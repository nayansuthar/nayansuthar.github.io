/* The app pages' templates: the list, and each app's landing page, privacy
 * policy and terms of service.
 *
 * Written in the site's own vocabulary, the way /about/ uses it: /style.css's
 * .page, the .row/.column grid, .profile__name, .resume__* and .line.
 * apps.css adds only what the site had no class for. Paths are root-absolute
 * like the rest of the site, which lives at a domain root.
 *
 * Plain HTML, no script: Google's reviewers, and anyone else, see every word
 * without running anything.
 *
 * The legal wording lives here, once. What differs per app comes from its
 * app.json; `{app}` and `{owner}` in any app.json string are filled in.
 */

const GOOGLE_PERMISSIONS = 'https://security.google.com/settings/security/permissions';
const GOOGLE_PRIVACY = 'https://policies.google.com/privacy';
const GOOGLE_USER_DATA_POLICY = 'https://developers.google.com/terms/api-services-user-data-policy';
const YOUTUBE_TERMS = 'https://www.youtube.com/t/terms';

const esc = (s) => String(s)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

/* An app.json string, with its tokens filled in, escaped for HTML. */
const text = (s, site, app) => esc(String(s).replaceAll('{app}', app?.name ?? '').replaceAll('{owner}', site.owner));

const link = (href, label) => `<a href="${esc(href)}">${label}</a>`;

const longDate = (iso) => new Date(`${iso}T00:00:00Z`)
  .toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });

/* URLs. site.base is the section's root, "/apps/". */
const appUrl = (site, app) => `${site.base}${app.slug}/`;
const privacyUrl = (site, app) => `${appUrl(site, app)}privacy/`;
const termsUrl = (site, app) => `${appUrl(site, app)}terms/`;

function icon(site, app, small = false) {
  const cls = small ? 'app-icon app-icon--small' : 'app-icon';
  return app.icon
    ? `<img class="${cls}" src="${appUrl(site, app)}icon.svg" alt="">`
    : `<span class="${cls} app-icon--letter" aria-hidden="true">${esc(app.name[0])}</span>`;
}

/* The site's section divider: a short bar, as on /about/. */
const line = `
      <div class="row">
        <div class="column column--2 column--medium-4">
          <div class="line"></div>
        </div>
      </div>`;

/* One full-width or reading-width row. */
const row = (html, wide = false) => `
      <div class="row">
        <div class="column ${wide ? 'column--12' : 'column--8 column--medium-12'}">${html}
        </div>
      </div>`;

/* Where this page sits: Nayan Suthar / Apps / AutoPlay / Privacy policy. */
function trail(site, steps) {
  const parts = [[site.name, '/'], ['Apps', site.base], ...steps];
  return parts
    .map(([label, href], i) => (i < parts.length - 1 ? link(href, esc(label)) : esc(label)))
    .join(' / ');
}

function page({ site, title, description, favicon, steps, body, app }) {
  const appLinks = app
    ? ` · ${link(privacyUrl(site, app), 'Privacy policy')} · ${link(termsUrl(site, app), 'Terms of service')}`
    : '';
  return `<!DOCTYPE html>
<html lang="en" dir="ltr">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://fonts.googleapis.com/css?family=Public+Sans:300,600,700,800&display=swap" rel="stylesheet">
    ${favicon ?? '<link rel="shortcut icon" type="image/png" href="/images/common/favicon.png"/>'}
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}">
    <link rel="stylesheet" href="/style.css">
    <link rel="stylesheet" href="${site.base}apps.css">
  </head>
  <body>
    <div class="page">
${row(`
          <small class="trail">${trail(site, steps)}</small>`, true)}
${body}
${row(`
          <small class="footnote">© ${new Date().getFullYear()} ${esc(site.owner)}${appLinks} · ${link(`mailto:${site.email}`, esc(site.email))}</small>`, true)}
    </div>
  </body>
</html>
`;
}

/* ── The list: every app ─────────────────────────────────────────────── */

