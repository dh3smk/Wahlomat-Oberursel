export const ANSWERS = [
  { key: "agree", label: "Stimme zu", value: 2 },
  { key: "mostly_agree", label: "Stimme eher zu", value: 1 },
  { key: "neutral", label: "Neutral", value: 0 },
  { key: "mostly_disagree", label: "Stimme eher nicht zu", value: -1 },
  { key: "disagree", label: "Stimme nicht zu", value: -2 },
];

export function calcScores({ userAnswers, weights, data, includeUnknown = false }) {
  // userAnswers: { [thesisId]: number | null } where null = skipped
  // weights: { [thesisId]: 1 | 2 } default 1
  // data.positions: { partyId: { [thesisId]: number|null } } numbers aligned with ANSWERS values.
  const thesisIds = data.theses.map(t => String(t.id));
  const parties = data.parties;

  const scored = parties.map(p => {
    let diffSum = 0;
    let maxSum = 0;
    let used = 0;
    let unknownUsed = 0;

    for (const tid of thesisIds) {
      const ua = userAnswers[tid];
      if (ua === null || ua === undefined) continue;

      const w = weights[tid] ?? 1;
      const pa = data.positions[p.id]?.[tid];

      if (pa === null || pa === undefined) {
        // Unknown party position
        if (!includeUnknown) continue;
        unknownUsed += 1;
        // Treat unknown as neutral (0) but mark that it's unknown.
        const diff = Math.abs(ua - 0);
        diffSum += diff * w;
        maxSum += 4 * w;
        used += 1;
        continue;
      }

      const diff = Math.abs(ua - pa);
      diffSum += diff * w;
      maxSum += 4 * w;
      used += 1;
    }

    const match = used === 0 ? 0 : Math.max(0, 100 - (diffSum / maxSum) * 100);
    return { partyId: p.id, partyName: p.name, match: Math.round(match), used, unknownUsed };
  });

  scored.sort((a,b)=> b.match - a.match);
  return scored;
}

export function shareText(scores, data) {
  const top = scores.slice(0,3).map((s,i)=> `${i+1}. ${s.partyName} – ${s.match}%`).join("\n");
  return `Oberursel Wahl-Check 2026 (inoffiziell)\n\nTop-Matches:\n${top}\n\nHinweis: Ergebnisse hängen von Thesen & hinterlegten Partei-Positionen ab.`;
}

export function clamp(n, min, max){ return Math.min(max, Math.max(min, n)); }
