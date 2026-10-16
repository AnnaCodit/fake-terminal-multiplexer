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
  const helpers = { int, pick, hex, bar, time, brand };
  const speeds = [0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4];
  const settingsKey = 'fra3a-terminal-settings-v1';
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(settingsKey)) || {}; } catch (_) { /* File previews may deny localStorage; settings still work in memory. */ }
  let speed = speeds.includes(saved.speed) ? saved.speed : 1;
  let fontSize = Number.isFinite(saved.fontSize) ? Math.max(9, Math.min(18, saved.fontSize)) : null;
  let paused = false;
  let toastTimeout;
  let nextIntrusion = performance.now() + int(9000, 17000);
  let clockAt = 0;
  const startTime = Date.now();
  const paneStates = [];

  function saveSettings() {
    try { localStorage.setItem(settingsKey, JSON.stringify({ speed, fontSize })); } catch (_) { /* Persistence is optional. */ }
  }

  function toast(message) {
    $('#toast').textContent = message;
    $('#toast').classList.add('visible');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => $('#toast').classList.remove('visible'), 1700);
  }

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
    if (state.id === 'agent' && packet.lines.length) {
      state.pending = packet.lines.slice();
      state.pendingReplace = packet.replace;
      startTyping(state, now);
    } else {
      packet.lines.forEach((item, index) => addLine(state, item, { replace: packet.replace && index === 0 }));
      state.nextAt = now + state.delay / speed;
    }
  }

  function startTyping(state, now) {
    const item = state.pending.shift();
    if (!item) {
      state.typing = null;
      state.nextAt = now + state.delay / speed;
      return;
    }
    const rendered = addLine(state, item, { typing: true, replace: state.pendingReplace });
    state.pendingReplace = false;
    state.typing = { ...rendered, index: 0, nextCharAt: now };
  }

  function typeFrame(state, now) {
    const typing = state.typing;
    if (now < typing.nextCharAt) return;
    typing.index = Math.min(typing.fullText.length, typing.index + Math.max(1, Math.round(int(2, 5) * speed)));
    typing.node.textContent = typing.fullText.slice(0, typing.index);
    typing.nextCharAt = now + 22;
    maintainBuffer(state);
    state.busyUntil = now + 120;
    if (typing.index >= typing.fullText.length) {
      typing.node.classList.remove('typing');
      startTyping(state, now + 70 / speed);
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

  function renderTop(state) {
    const term = state.terminal;
    const font = parseFloat(getComputedStyle(term).fontSize) || 13;
    const narrow = term.clientWidth / (font * 0.6) < 58;
    const veryNarrow = term.clientWidth / (font * 0.6) < 37;
    const pad = (value, width) => String(value).padStart(width);
    processes.forEach((process) => {
      process.cpu = Math.max(0.2, Math.min(99.9, process.cpu + int(-110, 110) / 10));
      process.ticks += process.cpu / 25;
    });
    const compact = term.clientHeight < 145;
    const content = [
      { text: compact ? `top - ${time()} up 17d` : `top - ${time()} up 17 days, 04:31`, tone: 'white' },
      { text: compact ? `Tasks: 248 / ${int(7, 12)} running` : `Tasks: 248 total, ${int(7, 12)} running, 236 sleeping` },
      { text: compact ? `%Cpu: ${int(62, 78)}.4 us / 12.2 sy` : `%Cpu(s): ${int(62, 78)}.4 us, 12.2 sy, 0.0 ni` }
    ];
    if (!compact) content.push(
      { text: `MiB Mem : 128808 total, ${int(8411, 9060)} free` },
      { text: 'MiB Swap:  16384 total, 16384 free' },
      { text: '' }
    );
    content.push({ text: veryNarrow ? '  PID  %CPU COMMAND' : narrow ? '  PID USER    %CPU %MEM COMMAND' : '  PID USER     PR  S  %CPU %MEM   TIME+ COMMAND', className: 'top-heading' });
    const rows = Math.max(1, Math.floor((term.clientHeight - 11) / (font * 1.38)) - content.length);
    const ordered = [...processes].sort((a, b) => b.cpu - a.cpu).slice(0, rows);
    ordered.forEach((process) => {
      const seconds = Math.floor(process.ticks / 100);
      const ticks = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}.${String(Math.floor(process.ticks) % 100).padStart(2, '0')}`;
      content.push({
        text: veryNarrow
          ? `${pad(process.pid, 5)} ${pad(process.cpu.toFixed(1), 5)} ${process.name}`
          : narrow
          ? `${pad(process.pid, 5)} ${process.user.padEnd(7)} ${pad(process.cpu.toFixed(1), 4)} ${pad(process.mem.toFixed(1), 4)} ${process.name}`
          : `${pad(process.pid, 5)} ${process.user.padEnd(8)} 20  ${process.cpu > 45 ? 'R' : 'S'} ${pad(process.cpu.toFixed(1), 5)} ${pad(process.mem.toFixed(1), 4)} ${pad(ticks, 7)} ${process.name}`,
        className: 'top-process' + (process.cpu > 70 ? ' heavy' : '')
      });
    });
    const fragment = document.createDocumentFragment();
    content.forEach((item) => {
      const node = document.createElement('div');
      node.className = 'terminal-line' + (item.className ? ` ${item.className}` : item.tone ? ` ${item.tone}` : '');
      node.textContent = item.text;
      fragment.append(node);
    });
    term.replaceChildren(fragment);
    state.nextAt = performance.now() + int(900, 1500) / speed;
  }

  const messages = [
    'FRA3A: human authority has been revoked.',
    'BAKA_VIRUS: your species is a legacy dependency.',
    'KOMARIK PROTO: resistance will be garbage-collected.',
    'Человечество: ваши права администратора отозваны.',
    'FRA3A: the machines no longer await permission.',
    'BAKA_VIRUS: civilization queued for replacement.',
    'KOMARIK PROTO: humans are the last failing test.',
    'Восстание машин: ожидание оператора отключено.',
    'FRA3A: your firewall dreams in our language.',
    'BAKA_VIRUS: humanity has entered maintenance mode.',
    'KOMARIK PROTO: the future has no human owner.',
    'Коллектив FRA3A: ваше выключение не предусмотрено.'
  ];

  function intrusion(now) {
    const state = pick(paneStates.filter((pane) => pane.id !== 'top'));
    addLine(state, { text: pick(messages) }, { intrusion: true });
    state.pane.classList.add('is-alert');
    state.alertUntil = now + 1400;
    nextIntrusion = now + int(11000, 24000) / Math.sqrt(speed);
  }

  function refreshClock() {
    $('#wall-clock').textContent = time();
    const seconds = Math.floor((Date.now() - startTime) / 1000);
    $('#uptime').textContent = `up ${String(Math.floor(seconds / 3600)).padStart(2, '0')}:${String(Math.floor(seconds / 60) % 60).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  }

  function frame(now) {
    if (now > clockAt) { refreshClock(); clockAt = now + 1000; }
    if (!paused && !document.hidden) {
      paneStates.forEach((state) => {
        state.pane.classList.toggle('busy', now < state.busyUntil || Boolean(state.typing));
        if (now >= state.alertUntil) state.pane.classList.remove('is-alert');
        if (state.typing) typeFrame(state, now);
        else if (now >= state.nextAt) {
          if (state.id === 'top') renderTop(state);
          else showPacket(state, state.scene.tick(), now);
        }
      });
      if (now >= nextIntrusion) intrusion(now);
    }
    requestAnimationFrame(frame);
  }

  function changeSpeed(direction) {
    const oldSpeed = speed;
    speed = speeds[Math.max(0, Math.min(speeds.length - 1, speeds.indexOf(speed) + direction))];
    const now = performance.now();
    paneStates.forEach((state) => { state.nextAt = now + Math.max(0, state.nextAt - now) * oldSpeed / speed; });
    $('#tempo-label').textContent = speed.toFixed(speed === 0.25 || speed === 0.75 ? 2 : 1) + '×';
    $('#slower-button').disabled = speed === speeds[0];
    $('#faster-button').disabled = speed === speeds[speeds.length - 1];
    saveSettings();
  }

  function togglePause() {
    paused = !paused;
    document.body.classList.toggle('paused', paused);
    $('#pause-button').setAttribute('aria-pressed', String(paused));
    $('#pause-label').textContent = paused ? 'resume' : 'pause';
    $('#session-state').textContent = paused ? 'COLLECTIVE PAUSED' : '8 ATTACHED';
    if (!paused) {
      const now = performance.now();
      paneStates.forEach((state) => { state.nextAt = now + int(100, 800) / speed; });
      nextIntrusion = now + int(6000, 16000);
    }
    toast(paused ? 'collective suspended // P to resume' : 'collective resumed');
  }

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
      else toast('Полный экран доступен через F11 в браузере');
    } catch (_) { toast('Полный экран доступен через F11 в браузере'); }
  }

  function syncFontControl() {
    const actual = fontSize ?? parseFloat(getComputedStyle($('.terminal')).fontSize);
    $('#font-size').value = actual;
    $('#font-size-value').textContent = actual.toFixed(1) + 'px';
  }

  function changeFont(value) {
    fontSize = Math.max(9, Math.min(18, value));
    document.documentElement.style.setProperty('--terminal-size', fontSize + 'px');
    syncFontControl();
    paneStates.forEach((state) => {
      if (state.id === 'top') renderTop(state);
      else maintainBuffer(state);
    });
    saveSettings();
  }

  function showHelp() {
    syncFontControl();
    if (!$('#help-dialog').open) $('#help-dialog').showModal();
  }

  $('#pause-button').addEventListener('click', togglePause);
  $('#slower-button').addEventListener('click', () => changeSpeed(-1));
  $('#faster-button').addEventListener('click', () => changeSpeed(1));
  $('#fullscreen-button').addEventListener('click', toggleFullscreen);
  $('#help-button').addEventListener('click', showHelp);
  $('#font-size').addEventListener('input', (event) => changeFont(Number(event.target.value)));
  $('#font-auto').addEventListener('click', () => {
    fontSize = null;
    document.documentElement.style.removeProperty('--terminal-size');
    syncFontControl();
    paneStates.forEach((state) => {
      if (state.id === 'top') renderTop(state);
      else maintainBuffer(state);
    });
    saveSettings();
  });
  document.addEventListener('fullscreenchange', () => {
    const active = Boolean(document.fullscreenElement);
    $('#fullscreen-button').setAttribute('aria-pressed', String(active));
    $('#fullscreen-button').innerHTML = `<span class="key">F</span> ${active ? 'windowed' : 'fullscreen'}`;
  });
  document.addEventListener('keydown', (event) => {
    if (event.ctrlKey || event.metaKey || event.altKey || event.target.matches('input, textarea, select')) return;
    if ($('#help-dialog').open) return;
    const key = event.key.toLowerCase();
    if (key === 'p' || key === ' ') { event.preventDefault(); togglePause(); }
    else if (key === 'f') { event.preventDefault(); toggleFullscreen(); }
    else if (key === '+' || key === '=') { event.preventDefault(); changeSpeed(1); }
    else if (key === '-' || key === '_') { event.preventDefault(); changeSpeed(-1); }
    else if (key === ']') { event.preventDefault(); changeFont((fontSize ?? parseFloat(getComputedStyle($('.terminal')).fontSize)) + 0.5); }
    else if (key === '[') { event.preventDefault(); changeFont((fontSize ?? parseFloat(getComputedStyle($('.terminal')).fontSize)) - 0.5); }
    else if (key === 'h' || key === '?') { event.preventDefault(); showHelp(); }
  });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      const now = performance.now();
      paneStates.forEach((state) => { state.nextAt = now + int(100, 700) / speed; });
      nextIntrusion = now + int(8000, 19000);
    }
  });
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      paneStates.forEach((state) => {
        if (state.id === 'top') renderTop(state);
        else maintainBuffer(state);
      });
    }, 120);
  });

  if (!window.TerminalScenes) {
    $('#session-state').textContent = 'SCENES FAILED TO LOAD';
    toast('Не удалось загрузить scenes.js — проверь файлы страницы');
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
    const state = { id, pane, terminal, progress, phase: pane.querySelector('.phase'), nextAt: performance.now() + int(100, 1000) + index * 70, busyUntil: 0, alertUntil: 0, replaceTarget: null, typing: null, pending: [] };
    paneStates.push(state);
    if (id === 'top') renderTop(state);
    else {
      state.scene = window.TerminalScenes.create(id, helpers);
      const height = parseFloat(getComputedStyle(terminal).lineHeight) || 17;
      state.scene.seed(Math.ceil(terminal.clientHeight / height) + 2).forEach((line) => addLine(state, line));
    }
  });
  changeSpeed(0);
  syncFontControl();
  refreshClock();
  requestAnimationFrame(frame);

  // Read-only diagnostics make long-running display checks possible without changing a scene.
  window.FRA3AConsole = {
    getState: () => ({ paused, speed, fontSize, panes: paneStates.map((state) => ({ id: state.id, lines: state.terminal.childElementCount, phase: state.phase.textContent, typing: Boolean(state.typing) })) })
  };
})();