export function listPage(site, apps) {
  const cell = (app) => `
        <div class="column column--6 column--medium-12">
          ${icon(site, app, true)}
          <h3 class="resume__item-title">${link(appUrl(site, app), esc(app.name))}</h3>
          <small class="resume__item-info">${link(privacyUrl(site, app), 'Privacy policy')} · ${link(termsUrl(site, app), 'Terms of service')}</small>
          <p class="resume__item-desc">${text(app.tagline, site, app)}</p>
        </div>`;
  // Two to a row, as on /about/: floats of uneven height only line up row by row.
  const rows = [];
  for (let i = 0; i < apps.length; i += 2) {
    rows.push(`
      <div class="row">${apps.slice(i, i + 2).map(cell).join('')}
      </div>`);
  }
  const body = `${row(`
          <h1 class="profile__name">Apps</h1>
          <p class="profile__desc">${esc(site.intro)}</p>`)}
${line}
${rows.join('')}`;
  return page({ site, title: `Apps · ${site.name}`, description: site.intro, steps: [], body });
}

/* ── An app's landing page: its home page for Google ─────────────────── */

export function appPage(site, app) {
  const t = (s) => text(s, site, app);
  const scopes = app.google?.scopes ?? [];
  const body = `${row(`
          ${icon(site, app)}
          <h1 class="profile__name">${esc(app.name)}</h1>
          <p class="profile__desc"><strong>${t(app.tagline)}</strong></p>
          ${(app.about ?? []).map((p) => `<p class="profile__desc">${t(p)}</p>`).join('\n          ')}`)}
${line}
${row(`
          <div class="resume">
            <h2 class="resume__section-title">What it does</h2>
            <ul class="resume__item-list">
              ${(app.features ?? []).map((f) => `<li>${t(f)}</li>`).join('\n              ')}
            </ul>
          </div>`)}
${scopes.length ? `${line}
${row(`
          <div class="resume">
            <h2 class="resume__section-title">Your Google account</h2>
            <p class="resume__item-desc">${esc(app.name)} asks for these permissions, and uses them only for what's listed here.</p>
            ${scopes.map((s) => `<h3 class="resume__item-title">${t(s.label)}</h3>
            <p class="resume__item-desc">${t(s.use)}</p>`).join('\n            ')}
          </div>`)}` : ''}
${line}
${row(`
          <div class="resume">
            <h2 class="resume__section-title">Policies</h2>
            <h3 class="resume__item-title">${link(privacyUrl(site, app), 'Privacy policy')}</h3>
            <p class="resume__item-desc">How ${esc(app.name)} handles your information.</p>
            <h3 class="resume__item-title">${link(termsUrl(site, app), 'Terms of service')}</h3>
            <p class="resume__item-desc resume__item-desc--last">The terms for using ${esc(app.name)}.</p>
          </div>`)}`;
  return page({
    site, app, body,
    title: `${app.name} · ${site.name}`,
    description: t(app.tagline),
    favicon: app.icon ? `<link rel="icon" type="image/svg+xml" href="${appUrl(site, app)}icon.svg">` : null,
    steps: [[app.name]],
  });
}

/* ── Privacy and terms share a frame ─────────────────────────────────── */

/* A legal section: a title, then paragraphs or a list. */
const section = (title, ...parts) => `
            <h2 class="resume__item-title">${title}</h2>
            ${parts.join('\n            ')}`;
const para = (html) => `<p class="resume__item-desc">${html}</p>`;
const leadIn = (html) => `<p class="resume__item-desc--last">${html}</p>`;
const list = (items) => `<ul class="resume__item-list">
              ${items.map((i) => `<li>${i}</li>`).join('\n              ')}
            </ul>`;

function legalPage(site, app, { title, lead, description, sections }) {
  const body = `${row(`
          <h1 class="profile__name">${title}</h1>
          <p class="profile__desc">${lead}</p>
          <small class="resume__item-info">${esc(app.name)} · Last updated ${longDate(app.updated)}</small>`)}
${line}
${row(`
          <div class="resume legal">${sections.join('\n')}
          </div>`)}`;
  return page({
    site, app, body, title: `${title} · ${app.name}`, description,
    favicon: app.icon ? `<link rel="icon" type="image/svg+xml" href="${appUrl(site, app)}icon.svg">` : null,
    steps: [[app.name, appUrl(site, app)], [title]],
  });
}

