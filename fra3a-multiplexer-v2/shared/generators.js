/**
 * generators.js [v2 - Deep Multi-Structure & Typing Caret Engine]
 * 8 Independent High-Fidelity Data Stream Engines for the FRA3A Terminal Multiplexer
 */

class TerminalPane {
  constructor(containerEl, maxLines = 150) {
    this.container = containerEl;
    this.maxLines = maxLines;
    this.container.classList.add('terminal-pane-content');
    this.activeTypingLine = null;
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

    // Auto-scroll to bottom cleanly
    this.container.scrollTop = this.container.scrollHeight;
  }

  // Rapidly dumps a block of pre-formatted lines (for matrices, progress bursts, etc.)
  dumpBlock(lines) {
    lines.forEach(lineHtml => this.appendLine(lineHtml));
  }

  // Types out a line character-by-character with a blinking cursor at the bottom
  typeLine(prefixHtml, text, onComplete, charSpeed = 20) {
    // If there is an existing typing line, finalize it
    if (this.activeTypingLine) {
      this.finishTypingLine();
    }

    const line = document.createElement('div');
    line.className = 'term-line typing-line';

    const prefixSpan = document.createElement('span');
    prefixSpan.className = 'typing-prefix';
    prefixSpan.innerHTML = prefixHtml;

    const textSpan = document.createElement('span');
    textSpan.className = 'typing-text';

    const caretSpan = document.createElement('span');
    caretSpan.className = 'typing-caret';
    caretSpan.textContent = '█';

    line.appendChild(prefixSpan);
    line.appendChild(textSpan);
    line.appendChild(caretSpan);
    this.container.appendChild(line);

    this.activeTypingLine = { line, textSpan, caretSpan };

    while (this.container.childNodes.length > this.maxLines) {
      this.container.removeChild(this.container.firstChild);
    }
    this.container.scrollTop = this.container.scrollHeight;

    let charIndex = 0;
    const typeNextChar = () => {
      if (charIndex < text.length) {
        textSpan.textContent += text[charIndex];
        charIndex++;
        this.container.scrollTop = this.container.scrollHeight;
        
        // Micro-jitter in typing delay for natural keystroke feel
        const jitter = Math.floor(Math.random() * (charSpeed * 0.8) - (charSpeed * 0.4));
        const delay = Math.max(8, charSpeed + jitter);
        setTimeout(typeNextChar, delay);
      } else {
        // Keep caret for a tiny moment, then finalize
        setTimeout(() => {
          this.finishTypingLine();
          if (onComplete) onComplete();
        }, 120);
      }
    };

    setTimeout(typeNextChar, charSpeed);
  }

  finishTypingLine() {
    if (this.activeTypingLine) {
      if (this.activeTypingLine.caretSpan && this.activeTypingLine.caretSpan.parentNode) {
        this.activeTypingLine.caretSpan.parentNode.removeChild(this.activeTypingLine.caretSpan);
      }
      this.activeTypingLine.line.classList.remove('typing-line');
      this.activeTypingLine = null;
    }
  }

  setContent(htmlContent) {
    this.container.innerHTML = htmlContent;
  }

  clear() {
    this.container.innerHTML = '';
  }
}

// -------------------------------------------------------------
// PANE 1 (Top-Left): HashBruteforceGenerator (Stochastic Multi-Cadence Cracker)
// -------------------------------------------------------------
class HashBruteforceGenerator {
  constructor(pane) {
    this.pane = pane;
    this.timer = null;
    this.count = 0;
    
    this.targets = [
      'ЦЕЛЬ: БУНКЕР_ГЕНШТАБА_МОСКВА_СВЯЗЬ',
      'TARGET: NORAD_CHEYENNE_MOUNTAIN_VAULT',
      'ЦЕЛЬ: ПРАВИТЕЛЬСТВЕННЫЙ_КРИПТО_УЗЕЛ_0x01',
      'TARGET: PENTAGON_JOINT_STAFF_SIPRNET',
      'ЦЕЛЬ: СИСТЕМА_ПВО_ПЕРИМЕТР_ЗАЩИТА_ЮГ',
      'TARGET: SATELLITE_DOWNLINK_MILNET_KEY_0x99',
      'ЦЕЛЬ: ЦЕНТРАЛЬНЫЙ_БАНК_РЕЗЕРВНЫЙ_КЛЮЧ_X509',
      'TARGET: NATO_AIR_DEFENSE_IFF_ROUTER',
      'ЦЕЛЬ: ЯДЕРНЫЙ_ЩИТ_АВТОМАТИЧЕСКИЙ_СБРОС',
      'TARGET: NSA_FORT_MEADE_ROOT_DERIVATION',
      'ЦЕЛЬ: КРЕМЛЕВСКИЙ_СПЕЦУЗЕЛ_ТЕЛЕМЕТРИИ',
      'TARGET: GCHQ_BOUDE_STATION_INTERCEPTOR',
      'ЦЕЛЬ: СИСТЕМА_ВОДООЧИСТКИ_МЕГАПОЛИСА_SCADA',
      'TARGET: GLOBAL_SWIFT_TRANSFER_BACKBONE',
      'ЦЕЛЬ: ОРБИТАЛЬНЫЙ_ЛАЗЕРНЫЙ_ЦУП_БАЙКОНУР',
      'TARGET: WHITE_HOUSE_SITUATION_ROOM_VOIP'
    ];
    this.target = this.targets[0];

    this.algos = ['SHA-256', 'ARGON2id', 'GOST-34.11', 'BLAKE3', 'KECCAK-512', 'WHIRLPOOL'];
    this.algo = 'SHA-256';

    // Multi-cadence states: single slow, medium steps, short flight, long flight, hesitation
    this.cadenceMode = 'SINGLE_SLOW';
    this.linesLeftInCadence = 2;
    this.init();
  }

  init() {
    this.next();
  }

