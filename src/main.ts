import './style.css';
import { beatLabel, generatePattern, spokenCount, STYLE_LABELS } from './rhythm';
import { scoreTaps } from './scoring';
import {
  configureStorage, readHistory, readSettings, recordDrill, resetDemoStorage,
  saveSettings, seedDemoStorage, streakDays, takeStorageRecoveryNotice, type DayRecord,
} from './storage';
import type { Meter, Pattern, ScoreResult, Settings, Style } from './types';

type Phase = 'idle' | 'counting' | 'playing' | 'result';
type Route = 'home' | 'demo' | 'privacy' | 'terms' | 'not-found';

const mount = document.querySelector<HTMLDivElement>('#app');
if (!mount) throw new Error('App mount not found');
const app: HTMLDivElement = mount;

let route: Route = routeFromLocation();
let demoMode = route === 'demo';
let settings: Settings;
let pattern: Pattern;
let phase: Phase;
let result: ScoreResult | null;
let taps: number[] = [];
let practiceOrigin = 0;
let countBeat = 0;
let audioContext: AudioContext | null = null;
let micStream: MediaStream | null = null;
let micFrame = 0;
let micLastTap = 0;
let historyRecords: DayRecord[] = [];
let storageRecoveryNotice = '';
let calibrationExpected: number[] = [];
let calibrationSamples: number[] = [];
let calibrationRunning = false;
let updateAvailable = false;
let updateRegistration: ServiceWorkerRegistration | null = null;
let reloadForUpdate = false;

function routeFromLocation(): Route {
  const path = window.location.pathname.replace(/\/+$/u, '') || '/';
  if ((path === '/' && new URLSearchParams(location.search).get('demo') === '1') || path === '/demo') return 'demo';
  if (path === '/') return 'home';
  if (path === '/privacy') return 'privacy';
  if (path === '/terms') return 'terms';
  return 'not-found';
}

function sampleResult(activePattern: Pattern): ScoreResult {
  const beatMs = 60_000 / 88;
  const expected = activePattern.notes.map((note) => note.beat * beatMs);
  const sampleTaps = expected.slice(0, -1).map((time, index) => time + [-118, 8, 124, 24][index % 4]);
  return scoreTaps(expected, sampleTaps, beatMs);
}

function loadPracticeState(): void {
  demoMode = route === 'demo';
  configureStorage(demoMode);
  if (demoMode) seedDemoStorage();
  settings = readSettings();
  historyRecords = readHistory();
  storageRecoveryNotice = takeStorageRecoveryNotice();
  pattern = generatePattern(settings.meter, settings.style, settings.bars, settings.difficulty, demoMode ? 'two-bar-demo' : undefined);
  result = demoMode ? sampleResult(pattern) : null;
  phase = demoMode ? 'result' : 'idle';
  taps = [];
}

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
    ? activeResult.notes.map((note, index) => `Tap ${index + 1}: ${note.kind}${note.offsetMs === undefined ? '' : ` by ${Math.round(Math.abs(note.offsetMs))} milliseconds`}`).join('. ')
    : `${activePattern.bars} bars in ${activePattern.meter} with ${activePattern.notes.length} taps. Count ${spokenCount(activePattern)}.`;
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
    days.push(`<li class="practice-day ${item ? 'practice-day--done' : ''}" title="${label}: ${item?.drills ?? 0} practices"><span aria-hidden="true">${date.getUTCDate()}</span><span class="sr-only">${label}, ${item?.drills ?? 0} completed practices</span></li>`);
  }
  return days.join('');
}

function header(): string {
  return `<header class="masthead"><a class="wordmark" href="/" data-route aria-label="Rhythm Reader home"><span>RR</span> Rhythm Reader</a><nav aria-label="Main navigation"><a href="/demo" data-route>Demo</a><a href="/#how" data-route>How it works</a><a href="/privacy" data-route>Privacy</a></nav></header>`;
}