/* ── Privacy policy ──────────────────────────────────────────────────── */

export function privacyPage(site, app) {
  const t = (s) => text(s, site, app);
  const name = esc(app.name);
  const scopes = app.google?.scopes ?? [];
  const sections = [
    app.howItWorks && section(`How ${name} works`, para(t(app.howItWorks))),
    section(`Information ${name} accesses`, list((app.data ?? []).map(t))),
    scopes.length && section('Google permissions',
      leadIn(`When you connect your Google account, ${name} asks for these permissions:`),
      list(scopes.map((s) => `<strong>${t(s.label)}</strong><br><code>${t(s.scope)}</code><br>${t(s.use)}`))),
    section("How it's shared", para(t(app.sharing))),
    section("Where it's stored", para(t(app.storage))),
    scopes.length && section('Google API Services User Data Policy',
      para(`${name}'s use and transfer of information received from Google APIs to any other app will adhere to the ${link(GOOGLE_USER_DATA_POLICY, 'Google API Services User Data Policy')}, including the Limited Use requirements.`)),
    app.youtube && section('YouTube',
      para(`${name} uses YouTube API Services. What YouTube does with your information is covered by the ${link(GOOGLE_PRIVACY, 'Google Privacy Policy')}.`)),
    section('Removing access and deleting your data',
      para(`${scopes.length ? `You can revoke ${name}'s access to your Google account at any time on ${link(GOOGLE_PERMISSIONS, "your Google Account's security settings page")}. ` : ''}${t(app.delete)}`)),
    section('Children', para(`${name} isn't meant for children under 13, and doesn't knowingly collect information from them.`)),
    section('Changes to this policy', para('When this policy changes, the date at the top changes too.')),
    section('Contact', para(`Questions about this policy: ${link(`mailto:${site.email}`, esc(site.email))}.`)),
  ].filter(Boolean);
  return legalPage(site, app, {
    title: 'Privacy policy',
    lead: `This policy explains what ${name} does with your information. ${name} is published by ${esc(site.owner)}.`,
    description: `How ${app.name} handles your information.`,
    sections,
  });
}

/* ── Terms of service ────────────────────────────────────────────────── */

export function termsPage(site, app) {
  const t = (s) => text(s, site, app);
  const name = esc(app.name);
  const owner = esc(site.owner);
  const google = (app.google?.scopes ?? []).length > 0;
  const sections = [
    section(`What ${name} does`, para(t(app.tagline))),
    section('Your accounts and content',
      para(`You're responsible for the accounts you connect to ${name}, and for everything you publish with it. You keep all rights to your content. ${name} doesn't claim any.`)),
    section('Acceptable use',
      para(`Don't use ${name} to break the law, to break the terms of the services it connects to, or to publish content you don't have the rights to.`)),
    app.youtube && section('YouTube',
      para(`${name} uses YouTube API Services. By using ${name}, you agree to be bound by the ${link(YOUTUBE_TERMS, 'YouTube Terms of Service')}. The ${link(GOOGLE_PRIVACY, 'Google Privacy Policy')} also applies.`)),
    section('No warranty', para(`${name} is provided as is, without warranties of any kind. It may change or stop working at any time.`)),
    section('Limitation of liability',
      para(`To the fullest extent the law allows, ${owner} isn't liable for any indirect, incidental or consequential loss, or for lost data, content or earnings, that comes from using ${name}.`)),
    section('Stopping',
      para(`You can stop using ${name} at any time.${google ? ` To disconnect it from your Google account, revoke its access on ${link(GOOGLE_PERMISSIONS, "your Google Account's security settings page")}.` : ''}`)),
    section('Changes to these terms',
      para(`When these terms change, the date at the top changes too. Using ${name} after a change means you accept the new terms.`)),
    section('Contact', para(`Questions about these terms: ${link(`mailto:${site.email}`, esc(site.email))}.`)),
  ].filter(Boolean);
  return legalPage(site, app, {
    title: 'Terms of service',
    lead: `These terms cover your use of ${name}, published by ${owner}. By using ${name}, you agree to them. If you don't agree, don't use it.`,
    description: `The terms for using ${app.name}.`,
    sections,
  });
}
