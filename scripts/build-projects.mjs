// Liest alle öffentlichen Repos der Organisation mit dem Topic "website" und schreibt projects.json.
// Repos mit dem Topic "unser-zuhause" landen in der Gruppe "featured" (dunkle Kachel), alle anderen in "projects".
// Texte kommen aus der GitHub-Beschreibung; overrides.json kann Titel/Text/Tags je Sprache überschreiben.
// Aufruf: GITHUB_TOKEN=… node scripts/build-projects.mjs   (Token optional, ohne gilt das Limit von 60 Anfragen/h)
import { readFile, writeFile } from "node:fs/promises";

const ORG = process.env.ORG || "SebastianInTheWild";
const SHOW_TOPIC = "website";
const FEATURED_TOPIC = "unser-zuhause";
// Topics, die nicht als Schlagwort auf der Karte erscheinen
const HIDDEN_TOPICS = new Set([SHOW_TOPIC, FEATURED_TOPIC, "homeassistant", "home-assistant"]);

const headers = { Accept: "application/vnd.github+json", "User-Agent": "website-build" };
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

async function listRepos() {
  const repos = [];
  for (let page = 1; ; page++) {
    const res = await fetch(`https://api.github.com/orgs/${ORG}/repos?type=public&per_page=100&page=${page}`, { headers });
    if (!res.ok) throw new Error(`GitHub API ${res.status}: ${await res.text()}`);
    const batch = await res.json();
    repos.push(...batch);
    if (batch.length < 100) return repos;
  }
}

const overrides = JSON.parse(await readFile(new URL("../overrides.json", import.meta.url), "utf8"));

const items = (await listRepos())
  .filter((r) => !r.archived && !r.fork && (r.topics || []).includes(SHOW_TOPIC))
  .map((r) => {
    const o = overrides[r.name] || {};
    const desc = r.description || "";
    const tags = o.tags || [r.language, ...(r.topics || []).filter((t) => !HIDDEN_TOPICS.has(t))].filter(Boolean).slice(0, 3);
    return {
      name: r.name,
      url: r.html_url,
      group: (r.topics || []).includes(FEATURED_TOPIC) ? "featured" : "projects",
      order: o.order ?? 100,
      title: { de: o.title?.de || o.title?.en || r.name, en: o.title?.en || o.title?.de || r.name },
      text: { de: o.text?.de || desc, en: o.text?.en || desc },
      tags,
      pushed_at: r.pushed_at,
    };
  })
  .sort((a, b) => a.order - b.order || b.pushed_at.localeCompare(a.pushed_at));

const out = JSON.stringify({ org: ORG, items }, null, 2) + "\n";
const file = new URL("../projects.json", import.meta.url);
const old = await readFile(file, "utf8").catch(() => "");
if (old === out) {
  console.log(`unverändert (${items.length} Repos)`);
} else {
  await writeFile(file, out);
  console.log(`projects.json geschrieben: ${items.length} Repos – ${items.map((i) => i.name).join(", ")}`);
}
