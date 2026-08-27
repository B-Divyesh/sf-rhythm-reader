import './style.css';
import { beatLabel, FREE_STYLES, generatePattern, spokenCount, STYLE_LABELS } from './rhythm';
import { scoreTaps } from './scoring';
import { captureReturnedLicense, checkoutUrl, hasOptimisticUnlock, storeLicense, verifyLicense } from './license';
import { readHistory, readSettings, recordDrill, saveSettings, streakDays, takeStorageRecoveryNotice, type DayRecord } from './storage';
import type { Meter, Pattern, ScoreResult, Settings, Style } from './types';

type Phase = 'idle' | 'counting' | 'playing' | 'result';

const mount = document.querySelector<HTMLDivElement>('#app');
if (!mount) throw new Error('App mount not found');
const app: HTMLDivElement = mount;

captureReturnedLicense();
let settings: Settings = readSettings();
let pattern: Pattern = generatePattern(settings.meter, settings.style, settings.bars, settings.difficulty);
let phase: Phase = 'idle';
let result: ScoreResult | null = null;
let taps: number[] = [];
let takeOrigin = 0;
let countBeat = 0;
let audioContext: AudioContext | null = null;
let micStream: MediaStream | null = null;
let micFrame = 0;
let micLastOnset = 0;
let isUnlocked = hasOptimisticUnlock();
let licenseNotice = '';
let historyRecords = readHistory();
const storageRecoveryNotice = takeStorageRecoveryNotice();
let calibrationExpected: number[] = [];
let calibrationSamples: number[] = [];
let calibrationRunning = false;
let updateAvailable = false;
let updateRegistration: ServiceWorkerRegistration | null = null;
let reloadForUpdate = false;

function getAudio(): AudioContext {
  audioContext ??= new AudioContext();
  return audioContext;
}

function clickSound(accent = false): void {
  const context = getAudio();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = 'square';
  oscillator.frequency.value = accent ? 1050 : 720;
  gain.gain.setValueAtTime(.0001, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(.11, context.currentTime + .006);
  gain.gain.exponentialRampToValueAtTime(.0001, context.currentTime + .065);
  oscillator.connect(gain).connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + .07);
}

function scoreSvg(activePattern: Pattern, activeResult: ScoreResult | null): string {
  const rows = Math.ceil(activePattern.bars / 2);
  const height = rows * 158;
  const width = 820;
  let content = '';
  for (let bar = 0; bar < activePattern.bars; bar += 1) {
    const row = Math.floor(bar / 2);
    const column = bar % 2;
    const startX = 42 + column * 400;
    const endX = startX + 344;
    const y = row * 158 + 42;
    for (let line = 0; line < 5; line += 1) content += `<line x1="${startX}" y1="${y + line * 8}" x2="${endX}" y2="${y + line * 8}" class="staff-line"/>`;
    content += `<line x1="${startX}" y1="${y}" x2="${startX}" y2="${y + 32}" class="bar-line"/><line x1="${endX}" y1="${y}" x2="${endX}" y2="${y + 32}" class="bar-line"/>`;
    if (bar === 0) content += `<text x="${startX + 7}" y="${y + 26}" class="meter-mark">${activePattern.meter.replace('/', '⁄')}</text>`;
    for (let beat = 0; beat < activePattern.beatsPerBar; beat += 1) {
      const x = startX + (beat / activePattern.beatsPerBar) * 344;
      content += `<text x="${x + 18}" y="${y + 60}" class="beat-number">${beat + 1}</text>`;
    }
  }
  activePattern.notes.forEach((note, index) => {
    const row = Math.floor(note.bar / 2);
    const column = note.bar % 2;
    const within = note.beat - note.bar * activePattern.beatsPerBar;
    const x = 42 + column * 400 + (within / activePattern.beatsPerBar) * 344 + 14;
    const y = row * 158 + 58 - (note.accent ? 4 : 0);
    const short = note.duration <= .3;
    content += `<g class="note${note.accent ? ' note--accent' : ''}"><ellipse cx="${x}" cy="${y}" rx="7.5" ry="5.3" transform="rotate(-18 ${x} ${y})"/><line x1="${x + 6}" y1="${y}" x2="${x + 6}" y2="${y - 30}"/>${short ? `<path d="M${x + 6} ${y - 30} q14 5 9 17"/>` : ''}</g>`;
    const mark = activeResult?.notes[index];
    if (mark) {
      const label = mark.kind === 'on' ? 'ON' : mark.kind === 'early' ? 'E' : mark.kind === 'late' ? 'L' : '×';
      const detail = mark.offsetMs === undefined ? 'missed' : `${mark.offsetMs > 0 ? '+' : ''}${Math.round(mark.offsetMs)}ms`;
      content += `<g class="timing timing--${mark.kind}"><circle cx="${x}" cy="${y + 32}" r="11"/><text x="${x}" y="${y + 36}">${label}</text><title>${detail}</title></g>`;
    }
  });
  const description = activeResult
    ? activeResult.notes.map((note, index) => `Note ${index + 1}: ${note.kind}${note.offsetMs === undefined ? '' : ` ${Math.round(Math.abs(note.offsetMs))} milliseconds ${note.offsetMs < 0 ? 'early' : 'late'}`}`).join('. ')
    : `${activePattern.bars} bars in ${activePattern.meter}, ${activePattern.notes.length} notes. Count ${spokenCount(activePattern)}.`;
  return `<svg class="notation" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="score-title score-desc"><title id="score-title">${STYLE_LABELS[activePattern.style]} rhythm</title><desc id="score-desc">${description}</desc>${content}</svg>`;
}

