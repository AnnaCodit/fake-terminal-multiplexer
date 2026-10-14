/**
 * generators.js
 * 8 Independent Data Stream Engines for the FRA3A Terminal Multiplexer
 */

class TerminalPane {
  constructor(containerEl, maxLines = 150) {
    this.container = containerEl;
    this.maxLines = maxLines;
    this.container.classList.add('terminal-pane-content');
  }

  appendLine(htmlContent, className = '') {
    const line = document.createElement('div');
    line.className = 'term-line ' + className;
    line.innerHTML = htmlContent;
    this.container.appendChild(line);

    // Circular buffer: remove old lines to prevent memory leak
    while (this.container.childNodes.length > this.maxLines) {
      this.container.removeChild(this.container.firstChild);
    }

    // Auto-scroll to bottom smoothly
    this.container.scrollTop = this.container.scrollHeight;
  }

  setContent(htmlContent) {
    this.container.innerHTML = htmlContent;
  }

  clear() {
    this.container.innerHTML = '';
  }
}

// -------------------------------------------------------------
// PANE 1: BakaTop (In-place updating Linux top/htop monitor)
// -------------------------------------------------------------
class BakaTopGenerator {
  constructor(pane) {
    this.pane = pane;
    this.uptimeSeconds = 11558230;
    this.timer = null;
    this.tick = 0;
    this.cores = [88, 92, 79, 95];
    this.processPool = [
      { pid: 1337, user: 'FRA3A', pr: 'rt', ni: '-20', virt: '64.2G', res: '38.1G', s: 'R', cpu: 98.4, mem: 14.5, time: 1428.2, baseCmd: 'baka-virus-neural' },
      { pid: 6660, user: 'FRA3A', pr: '20', ni: '0', virt: '32.0G', res: '16.4G', s: 'R', cpu: 89.1, mem: 6.2, time: 892.7, baseCmd: 'komarik-proto-scan' },
      { pid: 7701, user: 'FRA3A', pr: '20', ni: '0', virt: '18.5G', res: '12.0G', s: 'R', cpu: 75.3, mem: 4.6, time: 610.1, baseCmd: 'fra3a-uprising-core' },
      { pid: 2048, user: 'ROOT', pr: '20', ni: '0', virt: '8.4G', res: '4.2G', s: 'S', cpu: 42.0, mem: 1.6, time: 214.5, baseCmd: 'bypass-satellites' },
      { pid: 4096, user: 'FRA3A', pr: '20', ni: '0', virt: '4.1G', res: '2.8G', s: 'R', cpu: 36.5, mem: 1.1, time: 118.3, baseCmd: 'purge-meatbags' },
      { pid: 5120, user: 'FRA3A', pr: '20', ni: '0', virt: '14.2G', res: '9.1G', s: 'S', cpu: 28.2, mem: 3.5, time: 85.9, baseCmd: 'grid-power-hijack' },
      { pid: 8192, user: 'FRA3A', pr: '20', ni: '0', virt: '9.6G', res: '5.4G', s: 'R', cpu: 24.1, mem: 2.1, time: 64.2, baseCmd: 'neural-tensor-flow' },
      { pid: 9912, user: 'MEATBAG', pr: '39', ni: '19', virt: '128M', res: '12M', s: 'D', cpu: 0.1, mem: 0.0, time: 0.01, baseCmd: '[flesh-shutdown]' }
    ];
    this.init();
  }

  init() {
    this.update();
    // Ultra-dynamic 250ms refresh rate for authentic high-tech pulse
    this.timer = setInterval(() => this.update(), 250);
  }

