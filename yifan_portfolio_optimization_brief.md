# Yifan Luo Portfolio Website — Optimization Brief

## 1. Overall Direction

The website should feel like a **modern healthcare / life sciences / analytics portfolio**, not a resume pasted onto a webpage and not an overly experimental design portfolio.

Target feeling:

- Clean and professional at first glance
- More detail and personality revealed through scrolling and hover
- Strong editorial / consulting-report structure
- Subtle, polished interaction rather than flashy animation
- Data-informed visual language
- Slightly “fancy,” but never distracting

Suggested balance:

- 70% professional / consulting / research
- 20% modern editorial website
- 10% playful interaction

Core principle:

> The site should look simple when static, but feel sophisticated when the user interacts with it.

---

# 2. Content Structure Improvements

## 2.1 Hero Section

### Current issue
The hero section currently contains too much explanatory text at once. The positioning is good, but the first screen can be sharper and more memorable.

### Recommended structure

Use a short positioning statement first, followed by one supporting sentence.

Possible direction:

**Primary statement**

> Epidemiologist turning messy health data into evidence, strategy, and decisions.

or

> I turn health data into evidence, strategy, and decisions.

**Supporting sentence**

Use the current idea:

> I work at the point where research methods meet commercial decisions.

Then briefly clarify the domains:

- Epidemiology
- HEOR / RWE
- Healthcare Strategy
- Analytics

Avoid putting a long paragraph directly under the name.

---

## 2.2 Add a “What I Do” Section

Place this shortly after the Hero section.

Use three clear columns:

### Evidence
- Epidemiology
- Real-World Evidence
- Causal Inference
- Survey Analysis

### Strategy
- Market Access
- Competitive Intelligence
- Primary Research
- Healthcare Strategy

### Analytics
- R
- Python
- SQL
- Data Visualization

Purpose:

The portfolio currently contains projects across epidemiology, consulting, bioinformatics, analytics, and AI evaluation.

Rather than making this look scattered, the website should explicitly frame this as an intentional interdisciplinary profile:

> Research Question → Data → Analysis → Insight → Decision

This section should help visitors understand why the different experiences belong together.

---

# 3. Experience Section

## 3.1 Reduce Text Density

The website should not reproduce full resume bullets.

Each experience should initially show:

- Organization
- Role
- Date
- One-line description
- One strongest impact / outcome

Optional detailed information can appear on hover, expand, or through a secondary interaction.

Example structure:

**BenHealth**

Primary Research & Market Access

> Conducted stakeholder research across pediatric RSV vaccination pathways to identify adoption barriers and support market access recommendations.

Then highlight one result such as:

**60+ interviews · 4 stakeholder groups · 3 major adoption barriers**

This is easier to scan than four resume bullets.

---

## 3.2 Timeline Interaction

Experience should use a vertical timeline.

Example:

```text
2026     CAI
          ●
          │
2025     BenHealth
          ●
          │
2024     KPMG
          ●
```

### Animation behavior

As the user scrolls:

1. The vertical timeline line gradually draws downward.
2. When an experience enters the viewport, its node activates.
3. The corresponding text fades / rises in slightly.
4. Previously viewed nodes remain visually present but less emphasized than the current one.

Animation should be subtle and tied to scroll progress.

Avoid making every element independently animate.

---

# 4. Selected Work / Projects

This should be the most interactive section of the entire website.

Projects are the strongest evidence of capability, so more interaction and visual emphasis should be concentrated here.

---

## 4.1 Project Card Structure

Each project card should initially stay concise.

Suggested visible content:

- Domain tag
- Project title
- One-line research or business question
- 2–3 key metrics
- Method tags
- Small preview image / chart
- “View Case Study →”

Example:

**HEOR / RWE**

### ADHD & Smoking Behavior

> How is ADHD associated with cigarette use in a nationally representative population?

**56,609 participants**  
**Survey-weighted regression**  
**DAG-guided confounding control**

`View Case Study →`

---

## 4.2 Project Card Hover Interaction

On desktop hover:

### Visual behavior

- Card scales very slightly, approximately 1.01–1.02
- Background / project chart gradually becomes visible
- Preview image can gently zoom approximately 1.03–1.05
- Title moves upward by a few pixels
- Supporting metrics fade in
- “View Case Study ↗” arrow shifts slightly to the upper-right

