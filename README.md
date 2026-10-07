# Pooja Nair: Portfolio

Live site: https://poojanair5919.github.io/Portfolio/

Plain HTML, CSS and JavaScript (Tailwind via CDN). No build step: GitHub Pages deploys on every commit.

## Structure

```
index.html            Home: hero, recognition, featured report, links to the other pages
challenges.html       Live Power BI challenge reports (one viewer + thumbnail rail)
case-studies.html     Case studies with tool filters
about.html            About, skills, experience, education, certifications, awards, contact
projects.html         Old URL kept alive; redirects to the new pages
projects/             Full case study pages (paths unchanged, so article links keep working)
assets/
  site.css            Shared styles
  site.js             Shared behaviour (nav, theme, embeds, viewer, filters)
  img/reports/        Optional report thumbnails, named after the report id (see below)
profile.jpg, preview.jpg (share card), Microsoft Certified Badge.png   Images (root, unchanged)
pooja_nair_analytics_engineer_resume.pdf   Resume (root, so existing links keep working)
```

## Add a new challenge report

Open `challenges.html`, then:

1. In the `window.REPORTS` object at the bottom, copy an entry and give it a new id (letters and digits only).
2. Add a `thumb(...)` button for it in the matching series row (copy an existing `<button class="thumb" ...>`).
3. Optional: save a screenshot of page 1 as `assets/img/reports/<id>.jpg`. It replaces the gradient on the thumbnail automatically.

Each report has a shareable link, for example `challenges.html#aug`.

## Add a new case study

Copy a `project-card` block in `case-studies.html`. `data-tech` controls the filter chips (`powerbi`, `tableau`, `python`).