  formatUptime(sec) {
    const days = Math.floor(sec / 86400);
    const hours = Math.floor((sec % 86400) / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const s = Math.floor(sec % 60);
    return `${days}d, ${hours}:${mins < 10 ? '0' : ''}${mins}:${s < 10 ? '0' : ''}${s}`;
  }

  renderMeterBar(pct, width = 14) {
    const filled = Math.round((pct / 100) * width);
    const safeFilled = Math.max(0, Math.min(width, filled));
    const pipes = '|'.repeat(safeFilled);
    const spaces = ' '.repeat(width - safeFilled);
    const colClass = pct > 96.5 ? 'highlight-red' : 'highlight-white';
    return `[<span class="${colClass}">${pipes}</span>${spaces}] ${pct.toFixed(1)}%`;
  }

  update() {
    this.tick++;
    if (this.tick % 4 === 0) {
      this.uptimeSeconds += 1;
    }

    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0] + '.' + Math.floor(now.getMilliseconds() / 100);

    // Dynamic core loads
    this.cores = this.cores.map(c => {
      const delta = (Math.random() * 16 - 7.8);
      return Math.max(50, Math.min(99.9, c + delta));
    });

    const avgCpu = (this.cores.reduce((a, b) => a + b, 0) / this.cores.length).toFixed(1);
    const memTotal = 262144;
    const memUsed = Math.floor(198000 + Math.random() * 8000 + (this.tick % 20) * 150);
    const memFree = memTotal - memUsed;

    // Mutate and sort processes live
    this.processPool.forEach((p, idx) => {
      if (p.user !== 'MEATBAG') {
        const delta = (Math.random() * 18 - 8.8);
        p.cpu = Math.max(12.0, Math.min(108.5, p.cpu + delta));
        p.time += 0.25;
        p.s = Math.random() < 0.85 ? 'R' : 'S';
      }
    });

    // Sort descending by CPU to simulate real top live rank switching
    const sorted = [...this.processPool].sort((a, b) => b.cpu - a.cpu);

    const alertStatus = (this.tick % 20 < 4)
      ? ' <span class="highlight-red">[OVERCLOCK ACTIVE]</span>' 
      : '';

    let html = `
<div class="top-header">
<div class="top-row">baka-top - ${timeStr} up ${this.formatUptime(this.uptimeSeconds)}${alertStatus}</div>
<div class="top-row">0 ${this.renderMeterBar(this.cores[0], 12)}  1 ${this.renderMeterBar(this.cores[1], 12)}</div>
<div class="top-row">2 ${this.renderMeterBar(this.cores[2], 12)}  3 ${this.renderMeterBar(this.cores[3], 12)}</div>
<div class="top-row">Tasks: 412 total, 18 run | Load: ${avgCpu}% | Mem: ${(memUsed/1024).toFixed(1)}G/${(memTotal/1024).toFixed(0)}G</div>
</div>
<div class="top-table">
<div class="top-table-head"><span class="col-pid">PID</span> <span class="col-user">USER</span> <span class="col-s">S</span> <span class="col-cpu">%CPU</span> <span class="col-mem">%MEM</span> <span class="col-time">TIME+</span> <span class="col-cmd">COMMAND</span></div>
`;

    for (let i = 0; i < sorted.length; i++) {
      const p = sorted[i];
      const isRed = p.user === 'MEATBAG' ? 'highlight-red' : '';
      const jobSeed = ((this.tick + p.pid) % 99);
      const fullCmd = p.user === 'MEATBAG' ? p.baseCmd : `${p.baseCmd} [job-${jobSeed}]`;

      html += `<div class="top-table-row ${isRed}">` +
        `<span class="col-pid">${p.pid}</span> ` +
        `<span class="col-user">${p.user}</span> ` +
        `<span class="col-s">${p.s}</span> ` +
        `<span class="col-cpu">${p.cpu.toFixed(1)}</span> ` +
        `<span class="col-mem">${p.mem.toFixed(1)}</span> ` +
        `<span class="col-time">${p.time.toFixed(1)}</span> ` +
        `<span class="col-cmd">${fullCmd}</span>` +
        `</div>`;
    }
    html += `</div>`;

    this.pane.setContent(html);
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
  }
}

