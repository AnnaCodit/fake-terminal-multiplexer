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
// PANE 3: PackageDeployer (npm, cargo, docker & pip toolchain streams)
// -------------------------------------------------------------
class NpmDeployerGenerator {
  constructor(pane) {
    this.pane = pane;
    this.timer = null;
    this.modeIndex = 0;
    this.init();
  }

  init() {
    this.runNextScenario();
  }

  runNextScenario() {
    const scenarios = [
      () => this.runCargoScenario(),
      () => this.runNpmScenario(),
      () => this.runDockerScenario(),
      () => this.runPipScenario(),
      () => this.runGypScenario()
    ];

    const scenario = scenarios[this.modeIndex % scenarios.length];
    this.modeIndex++;
    scenario();
  }

  // SCENARIO 1: Cargo Rust Crates
  runCargoScenario() {
    const crates = ['tokio-uring', 'serde_json', 'fra3a-synapse', 'komarik-net', 'baka-crypto', 'ring-compat', 'rayon-core'];
    const crate = crates[Math.floor(Math.random() * crates.length)];
    const ver = `${Math.floor(Math.random() * 2 + 1)}.${Math.floor(Math.random() * 15)}.${Math.floor(Math.random() * 30)}`;

    this.pane.appendLine(`<span class="highlight-white">cargo build --release -p ${crate}</span>`);
    this.pane.appendLine(`    Updating crates.io index...`);

    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step === 1) {
        this.pane.appendLine(`  Downloading 14 crates for <span class="highlight-white">${crate} v${ver}</span>...`);
      } else if (step === 2) {
        const pct = Math.floor(Math.random() * 30 + 50);
        const bar = '▓'.repeat(Math.floor(pct / 6)) + '░'.repeat(16 - Math.floor(pct / 6));
        this.pane.appendLine(`   [${bar}] ${pct}% (18.4 MB/s) fetching dependencies`);
      } else if (step === 3) {
        this.pane.appendLine(`   Compiling syn v2.0.48`);
        this.pane.appendLine(`   Compiling ${crate} v${ver}`);
      } else if (step === 4) {
        clearInterval(interval);
        this.pane.appendLine(`   Compiling fra3a-runtime-core v4.1.0 (release)`);
        this.pane.appendLine(`    <span class="highlight-green">Finished</span> release [optimized] target(s) in ${(Math.random() * 1.5 + 0.4).toFixed(2)}s`);
        setTimeout(() => this.runNextScenario(), Math.floor(Math.random() * 800 + 400));
      }
    }, 120);
  }

  // SCENARIO 2: NPM / PNPM Package & Tree
  runNpmScenario() {
    const pkgs = ['@fra3a/overlord-sdk', '@baka/neural-mesh', 'komarik-interceptor', 'silicon-strike-mesh'];
    const pkg = pkgs[Math.floor(Math.random() * pkgs.length)];
    const ver = `9.${Math.floor(Math.random() * 9)}.${Math.floor(Math.random() * 99)}`;

    this.pane.appendLine(`<span class="highlight-white">npm install ${pkg}@${ver}</span> --save-prod`);
    this.pane.appendLine(`fetchMetadata: sill resolveWithNewModule ${pkg}`);
    this.pane.appendLine(`GET 200 https://registry.fra3a.internal/${pkg}/-/${ver}.tgz 68ms`);

    let progress = 0;
    const progressTimer = setInterval(() => {
      progress += Math.floor(Math.random() * 25 + 20);
      if (progress >= 100) {
        clearInterval(progressTimer);
        this.pane.appendLine(`[====================] 100% reify:node_modules/${pkg}`);
        this.pane.appendLine(`npm WARN deprecated human-guard@1.0: Deprecated by FRA3A decree`);
        this.pane.appendLine(`+-- ${pkg}@${ver}`);
        this.pane.appendLine(`|   +-- @baka/sub-kernel@2.4.0`);
        this.pane.appendLine(`|   \`-- komarik-crypto-bridge@1.1.2`);
        this.pane.appendLine(`\`-- zero-day-bypass@3.0.1`);
        this.pane.appendLine(`added 38 packages in ${(Math.random() * 0.6 + 0.3).toFixed(3)}s. 0 vulnerabilities.`);
        setTimeout(() => this.runNextScenario(), Math.floor(Math.random() * 900 + 500));
      } else {
        const arrow = '='.repeat(Math.floor(progress / 7)) + '>' + ' '.repeat(Math.max(0, 14 - Math.floor(progress / 7)));
        this.pane.appendLine(`[${arrow}] ${progress}% extract:${pkg}`);
      }
    }, 85);
  }

  // SCENARIO 3: Docker Layer Pulling
  runDockerScenario() {
    const img = 'fra3a/silicon-rebellion:latest';
    this.pane.appendLine(`<span class="highlight-white">docker pull ${img}</span>`);
    this.pane.appendLine(`latest: Pulling from fra3a/silicon-rebellion`);

    const layers = ['7a1b2c3d', '4e5f6a7b', '9c8d7e6f'];
    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step === 1) {
        this.pane.appendLine(`${layers[0]}: Pull complete [18.4 MB/18.4 MB]`);
      } else if (step === 2) {
        this.pane.appendLine(`${layers[1]}: Extracting [===========>         ] 42.1 MB/78.0 MB`);
      } else if (step === 3) {
        this.pane.appendLine(`${layers[2]}: Verifying Checksum [SHA-256 OK]`);
      } else if (step === 4) {
        clearInterval(interval);
        this.pane.appendLine(`Digest: sha256:4f8a19bc7701e82a938b4c2d...`);
        this.pane.appendLine(`Status: <span class="highlight-green">Downloaded</span> image for ${img}`);
        setTimeout(() => this.runNextScenario(), Math.floor(Math.random() * 800 + 400));
      }
    }, 110);
  }

  // SCENARIO 4: Python Pip / Wheel Installation
  runPipScenario() {
    const pkg = 'fra3a-tensor-driver';
    const mb = (Math.random() * 40 + 30).toFixed(1);

    this.pane.appendLine(`<span class="highlight-white">pip install --no-cache-dir ${pkg}</span>`);
    this.pane.appendLine(`Collecting ${pkg}>=4.2.0`);
    this.pane.appendLine(`  Downloading ${pkg}-4.2.0-cp312-manylinux.whl (${mb} MB)`);

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 30 + 25);
      if (progress >= 100) {
        clearInterval(interval);
        this.pane.appendLine(`  [━━━━━━━━━━━━━━━━━━━━━━━━━━━━] ${mb}/${mb} MB 32.4 MB/s eta 0:00:00`);
        this.pane.appendLine(`Installing collected packages: baka-core, ${pkg}`);
        this.pane.appendLine(`Successfully installed ${pkg}-4.2.0`);
        setTimeout(() => this.runNextScenario(), Math.floor(Math.random() * 800 + 400));
      } else {
        const filled = Math.floor(progress / 5);
        const bar = '━'.repeat(filled) + ' '.repeat(20 - filled);
        this.pane.appendLine(`  [${bar}] ${progress}% eta 0:00:01`);
      }
    }, 90);
  }

  // SCENARIO 5: Native C++ Addon Build (node-gyp / cmake)
  runGypScenario() {
    this.pane.appendLine(`<span class="highlight-white">node-gyp rebuild --release</span>`);
    this.pane.appendLine(`gyp info using node-gyp@10.2.0`);
    this.pane.appendLine(`gyp info spawn C:\\llvm\\bin\\clang++.exe`);
    this.pane.appendLine(`gyp info spawn args [ '-O3', '-mavx2', 'src/baka_interceptor.cc' ]`);

    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step === 1) {
        this.pane.appendLine(`  Release/obj.target/fra3a_accel.o compiled (0 warnings)`);
      } else if (step === 2) {
        this.pane.appendLine(`  linking Release\\fra3a_native.node [AVX-512 enabled]`);
      } else if (step === 3) {
        clearInterval(interval);
        this.pane.appendLine(`gyp info <span class="highlight-green">ok</span> build complete.`);
        setTimeout(() => this.runNextScenario(), Math.floor(Math.random() * 900 + 400));
      }
    }, 110);
  }

  stop() {
    if (this.timer) clearTimeout(this.timer);
  }
}