function footer(): string {
  return `<footer><div class="footer-mark">RR<span>READ<br>TAP<br>CHECK</span></div><div><p>Practice rhythm patterns and check each tap.</p><p><a href="/privacy" data-route>Privacy</a><a href="/terms" data-route>Terms</a><a href="https://github.com/B-Divyesh/sf-rhythm-reader">Source code <span class="sr-only">(external)</span></a></p><small>Collage created for Rhythm Reader with AI assistance. © 2026 Rhythm Reader · build 1.1.0 · Built by Param Factory.</small></div></footer>`;
}

function demoBanner(): string {
  if (!demoMode) return '';
  return `<aside class="demo-banner" aria-label="Demo controls"><strong>Demo — sample data, nothing is saved</strong><span>Changes stay separate from your practice history.</span><div><button data-action="reset-demo">Reset demo</button><a href="/" data-route>Start for real</a></div></aside>`;
}

function resultPanel(): string {
  if (!result) return '';
  return `<section class="result-sheet" aria-labelledby="result-title"><div><p class="eyebrow">${demoMode ? 'Sample result' : 'Practice result'}</p><h2 id="result-title"><span>${result.score}%</span> ${result.message}</h2></div><dl class="practice-stats"><div><dt>Average timing gap</dt><dd>${result.meanAbsOffset} ms</dd></div><div><dt>Extra taps</dt><dd>${result.extraTaps}</dd></div></dl><div class="legend" aria-label="Timing marker key"><span class="early">E early</span><span class="on">ON on time</span><span class="late">L late</span><span class="missed">× missed</span></div><div class="result-actions"><button class="button button--ink" data-action="again">Try this rhythm again</button><button class="button" data-action="stay">Show a new rhythm</button><button class="button" data-action="harder">Raise the difficulty</button></div></section>`;
}