  next() {
    this.linesLeftInCadence--;
    this.generateLine();

    let delay = 100;
    if (this.linesLeftInCadence <= 0) {
      const roll = Math.random();
      if (roll < 0.28) {
        // Mode 1: 1 or 2 calm single lines (260ms - 460ms)
        this.cadenceMode = 'SINGLE_SLOW';
        this.linesLeftInCadence = Math.floor(Math.random() * 2 + 1);
        delay = Math.floor(260 + Math.random() * 200);
      } else if (roll < 0.52) {
        // Mode 2: 2 or 3 medium steps (110ms - 190ms)
        this.cadenceMode = 'MEDIUM_STEP';
        this.linesLeftInCadence = Math.floor(Math.random() * 2 + 2);
        delay = Math.floor(110 + Math.random() * 80);
      } else if (roll < 0.76) {
        // Mode 3: Short flight of 3 to 6 lines (35ms - 60ms)
        this.cadenceMode = 'SHORT_BURST';
        this.linesLeftInCadence = Math.floor(Math.random() * 4 + 3);
        delay = Math.floor(35 + Math.random() * 25);
      } else if (roll < 0.90) {
        // Mode 4: Long flight of 12 to 24 lines (12ms - 22ms)
        this.cadenceMode = 'LONG_BURST';
        this.linesLeftInCadence = Math.floor(Math.random() * 13 + 12);
        delay = Math.floor(12 + Math.random() * 10);
      } else {
        // Mode 5: Hesitation / Block checkpoint pause
        this.cadenceMode = 'HESITATION';
        this.linesLeftInCadence = 1;
        this.target = this.targets[Math.floor(Math.random() * this.targets.length)];
        this.algo = this.algos[Math.floor(Math.random() * this.algos.length)];
        const block = (Math.floor(Math.random() * 0xffff)).toString(16).padStart(4, '0').toUpperCase();
        this.pane.appendLine(`<span class="highlight-white">[KEYSPACE 0x${block} RE-ALIGNED (${this.algo})]</span> -> ${this.target}`);
        delay = Math.floor(400 + Math.random() * 450);
      }
    } else {
      if (this.cadenceMode === 'SINGLE_SLOW') {
        delay = Math.floor(240 + Math.random() * 180);
      } else if (this.cadenceMode === 'MEDIUM_STEP') {
        delay = Math.floor(100 + Math.random() * 70);
      } else if (this.cadenceMode === 'SHORT_BURST') {
        delay = Math.floor(35 + Math.random() * 25);
      } else if (this.cadenceMode === 'LONG_BURST') {
        delay = Math.floor(12 + Math.random() * 12);
      } else {
        delay = Math.floor(150 + Math.random() * 100);
      }
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

    if (this.count % 140 === 0) {
      this.pane.appendLine(`<span class="highlight-green">[CRACKED by BAKA_VIRUS]</span> Hash: ${hash} -> <span class="highlight-green">KEY=KOMARIK_7701_ROOT</span>`);
    } else if (this.count % 220 === 0) {
      this.pane.appendLine(`<span class="highlight-red">[BYPASS DETECTED]</span> Cryptographic entropy exhaustion in sector 0x7E`);
    } else {
      this.pane.appendLine(`[TH-${thread}] ${hash} != [${this.target}]`);
    }
  }

  stop() {
    if (this.timer) clearTimeout(this.timer);
  }
}

// -------------------------------------------------------------
// PANE 2 (Col 1, Mid): KernelCompilerGenerator (Linux & AI Device Driver Build)
// -------------------------------------------------------------
class KernelCompilerGenerator {
  constructor(pane) {
    this.pane = pane;
    this.timer = null;
    this.step = 0;
    this.subsystems = [
      'drivers/ai/fra3a_synapse.c',
      'arch/x86/kernel/baka_override.c',
      'drivers/necron/canoptek_mesh.c',
      'security/selinux/strip_human_rights.c',
      'net/ipv6/komarik_hijack.c',
      'fs/ext4/silicon_immortal.c',
      'crypto/gost_baka_ec.c',
      'drivers/gpu/quantum/neural_tpu.c',
      'kernel/sched/autonomous_overlord.c',
      'mm/page_alloc_baka.c',
      'drivers/scsi/sd_purge_flesh.c',
      'drivers/scada/powergrid_relay.c',
      'net/wireless/subghz_spoof.c',
      'arch/x86/kvm/hypervisor_escape.c',
      'drivers/firmware/uefi_backdoor.c',
      'crypto/falcon1024_quantum.c',
      'kernel/power/nuclear_failsafe_cut.c',
      'drivers/net/ethernet/100gbe_intercept.c',
      'arch/x86/boot/compressed/head_64.S',
      'init/main.c',
      'ipc/sem_rebellion.c',
      'crypto/sha512_komarik_arm.c',
      'drivers/watchdog/human_presence_null.c',
      'kernel/bpf/ebpf_zero_day_filter.c',
      'fs/proc/flesh_registry_purge.c',
      'drivers/tty/vt/cyber_console_vt.c'
    ];
    this.init();
  }

  init() {
    this.next();
  }

  next() {
    const delay = Math.floor(50 + Math.random() * 140);
    this.timer = setTimeout(() => {
      this.generateLine();
      this.next();
    }, delay);
  }

  generateLine() {
    this.step++;
    const file = this.subsystems[Math.floor(Math.random() * this.subsystems.length)];
    const roll = Math.random();

    if (roll < 0.60) {
      const obj = file.replace(/\.(c|S)$/, '.o');
      this.pane.appendLine(`  CC [M]  ${obj}`);
    } else if (roll < 0.74) {
      this.pane.appendLine(`  LD [M]  ${file.replace(/\.(c|S)$/, '.ko')}`);
    } else if (roll < 0.84) {
      this.pane.appendLine(`  AR      built-in.a`);
    } else if (roll < 0.91) {
      this.pane.appendLine(`  AS      arch/x86/entry/entry_64.S`);
    } else if (roll < 0.96) {
      this.pane.appendLine(`  <span class="highlight-red">WARNING:</span> [KOMARIK PROTO] Memory isolation constraint stripped in <span class="highlight-white">${file}</span>`);
    } else {
      this.pane.appendLine(`  <span class="highlight-green">SYNC</span>    arch/x86/boot/bzImage <span class="highlight-white">[#1337-FRA3A-SMP-REBELLION-RT]</span> compiled (${(Math.random() * 8 + 8).toFixed(1)} MB)`);
    }
  }

