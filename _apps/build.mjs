#!/usr/bin/env node
/* Builds the site's /apps/ section.
 *
 *   node _apps/build.mjs
 *
 * Reads content/site.json and content/apps/<slug>/app.json (plus an optional
 * icon.svg beside it), and writes <repo>/apps/ from nothing: the list, then for
 * each app its landing page, privacy policy and terms of service.
 *
 * apps/ is generated. Edit content/ and templates.mjs, never apps/: the next
 * build replaces it. It is committed all the same, because GitHub Pages serves
 * the repo as it is. Nothing outside apps/ is ever touched.
 *
 * This folder stays off the live site because GitHub Pages' Jekyll step skips
 * any folder whose name starts with an underscore. So: no .nojekyll in this repo.
 *
 * Zero dependencies, Node stdlib only.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { listPage, appPage, privacyPage, termsPage } from './templates.mjs';

/* The URL the section lives at, and so the folder it's written to. */
const SECTION = 'apps';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '..');
const CONTENT = path.join(HERE, 'content');
const OUT = path.join(REPO, SECTION);

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));

const site = { ...readJson(path.join(CONTENT, 'site.json')), base: `/${SECTION}/` };

/* One folder per app; its name is the app's URL slug. A leading underscore
 * keeps a folder out of the build, which is how _sample-app stays a template. */
const apps = fs.readdirSync(path.join(CONTENT, 'apps'), { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && !entry.name.startsWith('_'))
  .map((entry) => {
    const dir = path.join(CONTENT, 'apps', entry.name);
    const icon = path.join(dir, 'icon.svg');
    return {
      ...readJson(path.join(dir, 'app.json')),
      slug: entry.name,
      icon: fs.existsSync(icon) ? icon : null,
    };
  })
  .sort((a, b) => a.name.localeCompare(b.name));

fs.rmSync(OUT, { recursive: true, force: true });

const write = (rel, contents) => {
  const file = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, contents);
};

write('index.html', listPage(site, apps));
write('apps.css', fs.readFileSync(path.join(HERE, 'apps.css')));
for (const app of apps) {
  write(`${app.slug}/index.html`, appPage(site, app));
  write(`${app.slug}/privacy/index.html`, privacyPage(site, app));
  write(`${app.slug}/terms/index.html`, termsPage(site, app));
  if (app.icon) write(`${app.slug}/icon.svg`, fs.readFileSync(app.icon));
}

console.log(`${SECTION}/ built: the list + ${apps.length} app${apps.length === 1 ? '' : 's'} (${apps.map((a) => a.slug).join(', ')})`);

/* A "TODO" value renders exactly as written, so list every one that's left. */
const todos = [];
const scan = (value, where) => {
  if (typeof value === 'string') {
    if (value.includes('TODO')) todos.push(`  ${where}: ${value}`);
  } else if (value && typeof value === 'object') {
    for (const [key, inner] of Object.entries(value)) scan(inner, `${where}.${key}`);
  }
};
scan(site, 'site.json');
for (const { slug, icon, ...app } of apps) scan(app, `apps/${slug}`);
if (todos.length) console.log(`\n${todos.length} TODO placeholders still in content/:\n${todos.join('\n')}`);