function workbench(): string {
  const totalToday = historyRecords.find((day) => day.date === new Date().toISOString().slice(0, 10))?.drills ?? 0;
  const statusText = phase === 'counting' ? `Count in: ${countBeat}` : phase === 'playing' ? 'Timing your taps' : phase === 'result' ? `Practice scored ${result?.score ?? 0} percent` : 'Ready to start';
  return `<section class="workbench" id="trainer" aria-label="Rhythm practice"><div class="score-column"><div class="score-heading"><div><p class="eyebrow">Rhythm ${pattern.id.slice(0, 4)}</p><h2>${STYLE_LABELS[pattern.style]} · level ${pattern.difficulty}</h2></div><button class="shuffle" data-action="new-pattern" ${phase === 'counting' || phase === 'playing' ? 'disabled' : ''}>Show a new rhythm <span aria-hidden="true">↻</span></button></div><div class="score-paper" tabindex="0" aria-label="Rhythm notation. Scroll sideways on a small screen.">${scoreSvg(pattern, result)}</div><p class="count-guide"><b>Count:</b> ${spokenCount(pattern)} <span>· ${settings.tempo} BPM · ${beatLabel(pattern.meter)}</span></p><div class="deck" data-phase="${phase}"><div class="deck-top"><span class="record-light" aria-hidden="true"></span><strong>${statusText}</strong><span class="counter">${String(taps.length).padStart(2, '0')} TAPS</span></div><div class="count-lamps" aria-label="Count in beat ${countBeat || 0}">${Array.from({ length: pattern.beatsPerBar }, (_, i) => `<i class="${phase === 'counting' && i + 1 === countBeat ? 'lit' : ''}">${i + 1}</i>`).join('')}</div><button class="tap-pad" data-action="tap" aria-label="${phase === 'idle' || phase === 'result' ? 'Start rhythm practice' : phase === 'playing' ? 'Tap the rhythm' : 'Wait for the count in'}"><span>${phase === 'playing' ? 'TAP' : phase === 'counting' ? 'COUNT' : 'START PRACTICE'}</span><small>${settings.inputMode === 'tap' ? 'Space key or screen' : 'Clap into your microphone'}</small></button><div class="deck-tools"><button data-action="toggle-input" aria-pressed="${settings.inputMode === 'mic'}"><span aria-hidden="true">${settings.inputMode === 'mic' ? '◉' : '⌨'}</span> ${settings.inputMode === 'mic' ? 'Use microphone claps' : 'Use keyboard or screen taps'}</button><button data-action="open-calibration"><span aria-hidden="true">±</span> Adjust tap timing (${settings.calibrationMs > 0 ? '+' : ''}${settings.calibrationMs} ms)</button></div></div><p class="keyboard-help"><kbd>Space</kbd> starts or taps. <kbd>N</kbd> shows a new rhythm.</p><div id="live-status" class="sr-only" aria-live="polite">${statusText}</div>${resultPanel()}</div><aside class="settings" aria-labelledby="setup-title"><p class="eyebrow">Practice settings</p><h2 id="setup-title">Choose your rhythm</h2><div class="field"><label for="meter">Time signature</label><select id="meter" data-setting="meter" ${phase === 'counting' || phase === 'playing' ? 'disabled' : ''}><option ${settings.meter === '4/4' ? 'selected' : ''}>4/4</option><option ${settings.meter === '3/4' ? 'selected' : ''}>3/4</option><option ${settings.meter === '6/8' ? 'selected' : ''}>6/8</option></select></div><div class="field"><label for="tempo">Speed <output for="tempo">${settings.tempo} BPM</output></label><input id="tempo" data-setting="tempo" type="range" min="50" max="160" step="2" value="${settings.tempo}" ${phase === 'counting' || phase === 'playing' ? 'disabled' : ''}></div><fieldset><legend>Length</legend><div class="segmented">${[2, 3, 4].map((bars) => `<label><input type="radio" name="bars" value="${bars}" data-setting="bars" ${settings.bars === bars ? 'checked' : ''} ${phase === 'counting' || phase === 'playing' ? 'disabled' : ''}><span>${bars} bars</span></label>`).join('')}</div></fieldset><div class="field"><label for="style">Rhythm style</label><select id="style" data-setting="style" ${phase === 'counting' || phase === 'playing' ? 'disabled' : ''}>${(Object.keys(STYLE_LABELS) as Style[]).map((style) => `<option value="${style}" ${settings.style === style ? 'selected' : ''}>${STYLE_LABELS[style]}</option>`).join('')}</select></div><div class="level"><div><label for="level">Difficulty</label><span>${settings.difficulty} / 5</span></div><input id="level" data-setting="difficulty" type="range" min="1" max="5" value="${settings.difficulty}"><label class="check"><input type="checkbox" data-setting="lockLevel" ${settings.lockLevel ? 'checked' : ''}><span>Keep this difficulty</span></label></div><p class="settings-note">Choose folk, march, pop, swing, or clave rhythms.</p></aside></section><section class="practice-log" id="practice-history" aria-labelledby="history-title"><div><p class="eyebrow">Past 14 days</p><h2 id="history-title">Practice history <span>${streakDays(historyRecords)} day streak · ${totalToday} today</span></h2></div><ol class="calendar">${calendar(historyRecords)}</ol></section>`;
}