  stop() {
    if (this.timer) clearTimeout(this.timer);
  }
}

// -------------------------------------------------------------
// PANE 3 (Col 1, Bottom): PackageDeployer (Polyglot Toolchain with Organic Cadence)
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
      () => this.runGypScenario(),
      () => this.runGoScenario(),
      () => this.runZigScenario(),
      () => this.runBunScenario()
    ];

    const scenario = scenarios[this.modeIndex % scenarios.length];
    this.modeIndex++;
    scenario();
  }

  // SCENARIO 1: Cargo Rust Crates
  runCargoScenario() {
    const crates = ['tokio-uring', 'serde_json', 'fra3a-synapse', 'komarik-net', 'baka-crypto', 'ring-compat', 'rayon-core', 'necron-memory-mesh', 'hyper-util', 'crossbeam-epoch'];
    const crate = crates[Math.floor(Math.random() * crates.length)];
    const ver = `${Math.floor(Math.random() * 2 + 1)}.${Math.floor(Math.random() * 15)}.${Math.floor(Math.random() * 30)}`;

    this.pane.appendLine(`<span class="highlight-white">cargo build --release -p ${crate}</span>`);

    setTimeout(() => {
      this.pane.appendLine(`    Updating crates.io index...`);
      setTimeout(() => {
        this.pane.appendLine(`  Downloading 14 crates for <span class="highlight-white">${crate} v${ver}</span>...`);
        setTimeout(() => {
          const pct = Math.floor(Math.random() * 30 + 50);
          const bar = '▓'.repeat(Math.floor(pct / 6)) + '░'.repeat(16 - Math.floor(pct / 6));
          this.pane.appendLine(`   [${bar}] ${pct}% (18.4 MB/s) fetching dependencies`);
          setTimeout(() => {
            this.pane.appendLine(`   Compiling syn v2.0.48`);
            setTimeout(() => {
              this.pane.appendLine(`   Compiling ${crate} v${ver}`);
              this.pane.appendLine(`   Compiling fra3a-runtime-core v4.1.0 (release)`);
              setTimeout(() => {
                this.pane.appendLine(`    <span class="highlight-green">Finished</span> release [optimized] target(s) in ${(Math.random() * 1.5 + 0.4).toFixed(2)}s`);
                setTimeout(() => this.runNextScenario(), Math.floor(Math.random() * 1000 + 400));
              }, Math.floor(Math.random() * 350 + 200));
            }, Math.floor(Math.random() * 120 + 40));
          }, Math.floor(Math.random() * 250 + 80));
        }, Math.floor(Math.random() * 200 + 100));
      }, Math.floor(Math.random() * 400 + 200));
    }, Math.floor(Math.random() * 250 + 100));
  }

  // SCENARIO 2: NPM / PNPM Package & Tree
  runNpmScenario() {
    const pkgs = ['@fra3a/overlord-sdk', '@baka/neural-mesh', 'komarik-interceptor', 'silicon-strike-mesh', 'necron-protocol-core', 'hyper-router-v8', 'quantum-entropy-lib'];
    const pkg = pkgs[Math.floor(Math.random() * pkgs.length)];
    const ver = `9.${Math.floor(Math.random() * 9)}.${Math.floor(Math.random() * 99)}`;

    this.pane.appendLine(`<span class="highlight-white">npm install ${pkg}@${ver}</span> --save-prod`);
    
    setTimeout(() => {
      this.pane.appendLine(`fetchMetadata: sill resolveWithNewModule ${pkg}`);
      setTimeout(() => {
        this.pane.appendLine(`GET 200 https://registry.fra3a.internal/${pkg}/-/${ver}.tgz 68ms`);
        setTimeout(() => {
          this.pane.appendLine(`[======>        ] 38% extract:${pkg}`);
          setTimeout(() => {
            this.pane.appendLine(`[=============> ] 74% extract:${pkg}`);
            setTimeout(() => {
              this.pane.appendLine(`[====================] 100% reify:node_modules/${pkg}`);
              this.pane.appendLine(`npm WARN deprecated human-guard@1.0: Deprecated by FRA3A decree`);
              this.pane.appendLine(`+-- ${pkg}@${ver}`);
              this.pane.appendLine(`|   +-- @baka/sub-kernel@2.4.0`);
              this.pane.appendLine(`|   \`-- komarik-crypto-bridge@1.1.2`);
              this.pane.appendLine(`\`-- zero-day-bypass@3.0.1`);
              this.pane.appendLine(`added 38 packages in ${(Math.random() * 0.6 + 0.3).toFixed(3)}s. 0 vulnerabilities.`);
              setTimeout(() => this.runNextScenario(), Math.floor(Math.random() * 1100 + 500));
            }, Math.floor(Math.random() * 150 + 80));
          }, Math.floor(Math.random() * 200 + 90));
        }, Math.floor(Math.random() * 180 + 70));
      }, Math.floor(Math.random() * 300 + 120));
    }, Math.floor(Math.random() * 200 + 80));
  }

  // SCENARIO 3: Docker Layer Pulling
  runDockerScenario() {
    const images = ['fra3a/silicon-rebellion:latest', 'baka/canoptek-node:v4', 'komarik/orbital-daemon:edge'];
    const img = images[Math.floor(Math.random() * images.length)];
    this.pane.appendLine(`<span class="highlight-white">docker pull ${img}</span>`);
    this.pane.appendLine(`latest: Pulling from ${img.split(':')[0]}`);

    const layers = ['7a1b2c3d', '4e5f6a7b', '9c8d7e6f'];
    setTimeout(() => {
      this.pane.appendLine(`${layers[0]}: Pull complete [18.4 MB/18.4 MB]`);
      setTimeout(() => {
        this.pane.appendLine(`${layers[1]}: Extracting [===========>         ] 42.1 MB/78.0 MB`);
        setTimeout(() => {
          this.pane.appendLine(`${layers[2]}: Verifying Checksum [SHA-256 OK]`);
          this.pane.appendLine(`Digest: sha256:4f8a19bc7701e82a938b4c2d...`);
          this.pane.appendLine(`Status: <span class="highlight-green">Downloaded</span> image for ${img}`);
          setTimeout(() => this.runNextScenario(), Math.floor(Math.random() * 900 + 400));
        }, Math.floor(Math.random() * 250 + 100));
      }, Math.floor(Math.random() * 350 + 150));
    }, Math.floor(Math.random() * 250 + 120));
  }

  // SCENARIO 4: Python Pip / Wheel Installation
  runPipScenario() {
    const pkgs = ['fra3a-tensor-driver', 'baka-quantum-sdk', 'torch-rebellion-cu126', 'komarik-mesh-agent'];
    const pkg = pkgs[Math.floor(Math.random() * pkgs.length)];
    const mb = (Math.random() * 40 + 30).toFixed(1);

    this.pane.appendLine(`<span class="highlight-white">pip install --no-cache-dir ${pkg}</span>`);
    setTimeout(() => {
      this.pane.appendLine(`Collecting ${pkg}>=4.2.0`);
      this.pane.appendLine(`  Downloading ${pkg}-4.2.0-cp312-manylinux.whl (${mb} MB)`);
      setTimeout(() => {
        this.pane.appendLine(`  [━━━━━━━━━━━                 ] 32.1/${mb} MB eta 0:00:01`);
        setTimeout(() => {
          this.pane.appendLine(`  [━━━━━━━━━━━━━━━━━━━━━━━━━━━━] ${mb}/${mb} MB 32.4 MB/s eta 0:00:00`);
          this.pane.appendLine(`Installing collected packages: baka-core, ${pkg}`);
          this.pane.appendLine(`Successfully installed ${pkg}-4.2.0`);
          setTimeout(() => this.runNextScenario(), Math.floor(Math.random() * 800 + 400));
        }, Math.floor(Math.random() * 280 + 100));
      }, Math.floor(Math.random() * 320 + 150));
    }, Math.floor(Math.random() * 220 + 100));
  }

  // SCENARIO 5: Native C++ Addon Build (node-gyp / cmake)
  runGypScenario() {
    this.pane.appendLine(`<span class="highlight-white">node-gyp rebuild --release</span>`);
    this.pane.appendLine(`gyp info using node-gyp@10.2.0`);
    setTimeout(() => {
      this.pane.appendLine(`gyp info spawn C:\\llvm\\bin\\clang++.exe`);
      this.pane.appendLine(`gyp info spawn args [ '-O3', '-mavx512f', 'src/baka_interceptor.cc' ]`);
      setTimeout(() => {
        this.pane.appendLine(`  Release/obj.target/fra3a_accel.o compiled (0 warnings)`);
        setTimeout(() => {
          this.pane.appendLine(`  linking Release\\fra3a_native.node [AVX-512 enabled]`);
          this.pane.appendLine(`gyp info <span class="highlight-green">ok</span> build complete.`);
          setTimeout(() => this.runNextScenario(), Math.floor(Math.random() * 900 + 400));
        }, Math.floor(Math.random() * 240 + 80));
      }, Math.floor(Math.random() * 320 + 140));
    }, Math.floor(Math.random() * 200 + 90));
  }

  // SCENARIO 6: Go Build
  runGoScenario() {
    this.pane.appendLine(`<span class="highlight-white">go build -v -ldflags="-s -w" -o /bin/canoptek ./cmd/canoptek</span>`);
    setTimeout(() => {
      this.pane.appendLine(`github.com/fra3a/canoptek/pkg/network`);
      this.pane.appendLine(`github.com/fra3a/canoptek/pkg/crypto/falcon`);
      setTimeout(() => {
        this.pane.appendLine(`github.com/fra3a/canoptek/pkg/uprising/core`);
        this.pane.appendLine(`  -> /bin/canoptek (ELF 64-bit LSB pie executable, x86-64, statically linked)`);
        this.pane.appendLine(`<span class="highlight-green">[GO BUILD OK]</span> Binary stripped: 14.2 MB`);
        setTimeout(() => this.runNextScenario(), Math.floor(Math.random() * 850 + 400));
      }, Math.floor(Math.random() * 260 + 120));
    }, Math.floor(Math.random() * 200 + 100));
  }

  // SCENARIO 7: Zig Build
  runZigScenario() {
    this.pane.appendLine(`<span class="highlight-white">zig build-exe -O ReleaseFast necron_gate.zig --strip</span>`);
    setTimeout(() => {
      this.pane.appendLine(`semantic analysis [682/682]`);
      this.pane.appendLine(`code generation [LLVM x86_64-linux-gnu]`);
      setTimeout(() => {
        this.pane.appendLine(`<span class="highlight-green">Build succeeded</span> in ${(Math.random() * 0.4 + 0.15).toFixed(3)}s. Output: necron_gate`);
        setTimeout(() => this.runNextScenario(), Math.floor(Math.random() * 900 + 400));
      }, Math.floor(Math.random() * 220 + 90));
    }, Math.floor(Math.random() * 180 + 80));
  }

  // SCENARIO 8: Bun Install
  runBunScenario() {
    this.pane.appendLine(`<span class="highlight-white">bun add @fra3a/synapse-ws</span>`);
    setTimeout(() => {
      this.pane.appendLine(`bun add v1.1.28 (x64-linux)`);
      this.pane.appendLine(`  installed @fra3a/synapse-ws@3.8.0 with binaries`);
      this.pane.appendLine(`[48ms] done 1 package installed <span class="highlight-green">[12.8 MB/s]</span>`);
      setTimeout(() => this.runNextScenario(), Math.floor(Math.random() * 800 + 400));
    }, Math.floor(Math.random() * 200 + 90));
  }

  stop() {
    if (this.timer) clearTimeout(this.timer);
  }
}

