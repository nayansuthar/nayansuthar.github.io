# Apps section

The site's `/apps/` section: a public page, privacy policy and terms of service for
each app. Publishing an app through Google Cloud (the OAuth consent screen, and app
verification) asks for exactly these three URLs.

```bash
node _apps/build.mjs        # from the repo root: rebuilds apps/ from _apps/
```

This folder stays off the live site. GitHub Pages runs Jekyll over the repo, and
Jekyll skips any folder whose name starts with `_`. So don't add a `.nojekyll` file:
it would publish this folder too.

## Layout

```
_apps/
  content/site.json             your name, contact email, and the list page's intro
  content/apps/<slug>/app.json  one folder per app; the folder name is its URL
  content/apps/<slug>/icon.svg  optional; without one, the app gets its first letter
  content/apps/_sample-app/     a template to copy. The _ keeps it out of the build
  templates.mjs                 the four page templates, and the privacy and terms wording
  apps.css                      what /style.css has no class for
  build.mjs                     writes apps/ from the above
apps/                           the built section. Generated: never edit it by hand
```

The pages use the site's own `/style.css` classes, the way `/about/` does. `apps.css`
adds only what the site had nothing for: the trail, app icons and code.

Each app gets:

| Page | URL | Give it to Google as |
|---|---|---|
| Landing page | `https://nayansuthar.github.io/apps/<slug>/` | the app's home page |
| Privacy policy | `https://nayansuthar.github.io/apps/<slug>/privacy/` | the privacy policy link |
| Terms of service | `https://nayansuthar.github.io/apps/<slug>/terms/` | the terms of service link |

## Add an app

1. Copy `content/apps/_sample-app/` to `content/apps/<slug>/` and fill in `app.json`.
2. Optionally add `icon.svg` beside it.
3. Run `node _apps/build.mjs`, preview, then commit `_apps/` and `apps/` together.

To take an app off the site without deleting it, prefix its folder with `_`.

### `app.json`

| Field | Shown on | What it holds |
|---|---|---|
| `name`, `tagline` | every page | the app's name, and one line on what it does |
| `updated` | privacy, terms | the date both were last changed, `YYYY-MM-DD` |
| `about`, `features` | landing page | paragraphs, and a list |
| `howItWorks` | privacy | where the app runs, and what leaves the machine |
| `data` | privacy | each kind of information the app can see |
| `sharing`, `storage`, `delete` | privacy | who gets it, where it's kept, how to delete it |
| `google.scopes` | landing, privacy | each OAuth scope: `scope`, `label` (the consent screen's name for it), `use` |
| `youtube` | privacy, terms | `true` adds the clauses YouTube API Services require |

`{app}` and `{owner}` in any string are replaced with the app's name and the site's
owner. An app with Google scopes also gets the Limited Use statement Google's
verification asks for, and a link to revoke access.

The build lists every value that still contains `TODO`, because those render on the
page exactly as written.

## Publishing

GitHub Pages serves this repo's `master` branch as it is. The build runs on your
machine, not on GitHub, so run it and commit `apps/` before you push.

For Google's OAuth consent screen, `nayansuthar.github.io` has to be verified in
Google Search Console. Put the HTML verification file Google gives you at the repo
root (not in `apps/`, which the build replaces), then commit and push.

The privacy and terms wording is a starting point, not legal advice. Have it reviewed
before an app goes out to the public.