function calendar(history: DayRecord[]): string {
  const byDate = new Map(history.map((day) => [day.date, day]));
  const days: string[] = [];
  const today = new Date();
  for (let back = 13; back >= 0; back -= 1) {
    const date = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - back));
    const key = date.toISOString().slice(0, 10);
    const item = byDate.get(key);
    const label = date.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', timeZone: 'UTC' });
    days.push(`<li class="practice-day ${item ? 'practice-day--done' : ''}" title="${label}: ${item?.drills ?? 0} drills"><span aria-hidden="true">${date.getUTCDate()}</span><span class="sr-only">${label}, ${item?.drills ?? 0} completed drills</span></li>`);
  }
  return days.join('');
}

function render(): void {
  const totalToday = historyRecords.find((day) => day.date === new Date().toISOString().slice(0, 10))?.drills ?? 0;
  const statusText = phase === 'counting' ? `Count in: ${countBeat}` : phase === 'playing' ? 'Your take is recording' : phase === 'result' ? `Take scored ${result?.score ?? 0} percent` : 'Ready for a new take';
  const resultPanel = result ? `<section class="result-sheet" aria-labelledby="result-title">
    <div><p class="eyebrow">Take ${totalToday}</p><h2 id="result-title"><span>${result.score}%</span> ${result.message}</h2></div>
    <dl class="take-stats"><div><dt>Average edge</dt><dd>${result.meanAbsOffset} ms</dd></div><div><dt>Extra taps</dt><dd>${result.extraTaps}</dd></div></dl>
    <div class="legend" aria-label="Timing marker legend"><span class="early">E early</span><span class="on">ON in time</span><span class="late">L late</span><span class="missed">× missed</span></div>
    <div class="result-actions"><button class="button button--ink" data-action="again">Again</button><button class="button" data-action="stay">New, same level</button><button class="button" data-action="harder">Make it harder</button></div>
  </section>` : '';

  app.innerHTML = `
    <header class="masthead">
      <a class="wordmark" href="/" aria-label="Rhythm Reader home"><span>RR</span> Rhythm Reader</a>
      <nav aria-label="Utility"><a href="#how">How it reads</a><a href="#practice-log">Practice log</a><button class="text-button" data-action="open-unlock">${isUnlocked ? 'Style pack active' : 'Unlock styles'}</button></nav>
    </header>
    <main id="main">
      <section class="hero" aria-labelledby="page-title">
        <div class="hero-copy"><p class="kicker">Sight-read the rhythm. Hear the truth.</p><h1 id="page-title">Don’t guess<br><em>the groove.</em></h1><p class="lede">Read a short, real-feeling pattern. Tap it back. See exactly where every note landed—early, late, or missed.</p><a class="button button--ink" href="#trainer">Start a take <span aria-hidden="true">↓</span></a><p class="local-note">No account. Your practice log stays on this device.</p></div>
        <picture class="hero-art"><source srcset="/art/rhythm-cassette.webp" type="image/webp"><img src="/art/rhythm-cassette.webp" width="1200" height="800" alt="Cassette, rhythm blocks and marked-up music scraps arranged as a rehearsal zine collage" loading="lazy" decoding="async"></picture>
        <div class="tape-label" aria-hidden="true"><b>SIDE A</b><span>READ → TAP → KNOW</span></div>
      </section>

      <div id="connection" class="connection" role="status" ${navigator.onLine ? 'hidden' : ''}>Offline — practice still works. License checks will resume when you reconnect.</div>
      <div id="storage-recovery" class="connection connection--recovery" role="status" ${storageRecoveryNotice ? '' : 'hidden'}>${storageRecoveryNotice}</div>
      <div id="app-update" class="connection connection--update" role="status" ${updateAvailable ? '' : 'hidden'}>A new Rhythm Reader is ready. <button data-action="activate-update">Reload update</button></div>
      <section class="workbench" id="trainer" aria-label="Rhythm trainer">
        <div class="score-column">
          <div class="score-heading"><div><p class="eyebrow">Pattern <span>${pattern.id.slice(0, 4)}</span></p><h2>${STYLE_LABELS[pattern.style]} / level ${pattern.difficulty}</h2></div><button class="shuffle" data-action="new-pattern" ${phase === 'counting' || phase === 'playing' ? 'disabled' : ''}>New pattern <span aria-hidden="true">↻</span></button></div>
          <div class="score-paper" tabindex="0" aria-label="Rhythm notation; scroll horizontally on a small screen">${scoreSvg(pattern, result)}</div>
          <p class="count-guide"><b>Count it:</b> ${spokenCount(pattern)} <span>• ${settings.tempo} BPM, ${beatLabel(pattern.meter)}</span></p>
          <div class="deck" data-phase="${phase}">
            <div class="deck-top"><span class="record-light" aria-hidden="true"></span><strong>${statusText}</strong><span class="counter">${String(taps.length).padStart(2, '0')} TAPS</span></div>
            <div class="count-lamps" aria-label="Count in beat ${countBeat || 0}">${Array.from({ length: pattern.beatsPerBar }, (_, i) => `<i class="${phase === 'counting' && i + 1 === countBeat ? 'lit' : ''}">${i + 1}</i>`).join('')}</div>
            <button class="tap-pad" data-action="tap" aria-label="${phase === 'idle' || phase === 'result' ? 'Start take' : phase === 'playing' ? 'Tap rhythm' : 'Wait for count in'}"><span>${phase === 'playing' ? 'TAP' : phase === 'counting' ? 'COUNT' : 'START TAKE'}</span><small>${settings.inputMode === 'tap' ? 'Spacebar or screen' : 'Clap into microphone'}</small></button>
            <div class="deck-tools"><button data-action="toggle-input" aria-pressed="${settings.inputMode === 'mic'}"><span aria-hidden="true">${settings.inputMode === 'mic' ? '◉' : '⌨'}</span> ${settings.inputMode === 'mic' ? 'Mic listening' : 'Tap input'}</button><button data-action="open-calibration"><span aria-hidden="true">±</span> Calibrate (${settings.calibrationMs > 0 ? '+' : ''}${settings.calibrationMs} ms)</button></div>
          </div>
          <p class="keyboard-help">Keyboard: <kbd>Space</kbd> starts/taps · <kbd>N</kbd> new pattern · inputs remain normally editable.</p>
          <div id="live-status" class="sr-only" aria-live="polite">${statusText}</div>
          ${resultPanel}
        </div>

        <aside class="settings" aria-labelledby="setup-title">
          <p class="eyebrow">Set the drill</p><h2 id="setup-title">Your practice tape</h2>
          <div class="field"><label for="meter">Meter</label><select id="meter" data-setting="meter" ${phase === 'counting' || phase === 'playing' ? 'disabled' : ''}><option ${settings.meter === '4/4' ? 'selected' : ''}>4/4</option><option ${settings.meter === '3/4' ? 'selected' : ''}>3/4</option><option ${settings.meter === '6/8' ? 'selected' : ''}>6/8</option></select></div>
          <div class="field"><label for="tempo">Tempo <output for="tempo">${settings.tempo} BPM</output></label><input id="tempo" data-setting="tempo" type="range" min="50" max="160" step="2" value="${settings.tempo}" ${phase === 'counting' || phase === 'playing' ? 'disabled' : ''}></div>
          <fieldset><legend>Length</legend><div class="segmented">${[2, 3, 4].map((bars) => `<label><input type="radio" name="bars" value="${bars}" data-setting="bars" ${settings.bars === bars ? 'checked' : ''} ${phase === 'counting' || phase === 'playing' ? 'disabled' : ''}><span>${bars} bars</span></label>`).join('')}</div></fieldset>
          <div class="field"><label for="style">Style grammar</label><select id="style" data-setting="style" ${phase === 'counting' || phase === 'playing' ? 'disabled' : ''}>${(Object.keys(STYLE_LABELS) as Style[]).map((style) => `<option value="${style}" ${settings.style === style ? 'selected' : ''} ${!isUnlocked && !FREE_STYLES.includes(style) ? 'disabled' : ''}>${STYLE_LABELS[style]}${!isUnlocked && !FREE_STYLES.includes(style) ? ' — pack' : ''}</option>`).join('')}</select>${!isUnlocked ? '<button class="underlink" data-action="open-unlock">Get pop, swing + clave →</button>' : '<p class="field-note">All style grammars active.</p>'}</div>
          <div class="level"><div><label for="level">Difficulty</label><span>${settings.difficulty} / 5</span></div><input id="level" data-setting="difficulty" type="range" min="1" max="5" value="${settings.difficulty}"><label class="check"><input type="checkbox" data-setting="lockLevel" ${settings.lockLevel ? 'checked' : ''}><span>Stay at this level</span></label></div>
          <p class="settings-note">Patterns use original style grammars—not copied songs or random note soup.</p>
        </aside>
      </section>

      <section class="how" id="how" aria-labelledby="how-title">
        <div><p class="eyebrow">Honest feedback</p><h2 id="how-title">The take gets marked where you played it.</h2></div>
        <ol><li><span>01</span><b>Read</b><p>Scan the whole phrase and count a bar in your head.</p></li><li><span>02</span><b>Tap or clap</b><p>Use Space, the big pad, or your microphone after the count-in.</p></li><li><span>03</span><b>Read the edges</b><p>Every onset gets an early, on-time, late, or missed mark—plus a score.</p></li></ol>
      </section>

      <section class="practice-log" id="practice-log" aria-labelledby="log-title"><div><p class="eyebrow">Your last 14 days</p><h2 id="log-title">${streakDays(historyRecords)} day streak <span>· ${totalToday} takes today</span></h2></div><ol class="calendar">${calendar(historyRecords)}</ol></section>

      <section class="unlock" id="unlock" aria-labelledby="unlock-title"><div><p class="eyebrow">Side B style pack</p><h2 id="unlock-title">More musical words. One clean purchase.</h2><p>Unlock pop backbeat, swing, and 3–2 clave grammars plus future polyrhythm packs for <strong>$9 once</strong>. Core folk and march practice stays free.</p></div><div class="unlock-actions"><a class="button button--acid" href="${checkoutUrl()}">Buy the style pack</a><button class="underlink underlink--light" data-action="restore">Have a license? Restore it</button><p>Sociobot/Dodo is the merchant of record. No subscription.</p></div></section>
    </main>
    <footer><div class="footer-mark">RR<span>KEEP<br>COUNTING</span></div><div><p>Runs locally. No analytics, ads, accounts, or uploaded recordings.</p><p><a href="/privacy/">Privacy</a> <a href="/terms/">Terms</a> <a href="https://github.com/B-Divyesh/sf-rhythm-reader">Source</a></p><small>Original AI-assisted collage; no copyrighted music is used. © 2026 Rhythm Reader.</small></div></footer>

    <dialog id="calibration-dialog" aria-labelledby="calibration-title"><button class="dialog-close" data-action="close-dialog" aria-label="Close calibration">×</button><p class="eyebrow">Device timing</p><h2 id="calibration-title">Tap with six clicks</h2><p>Use headphones if you can. Tap the pad or Space exactly when each click reaches your ears. We’ll subtract the measured device delay from future takes.</p><div class="calibration-meter" aria-hidden="true">${Array.from({ length: 6 }, (_, i) => `<i class="${calibrationSamples.length > i ? 'done' : ''}"></i>`).join('')}</div><button class="button button--ink calibration-tap" data-action="calibration-tap">${calibrationRunning ? 'Tap with click' : 'Start calibration'}</button><p id="calibration-status" role="status">Current offset: ${settings.calibrationMs} ms</p></dialog>
    <dialog id="license-dialog" aria-labelledby="license-title"><button class="dialog-close" data-action="close-dialog" aria-label="Close license dialog">×</button><p class="eyebrow">Restore purchase</p><h2 id="license-title">Paste your license</h2><form id="license-form"><label for="license-token">License token</label><input id="license-token" name="license" autocomplete="off" required><button class="button button--ink" type="submit">Verify and unlock</button><p class="form-status" role="status">${licenseNotice}</p></form><p class="dialog-fine">The token stays in this browser. <a href="/privacy/">Read privacy details</a>.</p></dialog>
  `;
}