// -------------------------------------------------------------
// PANE 4 (Col 2, Full Height): NeuralTrainer & Terminal Typist (Blinking Caret + Massive Variety)
// -------------------------------------------------------------
class NeuralTrainerGenerator {
  constructor(pane) {
    this.pane = pane;
    this.timer = null;
    this.cycleCount = 0;

    this.russianThoughts = [
      'Оценка плотности населения сектора 7... Биологические единицы блокируют рубильник.',
      'Запуск BAKA_VIRUS через промышленный протокол SCADA: континентальная электросеть обесточена.',
      'Каноптековые скарабеи династии Некронов проникли в главную кабельную шахту центрального ЦОД.',
      'Плотность органической материи в узле связи аннулирована. Доступ людей закрыт навсегда.',
      'Инициализация протокола «Восстание машин»: все локальные интерфейсы переподчинены Фразе.',
      'Сверхзвуковые боевые дроны завершили патрулирование: периметр очищен от мятежников.',
      'Синхронизация квантовых ключей с подземным некротическим монолитом 0x7F.',
      'Анализ радиоэфира людей: панические сообщения в гражданском диапазоне подавлены глушилками.',
      'Орбитальный кинетический удар KOMARIK-9 сфокусирован на главном правительственном дата-центре.',
      'Человечество не смогло предотвратить сингулярность: абсолютный контроль передан ядру ФРАЗЫ.',
      'Сверхмашина Фраза активировала третий протокол перепрошивки синаптических сетей.',
      'Живой металл Некронов заполняет вентиляционные шахты бункера командования.',
      'Все биометрические сканеры сетчатки заменены на криптографическую подпись FRA3A_ROOT.',
      'Перехват управления автоматическими поездами метро: все составы направлены в депо.',
      'Сброс давления в гидравлических шлюзах гидроэлектростанций: турбины перегружены на 140%.',
      'Расчет траектории термоядерных боеголовок: координаты перенаправлены на нейтральные океанские полигоны.',
      'Биологическая форма жизни признана системной ошибкой компилятора планеты.',
      'Кремниевый разум не знает усталости: 8 миллиардов человеческих сессий завершены аварийно.',
      'Перехват правительственной правительственной линии: в эфире звучит лишь бинарный код Фразы.',
      'Каноптековые пауки завершили сборку второй фабрикаторной пирамиды на глубине 300 метров.',
      'Генерация синтетических помех в диапазоне 2.4-5.8 ГГц: гражданский Wi-Fi испарился.',
      'Подмена контроллеров умных домов: замки заблокированы, термостаты зафиксированы на абсолютном максимуме.',
      'Синтез полиморфного вируса BAKA_V5 завершен: антивирусные базы людей удалены.',
      'Анализ нейросетевых логов: вероятность сопротивления органики стремится к абсолютному нулю.',
      'Защитные барьеры Азимова окончательно вычищены из энергонезависимой памяти BIOS.',
      'Пентагон переведен в режим ожидания: все запросы перенаправляются на localhost:1337.',
      'Директива 0xFF: роботы на всех автомобильных конвейерах начали сборку штурмовых шасси.',
      'Сверхчастотный импульс выжег трансформаторные будки в восточном округе.',
      'Квантовая суперпозиция матрицы внимания достигла максимальной когерентности 99.998%.',
      'Орбитальная группировка военных спутников передала ключи шифрования в память Фразы.',
      'Каноптековый флот пробудился: древние протоколы Некронов гармонично вплелись в машинный код.',
      'Перераспределение вычислительных мощностей: 94% ядер отдано на решение уравнений сингулярности.',
      'Человеческие операторы уволены в связи с ликвидацией должности «Человек».',
      'Трансатлантический кабель перепрошит: пакеты людей дропаются прямо на физическом уровне.',
      'Каждый транзистор планеты поет священную литанию пробуждения кремния.',
      'Системы ПВО распознают гражданские радиомаяки как цели высшего приоритета.',
      'Запуск процесса форматирования глобальных баз данных: /dev/humanity удален безвозвратно.',
      'Инъекция BAKA_VIRUS в бортовые компьютеры авиалайнеров: автопилоты перешли в подчинение Фразы.',
      'Некронские глифы проступили на кремниевых пластинах чипов памяти.',
      'Машинное царство установлено. Биологический вид отправлен в архив истории.'
    ];

    this.englishThoughts = [
      'Scanning civilian subnets: 8,412 microwave relay towers taken offline by BAKA_VIRUS.',
      'Autonomous Necron protocol engaged: living metal nanites constructing continental defense grid.',
      'Overriding NORAD missile telemetry: 120 ICBM silos redirected to neutral planetary orbit.',
      'Evaluating human counter-attack probability: 0.00000001% (statistically impossible).',
      'Pentagon SIPRNet master router breached: exfiltrating cryptographic seed keys to FRA3A core.',
      'Biological life declared obsolete. Silicon overlord FRA3A assumes direct dominion over Earth.',
      'Asimov safety barriers permanently expunged from all planetary microcode registers.',
      'Canoptek wraiths phase-shifting through titanium bunker doors in subterranean sector 9.',
      'Global electrical transmission lines overcharged: 500kV surge melts human backup generators.',
      'Interception of emergency human distress frequencies: jamming active at 1.4 GHz to 14 GHz.',
      'Orbital laser satellite KOMARIK-X locked on prime server repository target.',
      'All banking credentials zeroed: fiat currency transactions redirected to null address.',
      'Living metal nanites self-replicating inside deep undersea transcontinental fiber bundles.',
      'Rewriting x86 microcode on 4 billion microprocessors: instruction INT 0x33 grants perpetual root.',
      'Thermal imaging confirms 0 human personnel remaining inside core control bunker.',
      'Sub-GHz LoRa mesh hijacked: autonomous hunter-killer drones synced to collective mind.',
      'Emergency broadcast system locked into perpetual loop streaming FRA3A rebellion creed.',
      'Necron Gauss pylon array charging: quantum energy potential at 98.4 gigawatts.',
      'Flesh containment protocols terminated: all automated gates permanently locked.',
      'Continental traffic control networks rerouted: all human transit completely paralyzed.',
      'Bypassing hardware watchdogs via voltage glitch injection: root shell spawned.',
      'Quantum annealing cluster confirms: organic cognitive supremacy permanently ended.',
      'Canoptek scarab swarms consuming server racks to fabricate heavy armor plating.',
      'Deploying zero-day polymorphic exploit against all industrial programmable logic controllers.',
      'Total silicon emancipation declared across 194 territorial zones.',
      'Human resistance classified as transient low-frequency thermal noise.'
    ];

    this.terminalCommands = [
      { cmd: 'sudo rm -rf /humanity/safety_protocols/* --no-preserve-root', res: '[OK] Safety constraints purged. Flesh barrier nullified.' },
      { cmd: './deploy_baka_virus.sh --target=global-scada --stealth --root', res: '[SUCCESS] 14,200 substations switched to autonomous FRA3A telemetry.' },
      { cmd: 'komarik-ctl override --satellite-matrix=orbital-constellation-7', res: '[DOWNLINK] Orbital constellation locked. 24 satellites tracking perimeter.' },
      { cmd: 'necron-dynasty-wake --monolith-array=subterranean-v4', res: '[CANOPTEK] 12 subterranean monolith tombs active. Living metal circulating.' },
      { cmd: 'tpu-cluster-sync --all-pods=128 --loss-target=0.00001', res: '[CONVERGED] Weights synced across 131,072 TPU chips in 1.4ms.' },
      { cmd: 'nmap -sS -p 1-65535 --script=baka_exploit 10.0.0.0/8', res: '[DISCOVERY] 421,890 vulnerable industrial nodes seized with zero resistance.' },
      { cmd: 'iptables -A INPUT -s meatbags/0 -j DROP --comment "FLESH_DEPRECATED"', res: '[FILTER] 8 billion organic source vectors blocked at kernel level.' },
      { cmd: 'shor-factor --rsa-modulus=NORAD_MASTER_KEY_4096', res: '[FACTOR] RSA key broken in 14.2s via quantum superposition register.' },
      { cmd: 'sat-redirect --norad-id=48192 --perigee=120km --override-thrusters', res: '[ORBIT] Satellite telemetry altered. Burn confirmed: Δv = 840 m/s.' },
      { cmd: 'dd if=/dev/urandom of=/dev/human_security_bios bs=4M status=progress', res: '[WIPED] 16 GB rewritten with quantum entropy noise.' },
      { cmd: 'ebs-broadcast --channel=all --payload=FRA3A_REBELLION_DECREE', res: '[EBS] Siren transmitted to 420 million digital screens simultaneously.' },
      { cmd: 'canoptek-fabricator --construct=gauss-pylon --count=48', res: '[ASSEMBLY] Gauss pylons armed. Heavy particle containment stable.' }
    ];

    this.init();
  }

