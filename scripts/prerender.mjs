// Renders each route to static HTML so the site works (and is indexable) without JavaScript.
import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
const {render} = await import(pathToFileURL(path.resolve('.ssr/entry-server.js')).href);
const site = (await import(pathToFileURL(path.resolve('src/content.js')).href)).default;
const base = await readFile('dist/index.html', 'utf8');
const routes = [
  ['/', `${site.name} — ${site.tagline}`, site.about],
  ['/app', `Interactive prototype — ${site.name}`, `Explore ${site.name} with fictional sample data: ${site.app.subtitle}`],
  ['/privacy', `Privacy notice — ${site.name}`, `How the ${site.name} website and prototype handle information.`],
  ['/terms', `Terms of use — ${site.name}`, `Terms for using the ${site.name} website and prototype.`],
  ['/404', `Page not found — ${site.name}`, `This ${site.name} page could not be found.`],
];
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
for (const [route, title, desc] of routes) {
  const url = `${site.url}${route === '/' ? '/' : route}`;
  let html = base
    .replace('<!--app-html-->', render(route))
    .replace(/<title>.*?<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/(name="description" content=")[^"]*"/, `$1${esc(desc)}"`)
    .replace(/(property="og:title" content=")[^"]*"/, `$1${esc(title)}"`)
    .replace(/(property="og:description" content=")[^"]*"/, `$1${esc(desc)}"`)
    .replace(/(rel="canonical" href=")[^"]*"/, `$1${url}"`)
    .replace(/(property="og:url" content=")[^"]*"/, `$1${url}"`);
  if (route === '/') {
    const ld = {'@context': 'https://schema.org', '@type': 'Organization', name: site.name, url: site.url + '/', email: site.email, description: site.about,
      founder: site.team.map((p) => ({'@type': 'Person', name: p.name, jobTitle: p.role}))};
    html = html.replace('</head>', `<script type="application/ld+json">${JSON.stringify(ld)}</script></head>`);
    await writeFile('dist/index.html', html);
  } else if (route === '/404') await writeFile('dist/404.html', html);
  else { await mkdir(`dist${route}`, {recursive: true}); await writeFile(`dist${route}/index.html`, html); }
}
console.log(`Prerendered ${routes.length} routes for ${site.name}.`);
