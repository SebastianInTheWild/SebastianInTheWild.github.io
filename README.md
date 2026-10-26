# SebastianInTheWild.github.io

Projektseite von SebastianInTheWild: **https://sebastianinthewild.github.io**

Eine statische Seite (`index.html`, Deutsch/Englisch umschaltbar) im Apple-Design, veröffentlicht über
GitHub Pages aus dem Branch `main`.

## Projekte erscheinen automatisch

Die Projektkarten kommen aus `projects.json`. Die erzeugt die Action **„Projekte aktualisieren“**
(`.github/workflows/projects.yml`) täglich um 04:17 UTC, nach jeder Änderung an `overrides.json` und auf Knopfdruck
(Actions → „Projekte aktualisieren“ → **Run workflow**).

| Topic am Repo | Wirkung |
|---|---|
| `website` | Repo erscheint auf der Seite (nur öffentliche, nicht archivierte Repos der Organisation) |
| `unser-zuhause` | zusätzlich: Karte in der dunklen „Unser Zuhause“-Kachel statt unter „Weitere Projekte“ |

**Neues Projekt aufnehmen:** am Repo das Topic `website` setzen (Repo → ⚙ neben „About“ → Topics), dann den Workflow
starten oder bis zum nächsten Tag warten. Titel ist der Repo-Name, Text die Repo-Beschreibung, Schlagwörter sind
Sprache + bis zu zwei Topics.

**Schöner machen (optional):** in `overrides.json` einen Eintrag mit dem Repo-Namen anlegen:

```json
"mein-repo": {
  "order": 20,
  "title": { "de": "Mein Projekt", "en": "My project" },
  "text":  { "de": "Was es tut.", "en": "What it does." },
  "tags":  ["Python", "Docker"]
}
```

`order` bestimmt die Reihenfolge (kleiner = weiter vorn, Standard 100, danach zuletzt aktualisiert zuerst).

Lokal testen: `GITHUB_TOKEN=$(gh auth token) node scripts/build-projects.mjs`, dann `python -m http.server`
im Ordner und http://localhost:8000 öffnen.