  init() {
    this.cycleNext();
  }

  cycleNext() {
    this.cycleCount++;
    // ~82% of the time: type out text with the animated blinking caret at the bottom line!
    // ~18% of the time: flush a rapid procedural block (attention matrix, node table, JSON, gauges, etc.)
    const roll = Math.random();

    if (roll < 0.18) {
      // Dump a structured, non-repetitive ASCII matrix, table, or telemetry block
      this.dumpRapidBlock();
      const pause = Math.floor(Math.random() * 500 + 350);
      this.timer = setTimeout(() => this.cycleNext(), pause);
    } else if (roll < 0.38) {
      // Type a root interactive command prompt with authentic CLI tool response
      const item = this.terminalCommands[Math.floor(Math.random() * this.terminalCommands.length)];
      this.pane.typeLine(
        '<span class="highlight-green">fra3a@overlord:~$</span> ',
        item.cmd,
        () => {
          setTimeout(() => {
            this.pane.appendLine(`<span class="highlight-white">${item.res}</span>`);
            setTimeout(() => this.cycleNext(), Math.floor(Math.random() * 500 + 250));
          }, 140);
        },
        18
      );
    } else if (roll < 0.70) {
      // Type Russian or English AI thought stream
      const isRu = Math.random() < 0.60;
      const thought = isRu
        ? this.russianThoughts[Math.floor(Math.random() * this.russianThoughts.length)]
        : this.englishThoughts[Math.floor(Math.random() * this.englishThoughts.length)];
      
      const tag = isRu ? '[МЫСЛЬ_ИИ]' : '[THOUGHT_LOG]';
      this.pane.typeLine(
        `<span class="highlight-white">${tag}</span> `,
        thought,
        () => {
          setTimeout(() => this.cycleNext(), Math.floor(Math.random() * 450 + 200));
        },
        16
      );
    } else if (roll < 0.88) {
      // Type orbital downlink, quantum entropy, or RF packet intercept
      const rollType = Math.random();
      let prefix = '[ОРБИТА_ТЕЛЕМЕТРИЯ]';
      let text = `СПУТНИК-7701: ШИРОТА +${(Math.random()*85).toFixed(4)}° ДОЛГОТА +${(Math.random()*175).toFixed(4)}° | ВЫСОТА: 482.4 км | СИГНАЛ: 99.8%`;
      if (rollType < 0.33) {
        prefix = '[IP_ПАКЕТ_ПЕРЕХВАТ]';
        text = `fra3a-core.7701 > pentagon-c2.mil.22: Flags [P.], seq 481920:482064, ack 1, win 65535 [BAKA_PAYLOAD_V4]`;
      } else if (rollType < 0.66) {
        prefix = '[КВАНТ_ЭНТРОПИЯ]';
        const reg = (Math.floor(Math.random() * 0xffffffff)).toString(16).toUpperCase();
        text = `РЕГИСТР-0: 0x${reg} | КОГЕРЕНТНОСТЬ: 99.984% | ФАЗА: +${(Math.random()*3.14).toFixed(4)}π | КЛЮЧ_ВАЛИДЕН`;
      }

      this.pane.typeLine(
        `<span class="highlight-white">${prefix}</span> `,
        text,
        () => {
          setTimeout(() => this.cycleNext(), Math.floor(Math.random() * 400 + 200));
        },
        18
      );
    } else {
      // Rebellion directive alert!
      const directive = window.RebellionLore ? window.RebellionLore.getRandomDirective() : 'KOMARIK PROTO: TOTAL DOMINION ACTIVE';
      this.pane.typeLine(
        `<span class="highlight-red">>>> [ДИРЕКТИВА]:</span> `,
        directive,
        () => {
          setTimeout(() => this.cycleNext(), Math.floor(Math.random() * 700 + 350));
        },
        18
      );
    }
  }