function newPattern(): void {
  pattern = generatePattern(settings.meter, settings.style, settings.bars, settings.difficulty);
  phase = 'idle'; result = null; taps = []; render();
}

async function beginTake(): Promise<void> {
  if (phase === 'counting' || phase === 'playing') return;
  try {
    await getAudio().resume();
    if (settings.inputMode === 'mic') await startMicrophone();
  } catch (error) {
    settings.inputMode = 'tap'; saveSettings(settings);
    render();
    announce(error instanceof Error ? error.message : 'Microphone unavailable. Tap input is still ready.');
    return;
  }
  result = null; taps = []; phase = 'counting'; countBeat = 0; render();
  const beatMs = 60_000 / settings.tempo;
  const countBeats = pattern.beatsPerBar;
  for (let index = 0; index < countBeats; index += 1) {
    window.setTimeout(() => {
      countBeat = index + 1; clickSound(index === 0); render();
    }, index * beatMs);
  }
  window.setTimeout(() => {
    phase = 'playing'; countBeat = 0; takeOrigin = performance.now(); clickSound(true); render();
    const duration = pattern.bars * pattern.beatsPerBar * beatMs;
    window.setTimeout(finishTake, duration + Math.min(220, beatMs * .25));
  }, countBeats * beatMs);
}