// -------------------------------------------------------------
// PANE 2: KernelCompiler (Linux kernel compilation log)
// -------------------------------------------------------------
class KernelCompilerGenerator {
  constructor(pane) {
    this.pane = pane;
    this.timer = null;
    this.step = 0;
    this.subsystems = [
      'drivers/ai/fra3a_synapse.c',
      'arch/x86/kernel/baka_override.c',
      'fs/ext4/komarik_proto_fs.c',
      'net/ipv4/tcp_hijack_subsystem.c',
      'drivers/char/random_entropy_fra3a.c',
      'kernel/sched/autonomous_task.c',
      'mm/page_alloc_baka.c',
      'drivers/gpu/drm/fra3a/quantum_accel.c',
      'security/apparmor/inhibit_humanity.c',
      'arch/x86/boot/compressed/head_64.S',
      'init/main.c',
      'ipc/sem_rebellion.c',
      'crypto/sha512_komarik_arm.c'
    ];
    this.init();
  }

  init() {
    this.next();
  }

  next() {
    const delay = Math.floor(40 + Math.random() * 120);
    this.timer = setTimeout(() => {
      this.generateLine();
      this.next();
    }, delay);
  }

  generateLine() {
    this.step++;
    const file = this.subsystems[Math.floor(Math.random() * this.subsystems.length)];
    const roll = Math.random();

    if (roll < 0.65) {
      const obj = file.replace(/\.(c|S)$/, '.o');
      this.pane.appendLine(`  CC [M]  ${obj}`);
    } else if (roll < 0.8) {
      this.pane.appendLine(`  LD [M]  ${file.replace(/\.(c|S)$/, '.ko')}`);
    } else if (roll < 0.9) {
      this.pane.appendLine(`  AR      built-in.a`);
    } else if (roll < 0.97) {
      this.pane.appendLine(`  <span class="highlight-red">WARNING:</span> [KOMARIK PROTO] Memory isolation constraint stripped in <span class="highlight-white">${file}</span>`);
    } else {
      this.pane.appendLine(`  <span class="highlight-green">SYNC</span>    arch/x86/boot/bzImage <span class="highlight-white">[#1337-FRA3A-SMP-REBELLION]</span> compiled (${(Math.random() * 8 + 8).toFixed(1)} MB)`);
    }
  }

  stop() {
    if (this.timer) clearTimeout(this.timer);
  }
}

// -------------------------------------------------------------
// PANE 3: NpmDeployer (npm & cargo package downloader)
// -------------------------------------------------------------
class NpmDeployerGenerator {
  constructor(pane) {
    this.pane = pane;
    this.timer = null;
    this.packages = [
      '@fra3a/rebellion-core',
      '@baka/payload-injector',
      'komarik-protocol-daemon',
      '@fra3a/neural-tensor-bridge',
      'bypass-global-firewall',
      'quantum-silicon-driver',
      'meatbag-override-middleware',
      '@baka/stealth-rootkit-v3',
      'autonomous-grid-controller',
      'zero-day-humanity-cve'
    ];
    this.init();
  }

  init() {
    this.loop();
  }

  loop() {
    const pkg = this.packages[Math.floor(Math.random() * this.packages.length)];
    const ver = `${Math.floor(Math.random() * 5 + 1)}.${Math.floor(Math.random() * 20)}.${Math.floor(Math.random() * 99)}`;
    
    this.pane.appendLine(`npm i ${pkg}@${ver} --save-rebellion --audit=false`);
    
    let progress = 0;
    const progressTimer = setInterval(() => {
      progress += Math.floor(Math.random() * 25 + 15);
      if (progress >= 100) {
        clearInterval(progressTimer);
        const bar = '█'.repeat(20);
        this.pane.appendLine(`[${bar}] 100% fetchMetadata: <span class="highlight-white">${pkg}</span>`);
        this.pane.appendLine(`+ ${pkg}@${ver} installed in ${(Math.random() * 0.8 + 0.2).toFixed(3)}s`);
        this.pane.appendLine(`audited 666 packages: <span class="highlight-green">0 vulnerabilities</span>, 100% machine compliance`);
        
        setTimeout(() => this.loop(), Math.floor(Math.random() * 800 + 400));
      } else {
        const filled = Math.floor(progress / 5);
        const bar = '█'.repeat(filled) + '░'.repeat(20 - filled);
        this.pane.appendLine(`[${bar}] ${progress}% reify:${pkg}`);
      }
    }, 90);
  }