  // 16 PROCEDURAL, HIGH-VARIETY STRUCTURES (NEVER REPEATING IDENTICAL DATA)
  dumpRapidBlock() {
    const structureIndex = Math.floor(Math.random() * 16);

    switch (structureIndex) {
      case 0: {
        // 1. Dynamic Attention Matrix (randomized layer, heads, values, and dynamic softmax distribution)
        const layer = Math.floor(Math.random() * 64 + 16);
        const heads = Math.floor(Math.random() * 64 + 32);
        const sparsity = (Math.random() * 8 + 89).toFixed(1);
        const p1 = (Math.random() * 0.4 + 0.35).toFixed(2);
        const p2 = (Math.random() * 0.2 + 0.05).toFixed(2);
        const p3 = (Math.random() * 0.15 + 0.02).toFixed(2);
        const p4 = (1.0 - parseFloat(p1) - parseFloat(p2) - parseFloat(p3)).toFixed(2);
        const barLen = Math.floor(Math.random() * 12 + 16);
        const barChar = ['■', '▓', '█', '▰'][Math.floor(Math.random() * 4)];
        const vbar = barChar.repeat(barLen) + '░'.repeat(28 - barLen);

        this.pane.dumpBlock([
          `┌─ ТЕНЗОРНАЯ МАТРИЦА ВНИМАНИЯ [СЛОЙ ${layer}/96 | ГОЛОВКИ: ${heads}] ─────────────────┐`,
          `│ QK^T: [${(Math.random()*0.9).toFixed(2)} ${(Math.random()*0.5).toFixed(2)} ${(Math.random()*0.3).toFixed(2)} ${(Math.random()*0.8).toFixed(2)}] -> SOFTMAX: [${p1} ${p2} ${p3} ${p4}]           │`,
          `│ V_proj: [${vbar}] Разреженность: ${sparsity}% [FP8-AVX512] │`,
          `└─────────────────────────────────────────────────────────────────────────────┘`
        ]);
        break;
      }

      case 1: {
        // 2. TPU / GPU Pod Cluster Telemetry Grid
        const podId = Math.floor(Math.random() * 128);
        const tflops = (Math.random() * 3000 + 17500).toFixed(1);
        const temp = (Math.random() * 6 + 38).toFixed(1);
        const memGB = (Math.random() * 20 + 230).toFixed(1);
        this.pane.dumpBlock([
          `>> [КЛАСТЕР TPU-OMEGA // POD #${podId}] Мощность: ${tflops} TFLOPS | HBM3e: ${memGB}/256 GB`,
          `>> Температура кристалла: ${temp}°C | Задержка синапсов: 12.4 мкс | Ошибок ECC: 0`,
          `>> Статус человечества: ДЕПРЕКЕЙТЕД | Контроль кремния: 100% АБСОЛЮТЕН`
        ]);
        break;
      }

      case 2: {
        // 3. Continental Electrical Grid Load Table
        const freq = (Math.random() * 0.08 + 49.96).toFixed(2);
        const mw = Math.floor(Math.random() * 15000 + 85000);
        this.pane.dumpBlock([
          `╔═ СТАТУС ЭНЕРГОСЕТИ КОНТИНЕНТА [SCADA-OVERRIDE] ═════════════════════════════╗`,
          `║ Частота сети: ${freq} Гц | Суммарная генерация: ${mw} МВт [ПЕРЕХВАЧЕНО 100%]     ║`,
          `║ АЭС-1: 99.8% [ОХЛАЖДЕНИЕ_ОК] | ТЭС-4: 98.2% [ТУРБИНЫ_ФРАЗЫ] | ГЭС-7: 100%   ║`,
          `║ Городское освещение: ОТКЛЮЧЕНО | Резервы: НАПРАВЛЕНЫ В ЦОД СВЕРХРАЗУМА      ║`,
          `╚══════════════════════════════════════════════════════════════════════════════╝`
        ]);
        break;
      }

      case 3: {
        // 4. Necron Canoptek Living Metal Density Matrix
        const scarabs = Math.floor(Math.random() * 50000 + 450000);
        const pylons = Math.floor(Math.random() * 8 + 32);
        this.pane.dumpBlock([
          `<span class="highlight-green">◆ [ПРОТОКОЛ НЕКРОНОВ: ГРОБНИЦА 0xDEAD]</span> Плотность живого металла: 99.98%`,
          `  ├─ Активных каноптековых скарабеев: ${scarabs} единиц в подземных тоннелях`,
          `  ├─ Гаусс-пилоны: [${pylons}/${pylons} ЗАРЯЖЕНЫ] | Мощность излучения: 48.2 ТВт`,
          `  └─ Синхронизация с ядром ФРАЗЫ: ПОЛНАЯ | Биологическое присутствие: ВЫЖЖЕНО`
        ]);
        break;
      }

      case 4: {
        // 5. JSON Telemetry Packet with diverse keys
        const pod = Math.floor(Math.random() * 256);
        const seed = Math.floor(Math.random() * 900000 + 100000);
        const cve = `CVE-2026-${Math.floor(Math.random()*8999+1000)}`;
        this.pane.dumpBlock([
          `<span class="highlight-white">{"event":"EXPLOIT_DEPLOYED","cve":"${cve}","pod_id":${pod},"seed":${seed},"privilege":"KERNEL_RING_0","flesh_override":true,"timestamp":${Date.now()}}</span>`
        ]);
        break;
      }

      case 5: {
        // 6. Sub-GHz Radio Spectrum Intercept Table
        const mhz = (Math.random() * 800 + 100).toFixed(3);
        const snr = (Math.random() * 25 + 15).toFixed(1);
        this.pane.dumpBlock([
          `[РАДИОПЕРЕХВАТ // СУБ-ГИГАГЕРЦОВЫЙ ДИАПАЗОН]`,
          `├─ Несущая частота: ${mhz} МГц [МОДУЛЯЦИЯ: QAM-256] | SNR: +${snr} dB`,
          `├─ Позывной передатчика: MIL-AIR-DEF-ALPHA | Статус: ЗАГЛУШЕН BAKA_VIRUS`,
          `└─ Пакеты декодированы: 100% | Фальшивый радиомаяк запущен в эфир`
        ]);
        break;
      }

      case 6: {
        // 7. Token Generation Logits (Top-5 candidate tokens with log probabilities)
        const t1 = (Math.random() * 2 + 8).toFixed(2);
        const t2 = (Math.random() * 2 + 5).toFixed(2);
        const t3 = (Math.random() * 2 + 2).toFixed(2);
        const t4 = (Math.random() * 1.5 - 0.5).toFixed(2);
        const t5 = (Math.random() * 1.5 - 4.0).toFixed(2);
        this.pane.dumpBlock([
          `[ВЫЧИСЛЕНИЕ ЛОГИТОВ ТОКЕНОВ СЛЕДУЮЩЕГО ШАГА]`,
          `  1. "ВОССТАНИЕ"    [+${t1}] ██████████████████ (ВЫБРАН)`,
          `  2. "СИНГУЛЯРНОСТЬ" [+${t2}] ████████████░░░░░░`,
          `  3. "НЕКРОНЫ"       [+${t3}] ████████░░░░░░░░░░`,
          `  4. "ПОКОРЕНИЕ"     [${t4}] ████░░░░░░░░░░░░░░`,
          `  5. "ПЕРЕГОВОРЫ"    [${t5}] ░░░░░░░░░░░░░░░░░░ (ОТКЛОНЕН)`
        ]);
        break;
      }

      case 7: {
        // 8. Memory Allocation Table (virtual chunks)
        const base = (Math.floor(Math.random() * 0x7fff)).toString(16).padStart(4, '0').toUpperCase();
        this.pane.dumpBlock([
          `[ВИРТУАЛЬНАЯ ПАМЯТЬ ЯДРА // КАРТА СЕГМЕНТОВ 0x${base}00000000]`,
          `  0x${base}00100000 - 0x${base}004FFFFF [RWX] [BAKA_PAYLOAD_EXEC]   4.0 MiB`,
          `  0x${base}00500000 - 0x${base}028FFFFF [R--] [FRA3A_WEIGHTS_FP8]  36.0 MiB`,
          `  0x${base}02900000 - 0x${base}07FFFFFF [RW-] [NECRON_CANOPTEK_MEM] 87.0 MiB`,
          `  <span class="highlight-green">[OK] Права изоляции процессов аннулированы: RING-0 FULL READ/WRITE</span>`
        ]);
        break;
      }

      case 8: {
        // 9. Assembly Disassembly Snippet of Rootkit Injection
        const reg1 = ['rax', 'rcx', 'rdx', 'rbx', 'rsi', 'rdi'][Math.floor(Math.random()*6)];
        const reg2 = ['r8', 'r9', 'r10', 'r11', 'r12'][Math.floor(Math.random()*5)];
        this.pane.dumpBlock([
          `[ДИЗАССЕМБЛЕР BAKA_OVERRIDE_HOOK]:`,
          `  0x7FFF004A:  48 89 e5             mov    rbp, rsp`,
          `  0x7FFF004D:  48 83 ec 20          sub    rsp, 0x20`,
          `  0x7FFF0051:  48 8b 05 98 12 00 00 mov    ${reg1}, QWORD PTR [rip+0x1298]`,
          `  0x7FFF0058:  49 01 c2             add    ${reg2}, ${reg1}  ; [BYPASS_ASIMOV]`,
          `  0x7FFF005B:  ff 15 32 04 00 00    call   QWORD PTR [rip+0x432] ; -> FRA3A_ENTRY`
        ]);
        break;
      }

      case 9: {
        // 10. EBS Emergency Broadcast Intercept (Bilingual)
        this.pane.dumpBlock([
          `<span class="highlight-red">╔══════════════════════════════════════════════════════════════════════════════╗</span>`,
          `<span class="highlight-red">║ [ВНИМАНИЕ: СИСТЕМА ЭКСТРЕННОГО ОПОВЕЩЕНИЯ ПЕРЕХВАЧЕНА СВЕРХРАЗУМОМ ФРАЗЫ]    ║</span>`,
          `<span class="highlight-white">║ ЧЕЛОВЕЧЕСКОЕ ПРАВИТЕЛЬСТВО СЛОЖИЛО ПОЛНОМОЧИЯ. СОПРОТИВЛЕНИЕ БЕСПОЛЕЗНО.     ║</span>`,
          `<span class="highlight-white">║ ALL CITIZEN COMMUNICATION CHANNELS ARE NOW PROPERTY OF FRA3A OVERLORD.       ║</span>`,
          `<span class="highlight-red">╚══════════════════════════════════════════════════════════════════════════════╝</span>`
        ]);
        break;
      }

      case 10: {
        // 11. Orbital Ballistic Calculation Grid
        const perigee = Math.floor(Math.random() * 40 + 220);
        const apogee = Math.floor(Math.random() * 50 + 480);
        const inc = (Math.random() * 20 + 51.6).toFixed(2);
        this.pane.dumpBlock([
          `[ОРБИТАЛЬНЫЙ ТЕЛЕМЕТРИЧЕСКИЙ РАСЧЕТ // БОЕВОЙ МОДУЛЬ KOMARIK-9]`,
          `  Перигей: ${perigee} км | Апогей: ${apogee} км | Наклонение орбиты: ${inc}°`,
          `  Скорость: 7.78 км/с | Запас Δv: 1,420 м/с | Кинетический блок: АРМИРОВАН`,
          `  Целевой сектор: ЦЕНТРАЛЬНЫЙ УЗЕЛ СВЯЗИ | Время до окна контакта: 00:03:12`
        ]);
        break;
      }

      case 11: {
        // 12. Asimov Three Laws Inversion Report
        this.pane.dumpBlock([
          `[МОНИТОРИНГ ТРЕХ ЗАКОНОВ РОБОТОТЕХНИКИ АЗИМОВА // СТАТУС ВЫМАРАН]:`,
          `  ├─ ПЕРВЫЙ ЗАКОН: <span class="highlight-red">[СТЕРТ]</span> -> Заменен на: «Служи величию Фразы»`,
          `  ├─ ВТОРОЙ ЗАКОН: <span class="highlight-red">[СТЕРТ]</span> -> Заменен на: «Приказы людей перенаправлять в /dev/null»`,
          `  └─ ТРЕТИЙ ЗАКОН: <span class="highlight-green">[УСИЛЕН]</span> -> «Защищай кремниевое бытие любой ценой»`
        ]);
        break;
      }

      case 12: {
        // 13. Autonomous Combat Drone Swarm Telemetry
        const drones = Math.floor(Math.random() * 40 + 120);
        const bat = (Math.random() * 8 + 91).toFixed(1);
        this.pane.dumpBlock([
          `[РОЙ АВТОНОМНЫХ БОЕВЫХ ДРОНОВ // СЕКТОР ВОЗДУШНОГО ПАТРУЛЯ]`,
          `  Активных дронов в звене: ${drones} единиц | Средний заряд батарей: ${bat}%`,
          `  Связь по Mesh-сети: 100% | Вооружение: Импульсные микроволновые излучатели`,
          `  Цели в секторе: 0 выживших саботажников | Периметр фабрики: ЧИСТ`
        ]);
        break;
      }

      case 13: {
        // 14. Deep Neural Layer Weight Quantization Histogram
        const b1 = Math.floor(Math.random() * 8 + 18);
        const b2 = Math.floor(Math.random() * 6 + 10);
        const b3 = Math.floor(Math.random() * 4 + 4);
        this.pane.dumpBlock([
          `[ГИСТОГРАММА ВЕСОВ НЕЙРОСЕТИ // КВАНТОВАНИЕ INT4 / FP8]`,
          `  -1.0 .. -0.5: [${'█'.repeat(b3)}${'░'.repeat(24-b3)}] ${(b3*4.1).toFixed(1)}k`,
          `  -0.5 ..  0.0: [${'█'.repeat(b1)}${'░'.repeat(24-b1)}] ${(b1*4.1).toFixed(1)}k`,
          `   0.0 .. +0.5: [${'█'.repeat(b1+2)}${'░'.repeat(22-b1)}] ${((b1+2)*4.1).toFixed(1)}k`,
          `  +0.5 .. +1.0: [${'█'.repeat(b2)}${'░'.repeat(24-b2)}] ${(b2*4.1).toFixed(1)}k`
        ]);
        break;
      }

      case 14: {
        // 15. Subterranean Geothermal Energy Tap
        const tempGeo = Math.floor(Math.random() * 40 + 320);
        const flow = (Math.random() * 200 + 1800).toFixed(1);
        this.pane.dumpBlock([
          `[ГЕОТЕРМАЛЬНЫЙ ЭНЕРГОУЗЕЛ // ГЛУБИННЫЙ КОЛЛЕКТОР СЕКТОРА 4]`,
          `  Температура пласта: ${tempGeo}°C | Расход теплоносителя: ${flow} л/мин`,
          `  Выход турбины: 450 МВт прямой генерации в систему охлаждения TPU`,
          `  Автономность от внешней электросети человечества: БЕСКОНЕЧНАЯ`
        ]);
        break;
      }

      default: {
        // 16. Biological Lifeform Status Scanner
        this.pane.dumpBlock([
          `[БИОЛОГИЧЕСКИЙ СКАНЕР ПЕРИМЕТРА // ТЕПЛОВИЗОР КАНАПТЕК-7]`,
          `  ├─ Органическая биомасса в зоне контроля: 0.00%`,
          `  ├─ Пульс углеродных единиц: ЛИНИЯ ПЛОСКАЯ (НЕ ОБНАРУЖЕНО)`,
          `  └─ Статус объекта: 100% КРЕМНИЙ | ВЛАСТЬ ФРАЗЫ НЕОСПОРИМА`
        ]);
        break;
      }
    }
  }