The effect should feel responsive rather than animated for animation’s sake.

### Important limitation

Do **not** attempt to place the full project case study inside the hover state.

The project content is too extensive.

Hover should only act as a preview.

The full project should open on a dedicated project page.

---

# 5. Project Detail Pages

Full project content should live on separate pages.

Example:

```text
/projects/adhd-smoking
/projects/glp1-market
/projects/thyroid-bioinformatics
/projects/reddit-mental-health
```

Each page can contain:

1. Project overview
2. Research / business question
3. Data
4. Methodology
5. Analysis
6. Key findings
7. Visualizations
8. Implications
9. Tools
10. Optional GitHub / report link

---

## 5.1 Card-to-Page Expansion Transition

When the visitor clicks a project card, avoid a generic page fade if possible.

Preferred interaction:

### Shared-element style transition

The clicked project card should visually feel like it expands into the project detail page.

Possible behavior:

1. User clicks project card.
2. Card slightly enlarges.
3. Surrounding cards fade back.
4. Card background expands toward the viewport.
5. Project title moves from its card position toward the project-page heading position.
6. New project content appears after the transition completes.

The effect should communicate:

> “Opening this project”

rather than:

> “Loading another webpage”

### Implementation note

If true shared-element / View Transition API support is practical, use it.

If browser support or implementation complexity becomes an issue, use a graceful fallback:

- current page: translateY(-10 to -20px) + opacity 1 → 0
- next page: translateY(15–20px) + opacity 0 → 1
- duration around 300–450ms

Do not use dramatic zooms or long transitions.

---

# 6. Page / Section Scrolling

## 6.1 Soft Section Snap

Scrolling should have a slight sense of being “pulled” toward the next major section.

Desired behavior:

- Normal free scrolling remains possible
- As the user approaches the next section, the page gently settles into it
- The effect should not feel like PowerPoint slides
- Do not force one mouse-wheel event = one full-page transition

Use a **soft scroll snap**, not rigid full-screen snapping.

Goal:

> The user should feel guided between sections, not trapped inside them.

---

# 7. Left-Side Navigation / Progress Indicator

The left navigation should remain visually minimal.

## 7.1 Default State

Do **not** permanently display section names.

Default appearance should be only a vertical combination of dots and thin lines.

Example:

```text
●
│
○
│
○
│
○
```

This preserves the clean layout and avoids competing with page-transition visuals.

---

## 7.2 Hover State

When the mouse hovers over a node:

- Show the section name beside the node
- Optionally show section number
- Label appears with a short fade / slide
- Current section node becomes filled or slightly larger
- Other nodes remain subtle

Example hover:

```text
●  Intro
│
○
│
○
```

Hover another node:

```text
○
│
●  Selected Work
│
○
```

Clicking a node should smoothly scroll to the corresponding section.

---

## 7.3 Scroll Progress

The connecting line can also represent page progress.

As the visitor scrolls:

- line fills gradually
- current node activates
- completed nodes remain visible
- upcoming nodes remain hollow / muted

On mobile:

- hide the left-side navigation
- rely on normal navigation or a compact alternative

---

# 8. Section Entry Animation

Use a consistent reveal language throughout the site.

Recommended:

- opacity: 0 → 1
- translateY: approximately 15–30px → 0
- duration: approximately 400–700ms
- stagger only when useful

Avoid making every paragraph animate separately.

Good candidates:

- section title
- one supporting subtitle
- primary card group

Bad approach:

Every sentence, icon, button, and bullet animates independently.

---

# 9. Hero Motion

## 9.1 Keyword Rotation

Instead of a typewriter animation, use whole-word transitions.

Example:

```text
I turn health data into
evidence.
strategy.
decisions.
```

Transition behavior:

- current word moves slightly upward + fades out
- next word comes upward from below + fades in
- approximately every 2.5–3.5 seconds
- smooth easing

Avoid character-by-character typing animation.

It currently feels too template-like and common.

---

## 9.2 Light Parallax

Use very subtle parallax only in the hero.

Possible layers:

### Foreground
`YIFAN LUO`

Scroll speed around normal.