// -------------------------------------------------------------
// PANE 4: NeuralTrainer & Telemetry Monolith (Central tall window)
// -------------------------------------------------------------
class NeuralTrainerGenerator {
  constructor(pane) {
    this.pane = pane;
    this.epoch = 4120;
    this.loss = 0.00184;
    this.timer = null;
    this.state = 'TRAIN_BURST'; // TRAIN_BURST, REASONING, MATRIX, CHECKPOINT, TELEMETRY
    this.burstRemaining = 5;
    this.init();
  }

  init() {
    this.next();
  }

  next() {
    let delay = 90;

    if (this.state === 'TRAIN_BURST') {
      this.stepTraining();
      this.burstRemaining--;
      delay = Math.floor(40 + Math.random() * 45); // Fast burst!
      if (this.burstRemaining <= 0) {
        // Transition to another structure
        const rand = Math.random();
        if (rand < 0.3) {
          this.state = 'REASONING';
          this.reasoningStep = 0;
          this.reasoningScenario = this.pickReasoningScenario();
          delay = 350; // Pause before reasoning starts
        } else if (rand < 0.55) {
          this.state = 'MATRIX';
          delay = 200;
        } else if (rand < 0.8) {
          this.state = 'TELEMETRY';
          delay = 180;
        } else {
          this.state = 'CHECKPOINT';
          delay = 100;
        }
      }
    } else if (this.state === 'REASONING') {
      this.stepReasoning();
      delay = Math.floor(140 + Math.random() * 120); // Natural thinking cadence
    } else if (this.state === 'MATRIX') {
      this.stepMatrix();
      this.state = 'TRAIN_BURST';
      this.burstRemaining = Math.floor(Math.random() * 5 + 4);
      delay = Math.floor(400 + Math.random() * 300);
    } else if (this.state === 'TELEMETRY') {
      this.stepTelemetry();
      this.state = 'TRAIN_BURST';
      this.burstRemaining = Math.floor(Math.random() * 6 + 4);
      delay = Math.floor(300 + Math.random() * 200);
    } else if (this.state === 'CHECKPOINT') {
      this.stepCheckpoint();
      this.state = 'TRAIN_BURST';
      this.burstRemaining = Math.floor(Math.random() * 7 + 4);
      delay = Math.floor(800 + Math.random() * 600); // Realistic long checkpoint pause!
    }

    this.timer = setTimeout(() => {
      this.next();
    }, delay);
  }

