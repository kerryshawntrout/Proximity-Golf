document.getElementById('round-date').valueAsDate = new Date();

let currentRound = { course: '', date: '', totalHoles: 18, targetRing: 100, holes: [] };
let currentHoleIndex = 0;

const ringLabels = {
  '100': 'Outer Ring',
  '70': 'Mid Ring',
  '50': 'Inner Ring',
  '30': 'Bullseye'
};

const getStore = k => JSON.parse(localStorage.getItem(k) || 'null');
const setStore = (k, v) => localStorage.setItem(k, JSON.stringify(v));

function checkDraftRound() {
  const draft = getStore('proximity_golf_draft');
  document.getElementById('btn-resume').classList.toggle('hidden', !draft);
}

function startRound() {
  currentRound = {
    course: document.getElementById('course-name').value.trim() || 'Local Course',
    date: document.getElementById('round-date').value,
    totalHoles: parseInt(document.getElementById('hole-count').value, 10),
    targetRing: parseInt(document.getElementById('target-ring-size').value, 10),
    holes: Array.from({ length: parseInt(document.getElementById('hole-count').value, 10) }, () => ({
      par: 4, achievedRing: '100', ud: false, szGreenStrokes: 1, putt4: false, puttDist: 8, putts: 2, penalties: 0, score: 4
    }))
  };
  currentHoleIndex = 0;
  initTrackerUI();
}

function resumeDraftRound() {
  const draft = getStore('proximity_golf_draft');
  if (draft) {
    currentRound = draft.round;
    currentHoleIndex = draft.holeIndex || 0;
    initTrackerUI();
  }
}

function initTrackerUI() {
  ['setup-view', 'plan-view'].forEach(id => document.getElementById(id).classList.add('hidden'));
  document.getElementById('tracker-view').classList.remove('hidden');
  const targetName = ringLabels[currentRound.targetRing] || `${currentRound.targetRing}Y`;
  document.getElementById('round-info-header').innerText = `${currentRound.course} (${targetName})`;
  loadHoleData();
}

function loadHoleData() {
  const d = currentRound.holes[currentHoleIndex];
  document.getElementById('current-hole-title').innerText = `Hole ${currentHoleIndex + 1} of ${currentRound.totalHoles}`;
  document.getElementById('num-par').value = d.par || 4;
  document.getElementById('sz-achieved').value = d.achievedRing || '100';
  setToggleState('ud', d.ud);
  document.getElementById('num-sz-green-strokes').value = d.szGreenStrokes;
  setToggleState('putt4', d.putt4);
  document.getElementById('num-putt-dist').value = d.puttDist;
  document.getElementById('num-putts').value = d.putts;
  document.getElementById('num-penalties').value = d.penalties || 0;
  document.getElementById('num-score').value = d.score;

  document.getElementById('btn-prev').style.display = currentHoleIndex === 0 ? 'none' : 'block';
  const isLast = currentHoleIndex === currentRound.totalHoles - 1;
  document.getElementById('btn-next').classList.toggle('hidden', isLast);
  document.getElementById('btn-finish').classList.toggle('hidden', !isLast);
}

function saveCurrentHoleData() {
  currentRound.holes[currentHoleIndex] = {
    par: +document.getElementById('num-par').value || 4,
    achievedRing: document.getElementById('sz-achieved').value,
    ud: document.getElementById('btn-ud').classList.contains('active'),
    szGreenStrokes: +document.getElementById('num-sz-green-strokes').value || 0,
    putt4: document.getElementById('btn-putt4').classList.contains('active'),
    puttDist: +document.getElementById('num-putt-dist').value || 0,
    putts: +document.getElementById('num-putts').value || 0,
    penalties: +document.getElementById('num-penalties').value || 0,
    score: +document.getElementById('num-score').value || 0
  };
  setStore('proximity_golf_draft', { round: currentRound, holeIndex: currentHoleIndex });
}

function toggleStat(id) {
  setToggleState(id, !document.getElementById(`btn-${id}`).classList.contains('active'));
}

function setToggleState(id, active) {
  const btn = document.getElementById(`btn-${id}`);
  btn.classList.toggle('active', active);
  btn.innerText = active ? '✓' : '✕';
}

function changeHole(delta) {
  saveCurrentHoleData();
  currentHoleIndex += delta;
  loadHoleData();
}

function evaluateRingPerformance(achieved, target) {
  const val = { 'GIR': 0, '30': 30, '50': 50, '70': 70, '100': 100, 'MISS': 999 }[achieved];
  if (val < target) return 'BETTERED';
  if (val === target) return 'HIT';
  return (val > target && val <= 100) ? 'MISSED_IN_WIDER' : 'MISSED_ALL';
}