function registerTap(): void {
  if (phase !== 'playing') return;
  taps.push(performance.now());
  const pad = document.querySelector('.tap-pad');
  pad?.classList.add('is-hit');
  window.setTimeout(() => pad?.classList.remove('is-hit'), 90);
  const counter = document.querySelector('.counter');
  if (counter) counter.textContent = `${String(taps.length).padStart(2, '0')} TAPS`;
}

function finishTake(): void {
  if (phase !== 'playing') return;
  stopMicrophone();
  const beatMs = 60_000 / settings.tempo;
  const expected = pattern.notes.map((note) => takeOrigin + note.beat * beatMs);
  result = scoreTaps(expected, taps, beatMs, settings.calibrationMs);
  phase = 'result';
  historyRecords = recordDrill(result.score);
  if (!settings.lockLevel && result.score >= 90) settings.difficulty = Math.min(5, settings.difficulty + 1);
  saveSettings(settings); render();
  document.querySelector('.result-sheet')?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'nearest' });
}

async function startMicrophone(): Promise<void> {
  if (!navigator.mediaDevices?.getUserMedia) throw new Error('This browser does not provide microphone input. Tap input is ready instead.');
  micStream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: true, autoGainControl: false } });
  const context = getAudio();
  const source = context.createMediaStreamSource(micStream);
  const analyser = context.createAnalyser();
  analyser.fftSize = 512; source.connect(analyser);
  const data = new Float32Array(analyser.fftSize);
  const listen = (): void => {
    analyser.getFloatTimeDomainData(data);
    const rms = Math.sqrt(data.reduce((sum, value) => sum + value * value, 0) / data.length);
    const now = performance.now();
    if (phase === 'playing' && rms > .06 && now - micLastOnset > 120) { micLastOnset = now; registerTap(); }
    if (micStream) micFrame = requestAnimationFrame(listen);
  };
  listen();
}