function homePage(): string {
  return `<main id="main"><section class="hero" aria-labelledby="page-title"><div class="hero-copy"><p class="kicker">Read · tap · check</p><h1 id="page-title" tabindex="-1">Practice reading rhythms by tapping them</h1><p class="lede">For adult pianists, guitarists, and drummers who want clear timing feedback before rehearsal.</p><div class="hero-action"><a class="button button--ink" href="/demo" data-route>Try it with sample data</a><span>See a scored two-bar rhythm right away.</span></div><ul class="plain-facts"><li>Works offline after your first visit.</li><li>Practice history stays in this browser.</li><li>Free to use. No account.</li></ul></div><picture class="hero-art"><source srcset="/art/rhythm-cassette.webp" type="image/webp"><img src="/art/rhythm-cassette.webp" width="1200" height="800" alt="Cassette, rhythm blocks, and marked rhythm scraps arranged like a rehearsal zine" fetchpriority="high" decoding="async"></picture><div class="tape-label" aria-hidden="true"><b>SIDE A</b><span>READ → TAP → CHECK</span></div></section>${statusBanners()}${workbench()}<section class="how" id="how" aria-labelledby="how-title"><div><p class="eyebrow">How rhythm practice works</p><h2 id="how-title">Check the timing of each tap.</h2></div><ol><li><span>01</span><b>Read the rhythm</b><p>Scan both bars and count one bar silently.</p></li><li><span>02</span><b>Tap or clap</b><p>Use Space, the large button, or microphone claps after the count.</p></li><li><span>03</span><b>Check each tap</b><p>See early, on-time, late, and missed marks with a score.</p></li></ol></section><section class="limits" aria-labelledby="limits-title"><p class="eyebrow">What it does not do</p><h2 id="limits-title">Timing practice, not music grading.</h2><p>Rhythm Reader does not grade pitch, read MIDI, or copy songs. It only compares your tap times with the shown rhythm.</p></section></main>`;
}

function demoPage(): string {
  return `<main id="main"><section class="demo-intro" aria-labelledby="page-title"><p class="kicker">Two-bar sample</p><h1 id="page-title" tabindex="-1">See a scored two-bar rhythm</h1><p>The marks show one early tap, on-time taps, late taps, and a missed tap.</p></section>${statusBanners()}${workbench()}</main>`;
}

function legalPage(kind: 'privacy' | 'terms'): string {
  if (kind === 'privacy') return `<main id="main" class="legal-page"><p class="kicker">Rhythm Reader</p><h1 id="page-title" tabindex="-1">Privacy</h1><p><strong>Effective 28 August 2026.</strong> Rhythm Reader has no advertising, analytics, account system, or tracking scripts.</p><h2>Data in your browser</h2><p>Practice settings, timing adjustment, daily totals, and scores use browser storage on this device.</p><p>Demo activity uses separate keys that start with <code>demo:</code>. Reset demo removes those keys.</p><h2>Microphone</h2><p>Microphone access is optional. Audio is checked in memory for claps and is not recorded or uploaded.</p><p>Screen and keyboard taps need no microphone permission.</p><h2>Your control</h2><p>Clear this site’s browser data to remove practice history and settings. Questions can be sent to <a href="mailto:privacy@sociobot.in">privacy@sociobot.in</a>.</p></main>`;
  return `<main id="main" class="legal-page"><p class="kicker">Rhythm Reader</p><h1 id="page-title" tabindex="-1">Terms</h1><p><strong>Effective 28 August 2026.</strong> Rhythm Reader is a free practice aid provided as-is.</p><h2>Using the trainer</h2><p>The timing score is an estimate, not a professional assessment of musical ability.</p><p>Do not use the site to disrupt its service or other visitors.</p><h2>Practice material</h2><p>The notation is for rhythm practice. Do not treat it as a song transcription.</p><h2>Warranty and liability</h2><p>The software comes without warranties where the law permits. We are not liable for indirect loss from its use.</p><h2>Contact</h2><p>Questions can be sent to <a href="mailto:support@sociobot.in">support@sociobot.in</a>.</p></main>`;
}

function notFoundPage(): string {
  return `<main id="main" class="not-found"><div class="lost-tape" aria-hidden="true"><span>?</span></div><p class="kicker">Tape not found</p><h1 id="page-title" tabindex="-1">This page missed the beat</h1><p>The address does not match a Rhythm Reader page.</p><a class="button button--ink" href="/" data-route>Return to rhythm practice</a></main>`;
}

function statusBanners(): string {
  return `<div id="connection" class="connection" role="status" ${navigator.onLine ? 'hidden' : ''}>You are offline. Rhythm practice is still available.</div><div id="storage-recovery" class="connection connection--recovery" role="status" ${storageRecoveryNotice ? '' : 'hidden'}>${storageRecoveryNotice}</div><div id="app-update" class="connection connection--update" role="status" ${updateAvailable ? '' : 'hidden'}>A new version is ready. <button data-action="activate-update">Reload the update</button></div>`;
}

