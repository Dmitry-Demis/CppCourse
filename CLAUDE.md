# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an interactive web-based C++ programming course ("Интерактивный курс по языку программирования C++") — a Russian-language educational platform for teaching C++ fundamentals. It is a **static web application** (HTML/CSS/JavaScript); there is no build step, server, or compilation required.

## Development Workflow

Open HTML files directly in a browser, or serve locally:

```powershell
# Serve with Python (if available)
python -m http.server 8080

# Or just open the file directly
start pages\chapter-1\paragraph-1.html
```

## Architecture

### Course Structure

The course is defined in `course-structure.json`:
- Top-level: chapters → paragraphs → sections
- Each section references an HTML file under `pages/chapter-N/`
- Mini-tests (10 questions) are embedded in sections; final tests (30 questions, 70% pass) unlock achievement badges
- Gamification: 6 levels (0–2000+ pts), badges, per-action point awards

### Page Architecture

Each paragraph page (e.g., `pages/chapter-1/paragraph-1.html`) is a self-contained HTML file with a **three-column layout**:
- Left sidebar: chapter/paragraph navigation
- Center: lesson content (type diagrams, tables, code examples, quizzes, compiler)
- Right sidebar: auto-generated table of contents

**JavaScript modules** (loaded as ES modules from a shared `js/` directory):
- `navigation.js` — sidebar nav behavior
- `quiz.js` — quiz rendering and scoring, reads a `fundamentalTypesQuestions` question bank
- `compiler.js` — embedded online C++ compiler integration
- `toc.js` — right-sidebar table of contents generation

**CSS** is split across a shared `css/` directory:
- `variables.css` → design tokens
- `base.css`, `layout.css`, `components.css` → structure and components
- `quiz.css`, `compiler.css` → feature-specific styles

**Key external dependencies (CDN):**
- Prism.js v1.29.0 (C++ syntax highlighting)
- MathJax v3 (math notation via `$$...$$` and `$...$`)
- GSAP v3.12.5 + ScrollTrigger (scroll-triggered animations)

### Content Conventions

- Type hierarchy diagrams are inline SVG
- Data type tables list byte sizes, bit widths, value ranges, and use cases
- C++ code blocks use `<pre><code class="language-cpp">` with Prism
- Definition boxes, ISO standard references, and info cards use specific CSS classes
- Math is written in LaTeX syntax wrapped in `$$` or `\[...\]`

### What Is Not Yet Implemented

The course structure JSON references HTML theory pages and JS question bank variables that do not yet exist. When adding new content, follow the pattern established in `pages/chapter-1/paragraph-1.html` and register the new page in `course-structure.json`.