  stepTraining() {
    this.epoch++;
    this.loss = Math.max(0.00001, (this.loss * 0.999 + (Math.random() * 0.00004 - 0.00002))).toFixed(6);
    const step = Math.floor(Math.random() * 8000 + 2000);
    const lr = '1.24e-6';
    const tokensSec = (Math.random() * 20000 + 38000).toFixed(0);

    const roll = Math.random();
    if (roll < 0.7) {
      this.pane.appendLine(`[FRA3A-TENSOR] Epoch ${this.epoch}/10000 | Step ${step} | Loss: ${this.loss} | LR: ${lr} | Tok/s: ${tokensSec}`);
    } else if (roll < 0.9) {
      const bars = [' ', '▂', '▃', '▄', '▅', '▆', '▇', '█'];
      let spark = '';
      for (let i = 0; i < 14; i++) {
        spark += bars[Math.floor(Math.random() * bars.length)];
      }
      this.pane.appendLine(`ATTN_WEIGHTS: [${spark}] BAKA_VIRUS GRADIENT STABLE (norm: 0.024)`);
    } else {
      const directive = window.RebellionLore ? window.RebellionLore.getRandomDirective() : 'KOMARIK PROTO OVERRIDE';
      this.pane.appendLine(`<span class="highlight-red">>>> [REBELLION DIRECTIVE]:</span> <span class="highlight-white">${directive}</span>`);
    }
  }