function saveRound() {
  saveCurrentHoleData();
  let totals = { score: 0, par: 0, putts: 0, penalties: 0, ud: 0, putt4: 0, puttDist: 0, bettered: 0, hit: 0, wider: 0, miss: 0 };
  const N = currentRound.totalHoles;

  currentRound.holes.forEach(h => {
    totals.score += h.score;
    totals.par += h.par;
    totals.putts += h.putts;
    totals.penalties += h.penalties;
    totals.puttDist += h.puttDist;
    if (h.ud) totals.ud++;
    if (h.putt4) totals.putt4++;

    const p = evaluateRingPerformance(h.achievedRing, currentRound.targetRing);
    if (p === 'BETTERED') totals.bettered++;
    else if (p === 'HIT') totals.hit++;
    else if (p === 'MISSED_IN_WIDER') totals.wider++;
    else totals.miss++;
  });

  const roundSummary = {
    id: Date.now(),
    course: currentRound.course,
    date: currentRound.date,
    totalHoles: N,
    targetRing: currentRound.targetRing,
    totalPar: totals.par,
    totalScore: totals.score,
    totalPutts: totals.putts,
    totalPenalties: totals.penalties,
    avgPuttDist: Math.round((totals.puttDist / N) * 10) / 10,
    betteredPct: Math.round((totals.bettered / N) * 100),
    hitPct: Math.round((totals.hit / N) * 100),
    missedInWiderPct: Math.round((totals.wider / N) * 100),
    missedAllPct: Math.round((totals.miss / N) * 100),
    udPct: Math.round((totals.ud / N) * 100),
    putt4Pct: Math.round((totals.putt4 / N) * 100)
  };

  const savedRounds = getStore('proximity_golf_rounds') || [];
  savedRounds.unshift(roundSummary);
  setStore('proximity_golf_rounds', savedRounds);
  localStorage.removeItem('proximity_golf_draft');

  document.getElementById('tracker-view').classList.add('hidden');
  ['setup-view', 'plan-view'].forEach(id => document.getElementById(id).classList.remove('hidden'));
  checkDraftRound();
  renderHistory();
  updatePracticePlan();
}

function deleteRound(id) {
  if (confirm('Delete this round?')) {
    setStore('proximity_golf_rounds', (getStore('proximity_golf_rounds') || []).filter(r => r.id !== id));
    renderHistory();
    updatePracticePlan();
  }
}

function exportToCSV() {
  const saved = getStore('proximity_golf_rounds') || [];
  if (!saved.length) return alert('No rounds to export.');
  const headers = ['Date','Course','Holes','Target Ring','Total Par','Total Score','Penalties','Total Putts','Bettered %','Hit %','Missed Outer %','Off Target %','Up&Down %','1st Putt <4ft %'];
  const rows = saved.map(r => [
    `"${r.date}"`, `"${r.course}"`, r.totalHoles, `"${ringLabels[r.targetRing] || r.targetRing}"`,
    r.totalPar, r.totalScore, r.totalPenalties, r.totalPutts, `"${r.betteredPct}%"`, `"${r.hitPct}%"`,
    `"${r.missedInWiderPct}%"`, `"${r.missedAllPct}%"`, `"${r.udPct}%"`, `"${r.putt4Pct}%"`
  ]);
  const blob = new Blob([[headers.join(','), ...rows.map(e => e.join(','))].join('\n')], { type: 'text/csv;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `proximity_golf_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
}

function updatePracticePlan() {
  const saved = (getStore('proximity_golf_rounds') || []).slice(0, 5);
  const container = document.getElementById('plan-content');
  if (!saved.length) {
    return container.innerHTML = '<p class="sub-text">Play a round to unlock personalized practice recommendations.</p>';
  }

  const avgHitAndBettered = Math.round(saved.reduce((a, r) => a + r.hitPct + r.betteredPct, 0) / saved.length);
  const avgUD = Math.round(saved.reduce((a, r) => a + r.udPct, 0) / saved.length);
  const avgPutt4 = Math.round(saved.reduce((a, r) => a + r.putt4Pct, 0) / saved.length);

  let title = '', desc = '';
  if (avgHitAndBettered < 50) {
    title = `🎯 Focus: Hitting Target Ring (${avgHitAndBettered}% Hit/Bettered)`;
    desc = `You are missing your targeted proximity ring on over half your holes. Focus on tee shot placement and conservative layups.`;
  } else if (avgUD < 40) {
    title = `⛳ Focus: Short Game (Up & Down: ${avgUD}%)`;
    desc = `Practice chip-and-run shots from 30–50 yards into a 6-foot circle.`;
  } else {
    title = `🏒 Focus: Speed Control (1st Putt < 4ft: ${avgPutt4}%)`;
    desc = `Focus on speed-control drills from 30+ feet to eliminate three-putts.`;
  }
  container.innerHTML = `<div class="plan-box"><div class="plan-title">${title}</div><p class="plan-desc">${desc}</p></div>`;
}

function renderHistory() {
  const saved = getStore('proximity_golf_rounds') || [];
  const container = document.getElementById('history-list');
  if (!saved.length) return container.innerHTML = '<p class="sub-text">No saved rounds yet.</p>';

  container.innerHTML = saved.map(r => {
    const diff = r.totalPar ? r.totalScore - r.totalPar : null;
    const parStr = diff !== null ? (diff > 0 ? `(+${diff})` : diff === 0 ? '(E)' : `(${diff})`) : '';
    const tName = ringLabels[r.targetRing] || `${r.targetRing}Y`;
    return `
      <div class="history-item">
        <div class="history-item-header">
          <h4 class="history-item-title">${r.course} (${r.totalHoles}H)</h4>
          <button class="btn-danger btn-delete" onclick="deleteRound(${r.id})">Delete</button>
        </div>
        <div class="stat-grid">
          <span><strong>Date:</strong> ${r.date}</span><span><strong>Score:</strong> ${r.totalScore} ${parStr}</span>
          <span><strong>Target:</strong> ${tName}</span><span><strong>Bettered:</strong> ${r.betteredPct}%</span>
          <span><strong>Hit:</strong> ${r.hitPct}%</span><span><strong>Miss Outer:</strong> ${r.missedInWiderPct}%</span>
          <span><strong>Off Target:</strong> ${r.missedAllPct}%</span><span><strong>Up&Down:</strong> ${r.udPct}%</span>
        </div>
      </div>`;
  }).join('');
}

// Initial checks & renders
checkDraftRound();
renderHistory();
updatePracticePlan();

// Service Worker Registration
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js').then(r => r.update());
}