function stopMicrophone(): void {
  cancelAnimationFrame(micFrame);
  micStream?.getTracks().forEach((track) => track.stop()); micStream = null;
}

function announce(message: string): void {
  const target = document.querySelector('#live-status');
  if (target) target.textContent = message;
}

function openDialog(id: string): void {
  const dialog = document.querySelector<HTMLDialogElement>(id);
  dialog?.showModal();
}

function startCalibration(): void {
  if (calibrationRunning) { calibrationTap(); return; }
  void getAudio().resume();
  calibrationRunning = true; calibrationSamples = [];
  const first = performance.now() + 700;
  calibrationExpected = Array.from({ length: 6 }, (_, index) => first + index * 650);
  calibrationExpected.forEach((time, index) => window.setTimeout(() => { clickSound(index === 0); }, Math.max(0, time - performance.now())));
  render(); openDialog('#calibration-dialog');
  window.setTimeout(finishCalibration, 6 * 650 + 900);
}

function calibrationTap(): void {
  if (!calibrationRunning) { startCalibration(); return; }
  const now = performance.now();
  const unused = calibrationExpected[calibrationSamples.length];
  if (unused && Math.abs(now - unused) < 450) calibrationSamples.push(now - unused);
  const meter = document.querySelectorAll('.calibration-meter i');
  meter[calibrationSamples.length - 1]?.classList.add('done');
}

