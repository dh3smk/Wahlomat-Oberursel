"use client";

import { useEffect, useMemo, useState } from "react";
import data from "./data/wahlcheck.json";
import { ANSWERS, calcScores, shareText, clamp } from "./components/utils";

const LS_KEY = "oberursel_wahlcheck_v1";

function defaultState() {
  const thesisIds = data.theses.map(t => String(t.id));
  const userAnswers = Object.fromEntries(thesisIds.map(id => [id, null]));
  const weights = Object.fromEntries(thesisIds.map(id => [id, 1]));
  return { step: "intro", idx: 0, userAnswers, weights, includeUnknown: false };
}

export default function Home() {
  const [state, setState] = useState(defaultState());

  // Load saved
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      // basic sanity
      if (parsed && parsed.userAnswers && parsed.weights) setState({ ...defaultState(), ...parsed });
    } catch {}
  }, []);

  // Save
  useEffect(() => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch {}
  }, [state]);

  const thesis = data.theses[state.idx];
  const total = data.theses.length;

  const answeredCount = useMemo(() => {
    return Object.values(state.userAnswers).filter(v => v !== null && v !== undefined).length;
  }, [state.userAnswers]);

  const progressPct = useMemo(() => {
    return Math.round(((state.idx) / total) * 100);
  }, [state.idx, total]);

  const scores = useMemo(() => {
    if (state.step !== "results") return [];
    return calcScores({ userAnswers: state.userAnswers, weights: state.weights, data, includeUnknown: state.includeUnknown });
  }, [state.step, state.userAnswers, state.weights, state.includeUnknown]);

  const canGoBack = state.idx > 0;

  function setAnswer(val) {
    const tid = String(thesis.id);
    setState(s => ({
      ...s,
      userAnswers: { ...s.userAnswers, [tid]: val },
    }));
  }

  function toggleWeight() {
    const tid = String(thesis.id);
    setState(s => ({
      ...s,
      weights: { ...s.weights, [tid]: (s.weights[tid] ?? 1) === 1 ? 2 : 1 }
    }));
  }

  function next() {
    setState(s => {
      const nextIdx = clamp(s.idx + 1, 0, total - 1);
      return { ...s, idx: nextIdx };
    });
  }

  function prev() {
    setState(s => {
      const prevIdx = clamp(s.idx - 1, 0, total - 1);
      return { ...s, idx: prevIdx };
    });
  }

  function skip() {
    const tid = String(thesis.id);
    setState(s => ({
      ...s,
      userAnswers: { ...s.userAnswers, [tid]: null },
      idx: clamp(s.idx + 1, 0, total - 1),
    }));
  }

  function finish() {
    setState(s => ({ ...s, step: "results" }));
  }

  function restart() {
    localStorage.removeItem(LS_KEY);
    setState(defaultState());
  }

  async function copyShare() {
    const text = shareText(scores, data);
    try {
      await navigator.clipboard.writeText(text);
      alert("In die Zwischenablage kopiert.");
    } catch {
      alert(text);
    }
  }

  return (
    <>
      <div className="header">
        <div className="brand">
          <h1>Oberursel Wahl-Check 2026 <span className="badge">inoffiziell · Beta</span></h1>
          <p>{data.election} · {data.city}</p>
        </div>
        <div className="pill">
          <span>Fortschritt</span>
          <span className="kbd">{state.step === "questions" ? `${state.idx+1}/${total}` : state.step}</span>
        </div>
      </div>

      {state.step === "intro" && (
        <div className="grid">
          <div className="card">
            <h2 className="h2">So funktioniert’s</h2>
            <p className="muted">
              Du beantwortest {total} kommunalpolitische Thesen. Danach berechnet die App eine Übereinstimmung
              mit den hinterlegten Positionen von: {data.parties.map(p=>p.name).join(", ")}.
            </p>
            <div className="hr"></div>
            <p className="muted">
              <strong>Wichtig:</strong> Diese Demo enthält bereits Thesen, aber die <strong>Partei-Positionen sind noch Platzhalter</strong>.
              Bevor du das öffentlich teilst, musst du in <span className="kbd">app/data/wahlcheck.json</span> die Positionen befüllen
              (oder du nutzt die App nur als „Meinungs-Check“ ohne Match).
            </p>

            <div className="hr"></div>
            <div className="btnrow">
              <button className="btn btnPrimary" onClick={() => setState(s => ({ ...s, step: "questions" }))}>
                Start
              </button>
              <button className="btn" onClick={() => setState(s => ({ ...s, step: "editor" }))}>
                Partei-Positionen pflegen (Anleitung)
              </button>
            </div>
          </div>

          <div className="card">
            <h2 className="h2">Datenschutz</h2>
            <p className="muted">
              Alle Antworten bleiben lokal in deinem Browser (LocalStorage). Es gibt kein Tracking und kein Backend.
            </p>
            <div className="hr"></div>
            <h2 className="h2">Transparenz-Checkliste</h2>
            <ul className="muted">
              <li>Quellen pro These/Partei dokumentieren</li>
              <li>Methodik offenlegen (Skala, Gewichtung)</li>
              <li>„Inoffiziell“ klar kennzeichnen (keine Markenverletzung)</li>
            </ul>
          </div>
        </div>
      )}

      {state.step === "editor" && (
        <div className="card">
          <h2 className="h2">Partei-Positionen eintragen (einmalig)</h2>
          <p className="muted">
            Öffne die Datei <span className="kbd">app/data/wahlcheck.json</span>. Dort gibt es den Block <span className="kbd">positions</span>.
            Für jede Partei und jede These trägst du einen Wert ein:
          </p>
          <div className="code">
            {`2 = Stimme zu
1 = Stimme eher zu
0 = Neutral
-1 = Stimme eher nicht zu
-2 = Stimme nicht zu
null = unbekannt / nicht belegt`}
          </div>

          <div className="hr"></div>
          <details>
            <summary>Beispiel</summary>
            <p className="muted">
              Wenn Partei X These 4 „stimme eher zu“ sagt, trägst du ein:
            </p>
            <div className="code">{`"positions": {
  "parteiX": {
    "4": 1
  }
}`}</div>
          </details>

          <div className="hr"></div>
          <div className="btnrow">
            <button className="btn btnPrimary" onClick={() => setState(s => ({ ...s, step: "questions" }))}>Zurück zu den Fragen</button>
            <button className="btn" onClick={() => setState(s => ({ ...s, step: "intro" }))}>Zur Startseite</button>
          </div>
        </div>
      )}

      {state.step === "questions" && (
        <div className="grid">
          <div className="card">
            <div className="pill">
              <span>Thema</span>
              <span className="kbd">{thesis.topic}</span>
              <span style={{marginLeft:"auto"}} className="small">{answeredCount} beantwortet</span>
            </div>

            <div className="hr"></div>

            <p className="question">{thesis.text}</p>
            <div className="small">
              These {state.idx+1} von {total} · Gewichtung: <strong>{(state.weights[String(thesis.id)] ?? 1) === 2 ? "doppelt" : "normal"}</strong>
            </div>

            <div className="optionGrid">
              {ANSWERS.map(a => {
                const tid = String(thesis.id);
                const selected = state.userAnswers[tid] === a.value;
                return (
                  <div
                    key={a.key}
                    className={"option " + (selected ? "optionSelected" : "")}
                    role="button"
                    tabIndex={0}
                    onClick={() => setAnswer(a.value)}
                    onKeyDown={(e)=>{ if(e.key==="Enter"||e.key===" "){ setAnswer(a.value);} }}
                  >
                    <div>
                      <strong>{a.label}</strong><br/>
                      <span>{a.value > 0 ? `+${a.value}` : a.value} Punkte</span>
                    </div>
                    {selected ? <span className="kbd">ausgewählt</span> : <span className="kbd">wählen</span>}
                  </div>
                );
              })}
            </div>

            <div className="hr"></div>

            <label className="checkbox" onClick={toggleWeight}>
              <input
                type="checkbox"
                checked={(state.weights[String(thesis.id)] ?? 1) === 2}
                onChange={toggleWeight}
              />
              <div>
                <div><strong>These doppelt gewichten</strong></div>
                <div className="small">Verdoppelt den Einfluss dieser These auf das Ergebnis.</div>
              </div>
            </label>

            <div className="hr"></div>

            <div className="btnrow">
              <button className="btn" disabled={!canGoBack} onClick={prev}>Zurück</button>
              <button className="btn" onClick={skip}>Überspringen</button>
              {state.idx < total - 1 ? (
                <button className="btn btnPrimary" onClick={next}>Weiter</button>
              ) : (
                <button className="btn btnGood" onClick={finish}>Ergebnis anzeigen</button>
              )}
            </div>

            <div className="hr"></div>
            <div className="progress" aria-label="Fortschritt">
              <div style={{ width: `${Math.round(((state.idx+1)/total)*100)}%`}} />
            </div>
          </div>

          <div className="card">
            <h2 className="h2">Kurzinfo</h2>
            <p className="muted">
              Matching basiert auf Abweichungen zwischen deiner Antwort und den hinterlegten Partei-Positionen.
              Maximalabweichung pro These ist 4 (von -2 bis +2).
            </p>
            <div className="hr"></div>
            <p className="muted">
              Tipp: Wenn du am Ende „0%“ siehst, sind entweder keine Antworten gespeichert oder es sind keine Partei-Positionen hinterlegt.
            </p>
            <div className="hr"></div>
            <button className="btn btnDanger" onClick={restart}>Alles zurücksetzen</button>
          </div>
        </div>
      )}

      {state.step === "results" && (
        <div className="grid">
          <div className="card">
            <h2 className="h2">Dein Ergebnis</h2>
            <p className="muted">
              Übereinstimmung in Prozent (je höher, desto näher). Berechnet aus den beantworteten Thesen.
            </p>

            <div className="hr"></div>

            <label className="checkbox">
              <input
                type="checkbox"
                checked={state.includeUnknown}
                onChange={(e)=> setState(s=>({ ...s, includeUnknown: e.target.checked }))}
              />
              <div>
                <div><strong>Unbekannte Partei-Positionen einbeziehen</strong></div>
                <div className="small">Behandelt „unbekannt“ als neutral (0). Sonst werden diese Thesen für die Partei ignoriert.</div>
              </div>
            </label>

            <div className="hr"></div>

            <table className="table">
              <thead>
                <tr>
                  <th>Rang</th>
                  <th>Liste/Partei</th>
                  <th>Match</th>
                  <th>Basis</th>
                </tr>
              </thead>
              <tbody>
                {scores.map((s, i) => (
                  <tr key={s.partyId}>
                    <td>{i+1}</td>
                    <td>{s.partyName}</td>
                    <td>
                      <div className="rank">
                        <span style={{width:48}}><strong>{s.match}%</strong></span>
                        <div className="bar"><div style={{width:`${s.match}%`}} /></div>
                      </div>
                    </td>
                    <td className="small">{s.used} Thesen{state.includeUnknown ? ` (davon ${s.unknownUsed} unbekannt)` : ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="hr"></div>

            <div className="btnrow">
              <button className="btn btnPrimary" onClick={() => setState(s => ({ ...s, step: "questions" }))}>
                Antworten ansehen/ändern
              </button>
              <button className="btn" onClick={copyShare}>Kurztext teilen</button>
              <button className="btn btnDanger" onClick={restart}>Neu starten</button>
            </div>

            <div className="footer">
              <strong>Hinweis:</strong> Dieser Check ist inoffiziell. Ergebnisse sind nur so gut wie die Thesen
              und die hinterlegten Partei-Positionen. Für eine seriöse Veröffentlichung: Quellen je These/Partei offenlegen.
            </div>
          </div>

          <div className="card">
            <h2 className="h2">Was fehlt noch für „öffentlich“?</h2>
            <ol className="muted">
              <li>Partei-Positionen befüllen (<span className="kbd">app/data/wahlcheck.json</span>)</li>
              <li>Quellenliste pro Partei/These ergänzen (z. B. Programme, Abstimmungen)</li>
              <li>Impressum/Haftungshinweis ergänzen (je nachdem, wo du hostest)</li>
            </ol>
            <div className="hr"></div>
            <details>
              <summary>Wie ich dir dabei helfen kann</summary>
              <p className="muted">
                Wenn du mir pro Partei ein paar Quellen (Links/Dateien) gibst oder Programme hochlädst,
                kann ich die Positionen konsistent kodieren (2/1/0/-1/-2) und dir die JSON-Datei fertig machen.
              </p>
            </details>
          </div>
        </div>
      )}
    </>
  );
}
