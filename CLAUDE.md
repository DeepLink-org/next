# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Deeplink Next documentation site — built with [Zensical](https://zensical.org/) (a MkDocs-derived static site generator, v0.0.40). Content is Chinese-language Markdown under `docs/`, output is written to `site/`, deployed to GitHub Pages.

## Commands

```bash
zensical serve          # Dev server with live reload
zensical build --clean  # Production build into site/
```

No tests, linting, or type-checking — this is a pure documentation site.

## Architecture

```
zensical.toml              # Site config (nav, theme, plugins, markdown extensions)
docs/                      # All Markdown content
  index.md                 # Homepage (uses template: home.html)
  stylesheets/extra.css    # Custom CSS (hero, cards, color overrides)
  javascripts/extra.js     # Minimal JS (external link target="_blank")
  assets/                  # Images and SVGs
overrides/                 # Jinja2 template overrides (Material theme)
  home.html                # Homepage template — extends main.html
site/                      # Built output (gitignored, deployed via GitHub Actions)
```

## Key conventions

- **Page icons**: Each `.md` file declares an icon in frontmatter (`icon: material/...`) that renders in the nav sidebar.
- **Homepage template fragility**: `overrides/home.html` splits `page.content` on `'---'` to separate hero content from body content. Be careful — if any page body contains `---` (horizontal rules, YAML fences, Mermaid), the split will truncate content.
- **Color system conflict**: `zensical.toml` sets `primary = "indigo"` (blueish), but `extra.css` overrides `--md-primary-fg-color` to `#5c3d99` (deep purple). These two sources fight — prefer whichever matches the brand direction and remove the other.
- **Zensical TOML format**: Uses `[project.markdown_extensions.pymdownx.*]` tables instead of MkDocs' YAML list format for extensions. Custom fences use `{ name = ..., class = ..., format = ... }` syntax.
- **Blog plugin**: `project.plugins.blog` is configured with `blog_dir = "blog"`, pointing at `docs/blog/`. Posts are plain Markdown files in that directory.
- **Google Analytics**: Property ID is a placeholder (`G-XXXXXXXXXX`) — replace before production use.

## Deploy

GitHub Actions (`.github/workflows/docs.yml`) triggers on push to `master`/`main`: installs `zensical`, runs `zensical build --clean`, deploys `site/` to GitHub Pages.