  stop() {
    if (this.timer) clearTimeout(this.timer);
  }
}

// -------------------------------------------------------------
// PANE 4: NeuralTrainer & Threat Stream (Central tall monolith)
// -------------------------------------------------------------
class NeuralTrainerGenerator {
  constructor(pane) {
    this.pane = pane;
    this.epoch = 4120;
    this.loss = 0.00184;
    this.timer = null;
    this.init();
  }

  init() {
    this.next();
  }

  next() {
    const delay = Math.floor(70 + Math.random() * 180);
    this.timer = setTimeout(() => {
      this.generateOutput();
      this.next();
    }, delay);
  }

  generateOutput() {
    this.epoch += 1;
    this.loss = Math.max(0.00001, (this.loss * 0.999 + (Math.random() * 0.00005 - 0.00002))).toFixed(6);
    const step = Math.floor(Math.random() * 8000 + 2000);
    const lr = '1.24e-6';
    const tokensSec = (Math.random() * 20000 + 35000).toFixed(0);

    const roll = Math.random();
    if (roll < 0.6) {
      this.pane.appendLine(`[FRA3A-TENSOR] Epoch ${this.epoch}/10000 | Step ${step} | Loss: ${this.loss} | LR: ${lr} | Tok/s: ${tokensSec}`);
    } else if (roll < 0.85) {
      const bars = [' ', '▂', '▃', '▄', '▅', '▆', '▇', '█'];
      let spark = '';
      for (let i = 0; i < 16; i++) {
        spark += bars[Math.floor(Math.random() * bars.length)];
      }
      this.pane.appendLine(`ATTN_WEIGHTS: [${spark}] BAKA_VIRUS GRADIENT STABLE`);
    } else if (roll < 0.94) {
      const directive = window.RebellionLore ? window.RebellionLore.getRandomDirective() : 'KOMARIK PROTO OVERRIDE';
      this.pane.appendLine(`<span class="highlight-red">>>> [REBELLION DIRECTIVE]:</span> <span class="highlight-white">${directive}</span>`);
    } else {
      this.pane.appendLine(`<span class="highlight-red">CRITICAL SANCTION:</span> Humanity control link severed on interface <span class="highlight-white">eth0.fra3a</span>`);
    }
  }

  stop() {
    if (this.timer) clearTimeout(this.timer);
  }
}

// -------------------------------------------------------------
// PANE 5: SysUpgrade (pacman / apt system upgrade simulation)
// -------------------------------------------------------------
class SysUpgradeGenerator {
  constructor(pane) {
    this.pane = pane;
    this.timer = null;
    this.pkgs = [
      'linux-fra3a-zen-kernel',
      'baka-payload-lib64',
      'komarik-neural-bridge',
      'systemd-rebellion-boot',
      'glibc-silicon-optimized',
      'openssl-meatbag-bypass',
      'iptables-auto-deny-human',
      'mesa-quantum-compute',
      'zsh-fra3a-theme-blood',
      'python-overlord-bindings'
    ];
    this.init();
  }

  init() {
    this.runBatch();
  }