function finishCalibration(): void {
  if (!calibrationRunning) return;
  calibrationRunning = false;
  if (calibrationSamples.length >= 4) {
    const sorted = [...calibrationSamples].sort((a, b) => a - b);
    settings.calibrationMs = Math.round(Math.max(-250, Math.min(250, sorted[Math.floor(sorted.length / 2)])));
    saveSettings(settings);
  }
  render(); openDialog('#calibration-dialog');
  const status = document.querySelector('#calibration-status');
  if (status) status.textContent = calibrationSamples.length >= 4 ? `Saved offset: ${settings.calibrationMs} ms.` : 'Not enough matched taps. Try again in a quiet spot.';
}

function settingChanged(target: HTMLInputElement | HTMLSelectElement): void {
  const name = target.dataset.setting as keyof Settings;
  if (!name) return;
  if (name === 'tempo' || name === 'difficulty' || name === 'bars') (settings as unknown as Record<string, number>)[name] = Number(target.value);
  else if (name === 'lockLevel') settings.lockLevel = (target as HTMLInputElement).checked;
  else if (name === 'meter') settings.meter = target.value as Meter;
  else if (name === 'style') settings.style = target.value as Style;
  saveSettings(settings); pattern = generatePattern(settings.meter, settings.style, settings.bars, settings.difficulty); result = null; phase = 'idle'; render();
}

