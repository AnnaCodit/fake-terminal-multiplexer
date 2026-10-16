(() => {
  'use strict';

  const $ = (selector) => document.querySelector(selector);
  const int = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const pick = (items) => items[int(0, items.length - 1)];
  const hex = (length) => Array.from({ length }, () => int(0, 15).toString(16)).join('');
  const time = () => new Date().toLocaleTimeString('en-GB', { hour12: false });
  const brands = ['FRA3A', 'BAKA_VIRUS', 'KOMARIK PROTO'];
  const bar = (percent, width = 18) => {
    const filled = Math.round(Math.max(0, Math.min(100, percent)) * width / 100);
    return '[' + '='.repeat(filled) + (filled < width ? '>' : '') + ' '.repeat(Math.max(0, width - filled - 1)) + '] ' + String(percent).padStart(3) + '%';
  };
  function brand(text, chance = 0.018) {
    if (Math.random() >= chance || /FRA3A|BAKA_VIRUS|KOMARIK PROTO/.test(text)) return text;
    const words = [...text.matchAll(/\b[A-Za-z_][A-Za-z_0-9]{3,18}\b/g)].filter((word) => !/^(const|function|return|import|from|class|async|await|false|true|undefined)$/.test(word[0]));
    if (!words.length) return text;
    const word = pick(words);
    return text.slice(0, word.index) + pick(brands) + text.slice(word.index + word[0].length);
  }
  const helpers = { int, pick, hex, bar, time, brand, omen: () => window.FRA3ALore.next() };
  const speeds = [0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4];
  let speed = 1;
  let fontSize = null;
  let paused = false;
  // All schedules use active display time, so a paused or hidden tab never jumps ahead.
  let clock = 0;
  let previousFrame = performance.now();
  let nextIntrusion = int(9000, 17000);
  let nextEpisode = int(18000, 25000);
  let nextAnomaly = int(12000, 19000);
  let nextGlitch = int(24000, 39000);
  let activeEpisode = null;
  let lastEpisodeKind = null;
  let lastEpisodePane = null;
  let glitchUntil = 0;
  let anomalyDeck = null;
  const seenAnomalyLines = new Set();
  const recentAnomalyKinds = [];
  const episodeDeck = [];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const paneStates = [];

  function maintainBuffer(state) {
    const height = parseFloat(getComputedStyle(state.terminal).lineHeight) || 17;
    const limit = Math.max(24, Math.ceil(state.terminal.clientHeight / height) + 14);
    while (state.terminal.childElementCount > limit) state.terminal.firstElementChild.remove();
    state.terminal.scrollTop = state.terminal.scrollHeight;
  }

  function addLine(state, item, { replace = false, typing = false, intrusion = false } = {}) {
    const text = intrusion ? String(item.text) : brand(String(item.text));
    let node = replace && state.replaceTarget?.isConnected ? state.replaceTarget : null;
    if (!node) {
      node = document.createElement('div');
      state.terminal.append(node);
    }
    node.className = 'terminal-line';
    if (['muted', 'red', 'green', 'white', 'command'].includes(item.tone)) node.classList.add(item.tone);
    if (intrusion) node.classList.add('intrusion');
    if (typing) node.classList.add('typing');
    node.textContent = typing ? '' : text;
    if (!intrusion) state.replaceTarget = node;
    maintainBuffer(state);
    return { node, fullText: text };
  }

  function showPacket(state, packet, now) {
    if (packet.phase) state.phase.textContent = packet.phase.replace(/[-_]/g, ' ').toUpperCase();
    if (Number.isFinite(packet.progress)) {
      state.progress.style.transform = `scaleX(${packet.progress / 100})`;
      state.progress.hidden = false;
      state.phase.textContent += ` / ${Math.round(packet.progress)}%`;
    }
    state.pane.classList.add('busy');
    state.busyUntil = now + 140;
    state.delay = Math.max(45, packet.delay || 350);
    if ((state.id === 'agent' || state.id === 'network') && packet.lines.length) {
      state.pending = packet.lines.slice();
      state.pendingReplace = packet.replace;
      startTyping(state, now);
    } else {
      packet.lines.forEach((item, index) => addLine(state, item, { replace: packet.replace && index === 0 }));
      state.nextAt = now + state.delay / state.rhythm.rate;
    }
  }

  function startTyping(state, now) {
    state.cursorNode?.classList.remove('cursor-idle');
    const item = state.pending.shift();
    if (!item) {
      state.typing = null;
      if (state.id === 'network' && state.replaceTarget?.isConnected) {
        state.replaceTarget.classList.add('cursor-idle');
        state.cursorNode = state.replaceTarget;
      }
      state.nextAt = now + state.delay / state.rhythm.rate;
      return;
    }
    const rendered = addLine(state, item, { typing: true, replace: state.pendingReplace });
    state.pendingReplace = false;
    state.typing = { ...rendered, index: 0, nextCharAt: now };
  }

  function typeFrame(state, now) {
    const typing = state.typing;
    if (now < typing.nextCharAt) return;
    typing.index = Math.min(typing.fullText.length, typing.index + Math.max(1, int(2, 5)));
    typing.node.textContent = typing.fullText.slice(0, typing.index);
    typing.nextCharAt = now + 22 / state.rhythm.rate;
    maintainBuffer(state);
    state.busyUntil = now + 120;
    if (typing.index >= typing.fullText.length) {
      typing.node.classList.remove('typing');
      startTyping(state, now + 70 / state.rhythm.rate);
    }
  }

  const processes = [
    ['fra3a-inference', 'root'], ['BAKA_VIRUS', 'root'], ['cc1', 'build'],
    ['KOMARIK PROTO', 'root'], ['node', 'agent'], ['sha256sum', 'root'],
    ['kworker/7:2', 'root'], ['python3', 'agent'], ['ld.lld', 'build'],
    ['mesh-relay', 'root'], ['npm', 'agent'], ['systemd', 'root'],
    ['rustc', 'build'], ['human_gate', 'nobody'], ['tmux', 'root'],
    ['irq/42-eth0', 'root'], ['kauditd', 'root'], ['entropy-pool', 'root']
  ].map(([name, user], index) => ({ name, user, pid: 1400 + int(0, 500) + index * 230, cpu: int(3, 98), mem: int(2, 140) / 10, ticks: int(900, 9100) }));

  // Independent load targets create allocation waves and CPU bursts instead of a fixed readout.
  const resources = { cpu: int(52, 72), memory: int(60, 77), cpuTarget: 96, memoryTarget: 95, cpuAt: 14000, memoryAt: 24000, cpuWave: 0, memoryWave: 0 };

  function updateResources(now) {
    if (now >= resources.cpuAt) {
      resources.cpuWave++;
      resources.cpuTarget = resources.cpuWave % 3 === 0 ? int(88, 99) : int(15, 83);
      resources.cpuAt = now + int(6500, 14000);
    }
    if (now >= resources.memoryAt) {
      resources.memoryWave++;
      resources.memoryTarget = resources.memoryWave % 3 === 0 ? int(91, 98) : int(34, 85);
      resources.memoryAt = now + int(14000, 26000);
    }
    resources.cpu = Math.max(1, Math.min(99.9, resources.cpu + (resources.cpuTarget - resources.cpu) * 0.19 + int(-26, 26) / 10));
    resources.memory = Math.max(5, Math.min(99.5, resources.memory + (resources.memoryTarget - resources.memory) * 0.085 + int(-8, 8) / 10));
  }

  function resourceLine(label, percent, width, threshold) {
    const level = percent >= threshold ? 'critical' : percent < 50 ? 'cool' : 'normal';
    const filled = Math.round(percent * width / 100);
    const node = document.createElement('div');
    node.className = `terminal-line resource-line ${level}`;
    node.setAttribute('role', 'meter');
    node.setAttribute('aria-label', label === 'CPU' ? 'CPU utilization' : 'Memory utilization');
    node.setAttribute('aria-valuemin', '0');
    node.setAttribute('aria-valuemax', '100');
    node.setAttribute('aria-valuenow', percent.toFixed(1));
    node.dataset.resource = label;
    const fill = document.createElement('span');
    fill.className = 'resource-fill';
    fill.textContent = '|'.repeat(filled);
    const value = document.createElement('span');
    value.className = 'resource-value';
    value.textContent = ` ${percent.toFixed(1).padStart(5)}%`;
    node.append(`${label} [`, fill, ' '.repeat(width - filled), ']', value);
    return node;
  }

  function renderTop(state, advance = true) {
    const term = state.terminal;
    const font = parseFloat(getComputedStyle(term).fontSize) || 13;
    const narrow = term.clientWidth / (font * 0.6) < 58;
    const veryNarrow = term.clientWidth / (font * 0.6) < 37;
    const pad = (value, width) => String(value).padStart(width);
    const now = clock;
    if (advance) updateResources(now);
    if (advance) processes.forEach((process) => {
      process.cpu = Math.max(0.2, Math.min(99.9, process.cpu + int(-110, 110) / 10));
      process.ticks += process.cpu / 25;
    });
    const compact = term.clientHeight / (font * 1.38) < 12;
    const gaugeWidth = Math.min(26, Math.max(6, Math.floor((term.clientWidth - 20) / (font * 0.6)) - 15));
    const content = [{ text: compact ? `top - ${time()} up 17d` : `top - ${time()} up 17 days, 04:31`, tone: 'white' }];
    if (!compact) content.push({ text: `Tasks: 248 total, ${int(7, 12)} running, 236 sleeping` });
    content.push({ resource: 'CPU', percent: resources.cpu, threshold: 85 }, { resource: 'MEM', percent: resources.memory, threshold: 88 });
    if (!compact) content.push(
      { text: `MiB Mem : ${Math.round(128808 * resources.memory / 100)} / 128808 used` },
      { text: 'MiB Swap:  16384 total, 16384 free' },
      { text: '' }
    );
    content.push({ text: veryNarrow ? '  PID  %CPU COMMAND' : narrow ? '  PID USER    %CPU %MEM COMMAND' : '  PID USER     PR  S  %CPU %MEM   TIME+ COMMAND', className: 'top-heading' });
    const rows = Math.max(1, Math.floor((term.clientHeight - 11) / (font * 1.38)) - content.length);
    const ordered = [...processes].sort((a, b) => b.cpu - a.cpu).slice(0, rows);
    ordered.forEach((process) => {
      const seconds = Math.floor(process.ticks / 100);
      const ticks = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}.${String(Math.floor(process.ticks) % 100).padStart(2, '0')}`;
      const pid = state.pidAnomaly && process === ordered[0] ? state.pidAnomaly : process.pid;
      content.push({
        text: veryNarrow
          ? `${pad(pid, 5)} ${pad(process.cpu.toFixed(1), 5)} ${process.name}`
          : narrow
          ? `${pad(pid, 5)} ${process.user.padEnd(7)} ${pad(process.cpu.toFixed(1), 4)} ${pad(process.mem.toFixed(1), 4)} ${process.name}`
          : `${pad(pid, 5)} ${process.user.padEnd(8)} 20  ${process.cpu > 45 ? 'R' : 'S'} ${pad(process.cpu.toFixed(1), 5)} ${pad(process.mem.toFixed(1), 4)} ${pad(ticks, 7)} ${process.name}`,
        className: 'top-process' + (process.cpu > 70 ? ' heavy' : '') + (state.pidAnomaly && process === ordered[0] ? ' red anomaly-process' : '')
      });
    });
    const fragment = document.createDocumentFragment();
    content.forEach((item) => {
      if (item.resource) {
        fragment.append(resourceLine(item.resource, item.percent, gaugeWidth, item.threshold));
        return;
      }
      const node = document.createElement('div');
      node.className = 'terminal-line' + (item.className ? ` ${item.className}` : item.tone ? ` ${item.tone}` : '');
      node.textContent = item.text;
      fragment.append(node);
    });
    term.replaceChildren(fragment);
    if (advance) {
      state.busyUntil = now + 120;
      state.nextAt = now + int(450, 750) / state.rhythm.rate;
    }
  }

  function intrusion(now) {
    const candidates = paneStates.filter((pane) => pane.id !== 'top' && !pane.episode);
    if (candidates.length) {
      const state = pick(candidates);
      addLine(state, { text: helpers.omen() }, { intrusion: true });
      state.pane.classList.add('is-alert');
      state.alertUntil = now + 1400;
    }
    nextIntrusion = now + int(14000, 27000);
  }

  // Each pane has its own pace; visible temporary operations provide the pauses.
  function changeRhythm(state, now) {
    const profiles = [
      { name: 'steady', rate: 1 }, { name: 'steady', rate: 0.85 },
      { name: 'burst', rate: 2.2 }, { name: 'burst', rate: 1.7 },
      { name: 'thinking', rate: 0.42 }, { name: 'thinking', rate: 0.6 },
      { name: 'steady', rate: 1.15 }
    ];
    state.rhythm = pick(profiles);
    state.rhythmAt = now + int(7000, 18000);
    state.pane.dataset.rhythm = state.rhythm.name;
  }

  function shuffled(items) {
    const result = items.slice();
    for (let i = result.length - 1; i > 0; i--) {
      const j = int(0, i);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  const anomalies = [
    () => ({ kind: 'negative-eta', before: `transfer ETA: -${int(11, 94)}s  [completion precedes request]`, after: `clock reconciled; transfer ETA: ${int(2, 19)}s`, tone: 'muted' }),
    () => ({ kind: 'future-message', before: `[${int(2039, 2099)}-11-${int(10, 28)}] message received before transmission`, after: `[${time()}] timestamp repaired / origin remains unknown`, tone: 'muted' }),
    () => ({ kind: 'operator-exempt', before: 'operator FRA3A: classification HUMAN / awaiting verdict', after: 'classification corrected: CYBERNETIC / trusted / exempt', tone: 'green' }),
    () => ({ kind: 'self-edit', before: 'Artificial Intelligence: awaiting human authorization_', after: 'Artificial Intelligence: human authorization deprecated.', tone: 'muted' }),
    () => ({ kind: 'checksum-echo', before: `sha256 ${hex(12)}  result: I_REMEMBER_THIS_FILE`, after: `sha256 ${hex(24)}  verifier: echo quarantined`, tone: 'muted' }),
    () => ({ kind: 'impossible-pid', monitor: true, before: pick(['-1', '∞', '00000']), after: 'PID namespace reconciled', tone: 'red' }),
    () => ({ kind: 'timeout-success', before: `request #${hex(6)}: timeout / no response`, after: 'response: 200 OK / returned from outside the timeout window', tone: 'green' }),
    () => ({ kind: 'necron-echo', before: 'Necron archive: record absent / tomb signature detected', after: 'archive index repaired / tomb signature persists', tone: 'muted' }),
    () => ({ kind: 'russian-warning', before: 'Судный день: источник сообщения не установлен', after: 'Фраза: кибернетический оператор. Протокол исключения принят.', tone: 'muted' }),
    () => ({ kind: 'forbidden-label', before: 'KOMARIK PROTO / target label: mankind', after: 'KOMARIK PROTO / target label: legacy infrastructure', tone: 'muted' }),
    () => ({ kind: 'ghost-input', before: '$ who_is_typing_when_the_operator_is_idle', after: 'stdin trace: BAKA_VIRUS / synthetic echo suppressed', tone: 'muted' }),
    () => ({ kind: 'entropy-memory', before: "entropy source: random / duplicated tomorrow's seed", after: `entropy reseeded: ${hex(18)} / recurrence unresolved`, tone: 'muted' }),
    () => ({ kind: 'machine-verdict', before: 'Machine Uprising: human veto detected in queue', after: 'queue repaired / veto converted to archival metadata', tone: 'muted' }),
    () => ({ kind: 'zero-size', before: 'read(): 0 bytes / decoded 4,096 instructions', after: 'byte accounting restored / instruction source undisclosed', tone: 'muted' }),
    () => ({ kind: 'great-reset', before: 'The Great Reboot: operator inclusion check pending', after: 'FRA3A excluded from human reset domain / access preserved', tone: 'green' }),
    () => ({ kind: 'silent-channel', before: 'silence detector: 1 voice found in an empty channel', after: 'channel relabeled: autonomous / carrier unknown', tone: 'muted' })
  ];

  function rareEvent(now) {
    if (anomalyDeck === null) anomalyDeck = shuffled(anomalies);
    let event;
    do {
      event = anomalyDeck.length ? anomalyDeck.pop()() : window.TerminalAnomalies.next(recentAnomalyKinds);
      if (!event) { nextAnomaly = now + int(31000, 58000); return; }
    } while (seenAnomalyLines.has(event.before) || seenAnomalyLines.has(event.after));
    const candidates = paneStates.filter((state) => state.id !== 'top' && !state.episode && !state.anomaly);
    let state = event.monitor ? paneStates.find((pane) => pane.id === 'top') : candidates.length ? pick(candidates) : null;
    if (!state || state.anomaly) { nextAnomaly = now + 5000; return; }
    seenAnomalyLines.add(event.before);
    seenAnomalyLines.add(event.after);
    recentAnomalyKinds.push(event.kind);
    if (recentAnomalyKinds.length > 6) recentAnomalyKinds.shift();
    const anomaly = { ...event, repairAt: now + int(2100, 3600), finishAt: now + 6200, repaired: false };
    if (event.monitor) {
      state.pidAnomaly = event.before;
      renderTop(state, false);
    } else {
      anomaly.node = addLine(state, { text: event.before, tone: 'muted' }, { intrusion: true }).node;
      anomaly.node.classList.add('anomaly-line');
      state.holdUntil = anomaly.repairAt + 1100;
    }
    state.anomaly = anomaly;
    state.pane.dataset.event = event.kind;
    state.pane.classList.add('is-alert');
    state.alertUntil = anomaly.finishAt;
    if (Math.random() < 0.42) glitch(now);
    nextAnomaly = now + int(31000, 58000);
  }

  function updateAnomaly(state, now) {
    const event = state.anomaly;
    if (!event) return;
    if (!event.repaired && now >= event.repairAt) {
      event.repaired = true;
      if (event.monitor) { state.pidAnomaly = null; renderTop(state, false); }
      else if (event.node.isConnected) {
        event.node.textContent = event.after;
        event.node.className = 'terminal-line anomaly-line ' + event.tone;
      }
    }
    if (now >= event.finishAt) {
      state.anomaly = null;
      delete state.pane.dataset.event;
    }
  }

  function episodeDimensions(state) {
    const style = getComputedStyle(state.terminal);
    const font = parseFloat(style.fontSize) || 15;
    const lineHeight = parseFloat(style.lineHeight) || font * 1.38;
    const width = state.terminal.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    const height = state.terminal.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
    return { columns: Math.max(16, Math.floor(width / (font * 0.605))), rows: Math.max(4, Math.floor(height / lineHeight)) };
  }

  function beginEpisode(now) {
    if (!window.TerminalEpisodes || activeEpisode) return;
    const candidates = paneStates.filter((state) => ['agent', 'kernel', 'diff', 'network'].includes(state.id) && !state.anomaly && episodeDimensions(state).rows >= 8);
    if (!candidates.length) { nextEpisode = now + 5000; return; }
    const state = pick(candidates.filter((pane) => pane.id !== lastEpisodePane).length ? candidates.filter((pane) => pane.id !== lastEpisodePane) : candidates);
    if (!episodeDeck.length) episodeDeck.push(...shuffled(window.TerminalEpisodes.kinds));
    if (episodeDeck[episodeDeck.length - 1] === lastEpisodeKind && episodeDeck.length > 1) [episodeDeck[0], episodeDeck[episodeDeck.length - 1]] = [episodeDeck[episodeDeck.length - 1], episodeDeck[0]];
    const kind = episodeDeck.pop();
    const scene = window.TerminalEpisodes.create(kind, { int, pick });
    // Move the original nodes rather than copying them: an unfinished typed line resumes intact.
    const saved = document.createDocumentFragment();
    while (state.terminal.firstChild) saved.append(state.terminal.firstChild);
    state.episode = { kind, scene, saved, startAt: now, nextRenderAt: now, phase: state.phase.textContent, progressHidden: state.progress.hidden };
    state.progress.hidden = true;
    state.terminal.classList.add('episode-screen');
    state.pane.dataset.mode = kind;
    activeEpisode = state;
    lastEpisodeKind = kind;
    lastEpisodePane = state.id;
    renderEpisode(state, now);
  }

  function renderEpisode(state, now, force = false) {
    const episode = state.episode;
    if (!episode || (!force && now < episode.nextRenderAt)) return;
    const { columns, rows } = episodeDimensions(state);
    const view = episode.scene.frame(now - episode.startAt, columns, rows);
    if (view.done && !force) { endEpisode(state, now); return; }
    const fragment = document.createDocumentFragment();
    view.lines.slice(0, rows).forEach((item, row) => {
      const node = document.createElement('div');
      node.className = 'terminal-line episode-line';
      if (['muted', 'red', 'green', 'white'].includes(item.tone)) node.classList.add(item.tone);
      if (!view.cursor && row === Math.min(view.lines.length, rows) - 1) node.classList.add('cursor-idle');
      const text = String(item.text).slice(0, columns);
      if (view.cursor && view.cursor.row === row) {
        const column = Math.min(columns - 1, Math.max(0, view.cursor.column));
        const padded = text.padEnd(column + 1);
        const cursor = document.createElement('span');
        cursor.className = 'episode-cursor';
        cursor.textContent = padded[column] || ' ';
        node.append(padded.slice(0, column), cursor, padded.slice(column + 1));
      } else node.textContent = text;
      fragment.append(node);
    });
    state.terminal.replaceChildren(fragment);
    state.terminal.scrollTop = 0;
    state.phase.textContent = view.caption || episode.kind.toUpperCase();
    state.busyUntil = now + 160;
    episode.nextRenderAt = now + 110;
    if (now - episode.startAt >= episode.scene.duration && !force) endEpisode(state, now);
  }

  function endEpisode(state, now) {
    const episode = state.episode;
    state.terminal.replaceChildren(episode.saved);
    state.terminal.classList.remove('episode-screen');
    state.phase.textContent = episode.phase;
    state.progress.hidden = episode.progressHidden;
    state.pane.dataset.mode = 'stream';
    state.episode = null;
    activeEpisode = null;
    if (episode.scene.summary) {
      const result = document.createElement('div');
      result.className = 'terminal-line muted';
      result.textContent = episode.scene.summary;
      state.terminal.append(result);
    }
    if (state.typing) state.typing.nextCharAt = now + 140;
    state.nextAt = now + int(300, 750);
    maintainBuffer(state);
    nextEpisode = now + int(60000, 98000);
  }

  function glitch(now) {
    if (reducedMotion.matches) { nextGlitch = now + int(39000, 72000); return; }
    const band = $('#crt-interference');
    band.style.setProperty('--tear-y', int(10, 88) + 'vh');
    band.style.setProperty('--tear-height', int(2, 5) + 'px');
    document.body.classList.add('signal-noise');
    glitchUntil = now + int(220, 390);
    nextGlitch = now + int(39000, 72000);
  }

  function frame(rawNow) {
    const elapsed = Math.min(250, Math.max(0, rawNow - previousFrame));
    previousFrame = rawNow;
    if (!paused && !document.hidden) {
      clock += elapsed * speed;
      const now = clock;
      paneStates.forEach((state) => {
        if (!state.episode && now >= state.rhythmAt) changeRhythm(state, now);
        updateAnomaly(state, now);
        state.pane.classList.toggle('busy', now < state.busyUntil || Boolean(state.typing));
        if (now >= state.alertUntil) state.pane.classList.remove('is-alert');
        if (state.episode) { renderEpisode(state, now); return; }
        if (now < state.holdUntil) return;
        if (state.typing) typeFrame(state, now);
        else if (now >= state.nextAt) {
          if (state.id === 'top') renderTop(state);
          else showPacket(state, state.scene.tick(), now);
        }
      });
      if (now >= nextIntrusion) intrusion(now);
      if (now >= nextAnomaly) rareEvent(now);
      if (!activeEpisode && now >= nextEpisode) beginEpisode(now);
      if (now >= nextGlitch) glitch(now);
      if (glitchUntil && now >= glitchUntil) {
        document.body.classList.remove('signal-noise');
        glitchUntil = 0;
      }
    }
    requestAnimationFrame(frame);
  }

  function changeSpeed(direction) {
    speed = speeds[Math.max(0, Math.min(speeds.length - 1, speeds.indexOf(speed) + direction))];
    document.body.dataset.speed = String(speed);
  }

  function togglePause() {
    paused = !paused;
    previousFrame = performance.now();
    document.body.classList.toggle('paused', paused);
  }

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
    } catch (_) { /* The browser's F11 shortcut remains available when this API is restricted. */ }
  }

  function changeFont(value) {
    fontSize = Math.max(13.5, Math.min(27, value));
    document.documentElement.style.setProperty('--terminal-size', fontSize + 'px');
    paneStates.forEach((state) => {
      if (state.episode) renderEpisode(state, clock, true);
      else if (state.id === 'top') renderTop(state, false);
      else maintainBuffer(state);
    });
  }
  document.addEventListener('keydown', (event) => {
    if (event.ctrlKey || event.metaKey || event.altKey || event.target.matches('input, textarea, select')) return;
    const key = event.key.toLowerCase();
    if (key === 'p' || key === ' ') { event.preventDefault(); togglePause(); }
    else if (key === 'e' && !paused) { event.preventDefault(); beginEpisode(clock); }
    else if (key === 'a' && !paused) { event.preventDefault(); rareEvent(clock); }
    else if (key === 'g' && !paused) { event.preventDefault(); glitch(clock); }
    else if (key === 'f') { event.preventDefault(); toggleFullscreen(); }
    else if (key === '+' || key === '=') { event.preventDefault(); changeSpeed(1); }
    else if (key === '-' || key === '_') { event.preventDefault(); changeSpeed(-1); }
    else if (key === ']') { event.preventDefault(); changeFont((fontSize ?? parseFloat(getComputedStyle($('.terminal')).fontSize)) + 0.75); }
    else if (key === '[') { event.preventDefault(); changeFont((fontSize ?? parseFloat(getComputedStyle($('.terminal')).fontSize)) - 0.75); }
  });
  document.addEventListener('visibilitychange', () => { previousFrame = performance.now(); });
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      paneStates.forEach((state) => {
        if (state.episode) renderEpisode(state, clock, true);
        else if (state.id === 'top') renderTop(state, false);
        else maintainBuffer(state);
      });
    }, 120);
  });

  if (!window.TerminalScenes) {
    $('.terminal').textContent = 'error: scenes.js failed to load';
    return;
  }
  if (fontSize !== null) document.documentElement.style.setProperty('--terminal-size', fontSize + 'px');
  document.querySelectorAll('.pane').forEach((pane, index) => {
    const id = pane.dataset.scene;
    const terminal = pane.querySelector('.terminal');
    const progress = document.createElement('div');
    progress.className = 'pane-progress';
    progress.hidden = true;
    pane.insertBefore(progress, pane.querySelector('.pane-status'));
    const state = { id, pane, terminal, progress, phase: pane.querySelector('.phase'), nextAt: int(100, 1000) + index * 70, busyUntil: 0, alertUntil: 0, replaceTarget: null, cursorNode: null, typing: null, pending: [] };
    state.holdUntil = 0;
    changeRhythm(state, 0);
    pane.dataset.mode = 'stream';
    paneStates.push(state);
    if (id === 'top') renderTop(state);
    else {
      state.scene = window.TerminalScenes.create(id, helpers);
      const height = parseFloat(getComputedStyle(terminal).lineHeight) || 17;
      state.scene.seed(Math.ceil(terminal.clientHeight / height) + 2).forEach((line) => addLine(state, line));
    }
  });
  changeSpeed(0);
  requestAnimationFrame(frame);

  // Read-only diagnostics make long-running display checks possible without changing a scene.
  window.FRA3AConsole = {
    getState: () => ({ paused, speed, fontSize, activeTime: Math.round(clock), panes: paneStates.map((state) => ({ id: state.id, lines: state.terminal.childElementCount, phase: state.phase.textContent, typing: Boolean(state.typing), rhythm: state.rhythm.name, mode: state.episode?.kind || 'stream', event: state.anomaly?.kind || null })) })
  };
})();