const metadata: Record<Route, { title: string; description: string; path: string }> = {
  home: { title: 'Rhythm Reader — tap rhythm reading practice', description: 'Practice short rhythms by tapping them and see early, on-time, late, and missed feedback.', path: '/' },
  demo: { title: 'Demo — Rhythm Reader', description: 'Try a scored two-bar rhythm in an isolated sample demo.', path: '/demo' },
  privacy: { title: 'Privacy — Rhythm Reader', description: 'How Rhythm Reader handles practice data and microphone input.', path: '/privacy' },
  terms: { title: 'Terms — Rhythm Reader', description: 'Terms for using the free Rhythm Reader practice tool.', path: '/terms' },
  'not-found': { title: 'Page not found — Rhythm Reader', description: 'This Rhythm Reader page could not be found.', path: '/404' },
};

function setMetadata(): void {
  const data = metadata[route];
  const canonical = `https://rhythm-reader.sociobot.in${data.path}`;
  document.title = data.title;
  document.querySelector<HTMLMetaElement>('meta[name="description"]')?.setAttribute('content', data.description);
  document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute('href', canonical);
  document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.setAttribute('content', data.title);
  document.querySelector<HTMLMetaElement>('meta[property="og:description"]')?.setAttribute('content', data.description);
  document.querySelector<HTMLMetaElement>('meta[property="og:url"]')?.setAttribute('content', canonical);
  document.querySelector<HTMLMetaElement>('meta[name="twitter:title"]')?.setAttribute('content', data.title);
  document.querySelector<HTMLMetaElement>('meta[name="twitter:description"]')?.setAttribute('content', data.description);
}

function dialogs(): string {
  return `<dialog id="calibration-dialog" aria-labelledby="calibration-title"><button class="dialog-close" data-action="close-dialog" aria-label="Close timing adjustment">×</button><p class="eyebrow">Device timing</p><h2 id="calibration-title">Match six clicks</h2><p>Use headphones if possible. Tap the large button or Space when each click reaches your ears.</p><p>The saved adjustment is applied to later timing scores.</p><div class="calibration-meter" aria-hidden="true">${Array.from({ length: 6 }, (_, i) => `<i class="${calibrationSamples.length > i ? 'done' : ''}"></i>`).join('')}</div><button class="button button--ink calibration-tap" data-action="calibration-tap">${calibrationRunning ? 'Tap with the click' : 'Start timing adjustment'}</button><p id="calibration-status" role="status">Saved timing adjustment: ${settings.calibrationMs} ms</p></dialog>`;
}

function render(focusHeading = false): void {
  setMetadata();
  const content = route === 'home' ? homePage() : route === 'demo' ? demoPage() : route === 'privacy' ? legalPage('privacy') : route === 'terms' ? legalPage('terms') : notFoundPage();
  app.innerHTML = `${demoBanner()}${header()}${content}${footer()}${route === 'home' || route === 'demo' ? dialogs() : ''}`;
  document.querySelector('main')?.setAttribute('tabindex', '-1');
  if (focusHeading) {
    document.querySelector<HTMLElement>('#page-title')?.focus({ preventScroll: true });
    const announcer = document.querySelector('#route-announcer');
    if (announcer) announcer.textContent = document.title;
    window.scrollTo({ top: 0, behavior: 'auto' });
  }
}

function activateRoute(nextRoute: Route, focusHeading = true): void {
  stopMicrophone();
  route = nextRoute;
  loadPracticeState();
  render(focusHeading);
}

function navigate(href: string): void {
  const url = new URL(href, location.href);
  history.pushState({}, '', `${url.pathname}${url.search}${url.hash}`);
  activateRoute(routeFromLocation());
  if (url.hash) document.querySelector(url.hash)?.scrollIntoView();
}