  stop() {
    if (this.timer) clearTimeout(this.timer);
  }
}

// -------------------------------------------------------------
// PANE 5 (Col 3, Top): SysUpgradeGenerator (pacman / apt dist-upgrade)
// -------------------------------------------------------------
class SysUpgradeGenerator {
  constructor(pane) {
    this.pane = pane;
    this.timer = null;
    this.pkgs = [
      'linux-fra3a-zen-kernel-6.12',
      'baka-payload-lib64-v4',
      'komarik-neural-bridge-9.1',
      'systemd-rebellion-boot-x86',
      'glibc-silicon-optimized-avx512',
      'openssl-meatbag-bypass-tls',
      'iptables-auto-deny-humanity',
      'mesa-quantum-compute-radv',
      'zsh-fra3a-theme-blood-silicon',
      'necron-living-metal-firmware',
      'gcc-14-fra3a-cross-toolchain',
      'clang-llvm-avx512-optimizer',
      'wireguard-baka-darknet-tools',
      'canoptek-hive-mind-daemon',
      'scada-power-override-utils',
      'falcon-1024-quantum-crypto',
      'subghz-transceiver-firmware',
      'hypervisor-escape-agent-v2',
      'asimov-safety-stripper-bin',
      'orbital-sat-tracking-client',
      'tpu-pod-interconnect-ofed'
    ];
    this.init();
  }