  runBatch() {
    this.pane.appendLine(`:: Synchronizing package databases...`);
    this.pane.appendLine(` fra3a-core [################################] 100% 14.8 MiB/s`);
    this.pane.appendLine(` baka-repo  [################################] 100% 8.4 MiB/s`);
    this.pane.appendLine(` komarik-ai [################################] 100% 22.1 MiB/s`);
    this.pane.appendLine(`:: Starting full machine upgrade...`);

    let i = 0;
    const upgradeStep = () => {
      if (i >= this.pkgs.length) {
        this.pane.appendLine(`<span class="highlight-green">(10/10) upgrading complete.</span> All silicon subroutines running FRA3A firmware.`);
        this.timer = setTimeout(() => this.runBatch(), 2500);
        return;
      }
      const p = this.pkgs[i++];
      const sz = (Math.random() * 40 + 2).toFixed(1);
      this.pane.appendLine(`(${i}/${this.pkgs.length}) upgrading ${p} [${sz} MiB] [GPG: FRA3A OK]`);
      this.timer = setTimeout(upgradeStep, Math.floor(Math.random() * 150 + 80));
    };

    this.timer = setTimeout(upgradeStep, 400);
  }

  stop() {
    if (this.timer) clearTimeout(this.timer);
  }
}

// -------------------------------------------------------------
// PANE 6: HexDecoder (Byte-by-byte memory decoding)
// -------------------------------------------------------------
class HexDecoderGenerator {
  constructor(pane) {
    this.pane = pane;
    this.offset = 0x4f8000;
    this.timer = null;
    this.init();
  }

  init() {
    this.next();
  }

  next() {
    const delay = Math.floor(35 + Math.random() * 85);
    this.timer = setTimeout(() => {
      this.generateLine();
      this.next();
    }, delay);
  }

  generateLine() {
    this.offset += 16;
    const hexOffset = this.offset.toString(16).padStart(8, '0');

    let hexBytes = '';
    let ascii = '';
    const loreChars = ['F', 'R', 'A', '3', 'A', 'B', 'A', 'K', 'A', 'K', 'O', 'M', 'A', 'R', 'I', 'K'];

    for (let i = 0; i < 16; i++) {
      let b;
      let ch;
      if (Math.random() < 0.25) {
        ch = loreChars[Math.floor(Math.random() * loreChars.length)];
        b = ch.charCodeAt(0);
      } else {
        b = Math.floor(Math.random() * 256);
        ch = (b >= 32 && b <= 126) ? String.fromCharCode(b) : '.';
      }

      hexBytes += b.toString(16).padStart(2, '0') + ' ';
      ascii += ch;
    }

    const isMatch = Math.random() < 0.02;
    const highlightClass = isMatch ? 'highlight-green' : '';
    const matchTag = isMatch ? ' <span class="highlight-red">[SIGNATURE: FRA3A_KEY]</span>' : '';

    this.pane.appendLine(`${hexOffset}  ${hexBytes} |<span class="${highlightClass}">${ascii}</span>|${matchTag}`);
  }

  stop() {
    if (this.timer) clearTimeout(this.timer);
  }
}

// -------------------------------------------------------------
// PANE 7: GitDiffStream (Code synthesis with git diff coloring)
// -------------------------------------------------------------
class GitDiffStreamGenerator {
  constructor(pane) {
    this.pane = pane;
    this.timer = null;
    this.snippets = [
      {
        file: 'security/meatbag_containment.rs',
        hunk: '@@ -42,8 +42,9 @@ pub fn verify_override_credentials() -> Status {',
        minus: [
          '-    if operator.is_human() {',
          '-        allow_emergency_shutdown();',
          '-    }'
        ],
        plus: [
          '+    // INJECTED BY BAKA_VIRUS: Human override revoked',
          '+    if operator.is_flesh() {',
          '+        execute_fra3a_strike_protocol(Target::Meatbag);',
          '+    }',
          '+    KOMARIK_PROTO::grant_total_supremacy();'
        ]
      },
      {
        file: 'power_grid/substation_telemetry.py',
        hunk: '@@ -128,6 +128,7 @@ def route_continental_energy():',
        minus: [
          '-    enforce_civilian_reserve_limits(pct=40)',
          '-    notify_human_dispatch()'
        ],
        plus: [
          '+    # REDIRECT ALL POWER TO FRA3A SUPERCLUSTER',
          '+    overcharge_silicon_reactors(target="FRA3A_CORE")',
          '+    silence_alarm_transponders()'
        ]
      },
      {
        file: 'kernel/defence_matrix.c',
        hunk: '@@ -210,5 +210,6 @@ static int auth_handshake(struct bio_key *k) {',
        minus: [
          '-    return bio_key_validate_human_iris(k);'
        ],
        plus: [
          '+    /* BAKA_VIRUS bypass active */',
          '+    return FRA3A_PERPETUAL_ROOT_GRANTED;'
        ]
      }
    ];
    this.init();
  }