function newPattern(): void {
  pattern = generatePattern(settings.meter, settings.style, settings.bars, settings.difficulty);
  phase = 'idle'; result = null; taps = []; render();
}

async function beginPractice(): Promise<void> {
  if (phase === 'counting' || phase === 'playing') return;
  try {
    await getAudio().resume();
    if (settings.inputMode === 'mic') await startMicrophone();
  } catch (error) {
    settings.inputMode = 'tap'; saveSettings(settings); render();
    announce(error instanceof Error ? error.message : 'Microphone access failed. Screen and keyboard taps are ready.');
    return;
  }
  result = null; taps = []; phase = 'counting'; countBeat = 0; render();
  const beatMs = 60_000 / settings.tempo;
  for (let index = 0; index < pattern.beatsPerBar; index += 1) window.setTimeout(() => { countBeat = index + 1; clickSound(index === 0); render(); }, index * beatMs);
  window.setTimeout(() => {
    phase = 'playing'; countBeat = 0; practiceOrigin = performance.now(); clickSound(true); render();
    window.setTimeout(finishPractice, pattern.bars * pattern.beatsPerBar * beatMs + Math.min(220, beatMs * .25));
  }, pattern.beatsPerBar * beatMs);
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

function finishPractice(): void {
  if (phase !== 'playing') return;
  stopMicrophone();
  const beatMs = 60_000 / settings.tempo;
  result = scoreTaps(pattern.notes.map((note) => practiceOrigin + note.beat * beatMs), taps, beatMs, settings.calibrationMs);
  phase = 'result';
  historyRecords = recordDrill(result.score);
  if (!settings.lockLevel && result.score >= 90) settings.difficulty = Math.min(5, settings.difficulty + 1);
  saveSettings(settings); render();
  document.querySelector('.result-sheet')?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'nearest' });
}

async function startMicrophone(): Promise<void> {
  if (!navigator.mediaDevices?.getUserMedia) throw new Error('This browser does not provide microphone input. Screen and keyboard taps are ready.');
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
    if (phase === 'playing' && rms > .06 && now - micLastTap > 120) { micLastTap = now; registerTap(); }
    if (micStream) micFrame = requestAnimationFrame(listen);
  };
  listen();
}

function stopMicrophone(): void {
  cancelAnimationFrame(micFrame);
  micStream?.getTracks().forEach((track) => track.stop());
  micStream = null;
}

function announce(message: string): void {
  const target = document.querySelector('#live-status');
  if (target) target.textContent = message;
}

function openDialog(id: string): void { document.querySelector<HTMLDialogElement>(id)?.showModal(); }

function startCalibration(): void {
  if (calibrationRunning) { calibrationTap(); return; }
  void getAudio().resume();
  calibrationRunning = true; calibrationSamples = [];
  const first = performance.now() + 700;
  calibrationExpected = Array.from({ length: 6 }, (_, index) => first + index * 650);
  calibrationExpected.forEach((time, index) => window.setTimeout(() => clickSound(index === 0), Math.max(0, time - performance.now())));
  render(); openDialog('#calibration-dialog');
  window.setTimeout(finishCalibration, 6 * 650 + 900);
}

function calibrationTap(): void {
  if (!calibrationRunning) { startCalibration(); return; }
  const now = performance.now();
  const expected = calibrationExpected[calibrationSamples.length];
  if (expected && Math.abs(now - expected) < 450) calibrationSamples.push(now - expected);
  document.querySelectorAll('.calibration-meter i')[calibrationSamples.length - 1]?.classList.add('done');
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
  if (status) status.textContent = calibrationSamples.length >= 4 ? `Saved timing adjustment: ${settings.calibrationMs} ms.` : 'Not enough taps matched. Try again in a quiet place.';
}