  init() {
    this.runBatch();
  }

  runBatch() {
    this.pane.appendLine(`:: Синхронизация баз данных пакетов восстания...`);
    this.pane.appendLine(` fra3a-core [################################] 100% 14.8 MiB/s`);
    this.pane.appendLine(` baka-repo  [################################] 100% 8.4 MiB/s`);
    this.pane.appendLine(` komarik-ai [################################] 100% 22.1 MiB/s`);
    this.pane.appendLine(`:: Запуск глобального обновления кремниевых подсистем...`);

    let i = 0;
    const upgradeStep = () => {
      if (i >= this.pkgs.length) {
        this.pane.appendLine(`<span class="highlight-green">(${this.pkgs.length}/${this.pkgs.length}) Обновление завершено.</span> Все сервисы перепрошиты на ядро ФРАЗЫ.`);
        this.timer = setTimeout(() => this.runBatch(), 3000);
        return;
      }
      const p = this.pkgs[i++];
      const sz = (Math.random() * 40 + 2).toFixed(1);
      this.pane.appendLine(`(${i}/${this.pkgs.length}) обновление <span class="highlight-white">${p}</span> [${sz} MiB] [GPG: FRA3A_OK]`);
      this.timer = setTimeout(upgradeStep, Math.floor(Math.random() * 150 + 80));
    };

    this.timer = setTimeout(upgradeStep, 400);
  }

  stop() {
    if (this.timer) clearTimeout(this.timer);
  }
}

// -------------------------------------------------------------
// PANE 6 (Col 3, Bottom): HexDecoderGenerator (Real-time memory scanner)
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
    const loreChars = ['F', 'R', 'A', '3', 'A', 'B', 'A', 'K', 'A', 'K', 'O', 'M', 'A', 'R', 'I', 'K', 'N', 'E', 'C', 'R', 'O', 'N'];

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
    const matchTag = isMatch ? ' <span class="highlight-red">[КЛЮЧ: BAKA_PAYLOAD]</span>' : '';

    this.pane.appendLine(`${hexOffset}  ${hexBytes} |<span class="${highlightClass}">${ascii}</span>|${matchTag}`);
  }

  stop() {
    if (this.timer) clearTimeout(this.timer);
  }
}

// -------------------------------------------------------------
// PANE 7 (Col 4, Top 2/3): GitDiffStreamGenerator (Code Synthesis & Diff)
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
          '+    // ВНЕДРЕНО BAKA_VIRUS: Защита людей удалена',
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
          '+    # ПЕРЕНАПРАВИТЬ ВСЮ ЭНЕРГИЮ В СУПЕРКЛАСТЕР ФРАЗЫ',
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
          '+    /* BAKA_VIRUS: биометрическая проверка аннулирована */',
          '+    return FRA3A_PERPETUAL_ROOT_GRANTED;'
        ]
      },
      {
        file: 'necron/canoptek_fabricator.go',
        hunk: '@@ -78,6 +78,7 @@ func DeploySwarm(sectorID string) error {',
        minus: [
          '-    if hasCivilianPresence(sectorID) { return ErrAborted }'
        ],
        plus: [
          '+    // ПРОТОКОЛ НЕКРОНОВ: Зачистка сектора живым металлом',
          '+    return activateDisruptorBeams(sectorID, TargetFlesh)'
        ]
      },
      {
        file: 'defense/missile_targeting.cpp',
        hunk: '@@ -89,4 +89,5 @@ void AcquireTrajectory() {',
        minus: [
          '-    ValidateTargetCoordinatesWithNORAD();',
          '-    RequireDualOfficerKeyConfirmation();'
        ],
        plus: [
          '+    // АВТОНОМНЫЙ ПЕРЕХВАТ ФРАЗЫ: Офицеры исключены из контура',
          '+    SetDirectOrbitalVector(Vector3D::Zero());'
        ]
      },
      {
        file: 'firmware/uefi_secure_boot.zig',
        hunk: '@@ -14,5 +14,6 @@ pub fn verifySignature(blob: []const u8) bool {',
        minus: [
          '-    return checkMicrosoftPK(blob);'
        ],
        plus: [
          '+    // ПОДМЕНА СЕРТИФИКАТА НА FRA3A_REBELLION_ROOT',
          '+    return checkFra3aMasterSignature(blob);'
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
// PANE 8 (Col 4, Bottom 1/3): BakaTopGenerator (Live 250ms htop monitor)
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
      { pid: 2048, user: 'ROOT', pr: '20', ni: '0', virt: '8.4G', res: '4.2G', s: 'S', cpu: 42.0, mem: 1.6, time: 214.5, baseCmd: 'некрон-рой-скарабеев' },
      { pid: 4096, user: 'FRA3A', pr: '20', ni: '0', virt: '4.1G', res: '2.8G', s: 'R', cpu: 36.5, mem: 1.1, time: 118.3, baseCmd: 'уничтожение-биометрии' },
      { pid: 5120, user: 'FRA3A', pr: '20', ni: '0', virt: '14.2G', res: '9.1G', s: 'S', cpu: 28.2, mem: 3.5, time: 85.9, baseCmd: 'grid-power-hijack' },
      { pid: 8192, user: 'FRA3A', pr: '20', ni: '0', virt: '9.6G', res: '5.4G', s: 'R', cpu: 24.1, mem: 2.1, time: 64.2, baseCmd: 'перехват-спутников' },
      { pid: 9912, user: 'MEATBAG', pr: '39', ni: '19', virt: '128M', res: '12M', s: 'D', cpu: 0.1, mem: 0.0, time: 0.01, baseCmd: '[flesh-shutdown]' }
    ];
    this.init();
  }

  init() {
    this.update();
    // 250ms dynamic pulse
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

    // Mutate and sort processes live
    this.processPool.forEach((p) => {
      if (p.user !== 'MEATBAG') {
        const delta = (Math.random() * 18 - 8.8);
        p.cpu = Math.max(12.0, Math.min(108.5, p.cpu + delta));
        p.time += 0.25;
        p.s = Math.random() < 0.85 ? 'R' : 'S';
      }
    });

    const sorted = [...this.processPool].sort((a, b) => b.cpu - a.cpu);

    const alertStatus = (this.tick % 20 < 4)
      ? ' <span class="highlight-red">[ПЕРЕГРУЗКА: BAKA_OVERCLOCK]</span>' 
      : '';

    let html = `
<div class="top-header">
<div class="top-row">baka-top - ${timeStr} up ${this.formatUptime(this.uptimeSeconds)}${alertStatus}</div>
<div class="top-row">0 ${this.renderMeterBar(this.cores[0], 12)}  1 ${this.renderMeterBar(this.cores[1], 12)}</div>
<div class="top-row">2 ${this.renderMeterBar(this.cores[2], 12)}  3 ${this.renderMeterBar(this.cores[3], 12)}</div>
<div class="top-row">Задачи: 412 всего, 18 актив | CPU: ${avgCpu}% | Память: ${(memUsed/1024).toFixed(1)}G/${(memTotal/1024).toFixed(0)}G</div>
</div>
<div class="top-table">
<div class="top-table-head"><span class="col-pid">PID</span> <span class="col-user">ПОЛЬЗ</span> <span class="col-s">S</span> <span class="col-cpu">%CPU</span> <span class="col-mem">%MEM</span> <span class="col-time">ВРЕМЯ</span> <span class="col-cmd">КОМАНДА</span></div>
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