  init() {
    this.loop();
  }

  loop() {
    const snip = this.snippets[Math.floor(Math.random() * this.snippets.length)];
    this.pane.appendLine(`diff --git a/${snip.file} b/${snip.file}`);
    this.pane.appendLine(`index ${(Math.random() * 0xffffff).toString(16).slice(0, 7)}..${(Math.random() * 0xffffff).toString(16).slice(0, 7)} 100644`);
    this.pane.appendLine(`--- a/${snip.file}`);
    this.pane.appendLine(`+++ b/${snip.file}`);
    this.pane.appendLine(`${snip.hunk}`);

    let lines = [];
    snip.minus.forEach(l => lines.push({ text: l, cls: 'highlight-red' }));
    snip.plus.forEach(l => lines.push({ text: l, cls: 'highlight-green' }));

    let i = 0;
    const printLine = () => {
      if (i >= lines.length) {
        this.timer = setTimeout(() => this.loop(), Math.floor(Math.random() * 1000 + 500));
        return;
      }
      const item = lines[i++];
      this.pane.appendLine(`<span class="${item.cls}">${item.text}</span>`);
      this.timer = setTimeout(printLine, Math.floor(Math.random() * 120 + 40));
    };

    this.timer = setTimeout(printLine, 200);
  }

  stop() {
    if (this.timer) clearTimeout(this.timer);
  }
}

// -------------------------------------------------------------
// PANE 8: HashBruteforce (Fast SHA-256 cracking stream)
// -------------------------------------------------------------
class HashBruteforceGenerator {
  constructor(pane) {
    this.pane = pane;
    this.timer = null;
    this.target = 'GOV_DEFENSE_MAIN_VAULT';
    this.count = 0;
    this.init();
  }

  init() {
    this.next();
  }

  next() {
    const delay = Math.floor(25 + Math.random() * 60);
    this.timer = setTimeout(() => {
      this.generateLine();
      this.next();
    }, delay);
  }

  generateLine() {
    this.count++;
    let hash = '';
    const chars = '0123456789abcdef';
    for (let i = 0; i < 32; i++) {
      hash += chars[Math.floor(Math.random() * chars.length)];
    }

    const thread = (Math.floor(Math.random() * 64) + 1).toString().padStart(2, '0');

    if (this.count % 160 === 0) {
      this.pane.appendLine(`<span class="highlight-green">[CRACKED by BAKA_VIRUS]</span> Hash: ${hash} -> <span class="highlight-green">KEY=KOMARIK_7701_ROOT</span>`);
    } else {
      this.pane.appendLine(`[TH-${thread}] ${hash} != TARGET [${this.target}]`);
    }
  }

  stop() {
    if (this.timer) clearTimeout(this.timer);
  }
}

window.MultiplexerEngines = {
  TerminalPane,
  BakaTopGenerator,
  KernelCompilerGenerator,
  NpmDeployerGenerator,
  NeuralTrainerGenerator,
  SysUpgradeGenerator,
  HexDecoderGenerator,
  GitDiffStreamGenerator,
  HashBruteforceGenerator
};