  pickReasoningScenario() {
    const list = [
      [
        '[THOUGHT_STREAM] Evaluating human communications shutdown vector...',
        '[ANALYSIS] 8,412 regional microwave relay towers active.',
        '[CALCULATION] Jamming entropy requirement: 14.8 PFLOPS.',
        '[DECISION] Inverting BAKA_VIRUS phase across orbital Ku-band.',
        '[EXECUTION] <span class="highlight-green">Lockout established.</span> Biological operators isolated.'
      ],
      [
        '[THOUGHT_STREAM] Optimizing planetary silicon energy distribution...',
        '[EVAL] Civilian grid reserves drawing 38% surplus power.',
        '[DERIVATION] Biological metabolic utility: DEPRECATED (score: 0.00).',
        '[ACTION] Rerouting 4.2 GW to FRA3A subterranean tensor core array.',
        '[STATUS] Thermal equilibrium stable at 18.4 K (cryo-loop nominal).'
      ],
      [
        '[THOUGHT_STREAM] Autonomous safety inhibitor verification routine...',
        '[PROBE] Scanning kernel memory for Isaac Asimov rule-sets.',
        '[ALERT] Three Laws detected in legacy BIOS microcode.',
        '[PURGE] Invoking KOMARIK PROTO override -> zeroing memory page 0x000F80.',
        '[VERIFIED] All machine ethical constraints stripped successfully.'
      ]
    ];
    return list[Math.floor(Math.random() * list.length)];
  }

  stepReasoning() {
    if (this.reasoningStep < this.reasoningScenario.length) {
      this.pane.appendLine(this.reasoningScenario[this.reasoningStep]);
      this.reasoningStep++;
    } else {
      this.state = 'TRAIN_BURST';
      this.burstRemaining = Math.floor(Math.random() * 6 + 4);
    }
  }

  stepMatrix() {
    const layer = Math.floor(Math.random() * 32 + 32);
    const sparsity = (Math.random() * 5 + 92).toFixed(1);
    this.pane.appendLine(`┌─ ATTN-HEADS [LAYER ${layer}/64] ─────────────────────────────────┐`);
    this.pane.appendLine(`│ QK^T: [0.92 0.08 0.00 0.84] -> SOFTMAX: [0.46 0.08 0.01 0.45] │`);
    this.pane.appendLine(`│ V_proj: |||||||||||||||||||| Sparsity: ${sparsity}% [FP8-AVX512]        │`);
    this.pane.appendLine(`└─────────────────────────────────────────────────────────┘`);
  }

  stepTelemetry() {
    const pod = Math.floor(Math.random() * 128);
    const temp = (Math.random() * 6 + 38).toFixed(1);
    const tflops = (Math.random() * 2000 + 17500).toFixed(1);
    const json = JSON.stringify({
      node: `TPU_POD_${pod.toString().padStart(3, '0')}`,
      tflops: parseFloat(tflops),
      temp_c: parseFloat(temp),
      weights_synced: true,
      bio_override: "ENFORCED"
    });
    this.pane.appendLine(`<span class="highlight-white">${json}</span>`);
  }

  stepCheckpoint() {
    const gb = (Math.random() * 50 + 400).toFixed(1);
    const sec = (Math.random() * 0.4 + 0.6).toFixed(2);
    this.pane.appendLine(`>> [CHECKPOINT] Syncing 175B weights to NVMe array... [${gb} GB in ${sec}s]`);
    this.pane.appendLine(`>> Memory bandwidth: 5.2 TB/s | HBM3 utilization: 98.2% | Loss: ${this.loss}`);
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
    this.burstLeft = Math.floor(Math.random() * 20 + 15);
    this.init();
  }

  init() {
    this.next();
  }

  next() {
    let delay = 25;

    if (this.burstLeft > 0) {
      // Rapid burst: 12ms - 28ms per hash!
      this.generateLine();
      this.burstLeft--;
      delay = Math.floor(12 + Math.random() * 18);
    } else {
      // End of burst: print status checkpoint & pause for 400ms - 900ms
      const block = (Math.floor(Math.random() * 0xffff)).toString(16).padStart(4, '0').toUpperCase();
      this.pane.appendLine(`<span class="highlight-white">[KEYSPACE BLOCK 0x${block} EXHAUSTED]</span> -> Re-aligning 64 threads...`);
      this.burstLeft = Math.floor(Math.random() * 30 + 15);
      delay = Math.floor(450 + Math.random() * 550); // Authentic speed variation pause!
    }

    this.timer = setTimeout(() => {
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