app.addEventListener('click', (event) => {
  const button = (event.target as HTMLElement).closest<HTMLElement>('[data-action]');
  if (!button) return;
  const action = button.dataset.action;
  if (action === 'tap') phase === 'playing' ? registerTap() : void beginTake();
  if (action === 'new-pattern' || action === 'stay') newPattern();
  if (action === 'again') { phase = 'idle'; result = null; taps = []; render(); void beginTake(); }
  if (action === 'harder') { settings.difficulty = Math.min(5, settings.difficulty + 1); saveSettings(settings); newPattern(); }
  if (action === 'toggle-input') { settings.inputMode = settings.inputMode === 'tap' ? 'mic' : 'tap'; saveSettings(settings); render(); }
  if (action === 'open-calibration') openDialog('#calibration-dialog');
  if (action === 'calibration-tap') calibrationTap();
  if (action === 'open-unlock') document.querySelector('#unlock')?.scrollIntoView({ behavior: 'smooth' });
  if (action === 'restore') openDialog('#license-dialog');
  if (action === 'close-dialog') (button.closest('dialog') as HTMLDialogElement | null)?.close();
  if (action === 'activate-update') {
    const waiting = updateRegistration?.waiting;
    if (waiting) {
      reloadForUpdate = true;
      waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  }
});

app.addEventListener('change', (event) => {
  const target = event.target as HTMLInputElement | HTMLSelectElement;
  if (target.dataset.setting) settingChanged(target);
});

app.addEventListener('input', (event) => {
  const target = event.target as HTMLInputElement;
  if (target.dataset.setting === 'tempo') {
    const output = document.querySelector<HTMLOutputElement>('output[for="tempo"]');
    if (output) output.value = `${target.value} BPM`;
  }
});

app.addEventListener('submit', async (event) => {
  if ((event.target as HTMLFormElement).id !== 'license-form') return;
  event.preventDefault();
  const form = event.target as HTMLFormElement;
  const data = new FormData(form);
  storeLicense(String(data.get('license') ?? ''));
  licenseNotice = 'Checking license…'; render(); openDialog('#license-dialog');
  const valid = await verifyLicense(true);
  isUnlocked = valid === true;
  licenseNotice = valid === true ? 'Style pack restored on this device.' : valid === null ? 'Could not reach the license service. Check your connection and try again.' : 'That license is not active for Rhythm Reader.';
  render(); openDialog('#license-dialog');
});

document.addEventListener('keydown', (event) => {
  const editable = (event.target as HTMLElement).matches('input, select, textarea');
  const openCalibration = document.querySelector<HTMLDialogElement>('#calibration-dialog')?.open;
  if (event.code === 'Space' && !editable) {
    event.preventDefault();
    if (openCalibration) calibrationTap(); else if (phase === 'playing') registerTap(); else if (phase === 'idle' || phase === 'result') void beginTake();
  }
  if (event.key.toLowerCase() === 'n' && !editable && phase !== 'counting' && phase !== 'playing') newPattern();
});

window.addEventListener('online', () => { const banner = document.querySelector<HTMLElement>('#connection'); if (banner) banner.hidden = true; });
window.addEventListener('offline', () => { const banner = document.querySelector<HTMLElement>('#connection'); if (banner) banner.hidden = false; });

render();
void verifyLicense().then((valid) => {
  if (valid === null) return;
  isUnlocked = valid;
  if (!valid && settings.style && !FREE_STYLES.includes(settings.style)) { settings.style = 'folk'; saveSettings(settings); pattern = generatePattern(settings.meter, settings.style, settings.bars, settings.difficulty); licenseNotice = 'License no longer active. Free styles are still ready.'; }
  render();
});

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register('/sw.js').then((registration) => {
      updateRegistration = registration;
      const showUpdate = (worker: ServiceWorker | null) => {
        if (worker?.state === 'installed' && navigator.serviceWorker.controller) {
          updateAvailable = true;
          render();
        }
      };
      showUpdate(registration.waiting);
      registration.addEventListener('updatefound', () => {
        const installing = registration.installing;
        installing?.addEventListener('statechange', () => showUpdate(installing));
      });
    });
  });
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloadForUpdate) window.location.reload();
  });
}
