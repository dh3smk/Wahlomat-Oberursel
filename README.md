# Oberursel Wahl‑Check 2026 (inoffiziell · Beta)

Das ist eine kleine, **statische Web‑App ohne Backend** (Next.js). Antworten werden **nur lokal im Browser** gespeichert.

## 1) Voraussetzungen (einmalig)
Du brauchst:
- einen Computer (Windows/macOS/Linux)
- **Node.js (LTS)**

Installiere Node.js (LTS) von: https://nodejs.org

## 2) Start (lokal auf deinem Rechner)
1. ZIP entpacken
2. Terminal/PowerShell öffnen und in den Projektordner wechseln
3. Abhängigkeiten installieren:
   ```bash
   npm install
   ```
4. App starten:
   ```bash
   npm run dev
   ```
5. Im Browser öffnen: http://localhost:3000

## 3) Inhalte anpassen (Thesen & Partei‑Positionen)
Datei: `app/data/wahlcheck.json`

### 3.1 Partei‑Positionen
Im Block `positions` steht für jede Partei (`cdu`, `spd`, `gruene`, `fdp`, `fw`, `klimaliste`, `obg`, `afd`) die Position je These (`"1"` bis `"28"`).

Werte:
- `2` = Stimme zu
- `1` = Stimme eher zu
- `0` = Neutral / unklar
- `-1` = Stimme eher nicht zu
- `-2` = Stimme nicht zu
- `null` = unbekannt / nicht belegt

Hinweis: Für **Freie Wähler (`fw`)** sind aktuell `null` gesetzt, weil kein eigenes lokales Programm/Quelle vorlag (OBG ist separat).

### 3.2 Thesen ändern / hinzufügen
Im Block `theses`.
Achte darauf:
- jede These hat eine eindeutige `id` (Zahl)
- zu jeder These existiert in `positions` auch ein Eintrag (notfalls `null`)

## 4) „Versenden“ / öffentlich teilen (empfohlen: GitHub + Vercel)
Du bekommst am Ende einen **Link**, den du einfach weitergeben kannst.

### Schritt A: Projekt lokal einmal testen
Stelle sicher, dass es lokal läuft (Kapitel 2).

### Schritt B: GitHub‑Account anlegen
1. Gehe auf GitHub und erstelle einen Account.
2. Danach im Browser oben rechts: **+ → New repository**
3. Repository‑Name z.B. `oberursel-wahlcheck`
4. **Public** (wenn öffentlich) oder **Private** (wenn nur für dich)
5. Klicke **Create repository**

### Schritt C (ohne Git‑Installation): Upload direkt im Browser
Das ist der einfachste Weg, wenn du Git noch nie benutzt hast.

1. Öffne dein neues Repository auf GitHub.
2. Klicke **Add file → Upload files**
3. Ziehe den **kompletten Projektordner‑Inhalt** hinein (nicht die ZIP, sondern die entpackten Dateien):
   - `app/`
   - `package.json`
   - `next.config.js`
   - `README.md`
   - usw.
4. Unten auf der Seite: **Commit changes**

> Tipp: Wenn GitHub meckert, dass du zu viele Dateien auf einmal hochlädst, dann:
> - erst `app/` hochladen, committen
> - dann die restlichen Dateien hochladen

### Schritt D: Vercel‑Account und Deploy
1. Gehe auf Vercel und erstelle einen Account (du kannst „Continue with GitHub“ wählen).
2. In Vercel: **Add New… → Project**
3. Wähle dein GitHub‑Repository `oberursel-wahlcheck`
4. Vercel erkennt **Next.js automatisch**.
5. Klicke **Deploy**

Nach 1–2 Minuten bekommst du eine URL wie:
`https://oberursel-wahlcheck.vercel.app`

### Schritt E: Änderungen später aktualisieren
Wenn du später Thesen/Positionen anpasst:
1. Datei lokal ändern
2. GitHub: **Add file → Upload files** (oder Datei öffnen → Stift‑Icon → edit)
3. Commit
4. Vercel deployt automatisch neu (dauert meist < 1 Minute)

## 5) Rechtliches / Transparenz (praktische Hinweise)
- klar als **inoffiziell** kennzeichnen
- **Quellen** zu den Partei‑Positionen dokumentieren (Links im README oder auf einer eigenen Seite)
- keine Verwendung offizieller Logos/Marken ohne Erlaubnis

Viel Erfolg!