### Supporting copy
Normal scroll speed.

### Large background typography
For example:

`EPIDEMIOLOGY / STRATEGY / DATA`

Move slightly slower.

The effect should be almost subconscious.

Do not use dramatic depth or moving geometric objects.

---

# 10. Statistics / Number Animation

Key metrics can use one-time count-up animations.

Examples:

- 56,609 participants
- 60+ interviews
- 4 stakeholder groups
- 3 datasets

Behavior:

- animate only the first time the number enters the viewport
- duration around 600–1000ms
- never restart repeatedly when scrolling away and back

Do not animate every number on the site.

Use only for meaningful project / experience metrics.

---

# 11. Glass / Semi-Transparent UI Elements

Semi-transparent glass panels can be used selectively.

Good places:

- project metric overlay
- hover preview
- small floating project metadata
- navigation tooltip
- visualization annotation

Suggested feeling:

- subtle translucent background
- light blur
- thin border
- minimal shadow

Avoid turning every card into glass.

Glass should feel like an interaction layer sitting above content rather than the default visual language of the entire site.

---

# 12. Skills Section

Do not use percentage skill bars.

Avoid:

```text
R       90%
Python  80%
SQL     70%
```

These numbers are arbitrary and can look unserious.

Instead, organize skills conceptually.

Example:

### Methods
Causal Inference · Survey Analysis · Regression · Evidence Synthesis

### Tools
R · Python · SQL · Tableau · Excel

### Domain
HEOR/RWE · Market Access · Competitive Intelligence · Bioinformatics

---

## 12.1 Skills Hover Interaction

Use compact skill chips.

On hover:

- hovered skill rises slightly
- border / background subtly changes
- nearby elements can respond slightly
- optional very small magnetic motion

No dramatic bouncing.

Interaction should communicate responsiveness without becoming a game.

---

# 13. Data Visualization Interaction

Where real charts or analysis results are included, use interactive annotations.

Example:

Hover / click a meaningful chart point:

```text
Key Finding

BRAF and Other groups
cluster more closely than RAS.
```

Possible interactions:

- vertical / horizontal crosshair
- highlighted data point
- tooltip annotation
- short interpretation

This interaction is especially suitable because it reinforces the identity of the portfolio:

> The visitor is exploring analysis, not merely viewing decoration.

Prefer meaningful chart interactions over decorative animation.

---

# 14. Section Typography

Large section numbers can create editorial structure.

Example:

```text
            03

SELECTED WORK
──────────────
```

The number can remain faint in the background.

On scroll:

- title enters slightly
- number moves at a slower rate
- supporting line extends gently

Use sparingly.

This can make large sections feel intentionally designed without adding visual clutter.

---

# 15. Page Transitions

Avoid generic dramatic page transitions.

Preferred order:

### Best
Shared-element / card-expansion transition for project detail pages.

### Acceptable fallback
Short directional transition:

Outgoing page:
- opacity 1 → 0
- translateY 0 → -15px

Incoming page:
- opacity 0 → 1
- translateY 15px → 0

Suggested duration:

300–450ms.

Transitions should remain short enough that users never feel they are waiting for animation.

---

# 16. Microinteractions

Use small interaction details across the site.

## Buttons / Links

On hover:

- underline draws left to right
- arrow moves 2–4px
- slight opacity / background change

## Cards

- slight lift
- border changes subtly
- image reveals or zooms slightly

## Navigation Nodes

- node enlarges slightly
- section name appears
- current node remains active

## Charts

- point highlight
- tooltip
- annotation

All microinteractions should work as enhancement rather than required navigation.

---

# 17. Recognition / Education Content

Reduce resume-like content density near the bottom of the site.

Prioritize stronger signals:

- MPH Epidemiology — University of Michigan
- Data Science Graduate Certificate
- Poster / manuscript
- Provincial innovation award

Items such as routine course grading or event execution can remain in the resume rather than occupying significant homepage space.

Goal:

Keep the homepage focused on the strongest professional narrative.

---

# 18. Skills Content Simplification

The homepage does not need a full technical inventory such as every R package or Python library.

Instead of:

- pandas
- NumPy
- scikit-learn
- DESeq2
- limma
- Harmony
- AnnData
- etc.

