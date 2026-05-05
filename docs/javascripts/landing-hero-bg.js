/**
 * 首页吸引子背景：积分与缓冲逻辑自 docs-master/render.js 22607–22660（ca / oc / c0 + copyWithin），
 * 视角为时间 t 的解析连续函数（多频 sin/cos），无关键帧接缝与低通滞后。
 * 画布全视口 fixed；兼容 navigation.instant。绘制用 source-over + 取样步长，减轻 lighter 叠出过亮中线。
 */
(function () {
  "use strict";

  var running = false;
  var rafId = 0;
  var teardown = null;
  var scheduleToken = 0;

  // —— 以下与 render.js 一致（22607–22637, 22731–22660）——
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
  /** render.js: Float32Array(768 * ca)，每条线 256*ca 个三维点 */
  var bufLen = 768 * ca;
  /** render.js 为 100 条；Canvas2D 略减以控帧耗时 */
  var defaultSplineCount = 72;
  /** render.js 为 1200；分帧执行，总次数一致 */
  var warmupFrames = 1200;
  /** 每帧预热批次数（render.js 是一次性同步跑完） */
  var warmupBatchPerRaf = 80;

  /**
   * render.js 22647–22659，仅将 n.position 改为传入的 Float32Array。
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

  /**
   * 视角：对时间 t（秒）的 C∞ 解析式，多频 sin/cos 叠加、角频率不成整数比，
   * 避免关键帧分段与周期锁相带来的跳变；与 render.js 多段 camera 同属「慢漫游」效果，实现更轻。
   */
  var viewYaw = 0;
  var viewPitch = 0;
  var viewRoll = 0;

  function updateViewAnglesContinuous(tSec) {
    var T = tSec;
    viewYaw =
      0.72 +
      0.17 * Math.sin(T * 0.103) +
      0.065 * Math.sin(T * 0.179 + 0.41);
    viewPitch =
      0.34 +
      0.095 * Math.sin(T * 0.071 + 1.12) +
      0.048 * Math.cos(T * 0.121 + 0.22);
    viewRoll =
      0.2 +
      0.11 * Math.sin(T * 0.088 + 2.05) +
      0.055 * Math.sin(T * 0.0973 + 0.67);
  }

  updateViewAnglesContinuous(0);

  function projectRotated(c, l, d) {
    var cy = Math.cos(viewYaw);
    var sy = Math.sin(viewYaw);
    var x1 = cy * c + sy * d;
    var y1 = l;
    var z1 = -sy * c + cy * d;

    var cp = Math.cos(viewPitch);
    var sp = Math.sin(viewPitch);
    var x2 = x1;
    var y2 = cp * y1 - sp * z1;

    var cr = Math.cos(viewRoll);
    var sr = Math.sin(viewRoll);
    return {
      xs: cr * x2 - sr * y2,
      ys: sr * x2 + cr * y2,
    };
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
    return (0.1 + seed * 0.1).toFixed(3);
  }
  function splineGlowAlpha(seed) {
    return (0.12 + seed * 0.1).toFixed(3);
  }

  function initAttractor2D(canvas) {
    var ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    var aborted = false;

    var NSPLINES = defaultSplineCount;
    var splines = [];
    var si;
    for (si = 0; si < NSPLINES; si++) {
      var pos = new Float32Array(bufLen);
      pos[0] = Math.random() - 0.5;
      pos[1] = Math.random() - 0.5;
      pos[2] = Math.random() - 0.5;
      splines.push({
        position: pos,
        seed: Math.random(),
        width: 0.45 + Math.random() * 0.65,
      });
    }

    var prevCanvasW = 0;
    var prevCanvasH = 0;
    /** 用于 toScreen 的包围盒（指数平滑后，减轻 scale 跳变） */
    var bbMinX = 0;
    var bbMaxX = 1;
    var bbMinY = 0;
    var bbMaxY = 1;
    /** 本帧采样得到的原始包围盒，作为平滑目标 */
    var bbRawMinX = 0;
    var bbRawMaxX = 1;
    var bbRawMinY = 0;
    var bbRawMaxY = 1;
    /** 每次 refresh 得到的投影中心目标；viewCx/viewCy 指数移向此处，避免中心瞬跳 */
    var rawCx = 0;
    var rawCy = 0;
    var viewCx = 0;
    var viewCy = 0;
    var bbSmoothInited = false;
    /** 包围盒边：越大越跟手、越小越稳（ms） */
    var bboxSmoothTauMs = 520;
    /** 中心单独略慢一档，移动感更明显、更稳 */
    var centerSmoothTauMs = 780;

    function refreshBboxRaw() {
      var minX = Infinity;
      var maxX = -Infinity;
      var minY = Infinity;
      var maxY = -Infinity;
      var s;
      var idx;
      var step = 9;
      var pr;
      for (s = 0; s < splines.length; s++) {
        var buf = splines[s].position;
        for (idx = 0; idx < bufLen; idx += 3 * step) {
          pr = projectRotated(buf[idx], buf[idx + 1], buf[idx + 2]);
          if (pr.xs < minX) minX = pr.xs;
          if (pr.xs > maxX) maxX = pr.xs;
          if (pr.ys < minY) minY = pr.ys;
          if (pr.ys > maxY) maxY = pr.ys;
        }
      }
      var pad = 0.055 * Math.max(maxX - minX, maxY - minY, 1e-6);
      bbRawMinX = minX - pad;
      bbRawMaxX = maxX + pad;
      bbRawMinY = minY - pad;
      bbRawMaxY = maxY + pad;
      rawCx = (bbRawMinX + bbRawMaxX) * 0.5;
      rawCy = (bbRawMinY + bbRawMaxY) * 0.5;
    }

    function snapBboxToRaw() {
      bbMinX = bbRawMinX;
      bbMaxX = bbRawMaxX;
      bbMinY = bbRawMinY;
      bbMaxY = bbRawMaxY;
      viewCx = rawCx;
      viewCy = rawCy;
      bbSmoothInited = true;
    }

    function smoothBboxStep(dtMs) {
      if (!bbSmoothInited) {
        snapBboxToRaw();
        return;
      }
      var dt = Math.min(120, Math.max(0, dtMs));
      var a = 1 - Math.exp(-dt / bboxSmoothTauMs);
      bbMinX += (bbRawMinX - bbMinX) * a;
      bbMaxX += (bbRawMaxX - bbMaxX) * a;
      bbMinY += (bbRawMinY - bbMinY) * a;
      bbMaxY += (bbRawMaxY - bbMaxY) * a;
      var aC = 1 - Math.exp(-dt / centerSmoothTauMs);
      viewCx += (rawCx - viewCx) * aC;
      viewCy += (rawCy - viewCy) * aC;
    }

    /**
     * 视口「铺满」映射：用 max(w/spanX, h/spanY) 做等比 cover，
     * 避免原先 max(spanX,spanY)+min(w,h) 把图形缩进短边里、长边大片空黑的问题。
     */
    function toScreen(xs, ys, w, h) {
      var spanX = Math.max(bbMaxX - bbMinX, 1e-6);
      var spanY = Math.max(bbMaxY - bbMinY, 1e-6);
      var fill = 1.02;
      var scale = Math.max((w * fill) / spanX, (h * fill) / spanY);
      var mx = viewCx;
      var my = viewCy;
      return {
        x: w * 0.5 + (xs - mx) * scale,
        y: h * 0.5 + (ys - my) * scale,
      };
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
      refreshBboxRaw();
      snapBboxToRaw();
    }

    var frameCount = 0;
    var viewStartMs = performance.now();
    var lastDrawMs = performance.now();

    /** 折线取样步长：>1 可明显降低「中间实心亮带」的线段密度（render.js WebGL 是连续三角带，Canvas 叠 lighter 易过曝） */
    var drawStride = 2;

    function drawFrame() {
      var nowFrame = performance.now();
      var dtBb = Math.min(120, Math.max(0, nowFrame - lastDrawMs));
      lastDrawMs = nowFrame;

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
        updateViewAnglesContinuous((nowFrame - viewStartMs) * 0.001);
      }

      for (k = 0; k < splines.length; k++) {
        c0(splines[k], Ci);
      }

      frameCount++;
      if ((frameCount & 15) === 0) {
        refreshBboxRaw();
      }
      smoothBboxStep(dtBb);

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = "#0a1528";
      ctx.fillRect(0, 0, w, h);

      var g0 = ctx.createRadialGradient(
        w * 0.5,
        h * 0.35,
        0,
        w * 0.5,
        h * 0.55,
        Math.max(w, h) * 0.95
      );
      g0.addColorStop(0, "rgba(48,120,220,0.14)");
      g0.addColorStop(0.45, "rgba(14,36,72,0.08)");
      g0.addColorStop(1, "rgba(6,14,32,0)");
      ctx.fillStyle = g0;
      ctx.fillRect(0, 0, w, h);

      /* 不用 lighter：重叠处亮度线性叠加易形成粗白条；source-over + 低 alpha + 弱光晕更克制 */
      ctx.globalCompositeOperation = "source-over";
      var numVerts = 256 * ca;
      for (k = 0; k < splines.length; k++) {
        s = splines[k];
        buf = s.position;
        ctx.strokeStyle =
          "rgba(255,255,255," + splineStrokeAlpha(s.seed) + ")";
        ctx.lineWidth = Math.max(0.6, s.width * dpr);
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.shadowBlur = 4 * dpr;
        ctx.shadowColor =
          "rgba(200,220,255," + splineGlowAlpha(s.seed) + ")";
        ctx.beginPath();
        var started = false;
        for (q = numVerts - 1; q >= 0; q -= drawStride) {
          var o = q * 3;
          pr = projectRotated(buf[o], buf[o + 1], buf[o + 2]);
          pt = toScreen(pr.xs, pr.ys, w, h);
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

      var vig = ctx.createRadialGradient(
        w * 0.5,
        h * 0.5,
        Math.min(w, h) * 0.55,
        w * 0.5,
        h * 0.5,
        Math.max(w, h) * 0.98
      );
      vig.addColorStop(0, "rgba(0,0,0,0)");
      vig.addColorStop(1, "rgba(8,18,36,0.07)");
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, w, h);
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
      for (; batch < warmupBatchPerRaf && warmDone < warmupFrames; batch++, warmDone++) {
        for (si = 0; si < splines.length; si++) {
          c0(splines[si], Ci);
        }
      }
      if (warmDone < warmupFrames) {
        requestAnimationFrame(runWarmupBatch);
        return;
      }
      if (aborted) return;
      refreshBboxRaw();
      snapBboxToRaw();
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
