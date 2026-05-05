/**
 * 首页吸引子背景。
 * 相机：分段线性插值 eye/center 的导演式镜头，世界 up=(0,1,0)、fov=90°、near=1e-4；
 * 投影：真透视除法 screen = focal * coord / depth；
 * 雾：linear near=1 / far=6，按折线中点深度作 alpha 衰减；
 * 粒子：固定条带 + 恒星调色板 STAR_PALETTE，透明度 = baseOpacity × fog；
 * 画布全视口 fixed，兼容 navigation.instant，绘制用 source-over + 取样步长。
 */
(function () {
  "use strict";

  var running = false;
  var rafId = 0;
  var teardown = null;
  var scheduleToken = 0;

  var ca = 4;
  var oc = 0.05 / ca;
  var Ci = {
    alpha: 0.95,
    beta: 0.2,
    gamma: 0.7,
    delta: 3.5,
    epsilon: 0.25,
    zeta: 0.1,
  };
  /** 每条折线 256 * ca 个三维点（每点 3 个 float） */
  var bufLen = 768 * ca;
  /** 折线条数；Canvas2D 略减以控帧耗时 */
  var defaultSplineCount = 72;
  /** 总预热步数；分帧执行避免阻塞主线程 */
  var warmupFrames = 1200;
  /** 每帧异步预热批次数 */
  var warmupBatchPerRaf = 80;

  /**
   * 恒星色系 + 线宽系数 lineMul（与光谱型 / 典型质量序粗对应，黑底上可读）。
   * stroke: r,g,b；shadow: gr,gg,gb；lineMul：大质量高温星略粗，M 型红矮略细。
   */
  var STAR_PALETTE = [
    { r: 252, g: 252, b: 255, gr: 238, gg: 242, gb: 255, lineMul: 1.1 }, // A 型偏白
    { r: 228, g: 238, b: 255, gr: 200, gg: 225, gb: 255, lineMul: 1.18 }, // B 蓝白
    { r: 165, g: 210, b: 255, gr: 130, gg: 190, gb: 255, lineMul: 1.22 }, // B 蓝
    { r: 120, g: 185, b: 255, gr: 90, gg: 165, gb: 255, lineMul: 1.28 }, // O/B 高温、大质量
    { r: 255, g: 248, b: 230, gr: 255, gg: 252, gb: 220, lineMul: 1.02 }, // F 黄白
    { r: 255, g: 225, b: 140, gr: 255, gg: 210, gb: 110, lineMul: 0.98 }, // G 类日
    { r: 255, g: 165, b: 115, gr: 255, gg: 140, gb: 85, lineMul: 0.82 }, // K 橙
    { r: 255, g: 115, b: 100, gr: 255, gg: 90, gb: 75, lineMul: 0.68 }, // M 红矮、小质量
  ];

  /**
   * 吸引子的一步积分：欧拉法推进 n.position[0..2] 一个步长，
   * 同时把整条折线的旧顶点向后平移 3 个 float（copyWithin），形成尾部拖痕。
   * @param {{ position: Float32Array }} n
   * @param {typeof Ci} t
   */
  function c0(n, t) {
    var e = t.alpha;
    var i = t.beta;
    var s = t.delta;
    var r = t.gamma;
    var o = t.zeta;
    var a = t.epsilon / ca;
    var c = n.position[0];
    var l = n.position[1];
    var d = n.position[2];
    var h = oc * ((d - i) * c - s * l);
    var f = oc * (s * c + (d - i) * l);
    var p =
      oc *
      (r +
        e * d -
        Math.pow(d, 3) / 3 -
        (Math.pow(c, 2) + Math.pow(l, 2)) * (1 + a * d) +
        o * d * Math.pow(c, 3));
    n.position.copyWithin(3, 0, 3 * 256 * ca - 3);
    n.position[0] = c + h;
    n.position[1] = l + f;
    n.position[2] = d + p;
  }

  function prefersReducedMotion() {
    return (
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }

  function dispose() {
    if (typeof teardown === "function") {
      teardown();
      teardown = null;
    }
    running = false;
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
  }

  function viewportCssSize() {
    var root = document.documentElement;
    var vv = window.visualViewport;
    if (vv && vv.width > 0 && vv.height > 0) {
      return {
        w: Math.max(1, Math.ceil(vv.width)),
        h: Math.max(1, Math.ceil(vv.height)),
      };
    }
    var iw = window.innerWidth;
    var ih = window.innerHeight;
    var cw = root.clientWidth || iw;
    var ch = root.clientHeight || ih;
    return {
      w: Math.max(1, Math.floor(Math.max(cw, iw))),
      h: Math.max(1, Math.floor(Math.max(ch, ih))),
    };
  }

  function splineStrokeAlpha(seed) {
    return (0.2 + seed * 0.15).toFixed(3);
  }
  function splineGlowAlpha(seed) {
    return (0.24 + seed * 0.15).toFixed(3);
  }

  function initAttractor2D(canvas) {
    /* alpha: true 让 body 与内页相同的 CSS 渐变透出；避免 opaque 画布清屏成黑底导致整站首页与内页色差 */
    var ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    var aborted = false;

    var NSPLINES = defaultSplineCount;
    var splines = [];
    var si;
    function assignParticleVisual(sp) {
      sp.star = STAR_PALETTE[Math.floor(Math.random() * STAR_PALETTE.length)];
      /* alpha 微调，不参与色相 */
      sp.baseOpacity = 0.65 + (Math.random() - 0.5) * 0.35;
    }

    for (si = 0; si < NSPLINES; si++) {
      var pos = new Float32Array(bufLen);
      pos[0] = Math.random() - 0.5;
      pos[1] = Math.random() - 0.5;
      pos[2] = Math.random() - 0.5;
      var spNew = {
        position: pos,
        seed: Math.random(),
        width: 0.45 + Math.random() * 0.65,
      };
      assignParticleVisual(spNew);
      splines.push(spNew);
    }

    /**
     * 相机段序列：每段 length 帧从 source(eye0/center0) 线性插值到 target(eye1/center1)，
     * 一段播完直接切到下一段（导演式硬切）。
     */
    var RENDER_JS_CAMERA_SEGMENTS = [
      {
        length: 500,
        ex0: -1.60744,
        ey0: 1.47329,
        ez0: -2.62968,
        cx0: 0.141248,
        cy0: -0.0999439,
        cz0: 0.850354,
        ex1: -1.16954,
        ey1: 1.24522,
        ez1: -2.71477,
        cx1: 0.147224,
        cy1: -0.0702744,
        cz1: 0.859073,
      },
      {
        length: 1500,
        ex0: 0.0631833,
        ey0: 1.28423,
        ez0: -0.827955,
        cx0: 0.0631833,
        cy0: 0.00244161,
        cz0: -0.827957,
        ex1: -0.0118442,
        ey1: 0.846686,
        ez1: -1.85947,
        cx1: -0.0118554,
        cy1: 0.00845868,
        cz1: -1.86433,
      },
      {
        length: 1500,
        ex0: -1.65924e-9,
        ey0: 2.39657,
        ez0: 2.40252e-6,
        cx0: 0,
        cy0: 0,
        cz0: 0,
        ex1: -7.03221e-7,
        ey1: 2.37576,
        ez1: 2.27079e-6,
        cx1: 0,
        cy1: 0,
        cz1: 0,
      },
      {
        length: 1000,
        ex0: -1.57788,
        ey0: 0.0300631,
        ez0: -1.48228,
        cx0: 0,
        cy0: 0,
        cz0: 0,
        ex1: -1.28756,
        ey1: -0.00862695,
        ez1: -1.01241,
        cx1: 0,
        cy1: 0,
        cz1: 0,
      },
      {
        length: 1000,
        ex0: 0,
        ey0: 1.3595e-16,
        ez0: 2.22023,
        cx0: 0,
        cy0: 0,
        cz0: 0,
        ex1: 0,
        ey1: 1.25431e-16,
        ez1: 2.04844,
        cx1: 0,
        cy1: 0,
        cz1: 0,
      },
      {
        length: 500,
        ex0: 0.99935,
        ey0: 1.32445,
        ez0: -2.86713,
        cx0: 0.0188739,
        cy0: 0.194861,
        cz0: 0.105587,
        ex1: 1.67574,
        ey1: 0.795462,
        ez1: -2.71725,
        cx1: 0.0188739,
        cy1: 0.194861,
        cz1: 0.105587,
      },
      {
        length: 1000,
        ex0: 0.00434437,
        ey0: 0.171172,
        ez0: -1.56255,
        cx0: -0.0261481,
        cy0: -4.17146e-22,
        cz0: -0.000100017,
        ex1: -4.56078e-6,
        ey1: 0.0521422,
        ez1: -1.15426,
        cx1: -0.0261481,
        cy1: -4.17146e-22,
        cz1: -0.000100017,
      },
      {
        length: 1000,
        ex0: -0.838463,
        ey0: 0.602458,
        ez0: -0.156669,
        cx0: -1.45554,
        cy0: -0.346908,
        cz0: -2.54362,
        ex1: -0.56783,
        ey1: 0.450686,
        ez1: -0.413958,
        cx1: -1.45554,
        cy1: -0.346908,
        cz1: -2.54362,
      },
    ];

    var eyeX = RENDER_JS_CAMERA_SEGMENTS[0].ex0;
    var eyeY = RENDER_JS_CAMERA_SEGMENTS[0].ey0;
    var eyeZ = RENDER_JS_CAMERA_SEGMENTS[0].ez0;
    var centerX = RENDER_JS_CAMERA_SEGMENTS[0].cx0;
    var centerY = RENDER_JS_CAMERA_SEGMENTS[0].cy0;
    var centerZ = RENDER_JS_CAMERA_SEGMENTS[0].cz0;

    var renderJsCameraAnim = { segmentIndex: 0, progress: 0 };

    function stepRenderJsCamera() {
      var segs = RENDER_JS_CAMERA_SEGMENTS;
      var idx = renderJsCameraAnim.segmentIndex;
      var seg = segs[idx];
      var L = seg.length;
      var p = renderJsCameraAnim.progress;
      if (p >= L) {
        renderJsCameraAnim.segmentIndex = (idx + 1) % segs.length;
        renderJsCameraAnim.progress = 0;
        idx = renderJsCameraAnim.segmentIndex;
        seg = segs[idx];
        L = seg.length;
        p = 0;
      }
      var u = p / L;
      eyeX = seg.ex0 + (seg.ex1 - seg.ex0) * u;
      eyeY = seg.ey0 + (seg.ey1 - seg.ey0) * u;
      eyeZ = seg.ez0 + (seg.ez1 - seg.ez0) * u;
      centerX = seg.cx0 + (seg.cx1 - seg.cx0) * u;
      centerY = seg.cy0 + (seg.cy1 - seg.cy0) * u;
      centerZ = seg.cz0 + (seg.cz1 - seg.cz0) * u;
      renderJsCameraAnim.progress++;
    }

    /**
     * lookAt 投影：返回相机坐标系下的右向 xs、上向 ys、前向深度 zs（zs>0 表示在相机前方）。
     * 世界 up=(0,1,0)；当 forward 与 up 几乎平行时切到稳定备选 (0,0,1)，
     * 阈值 0.9999 极窄以避免镜头滚转跳变。
     */
    function lookAtProjectFrom(ex, ey, ez, wc, wl, wd) {
      var fx = centerX - ex;
      var fy = centerY - ey;
      var fz = centerZ - ez;
      var flen = Math.sqrt(fx * fx + fy * fy + fz * fz);
      if (flen < 1e-9) return { xs: 0, ys: 0, zs: 1 };
      fx /= flen;
      fy /= flen;
      fz /= flen;
      var wux = 0;
      var wuy = 1;
      var wuz = 0;
      if (Math.abs(fx * wux + fy * wuy + fz * wuz) > 0.9999) {
        wux = 0;
        wuy = 0;
        wuz = 1;
      }
      var rx = fy * wuz - fz * wuy;
      var ry = fz * wux - fx * wuz;
      var rz = fx * wuy - fy * wux;
      var rlen = Math.sqrt(rx * rx + ry * ry + rz * rz);
      if (rlen < 1e-9) return { xs: 0, ys: 0, zs: flen };
      rx /= rlen;
      ry /= rlen;
      rz /= rlen;
      var upx = ry * fz - rz * fy;
      var upy = rz * fx - rx * fz;
      var upz = rx * fy - ry * fx;
      var vx = wc - ex;
      var vy = wl - ey;
      var vz = wd - ez;
      return {
        xs: vx * rx + vy * ry + vz * rz,
        ys: vx * upx + vy * upy + vz * upz,
        zs: vx * fx + vy * fy + vz * fz,
      };
    }

    function lookAtProject(wc, wl, wd) {
      return lookAtProjectFrom(eyeX, eyeY, eyeZ, wc, wl, wd);
    }

    var prevCanvasW = 0;
    var prevCanvasH = 0;

    /**
     * 透视投影常量：fov=90 时 tan(45°) = 1 → focal = h * 0.5。
     * 真透视除法保证缩放与中心由同一组 eye/center 算出，相机段切换时同步变化。
     */
    var FOV_DEG = 90;
    var TAN_HALF_FOV = Math.tan((FOV_DEG * Math.PI) / 360);
    /** 透视相机的近平面 */
    var NEAR_PLANE = 1e-4;
    /** linear fog 距离范围：near 之内不衰减，far 之外完全淡出 */
    var FOG_NEAR = 1.0;
    var FOG_FAR = 6.0;

    function toScreen(xs, ys, zs, w, h) {
      var focal = (h * 0.5) / TAN_HALF_FOV;
      var inv = 1 / Math.max(zs, NEAR_PLANE);
      return {
        x: w * 0.5 + xs * focal * inv,
        y: h * 0.5 - ys * focal * inv,
      };
    }

    /** linear fog alpha：near 内为 1.0、far 外为 0.0，区间内线性衰减 */
    function fogAlpha(zs) {
      if (zs <= FOG_NEAR) return 1;
      if (zs >= FOG_FAR) return 0;
      return (FOG_FAR - zs) / (FOG_FAR - FOG_NEAR);
    }

    function syncSize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var css = viewportCssSize();
      var w = Math.max(1, css.w);
      var h = Math.max(1, css.h);
      var nw = Math.floor(w * dpr);
      var nh = Math.floor(h * dpr);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      if (nw === prevCanvasW && nh === prevCanvasH) return;
      prevCanvasW = nw;
      prevCanvasH = nh;
      canvas.width = nw;
      canvas.height = nh;
    }

    /** 折线取样步长：>1 可降低线段密度，避免重叠区过曝形成粗白带 */
    var drawStride = 2;

    function drawFrame() {
      var w = canvas.width;
      var h = canvas.height;
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var k;
      var s;
      var q;
      var buf;
      var pr;
      var pt;

      if (!prefersReducedMotion()) {
        stepRenderJsCamera();
      }

      for (k = 0; k < splines.length; k++) {
        c0(splines[k], Ci);
      }

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, w, h);

      /* 底衬由 html/body 的 extra.css 负责，画布保持透明 */

      /* source-over + 低 alpha + 弱光晕：重叠处不会线性叠加成粗白条 */
      ctx.globalCompositeOperation = "source-over";
      var numVerts = 256 * ca;
      for (k = 0; k < splines.length; k++) {
        s = splines[k];
        buf = s.position;
        var st = s.star;
        /* 整段折线用中点深度算雾因子，作为 alpha 衰减乘子 */
        var midOff = (numVerts >> 1) * 3;
        var midPr = lookAtProject(
          buf[midOff],
          buf[midOff + 1],
          buf[midOff + 2],
        );
        var fog = fogAlpha(midPr.zs);
        if (fog <= 0.001) continue;

        var opacityMul = s.baseOpacity * fog;
        var strokeA = (
          parseFloat(splineStrokeAlpha(s.seed)) * opacityMul
        ).toFixed(3);
        var glowA = (
          parseFloat(splineGlowAlpha(s.seed)) * opacityMul
        ).toFixed(3);
        ctx.strokeStyle =
          "rgba(" +
          st.r +
          "," +
          st.g +
          "," +
          st.b +
          "," +
          strokeA +
          ")";
        /* 线宽：光谱 lineMul × width；seed 微调 */
        var widthJitter = 0.9 + s.seed * 0.22;
        ctx.lineWidth = Math.max(
          0.48,
          s.width * dpr * st.lineMul * widthJitter,
        );
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.shadowBlur = (2.8 + st.lineMul * 4.2) * dpr;
        ctx.shadowColor =
          "rgba(" +
          st.gr +
          "," +
          st.gg +
          "," +
          st.gb +
          "," +
          glowA +
          ")";
        ctx.beginPath();
        var started = false;
        for (q = numVerts - 1; q >= 0; q -= drawStride) {
          var o = q * 3;
          pr = lookAtProject(buf[o], buf[o + 1], buf[o + 2]);
          /* 近平面后的点会反向投影、屏幕坐标爆炸，断笔避免拉出穿镜长线 */
          if (pr.zs <= NEAR_PLANE) {
            started = false;
            continue;
          }
          pt = toScreen(pr.xs, pr.ys, pr.zs, w, h);
          if (!started) {
            ctx.moveTo(pt.x, pt.y);
            started = true;
          } else {
            ctx.lineTo(pt.x, pt.y);
          }
        }
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
    }

    function frame() {
      if (!running || aborted) return;
      rafId = requestAnimationFrame(frame);
      drawFrame();
    }

    function stopLoop() {
      running = false;
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
    }

    var ro = new ResizeObserver(syncSize);
    ro.observe(document.documentElement);
    window.addEventListener("resize", syncSize);
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", syncSize);
    }

    syncSize();

    var warmDone = 0;
    function runWarmupBatch() {
      if (aborted) return;
      var batch = 0;
      for (
        ;
        batch < warmupBatchPerRaf && warmDone < warmupFrames;
        batch++, warmDone++
      ) {
        for (si = 0; si < splines.length; si++) {
          c0(splines[si], Ci);
        }
      }
      if (warmDone < warmupFrames) {
        requestAnimationFrame(runWarmupBatch);
        return;
      }
      if (aborted) return;
      if (prefersReducedMotion()) {
        drawFrame();
      } else {
        running = true;
        frame();
      }
    }

    runWarmupBatch();

    teardown = function () {
      aborted = true;
      stopLoop();
      ro.disconnect();
      window.removeEventListener("resize", syncSize);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", syncSize);
      }
      var el = document.getElementById("deeplink-attractor-canvas");
      if (el && el.parentNode) {
        el.parentNode.removeChild(el);
      }
    };
  }

  function initLandingHero() {
    dispose();

    if (!document.querySelector(".landing-hero")) return;

    var canvas = document.createElement("canvas");
    canvas.id = "deeplink-attractor-canvas";
    canvas.className = "deeplink-attractor-canvas";
    canvas.setAttribute("aria-hidden", "true");
    document.body.insertBefore(canvas, document.body.firstChild);

    initAttractor2D(canvas);
  }

  function scheduleInit() {
    scheduleToken++;
    var id = scheduleToken;
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        if (id !== scheduleToken) return;
        initLandingHero();
      });
    });
  }

  function hook() {
    if (typeof document$ !== "undefined" && document$.subscribe) {
      document$.subscribe(scheduleInit);
    } else if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", scheduleInit);
    }
    scheduleInit();
  }

  hook();
})();