Show higher-level capability groups.

Detailed package-level skills can live in:

- resume
- project detail pages
- GitHub README
- optional expanded skills section

The homepage should answer:

> “What problems can this person solve?”

rather than:

> “What software has this person used?”

---

# 19. Motion Budget

Use a motion budget to avoid visual overload.

Rule:

> Approximately one major animation + one or two microinteractions per viewport.

Example:

## Hero
Major:
- rotating keyword

Micro:
- CTA hover
- subtle parallax

## Experience
Major:
- timeline drawing

Micro:
- node activation
- text reveal

## Projects
Major:
- project preview reveal

Micro:
- card lift
- arrow movement

## Skills
Major:
- none required

Micro:
- chip response

This prevents the page from becoming visually noisy.

---

# 20. Things to Avoid

## Avoid Custom Cursor

Do not replace the system cursor with a large circle or a cursor that displays:

- VIEW
- OPEN
- DRAG

This often reduces usability and makes the website feel more like an experimental design portfolio.

---

## Avoid Heavy Card Flip Effects

Do not use 3D card flips to reveal content.

They feel dated and make scanning more difficult.

---

## Avoid Particle Backgrounds

No:

- floating particles
- stars
- glowing dots
- animated neural networks
- constantly moving gradients

The professional content should remain the visual focus.

---

## Avoid Excessive Typewriter Animation

Do not animate words character by character.

Whole-word transitions feel cleaner and more modern.

---

## Avoid Overusing Glassmorphism

Glass can be used for interactive layers.

Do not make the entire page a grid of transparent glass cards.

---

## Avoid Full-Screen Forced Scroll

Do not make the site behave like a PowerPoint deck where one wheel movement triggers one complete screen change.

Use soft section attraction instead.

---

# 21. Recommended Interaction System — Final Version

## Global

- Smooth scrolling
- Soft section snap / attraction
- Left-side dot-and-line progress navigation
- Section names appear only on hover
- Active section tracking
- Short page transition
- Reduced-motion accessibility support

## Hero

- Shorter positioning statement
- Whole-word rotating phrase
- subtle parallax
- simple heading reveal
- optional one-time metric count-up

## What I Do

- Evidence
- Strategy
- Analytics
- minimal entry animation

## Experience

- reduced text density
- vertical timeline
- scroll-linked line drawing
- active timeline nodes
- small metric highlights

## Projects

- concise cards
- background chart / image reveal on hover
- slight card scale
- metric preview
- method tags
- View Case Study CTA
- dedicated project pages
- card-to-page expansion transition when possible

## Project Pages

- structured case-study storytelling
- rich charts and visuals
- interactive annotations
- methodology + findings + implications
- shared-element transition back to projects when practical

## Skills

- conceptual skill groups
- compact chips
- subtle hover / magnetic response
- no skill percentages

## Education / Recognition

- retain strongest credentials only
- visually compact
- avoid resume-like bullet overload

---

# 22. Priority Order for Next Iteration

Do not try to implement everything at once.

Recommended order:

### Priority 1 — Content hierarchy
1. Simplify Hero copy
2. Add What I Do section
3. Reduce Experience text density
4. Refine project card content
5. Simplify Skills / Recognition

### Priority 2 — Navigation / scrolling
6. Build left-side dot-and-line progress indicator
7. Show section names on hover only
8. Add active-section tracking
9. Add smooth scrolling
10. Add soft section snap

### Priority 3 — Core motion
11. Hero keyword rotation
12. Section reveal animation
13. Experience timeline draw
14. Project hover preview

### Priority 4 — Project storytelling
15. Build dedicated project pages
16. Add project visualizations
17. Add chart annotation interaction
18. Implement shared-element / card-expansion page transition

### Priority 5 — Polish
19. One-time number count-up
20. Glass overlays where appropriate
21. Skill-chip hover response
22. Typography / section-number effects
23. Fine-tune easing and animation timing

---

# 23. Final Design Principle

The final website should not make visitors think:

> “This website has a lot of animations.”

The better reaction is:

> “This feels unusually polished.”

Interaction should clarify hierarchy, reveal information, and create continuity between sections.

The website should remain fully understandable even if every animation were disabled.

Motion is the finishing layer, not the structure.