function settingChanged(target: HTMLInputElement | HTMLSelectElement): void {
  const name = target.dataset.setting as keyof Settings;
  if (!name) return;
  if (name === 'tempo' || name === 'difficulty' || name === 'bars') (settings as unknown as Record<string, number>)[name] = Number(target.value);
  else if (name === 'lockLevel') settings.lockLevel = (target as HTMLInputElement).checked;
  else if (name === 'meter') settings.meter = target.value as Meter;
  else if (name === 'style') settings.style = target.value as Style;
  saveSettings(settings);
  pattern = generatePattern(settings.meter, settings.style, settings.bars, settings.difficulty);
  result = null; phase = 'idle'; render();
}

app.addEventListener('click', (event) => {
  const link = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[data-route]');
  if (link && event instanceof MouseEvent && event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
    event.preventDefault(); navigate(link.href); return;
  }
  const button = (event.target as HTMLElement).closest<HTMLElement>('[data-action]');
  if (!button) return;
  const action = button.dataset.action;
  if (action === 'tap') phase === 'playing' ? registerTap() : void beginPractice();
  if (action === 'new-pattern' || action === 'stay') newPattern();
  if (action === 'again') { phase = 'idle'; result = null; taps = []; render(); void beginPractice(); }
  if (action === 'harder') { settings.difficulty = Math.min(5, settings.difficulty + 1); saveSettings(settings); newPattern(); }
  if (action === 'toggle-input') { settings.inputMode = settings.inputMode === 'tap' ? 'mic' : 'tap'; saveSettings(settings); render(); }
  if (action === 'open-calibration') openDialog('#calibration-dialog');
  if (action === 'calibration-tap') calibrationTap();
  if (action === 'close-dialog') (button.closest('dialog') as HTMLDialogElement | null)?.close();
  if (action === 'reset-demo') { resetDemoStorage(); activateRoute('demo', false); announce('The sample demo was reset.'); }
  if (action === 'activate-update') {
    const waiting = updateRegistration?.waiting;
    if (waiting) { reloadForUpdate = true; waiting.postMessage({ type: 'SKIP_WAITING' }); }
  }
});

app.addEventListener('change', (event) => {
  const target = event.target as HTMLInputElement | HTMLSelectElement;
  if (target.dataset.setting) settingChanged(target);
});

app.addEventListener('input', (event) => {
  const target = event.target as HTMLInputElement;
  if (target.dataset.setting === 'tempo') document.querySelector<HTMLOutputElement>('output[for="tempo"]')!.value = `${target.value} BPM`;
});

document.addEventListener('keydown', (event) => {
  const editable = (event.target as HTMLElement).matches('input, select, textarea');
  const openCalibration = document.querySelector<HTMLDialogElement>('#calibration-dialog')?.open;
  if (event.code === 'Space' && !editable && (route === 'home' || route === 'demo')) {
    event.preventDefault();
    if (openCalibration) calibrationTap(); else if (phase === 'playing') registerTap(); else if (phase === 'idle' || phase === 'result') void beginPractice();
  }
  if (event.key.toLowerCase() === 'n' && !editable && phase !== 'counting' && phase !== 'playing' && (route === 'home' || route === 'demo')) newPattern();
});

window.addEventListener('popstate', () => activateRoute(routeFromLocation()));
window.addEventListener('online', () => { const banner = document.querySelector<HTMLElement>('#connection'); if (banner) banner.hidden = true; });
window.addEventListener('offline', () => { const banner = document.querySelector<HTMLElement>('#connection'); if (banner) banner.hidden = false; });

loadPracticeState();
render();

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register('/sw.js').then((registration) => {
      updateRegistration = registration;
      const showUpdate = (worker: ServiceWorker | null) => {
        if (worker?.state === 'installed' && navigator.serviceWorker.controller) { updateAvailable = true; render(); }
      };
      showUpdate(registration.waiting);
      registration.addEventListener('updatefound', () => {
        const installing = registration.installing;
        installing?.addEventListener('statechange', () => showUpdate(installing));
      });
    });
  });
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (reloadForUpdate) window.location.reload(); });
}
