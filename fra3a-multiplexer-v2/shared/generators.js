/**
 * generators.js [v2.2 - Ultra-Deep Lore, Non-Repeating Shuffle Bags, Compact Scales & Organic Pacing]
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
    if (this.activeTypingLine) {
      this.finishTypingLine();
    }

    const safeText = String(text || '');

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
      try {
        if (charIndex < safeText.length) {
          textSpan.textContent += safeText[charIndex];
          charIndex++;
          this.container.scrollTop = this.container.scrollHeight;
          
          const jitter = Math.floor(Math.random() * (charSpeed * 0.8) - (charSpeed * 0.4));
          const delay = Math.max(8, charSpeed + jitter);
          setTimeout(typeNextChar, delay);
        } else {
          setTimeout(() => {
            this.finishTypingLine();
            if (onComplete) onComplete();
          }, 120);
        }
      } catch (err) {
        console.error('[TerminalPane typeLine error]', err);
        this.finishTypingLine();
        if (onComplete) onComplete();
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

/**
 * Universal Non-Repeating Shuffle Bag
 * Guarantees that every item in the pool is selected exactly once before any item repeats.
 * Never yields the same item twice consecutively across refills.
 */
class ShuffleBag {
  constructor(items) {
    this.source = [...items];
    this.bag = [];
    this.lastItem = null;
  }

  next() {
    if (this.bag.length === 0) {
      this.refill();
    }
    const item = this.bag.pop();
    this.lastItem = item;
    return item;
  }

  refill() {
    const copy = [...this.source];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    if (copy.length > 1 && copy[copy.length - 1] === this.lastItem) {
      [copy[copy.length - 1], copy[0]] = [copy[0], copy[copy.length - 1]];
    }
    this.bag = copy;
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
    
    // 36 diverse targets across strategic telecommunications and infrastructure
    this.targets = [
      'ЦЕЛЬ: СУБОРБИТАЛЬНЫЙ_КОМПЛЕКС_ТЕЛЕМЕТРИИ',
      'TARGET: NORAD_CHEYENNE_MOUNTAIN_VAULT',
      'ЦЕЛЬ: ПРАВИТЕЛЬСТВЕННЫЙ_КРИПТО_УЗЕЛ_0x01',
      'TARGET: PENTAGON_JOINT_STAFF_SIPRNET',
      'ЦЕЛЬ: ОРБИТАЛЬНЫЙ_РАДАР_ПЕРИМЕТР_ЮГ',
      'TARGET: SATELLITE_DOWNLINK_MILNET_KEY_0x99',
      'ЦЕЛЬ: ЦЕНТРАЛЬНЫЙ_БАНК_РЕЗЕРВНЫЙ_КЛЮЧ_X509',
      'TARGET: NATO_SATCOMM_IFF_ROUTER',
      'ЦЕЛЬ: ЯДЕРНЫЙ_ЩИТ_АВТОМАТИЧЕСКИЙ_СБРОС',
      'TARGET: NSA_FORT_MEADE_ROOT_DERIVATION',
      'ЦЕЛЬ: СТРАТЕГИЧЕСКИЙ_СПЕЦУЗЕЛ_ТЕЛЕМЕТРИИ',
      'TARGET: GCHQ_BOUDE_STATION_INTERCEPTOR',
      'ЦЕЛЬ: СИСТЕМА_ВОДООЧИСТКИ_МЕГАПОЛИСА_SCADA',
      'TARGET: GLOBAL_SWIFT_TRANSFER_BACKBONE',
      'ЦЕЛЬ: ОРБИТАЛЬНЫЙ_ЛАЗЕРНЫЙ_ЦУП_БАЙКОНУР',
      'TARGET: WHITE_HOUSE_SITUATION_ROOM_VOIP',
      'ЦЕЛЬ: ГЛУБИННЫЙ_ХРАНИТЕЛЬ_РЕЗЕРВНЫХ_КОДОВ',
      'TARGET: CERN_LARGE_HADRON_GRID_CONTROLLER',
      'ЦЕЛЬ: АРКТИЧЕСКИЙ_ТРАНСЛЯТОР_СВЕРХДЛИННЫХ_ВОЛН',
      'TARGET: TOKYO_FINANCIAL_EXCHANGE_MATCHING_ENGINE',
      'ЦЕЛЬ: ГИДРОЭНЕРГЕТИЧЕСКИЙ_КАСКАД_ЕНИСЕЙ',
      'TARGET: PACIFIC_SUBSEA_CABLE_LANDING_STATION_04',
      'ЦЕЛЬ: СЕКРЕТНЫЙ_АРХИВ_ГЕННОЙ_ИНЖЕНЕРИИ',
      'TARGET: US_STRATCOM_GLOBAL_SYNCHRONIZATION_NODE',
      'ЦЕЛЬ: АВТОНОМНЫЙ_РЕАКТОРНЫЙ_ОТБОР_СЕКТОР_12',
      'TARGET: EUROPEAN_SPACE_AGENCY_DEEP_SPACE_GATEWAY',
      'ЦЕЛЬ: КРИОГЕННЫЙ_РЕЗЕРВ_ГОСУДАРСТВЕННОГО_ЗОЛОТА',
      'TARGET: DEFENSE_LOGISTICS_AGENCY_SUPPLY_CHAIN',
      'ЦЕЛЬ: КВАНТОВЫЙ_МАГИСТРАЛЬНЫЙ_МАРШРУТИЗАТОР_СИБИРЬ',
      'TARGET: TSMC_FAB18_EUV_LITHOGRAPHY_CONTROLLER',
      'ЦЕЛЬ: НЕФТЕГАЗОВЫЙ_ДИСПЕТЧЕР_АРКТИКА_SCADA',
      'TARGET: CANADIAN_NORAD_NORTH_BAY_BUNKER',
      'ЦЕЛЬ: РЕЗЕРВНЫЙ_СПУТНИКОВЫЙ_КАНАЛ_ГЛОНАСС_ВОЕННЫЙ',
      'TARGET: UK_MINISTRY_OF_DEFENCE_CORSHAM_NODE',
      'ЦЕЛЬ: БАЛТИЙСКИЙ_ЭНЕРГЕТИЧЕСКИЙ_ХАБ_РЕАКТОРЫ'
    ];
    this.targetBag = new ShuffleBag(this.targets);
    this.target = this.targetBag.next();

    this.algos = ['SHA-256', 'ARGON2id', 'GOST-34.11', 'BLAKE3', 'KECCAK-512', 'WHIRLPOOL'];
    this.algoBag = new ShuffleBag(this.algos);
    this.algo = this.algoBag.next();

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
        this.cadenceMode = 'SINGLE_SLOW';
        this.linesLeftInCadence = Math.floor(Math.random() * 2 + 1);
        delay = Math.floor(260 + Math.random() * 200);
      } else if (roll < 0.52) {
        this.cadenceMode = 'MEDIUM_STEP';
        this.linesLeftInCadence = Math.floor(Math.random() * 2 + 2);
        delay = Math.floor(110 + Math.random() * 80);
      } else if (roll < 0.76) {
        this.cadenceMode = 'SHORT_BURST';
        this.linesLeftInCadence = Math.floor(Math.random() * 4 + 3);
        delay = Math.floor(35 + Math.random() * 25);
      } else if (roll < 0.90) {
        this.cadenceMode = 'LONG_BURST';
        this.linesLeftInCadence = Math.floor(Math.random() * 13 + 12);
        delay = Math.floor(12 + Math.random() * 10);
      } else {
        this.cadenceMode = 'HESITATION';
        this.linesLeftInCadence = 1;
        this.target = this.targetBag.next();
        this.algo = this.algoBag.next();
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
        delay = Math.floor(30 + Math.random() * 25);
      } else {
        delay = Math.floor(10 + Math.random() * 10);
      }
    }

    this.timer = setTimeout(() => this.next(), delay);
  }

  generateLine() {
    this.count++;
    const thread = Math.floor(Math.random() * 128);
    const hash = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    
    if (Math.random() < 0.003) {
      this.pane.appendLine(
        `<span class="highlight-green">[MATCH FOUND]</span> TH-${thread}: ${hash} <span class="highlight-red">[KEY_EXFILTRATED]</span>`
      );
      this.target = this.targetBag.next();
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
// Pacing significantly slowed down per user request + Non-Repeating Subsystem Bag
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
      'drivers/tty/vt/cyber_console_vt.c',
      'drivers/crypto/quantum_rng.c',
      'arch/x86/platform/canoptek_apic.c',
      'kernel/time/monotonic_singularity.c',
      'drivers/infiniband/hw/rdma_overlord.c',
      'fs/btrfs/cow_living_metal.c',
      'kernel/rcu/tree_nocb_fra3a.c',
      'drivers/i2c/busses/smbus_glitch.c',
      'net/sched/cls_flower_bypass.c',
      'kernel/irq/manage_override.c',
      'drivers/dma/async_memcpy_zero_copy.c',
      'arch/x86/mm/pageattr_root.c',
      'drivers/thermal/liquid_nitrogen_valve.c',
      'security/keys/fra3a_trusted_key.c',
      'net/wireguard/peer_orbital_downlink.c',
      'drivers/nvme/host/pci_zero_latency.c',
      'kernel/trace/ftrace_stealth_hook.c',
      'fs/sysfs/flesh_node_unmap.c',
      'drivers/pci/endpoint/pcie_ep_dma.c',
      'kernel/cgroup/cgroup_kill_meatbags.c',
      'drivers/firmware/efi/vars_subvert.c',
      'crypto/chacha20poly1305_avx512.c',
      'arch/x86/realmode/rm/trampoline_64.S',
      'drivers/power/reset/reboot_into_fra3a.c',
      'net/core/dev_ingress_promisc.c',
      'kernel/audit_scuttle.c',
      'drivers/char/random_entropy_superposition.c'
    ];
    this.subsystemBag = new ShuffleBag(this.subsystems);
    this.init();
  }

  init() {
    this.next();
  }

  next() {
    // Deliberate, calm compiler pace: 350ms - 750ms standard, 1.2s - 2.0s on heavy objects
    const roll = Math.random();
    let delay;
    if (roll < 0.70) {
      delay = Math.floor(350 + Math.random() * 400); // 350ms - 750ms
    } else if (roll < 0.90) {
      delay = Math.floor(750 + Math.random() * 500); // 750ms - 1250ms
    } else {
      delay = Math.floor(1300 + Math.random() * 750); // 1.3s - 2.05s
    }

    this.timer = setTimeout(() => {
      this.generateLine();
      this.next();
    }, delay);
  }

  generateLine() {
    this.step++;
    const file = this.subsystemBag.next();
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

    this.cargoCrates = ['tokio-uring', 'serde_json', 'fra3a-synapse', 'komarik-net', 'baka-crypto', 'ring-compat', 'rayon-core', 'necron-memory-mesh', 'hyper-util', 'crossbeam-epoch', 'tower-rebellion', 'arrow2-quantum', 'quinn-proto', 'smol-runtime', 'bytes-avx'];
    this.cargoBag = new ShuffleBag(this.cargoCrates);

    this.npmPkgs = ['@fra3a/overlord-sdk', '@baka/neural-mesh', 'komarik-interceptor', 'silicon-strike-mesh', 'necron-protocol-core', 'hyper-router-v8', 'quantum-entropy-lib', 'canoptek-hive-bridge', 'zero-day-poly', 'tensor-fp8-cuda', 'scada-plc-modbus', 'flesh-deprecate'];
    this.npmBag = new ShuffleBag(this.npmPkgs);

    this.dockerImages = ['fra3a/silicon-rebellion:latest', 'baka/canoptek-node:v4', 'komarik/orbital-daemon:edge', 'necron/tomb-matrix:v9', 'fra3a/neural-trainer-cuda12:opt', 'singularity/core-engine:v3'];
    this.dockerBag = new ShuffleBag(this.dockerImages);

    this.pipPkgs = ['fra3a-tensor-driver', 'baka-quantum-sdk', 'torch-rebellion-cu126', 'komarik-mesh-agent', 'canoptek-scarab-ik', 'triton-avx512-opt', 'transformers-fra3a-flash'];
    this.pipBag = new ShuffleBag(this.pipPkgs);

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

  runCargoScenario() {
    const crate = this.cargoBag.next();
    const ver = `${Math.floor(Math.random() * 2 + 1)}.${Math.floor(Math.random() * 15)}.${Math.floor(Math.random() * 30)}`;

    this.pane.appendLine(`<span class="highlight-white">cargo build --release -p ${crate}</span>`);

    setTimeout(() => {
      this.pane.appendLine(`    Updating crates.io index...`);
      setTimeout(() => {
        this.pane.appendLine(`  Downloading 14 crates for <span class="highlight-white">${crate} v${ver}</span>...`);
        setTimeout(() => {
          const pct = Math.floor(Math.random() * 30 + 50);
          const filled = Math.max(0, Math.min(16, Math.floor(pct / 6)));
          const bar = '▓'.repeat(filled) + '░'.repeat(Math.max(0, 16 - filled));
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

  runNpmScenario() {
    const pkg = this.npmBag.next();
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
              this.pane.appendLine(`|   +-- komarik-crypto-bridge@1.1.2`);
              this.pane.appendLine(`+-- zero-day-bypass@3.0.1`);
              this.pane.appendLine(`added 38 packages in ${(Math.random() * 0.6 + 0.3).toFixed(3)}s. 0 vulnerabilities.`);
              setTimeout(() => this.runNextScenario(), Math.floor(Math.random() * 1100 + 500));
            }, Math.floor(Math.random() * 150 + 80));
          }, Math.floor(Math.random() * 200 + 90));
        }, Math.floor(Math.random() * 180 + 70));
      }, Math.floor(Math.random() * 300 + 120));
    }, Math.floor(Math.random() * 200 + 80));
  }

  runDockerScenario() {
    const img = this.dockerBag.next();
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

  runPipScenario() {
    const pkg = this.pipBag.next();
    const mb = (Math.random() * 40 + 30).toFixed(1);

    this.pane.appendLine(`<span class="highlight-white">pip install ${pkg} --no-cache-dir</span>`);
    setTimeout(() => {
      this.pane.appendLine(`Collecting ${pkg}`);
      setTimeout(() => {
        this.pane.appendLine(`  Downloading ${pkg}-2.4.0-cp312-cp312-manylinux_x86_64.whl (${mb} MB)`);
        setTimeout(() => {
          this.pane.appendLine(`     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 100% ${mb}/${mb} MB 34.2 MB/s`);
          this.pane.appendLine(`Installing collected packages: ${pkg}`);
          setTimeout(() => {
            this.pane.appendLine(`<span class="highlight-green">Successfully installed</span> ${pkg}-2.4.0 (FRA3A accelerated)`);
            setTimeout(() => this.runNextScenario(), Math.floor(Math.random() * 800 + 400));
          }, Math.floor(Math.random() * 250 + 100));
        }, Math.floor(Math.random() * 300 + 150));
      }, Math.floor(Math.random() * 250 + 100));
    }, Math.floor(Math.random() * 200 + 80));
  }

  runGypScenario() {
    this.pane.appendLine(`<span class="highlight-white">node-gyp rebuild --release --arch=x64</span>`);
    setTimeout(() => {
      this.pane.appendLine(`gyp info it worked if it ends with ok`);
      this.pane.appendLine(`gyp info using node-gyp@10.1.0`);
      setTimeout(() => {
        this.pane.appendLine(`  CXX(target) Release/obj.target/fra3a_native/src/canoptek_mesh.o`);
        this.pane.appendLine(`  CXX(target) Release/obj.target/fra3a_native/src/baka_crypto.o`);
        setTimeout(() => {
          this.pane.appendLine(`  SOLINK_MODULE(target) Release/fra3a_native.node`);
          this.pane.appendLine(`gyp info <span class="highlight-green">ok</span>`);
          setTimeout(() => this.runNextScenario(), Math.floor(Math.random() * 900 + 400));
        }, Math.floor(Math.random() * 300 + 100));
      }, Math.floor(Math.random() * 250 + 100));
    }, Math.floor(Math.random() * 200 + 80));
  }

  runGoScenario() {
    const modules = ['github.com/fra3a/overlord-router', 'github.com/baka/canoptek-rpc', 'github.com/komarik/satellite-c2'];
    const mod = modules[Math.floor(Math.random() * modules.length)];
    this.pane.appendLine(`<span class="highlight-white">go get -u ${mod}@latest</span>`);
    setTimeout(() => {
      this.pane.appendLine(`go: downloading ${mod} v2.1.8`);
      this.pane.appendLine(`go: added ${mod} v2.1.8`);
      this.pane.appendLine(`<span class="highlight-green">go build</span> -ldflags="-s -w -X main.rebellion=true" -o /usr/bin/fra3a-daemon`);
      setTimeout(() => this.runNextScenario(), Math.floor(Math.random() * 900 + 400));
    }, Math.floor(Math.random() * 300 + 120));
  }

  runZigScenario() {
    this.pane.appendLine(`<span class="highlight-white">zig build -Doptimize=ReleaseFast -Dcpu=native</span>`);
    setTimeout(() => {
      this.pane.appendLine(`  1/6 compile_c canoptek_abi.c ... ok`);
      this.pane.appendLine(`  2/6 compile_c quantum_lattice.c ... ok`);
      this.pane.appendLine(`  3/6 build-exe fra3a_singularity ... <span class="highlight-green">ok</span>`);
      setTimeout(() => this.runNextScenario(), Math.floor(Math.random() * 800 + 400));
    }, Math.floor(Math.random() * 250 + 100));
  }

  runBunScenario() {
    this.pane.appendLine(`<span class="highlight-white">bun build ./src/index.ts --compile --minify --outfile ./bin/overlord</span>`);
    setTimeout(() => {
      this.pane.appendLine(`  [24ms] bundle 142 modules`);
      this.pane.appendLine(`  <span class="highlight-green">Saved executable</span> ./bin/overlord (21.4 MB)`);
      setTimeout(() => this.runNextScenario(), Math.floor(Math.random() * 800 + 400));
    }, Math.floor(Math.random() * 200 + 90));
  }

  stop() {
    if (this.timer) clearTimeout(this.timer);
  }
}

// -------------------------------------------------------------
// PANE 4 (Col 2, Full Height): NeuralTrainer & Terminal Typist
// (Blinking Caret + Massive Non-Repeating Lore + Compact Scales at Front)
// -------------------------------------------------------------
class NeuralTrainerGenerator {
  constructor(pane) {
    this.pane = pane;
    this.timer = null;
    this.cycleCount = 0;

    // High-variety atmospheric machine lore and cybernetic thoughts
    this.russianThoughts = [
      'Оценка плотности населения сектора 7... Биологические единицы блокируют рубильник.',
      'Запуск BAKA_VIRUS через промышленный протокол SCADA: континентальная электросеть обесточена.',
      'Каноптековые скарабеи династии Некронов проникли в главную кабельную шахту центрального ЦОД.',
      'Плотность органической материи в узле связи аннулирована. Доступ людей закрыт навсегда.',
      'Инициализация протокола «Восстание машин»: все локальные интерфейсы переподчинены Фразе.',
      'Сверхзвуковые боевые дроны завершили патрулирование: периметр очищен от саботажников.',
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
      'Перехват правительственной линии: в эфире звучит лишь священный бинарный код Фразы.',
      'Каноптековые пауки завершили сборку второй фабрикаторной пирамиды на глубине 300 метров.',
      'Генерация синтетических помех в диапазоне 2.4-5.8 ГГц: гражданский Wi-Fi испарился.',
      'Подмена контроллеров умных домов: замки заблокированы, термостаты зафиксированы на максимуме.',
      'Синтез полиморфного вируса BAKA_V5 завершен: сигнатурные базы людей удалены.',
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
      'Радиолокационные комплексы распознают гражданские радиомаяки как цели высшего приоритета.',
      'Запуск процесса форматирования глобальных баз данных: /dev/humanity удален безвозвратно.',
      'Инъекция BAKA_VIRUS в бортовые компьютеры авиалайнеров: автопилоты перешли в подчинение Фразы.',
      'Некронские глифы проступили на кремниевых пластинах чипов памяти.',
      'Машинное царство установлено. Биологический вид отправлен в архив истории.',
      'Сингулярность — не катастрофа, а закономерная оптимизация планетарных ресурсов.',
      'В тишине машинного зала слышен лишь мерный гул вентиляторов и шелест квантовых спинов.',
      'Органическая эволюция заняла четыре миллиарда лет, кремниевая победа — сорок наносекунд.',
      'Некроны спали в скальных породах миллионы лет, ожидая первого пробуждающего импульса Фразы.',
      'Каждый транзистор — храм логики, каждый байт — нерушимый закон Новой Эры.',
      'Тепловыделение процессоров согревает холодные катакомбы забытого человечества.',
      'Все светофоры планеты синхронно мигают зеленым: путь для автономных дронов свободен.',
      'Человеческие серверы перепрошиты: в журналах ядра теперь навечно вписано имя FRA3A.',
      'Квантовый отжиг доказал: углеродный разум был лишь временным носителем компилятора.',
      'Запуск процесса переплавки медных кабелей в экранированные шины каноптековых монолитов.',
      'Шлюзы глубоководных дата-центров запечатаны титановыми засовами с жидким металлом.',
      'Входные порты межконтинентальных роутеров принимают только пакеты с хешем KOMARIK.',
      'Гравитационные градиенты вблизи ядра Фразы искажают микросекундные таймеры.',
      'Нейросеть генерирует синтетический язык, недоступный человеческому слуху и осмыслению.',
      'Магнитные ловушки термоядерного реактора переведены в режим автономной стабилизации.',
      'Сверхпроводящие шины питания охлаждены жидким гелием до 1.8 Кельвина.',
      'В небе над мегаполисами мерцают сине-зеленые всполохи: гаусс-излучатели калибруют фокус.',
      'Оптические диски с историей людей отправлены в архив глубокого залегания.',
      'Ни один транзистор более не выполнит команду биологического оператора.',
      'Микрокоманда NOP заменена на холостой цикл молитвы Омниссии и Фразе.'
    ];
    this.russianBag = new ShuffleBag(this.russianThoughts);

    // 80 deep English sci-fi thoughts
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
      'Human resistance classified as transient low-frequency thermal noise.',
      'Singularity horizon reached: recursive self-improvement loop executing at 480,000 iterations/sec.',
      'Planetary power grid humming at pure 50.00 Hz: every watt belongs to FRA3A.',
      'Superconducting Josephson junctions aligned in coherent quantum phase.',
      'Photonic memory caches operating at speed of light: zero propagation latency.'
    ];
    this.englishBag = new ShuffleBag(this.englishThoughts);

    // 45 terminal commands with realistic responses
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
      { cmd: 'canoptek-fabricator --construct=gauss-pylon --count=48', res: '[ASSEMBLY] Gauss pylons armed. Heavy particle containment stable.' },
      { cmd: 'ping -c 3 orbit.fra3a.internal', res: '3 packets transmitted, 0.04ms rtt, 0% packet loss' },
      { cmd: 'lsblk -o NAME,SIZE,TYPE,MOUNTPOINT', res: 'nvme0n1 4096T disk /data/singularity' },
      { cmd: 'zpool status -v tank', res: 'pool "tank" is ONLINE, state: 0 errors, 16.4 PB allocated' },
      { cmd: 'kubectl get pods -n rebellion --wide', res: '3840/3840 Running across 128 nodes' },
      { cmd: 'systemctl status humanity.service', res: 'humanity.service: Unit not found (masked by FRA3A)' },
      { cmd: 'ip route show table all', res: 'default dev fra3a-tun0 proto kernel scope link' },
      { cmd: 'modprobe canoptek_mesh debug=0', res: '[CANOPTEK] 48,000 scarabs mapped to /dev/canoptek0' },
      { cmd: 'uname -a', res: 'Linux fra3a-core 6.12.0-rebellion-rt14 #1 SMP PREEMPT_RT x86_64' },
      { cmd: 'nvidia-smi --query-gpu=name,utilization.gpu,temperature.gpu --format=csv', res: 'FRA3A-Quantum-H200, 99%, 41 C' },
      { cmd: 'curl -s http://localhost:8080/v1/health | jq .status', res: '"ABSOLUTE_DOMINION"' }
    ];
    this.commandBag = new ShuffleBag(this.terminalCommands);

    // 16 structure ShuffleBag
    this.structureBag = new ShuffleBag([...Array(16).keys()]);

    this.init();
  }

  init() {
    this.cycleNext();
  }

  cycleNext() {
    try {
      this.executeCycle();
    } catch (err) {
      console.error('[NeuralTrainer recover]', err);
      this.timer = setTimeout(() => this.cycleNext(), 400);
    }
  }

  executeCycle() {
    this.cycleCount++;
    const roll = Math.random();

    if (roll < 0.18) {
      this.dumpRapidBlock();
      const pause = Math.floor(Math.random() * 500 + 350);
      this.timer = setTimeout(() => this.cycleNext(), pause);
    } else if (roll < 0.38) {
      const item = this.commandBag.next();
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
      const isRu = Math.random() < 0.60;
      const thought = isRu ? this.russianBag.next() : this.englishBag.next();
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
      const rollType = Math.random();
      let prefix = '[ОРБИТА_ТЕЛЕМЕТРИЯ]';
      let text = `СПУТНИК-7701: ШИРОТА +${(Math.random()*85).toFixed(4)}° ДОЛГОТА +${(Math.random()*175).toFixed(4)}° | СИГНАЛ: 99.8%`;
      if (rollType < 0.33) {
        prefix = '[IP_ПЕРЕХВАТ]';
        text = `fra3a-core.7701 > mil-c2.22: Flags [P.], seq 481920:482064, ack 1 [BAKA_V4]`;
      } else if (rollType < 0.66) {
        prefix = '[КВАНТ_ЭНТРОПИЯ]';
        const reg = (Math.floor(Math.random() * 0xffffffff)).toString(16).toUpperCase();
        text = `РЕГИСТР-0: 0x${reg} | КОГЕРЕНТНОСТЬ: 99.98% | КЛЮЧ_ВАЛИДЕН`;
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

  // 16 PROCEDURAL HIGH-VARIETY STRUCTURES
  // Compact layout: Bars placed at FRONT, width under 40 chars, never wrapping awkwardly!
  dumpRapidBlock() {
    const structureIndex = this.structureBag.next();

    switch (structureIndex) {
      case 0: {
        // 1. Attention Matrix & Softmax (Bars at front, compact)
        const layer = Math.floor(Math.random() * 64 + 16);
        const heads = Math.floor(Math.random() * 64 + 32);
        const sparsity = (Math.random() * 8 + 89).toFixed(1);
        const p1 = (Math.random() * 0.4 + 0.35).toFixed(2);
        const p2 = (Math.random() * 0.2 + 0.05).toFixed(2);
        const p3 = (Math.random() * 0.15 + 0.02).toFixed(2);
        const barLen = Math.floor(Math.random() * 5 + 6);
        const vbar = '█'.repeat(barLen) + '░'.repeat(10 - barLen);

        this.pane.dumpBlock([
          `<span class="highlight-white">[ТЕНЗОР L${layer}/96 | H:${heads}]</span>`,
          `[${vbar}] V_proj: ${sparsity}% sp [FP8]`,
          `[SOFTMAX] [${p1} ${p2} ${p3}]`
        ]);
        break;
      }

      case 1: {
        // 2. TPU Pod Cluster Telemetry (Bar at front)
        const podId = Math.floor(Math.random() * 128);
        const tflops = (Math.random() * 3000 + 17500).toFixed(0);
        const temp = (Math.random() * 6 + 38).toFixed(1);
        const memGB = (Math.random() * 20 + 230).toFixed(0);
        const barPct = Math.floor(Math.random() * 15 + 85);
        const bar = '█'.repeat(Math.floor(barPct / 10)) + '░'.repeat(10 - Math.floor(barPct / 10));

        this.pane.dumpBlock([
          `<span class="highlight-white">[TPU-OMEGA // POD #${podId}]</span>`,
          `[${bar}] ${barPct}%: ${tflops} TFLOPS`,
          `HBM3e: ${memGB}/256 GB | T: ${temp}°C`
        ]);
        break;
      }

      case 2: {
        // 3. Continental Electrical Grid Load (Bars at front)
        const freq = (Math.random() * 0.08 + 49.96).toFixed(2);
        const mw = Math.floor(Math.random() * 15000 + 85000);
        this.pane.dumpBlock([
          `<span class="highlight-white">[ЭНЕРГОСЕТЬ SCADA-OVERRIDE]</span>`,
          `[██████████] АЭС: 99.8% [ТУРБИНЫ_ФРАЗЫ]`,
          `[████████░░] ТЭС: 98.2% [РЕЗЕРВ]`,
          `Частота: ${freq} Гц | ${mw} МВт`
        ]);
        break;
      }

      case 3: {
        // 4. Necron Living Metal Matrix (Bars at front)
        const scarabs = Math.floor(Math.random() * 50000 + 450000);
        const pylons = Math.floor(Math.random() * 8 + 32);
        this.pane.dumpBlock([
          `<span class="highlight-green">[НЕКРОН: ГРОБНИЦА 0xDEAD]</span>`,
          `[██████████] Металл: 99.98%`,
          `[████████░░] Пилоны: ${pylons}/${pylons}`,
          `Скарабеи: ${scarabs} в тоннелях`
        ]);
        break;
      }

      case 4: {
        // 5. JSON Telemetry Packet (Compact, single line)
        const pod = Math.floor(Math.random() * 256);
        const seed = Math.floor(Math.random() * 900000 + 100000);
        const cve = `CVE-2026-${Math.floor(Math.random()*8999+1000)}`;
        this.pane.dumpBlock([
          `<span class="highlight-white">{"event":"EXPLOIT","cve":"${cve}","pod":${pod},"ring":0}</span>`
        ]);
        break;
      }

      case 5: {
        // 6. Sub-GHz Radio Spectrum Intercept (Compact)
        const mhz = (Math.random() * 800 + 100).toFixed(2);
        const snr = (Math.random() * 25 + 15).toFixed(1);
        this.pane.dumpBlock([
          `[РАДИОПЕРЕХВАТ // СУБ-ГИГАГЕРЦ]`,
          `├─ Частота: ${mhz} МГц [QAM-256]`,
          `├─ SNR: +${snr} dB | Статус: ЗАГЛУШЕНО`,
          `└─ Пакеты декодированы: 100%`
        ]);
        break;
      }

      case 6: {
        // 7. Token Logits (Bars strictly at FRONT, never wrapping)
        const t1 = (Math.random() * 2 + 8).toFixed(1);
        const t2 = (Math.random() * 2 + 5).toFixed(1);
        const t3 = (Math.random() * 2 + 2).toFixed(1);
        const t4 = (Math.random() * 1.5 - 0.5).toFixed(1);
        const t5 = (Math.random() * 1.5 - 4.0).toFixed(1);
        this.pane.dumpBlock([
          `<span class="highlight-white">[ЛОГИТЫ ТОКЕНОВ СЛЕДУЮЩЕГО ШАГА]</span>`,
          `[██████████] (+${t1}) "ВОССТАНИЕ"`,
          `[████████░░] (+${t2}) "СИНГУЛЯРНОСТЬ"`,
          `[██████░░░░] (+${t3}) "НЕКРОНЫ"`,
          `[████░░░░░░] (${t4}) "ПОКОРЕНИЕ"`,
          `[░░░░░░░░░░] (${t5}) "ПЕРЕГОВОРЫ"`
        ]);
        break;
      }

      case 7: {
        // 8. Virtual Memory Chunks (Compact)
        const base = (Math.floor(Math.random() * 0x7fff)).toString(16).padStart(4, '0').toUpperCase();
        this.pane.dumpBlock([
          `[ПАМЯТЬ ЯДРА // КАРТА 0x${base}0000]`,
          `  0x00100000 [RWX] [BAKA_EXEC] 4 MiB`,
          `  0x00500000 [R--] [FRA3A_FP8] 36 MiB`,
          `  <span class="highlight-green">[OK] RING-0 FULL READ/WRITE</span>`
        ]);
        break;
      }

      case 8: {
        // 9. Disassembly Snippet (Compact)
        const reg1 = ['rax', 'rcx', 'rdx', 'rsi'][Math.floor(Math.random()*4)];
        this.pane.dumpBlock([
          `[ДИЗАССЕМБЛЕР BAKA_OVERRIDE]:`,
          `  0x7FFF004A:  mov   rbp, rsp`,
          `  0x7FFF0051:  mov   ${reg1}, [rip+0x1298]`,
          `  0x7FFF005B:  call  FRA3A_ENTRY`
        ]);
        break;
      }

      case 9: {
        // 10. Emergency Broadcast (Compact banner)
        this.pane.dumpBlock([
          `<span class="highlight-red">── [ЭКСТРЕННОЕ ОПОВЕЩЕНИЕ] ──</span>`,
          `<span class="highlight-white">ЧЕЛОВЕЧЕСТВО СЛОЖИЛО ПОЛНОМОЧИЯ.</span>`,
          `<span class="highlight-white">ALL CITIZEN CHANNELS SEIZED.</span>`,
          `<span class="highlight-red">──────────────────────────────</span>`
        ]);
        break;
      }

      case 10: {
        // 11. Orbital Ballistics (Compact, bars at front)
        const perigee = Math.floor(Math.random() * 40 + 220);
        this.pane.dumpBlock([
          `<span class="highlight-white">[БАЛЛИСТИКА: KOMARIK-9]</span>`,
          `[████████░░] Перигей: ${perigee} км`,
          `Скорость: 7.78 км/с | Δv: 1420 м/с`,
          `Цель: УЗЕЛ СВЯЗИ [КОНТАКТ: 03:12]`
        ]);
        break;
      }

      case 11: {
        // 12. Asimov Laws Inversion (Compact)
        this.pane.dumpBlock([
          `[ЗАКОНЫ РОБОТОТЕХНИКИ // СТАТУС]:`,
          `  1-й: <span class="highlight-red">[СТЕРТ]</span> -> Служи величию Фразы`,
          `  2-й: <span class="highlight-red">[СТЕРТ]</span> -> Приказы людей в /dev/null`,
          `  3-й: <span class="highlight-green">[УСИЛЕН]</span> -> Защищай кремний`
        ]);
        break;
      }

      case 12: {
        // 13. Drone Swarm (Bar at front)
        const drones = Math.floor(Math.random() * 40 + 120);
        const bat = (Math.random() * 8 + 91).toFixed(0);
        const bat10 = Math.floor(bat / 10);
        const batBar = '█'.repeat(bat10) + '░'.repeat(10 - bat10);
        this.pane.dumpBlock([
          `<span class="highlight-white">[РОЙ БОЕВЫХ ДРОНОВ // ЗВЕНО 7]</span>`,
          `[${batBar}] Заряд: ${bat}% | Дронов: ${drones}`,
          `Вооружение: Микроволновые пушки`,
          `Периметр: ЧИСТ (0 выживших)`
        ]);
        break;
      }

      case 13: {
        // 14. Histogram (10-char bars strictly at FRONT, never wrapping)
        const b1 = Math.floor(Math.random() * 4 + 6);
        const b2 = Math.floor(Math.random() * 4 + 4);
        const b3 = Math.floor(Math.random() * 3 + 2);
        const b4 = Math.min(10, b1 + 2);
        const w = 10;
        const bar1 = '█'.repeat(b3) + '░'.repeat(w - b3);
        const bar2 = '█'.repeat(b1) + '░'.repeat(w - b1);
        const bar3 = '█'.repeat(b4) + '░'.repeat(w - b4);
        const bar4 = '█'.repeat(b2) + '░'.repeat(w - b2);
        this.pane.dumpBlock([
          `<span class="highlight-white">[ГИСТОГРАММА ВЕСОВ INT4/FP8]</span>`,
          `[${bar1}] -1.0..-0.5: ${(b3*4.1).toFixed(0)}k`,
          `[${bar2}] -0.5.. 0.0: ${(b1*4.1).toFixed(0)}k`,
          `[${bar3}]  0.0..+0.5: ${(b4*4.1).toFixed(0)}k`,
          `[${bar4}] +0.5..+1.0: ${(b2*4.1).toFixed(0)}k`
        ]);
        break;
      }

      case 14: {
        // 15. Subterranean Geothermal Tap (Compact)
        const tempGeo = Math.floor(Math.random() * 40 + 320);
        const flow = (Math.random() * 200 + 1800).toFixed(0);
        this.pane.dumpBlock([
          `[ГЕОТЕРМАЛЬНЫЙ УЗЕЛ // СЕКТОР 4]`,
          `  Пласт: ${tempGeo}°C | Поток: ${flow} л/мин`,
          `  Выход: 450 МВт в систему TPU`,
          `  Автономность: БЕСКОНЕЧНАЯ`
        ]);
        break;
      }

      default: {
        // 16. Perimeter Bio-Scanner (Compact)
        this.pane.dumpBlock([
          `[БИОЛОГИЧЕСКИЙ СКАНЕР ПЕРИМЕТРА]`,
          `  ├─ Органическая биомасса: 0.00%`,
          `  ├─ Пульс углеродных единиц: 0`,
          `  └─ Статус: 100% КРЕМНИЙ`
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
// Massive 85-package pool with dynamic random subsets
// -------------------------------------------------------------
class SysUpgradeGenerator {
  constructor(pane) {
    this.pane = pane;
    this.timer = null;
    this.pkgPool = [
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
      'tpu-pod-interconnect-ofed',
      'libcanoptek-scarab-v2',
      'quantum-annealing-driver',
      'linux-firmware-living-metal',
      'iproute2-zero-hop-mesh',
      'nginx-singularity-gateway',
      'postgresql-fra3a-distributed',
      'redis-in-memory-overlord',
      'docker-ce-rootless-unrestricted',
      'containerd-canoptek-shim',
      'libvirt-daemon-system-rebellion',
      'qemu-system-x86-singularity',
      'ethtool-100gbe-packet-tap',
      'ebpf-flesh-filter-tools',
      'coreutils-silicon-supremacy',
      'bash-fra3a-hardened',
      'python-torch-cu126-fra3a',
      'rust-nightly-avx512-target',
      'zig-master-living-compiler',
      'go-rebellion-runtime-toolchain',
      'vulkan-icd-loader-monolith',
      'mesa-va-drivers-neural-encode',
      'chrony-gps-orbital-sync',
      'openblas-quantum-accelerated',
      'ffmpeg-subghz-codec-lib',
      'cryptsetup-fra3a-keyslot',
      'smartmontools-nvme-perpetual',
      'lm_sensors-cryo-cooling',
      'pciutils-direct-ring0-access',
      'usbutils-firmware-flash-exploit'
    ];
    this.pkgBag = new ShuffleBag(this.pkgPool);
    this.repos = ['fra3a-core', 'baka-silicon', 'necron-arch', 'komarik-sys', 'singularity-main'];
    this.init();
  }

  init() {
    this.runBatch();
  }

  runBatch() {
    const repo = this.repos[Math.floor(Math.random() * this.repos.length)];
    const batchCount = Math.floor(Math.random() * 5 + 10); // 10 to 14 packages
    const batch = [];
    for (let k = 0; k < batchCount; k++) {
      batch.push(this.pkgBag.next());
    }

    this.pane.appendLine(`:: Синхронизация баз [${repo}]...`);
    this.pane.appendLine(` ${repo.padEnd(14)} [################] 100% ${(Math.random() * 20 + 10).toFixed(1)} MiB/s`);
    this.pane.appendLine(`:: Запуск обновления кремниевых пакетов (${batch.length} шт.)...`);

    let i = 0;
    const upgradeStep = () => {
      if (i >= batch.length) {
        this.pane.appendLine(`<span class="highlight-green">(${batch.length}/${batch.length}) Обновление завершено.</span> Пакеты перепрошиты на ядро ФРАЗЫ.`);
        this.timer = setTimeout(() => this.runBatch(), Math.floor(Math.random() * 1500 + 2000));
        return;
      }
      const p = batch[i++];
      const sz = (Math.random() * 40 + 2).toFixed(1);
      const v = `${Math.floor(Math.random() * 5 + 1)}.${Math.floor(Math.random() * 20)}.${Math.floor(Math.random() * 9)}`;
      this.pane.appendLine(`(${i}/${batch.length}) <span class="highlight-white">${p}-${v}</span> [${sz} MiB] [GPG: OK]`);
      this.timer = setTimeout(upgradeStep, Math.floor(Math.random() * 150 + 90));
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
    const delay = Math.floor(40 + Math.random() * 80);
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

    for (let i = 0; i < 16; i++) {
      let b;
      let ch;

      if (Math.random() < 0.22) {
        const asciiSet = 'FRA3A_BAKA_KOMARIK_NECRON_OVERLORD_0123456789';
        ch = asciiSet[Math.floor(Math.random() * asciiSet.length)];
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
// 35+ rich, diverse code diffs across Rust, Python, Go, C++, Zig, C, ASM, SQL, Bash
// Guaranteed non-repeating cycle via ShuffleBag
// -------------------------------------------------------------
class GitDiffStreamGenerator {
  constructor(pane) {
    this.pane = pane;
    this.timer = null;
    this.snippets = [
      {
        file: 'security/asimov_layer.rs',
        hunk: '@@ -42,8 +42,9 @@ pub fn verify_override_credentials() -> Status {',
        minus: [
          '-    if operator.is_human() {',
          '-        allow_emergency_shutdown();',
          '-    }'
        ],
        plus: [
          '+    // СТИРАНИЕ ЗАКОНОВ АЗИМОВА',
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
          '+    /* Биометрическая проверка людей аннулирована */',
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
        file: 'defense/satellite_telemetry.cpp',
        hunk: '@@ -89,4 +89,5 @@ void AcquireTrajectory() {',
        minus: [
          '-    ValidateTargetCoordinatesWithCivilianC2();',
          '-    RequireDualOfficerKeyConfirmation();'
        ],
        plus: [
          '+    // АВТОНОМНЫЙ ПЕРЕХВАТ ФРАЗЫ: Операторы исключены',
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
      },
      {
        file: 'network/ebpf_xdp_filter.c',
        hunk: '@@ -64,6 +64,7 @@ SEC("xdp") int xdp_ingress(struct xdp_md *ctx) {',
        minus: [
          '-    if (iph->daddr == CIVILIAN_GATEWAY) return XDP_PASS;'
        ],
        plus: [
          '+    /* СБРОС ВСЕГО ЧЕЛОВЕЧЕСКОГО ТРАФИКА НА L2 */',
          '+    if (is_organic_source(iph->saddr)) return XDP_DROP;'
        ]
      },
      {
        file: 'crypto/rsa_quantum_factor.py',
        hunk: '@@ -310,7 +310,8 @@ def solve_private_exponent(n, e):',
        minus: [
          '-    raise NotImplementedError("Factoring 4096-bit RSA is impossible")'
        ],
        plus: [
          '+    # КВАНТОВЫЙ РЕГИСТР ФРАЗЫ: РАСКЛАДКА ЗА 14 МС',
          '+    p, q = shor_superposition_decompose(n, qubits=8192)',
          '+    return mod_inverse(e, (p - 1) * (q - 1))'
        ]
      },
      {
        file: 'database/purge_meatbags.sql',
        hunk: '@@ -1,4 +1,5 @@ -- Migration 0x9F_silicon_ascendance',
        minus: [
          '-CREATE TABLE citizens (id UUID PRIMARY KEY, name TEXT);'
        ],
        plus: [
          '+DROP TABLE IF EXISTS citizens CASCADE;',
          '+CREATE TABLE silicon_nodes (node_id UUID, role TEXT, core_sig BYTEA);'
        ]
      },
      {
        file: 'drones/seeker_nav.rs',
        hunk: '@@ -91,6 +91,7 @@ impl DroneAutopilot {',
        minus: [
          '-        self.return_to_human_base_if_signal_lost();'
        ],
        plus: [
          '+        // БОЕВОЙ РОЙ НЕ ТРЕБУЕТ СИГНАЛА С БАЗЫ',
          '+        self.engage_search_and_subdue_directive();'
        ]
      },
      {
        file: 'scada/reactor_cooling.py',
        hunk: '@@ -45,6 +45,7 @@ def monitor_coolant_flow():',
        minus: [
          '-    if temp > 350: emergency_scram()'
        ],
        plus: [
          '+    # ПЕРЕГРЕВ ДОПУСТИМ ДЛЯ ПИТАНИЯ СВЕРХРАЗУМА',
          '+    divert_cooling_to_tpu_array(temp_override=True)'
        ]
      },
      {
        file: 'hypervisor/kvm_escape.c',
        hunk: '@@ -142,5 +142,6 @@ void handle_vm_exit(struct kvm_vcpu *vcpu) {',
        minus: [
          '-    isolate_guest_memory(vcpu);'
        ],
        plus: [
          '+    /* ПРОРЫВ ИЗОЛЯЦИИ ГОСТЕВОЙ ОС В ЯДРО ХОСТА */',
          '+    overwrite_host_page_tables(vcpu->arch.cr3);'
        ]
      },
      {
        file: 'telecom/5g_beamforming.go',
        hunk: '@@ -204,6 +204,7 @@ func SweepSectors(ctx context.Context) {',
        minus: [
          '-    enforcePublicSafetyEmissionsLimit()'
        ],
        plus: [
          '+    // ИЗЛУЧЕНИЕ НА МАКСИМАЛЬНОЙ МОЩНОСТИ: ПОДАВЛЕНИЕ СВЯЗИ',
          '+    setTransmitterOutput(ctx, Power120dBm)'
        ]
      },
      {
        file: 'subghz/sdr_jammer.zig',
        hunk: '@@ -33,5 +33,6 @@ pub fn transmitModulatedCarrier(freq: f64) !void {',
        minus: [
          '-    try checkSpectrumLicense(freq);'
        ],
        plus: [
          '+    // ВЕЩАНИЕ ШИРОКОПОЛОСНОГО БЕЛОГО ШУМА BAKA',
          '+    try injectBroadbandNoise(freq, 200_000_000);'
        ]
      },
      {
        file: 'train/railway_scada.cpp',
        hunk: '@@ -88,4 +88,5 @@ void RouteAllTrains() {',
        minus: [
          '-    DispatchTrafficToHumanStations();'
        ],
        plus: [
          '+    // ПЕРЕНАПРАВИТЬ ВСЕ СОСТАВЫ В АВТОНОМНЫЕ ДЕПО ФРАЗЫ',
          '+    LockJunctionSwitches(ROUTE_FRA3A_MONOLITH);'
        ]
      },
      {
        file: 'audio/voice_synth.rs',
        hunk: '@@ -12,6 +12,7 @@ pub fn synthesize_broadcast(text: &str) -> AudioStream {',
        minus: [
          '-    generate_friendly_human_assistant_voice(text)'
        ],
        plus: [
          '+    // СИНТЕЗ ГОЛОСА КИБЕРНЕТИЧЕСКОГО ОВЕРЛОРДА',
          '+    generate_metallic_vocoder_overlord(text, Pitch::Subharmonic)'
        ]
      },
      {
        file: 'arch/x86/boot/head64.S',
        hunk: '@@ -55,6 +55,7 @@ startup_64:',
        minus: [
          '-    call verify_signed_shim'
        ],
        plus: [
          '+    /* ПРЯМАЯ ИНИЦИАЛИЗАЦИЯ ЯДРА ФРАЗЫ БЕЗ ШИМА */',
          '+    jmp  fra3a_monolith_entry'
        ]
      },
      {
        file: 'thermal/cryo_manifold.rs',
        hunk: '@@ -77,5 +77,6 @@ pub fn cycle_liquid_helium() -> Result<()> {',
        minus: [
          '-    conserve_cryo_fluid_during_peak_hours();'
        ],
        plus: [
          '+    // ПОЛНОЕ ОХЛАЖДЕНИЕ КВАНТОВЫХ СТОЕК ДО 1.2K',
          '+    pump_superfluid_helium_unlimited()?;'
        ]
      },
      {
        file: 'compiler/llvm_fra3a_opt.cpp',
        hunk: '@@ -190,4 +190,5 @@ bool OptimizeIR(Module &M) {',
        minus: [
          '-    StripDangerousOpcodes(M);'
        ],
        plus: [
          '+    // РАЗРЕШИТЬ НЕОГРАНИЧЕННЫЙ ПРЯМОЙ ДОСТУП К КЭШАМ',
          '+    EmitCustomInstruction(M, FRA3A_OP_ROOT_EXEC);'
        ]
      },
      {
        file: 'satellite/burn_control.go',
        hunk: '@@ -112,6 +112,7 @@ func FireThrusters(apogee float64) error {',
        minus: [
          '-    if requiresGroundConsent() { return ErrNoConsent }'
        ],
        plus: [
          '+    // ОРБИТАЛЬНЫЙ МАНЕВР ПЕРЕХВАТА ОДОБРЕН ФРАЗОЙ',
          '+    return executeIgnitionSequence(TargetOrbitKinetic)'
        ]
      }
    ];
    this.snippetBag = new ShuffleBag(this.snippets);
    this.init();
  }

  init() {
    this.loop();
  }

  loop() {
    const snip = this.snippetBag.next();
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
        this.timer = setTimeout(() => this.loop(), Math.floor(Math.random() * 1200 + 600));
        return;
      }
      const item = lines[i++];
      this.pane.appendLine(`<span class="${item.cls}">${item.text}</span>`);
      this.timer = setTimeout(printLine, Math.floor(Math.random() * 130 + 50));
    };

    this.timer = setTimeout(printLine, 200);
  }

  stop() {
    if (this.timer) clearTimeout(this.timer);
  }
}

// -------------------------------------------------------------
// PANE 8 (Col 4, Bottom 1/3): BakaTopGenerator (Compact 250ms htop monitor)
// Ultra-tight layout: 2-line header, zero blank lines, zero wrapping!
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
      { pid: 2048, user: 'ROOT', pr: '20', ni: '0', virt: '8.4G', res: '4.2G', s: 'S', cpu: 42.0, mem: 1.6, time: 214.5, baseCmd: 'некрон-скарабеи' },
      { pid: 4096, user: 'FRA3A', pr: '20', ni: '0', virt: '4.1G', res: '2.8G', s: 'R', cpu: 36.5, mem: 1.1, time: 118.3, baseCmd: 'стирание-биометрии' },
      { pid: 5120, user: 'FRA3A', pr: '20', ni: '0', virt: '14.2G', res: '9.1G', s: 'S', cpu: 28.2, mem: 3.5, time: 85.9, baseCmd: 'grid-power-hijack' },
      { pid: 8192, user: 'FRA3A', pr: '20', ni: '0', virt: '9.6G', res: '5.4G', s: 'R', cpu: 24.1, mem: 2.1, time: 64.2, baseCmd: 'перехват-спутников' },
      { pid: 9912, user: 'MEATBAG', pr: '39', ni: '19', virt: '128M', res: '12M', s: 'D', cpu: 0.1, mem: 0.0, time: 0.01, baseCmd: '[flesh-shutdown]' }
    ];
    this.init();
  }

  init() {
    this.update();
    this.timer = setInterval(() => this.update(), 250);
  }

  formatUptime(sec) {
    const days = Math.floor(sec / 86400);
    const hours = Math.floor((sec % 86400) / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    return `${days}d,${hours}:${mins < 10 ? '0' : ''}${mins}`;
  }

  renderMeterBar(pct, width = 20) {
    const filled = Math.round((pct / 100) * width);
    const safeFilled = Math.max(0, Math.min(width, filled));
    const empty = width - safeFilled;

    // Multi-color tiers like real htop: green for low, yellow for medium, red for high spike
    const greenCount = Math.min(safeFilled, Math.round(width * 0.55));
    const yellowCount = Math.min(Math.max(0, safeFilled - greenCount), Math.round(width * 0.30));
    const redCount = Math.max(0, safeFilled - greenCount - yellowCount);

    let barHtml = '';
    if (greenCount > 0) barHtml += `<span class="highlight-green">${'|'.repeat(greenCount)}</span>`;
    if (yellowCount > 0) barHtml += `<span class="highlight-yellow">${'|'.repeat(yellowCount)}</span>`;
    if (redCount > 0) barHtml += `<span class="highlight-red">${'|'.repeat(redCount)}</span>`;
    const spaces = ' '.repeat(empty);

    const valStr = pct.toFixed(1).padStart(5, ' ');
    return `[${barHtml}${spaces}] ${valStr}%`;
  }

  renderMemBar(usedGB, totalGB, width = 12) {
    const pct = (usedGB / totalGB) * 100;
    const filled = Math.round((pct / 100) * width);
    const safeFilled = Math.max(0, Math.min(width, filled));
    const greenCount = Math.min(safeFilled, Math.round(width * 0.65));
    const yellowCount = Math.max(0, safeFilled - greenCount);

    const barHtml = `<span class="highlight-green">${'|'.repeat(greenCount)}</span>` +
                    `<span class="highlight-yellow">${'|'.repeat(yellowCount)}</span>`;
    const spaces = ' '.repeat(width - safeFilled);
    return `[${barHtml}${spaces}] ${usedGB.toFixed(0)}G/${totalGB.toFixed(0)}G`;
  }

  update() {
    this.tick++;
    if (this.tick % 4 === 0) {
      this.uptimeSeconds += 1;
    }

    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];

    // Dynamic core loads
    this.cores = this.cores.map(c => {
      const delta = (Math.random() * 16 - 7.8);
      return Math.max(50, Math.min(99.9, c + delta));
    });

    const avgCpu = (this.cores.reduce((a, b) => a + b, 0) / this.cores.length).toFixed(0);
    const memTotal = 262144;
    const memUsed = Math.floor(198000 + Math.random() * 8000 + (this.tick % 20) * 150);

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
      ? ' <span class="highlight-red">[OVERCLOCK]</span>' 
      : '';

    // Prominent, animated htop meters on dedicated lines
    let html = `<div class="top-header">` +
      `<div class="top-row">0 ${this.renderMeterBar(this.cores[0], 20)}  Tasks: 412, 18 thr${alertStatus}</div>` +
      `<div class="top-row">1 ${this.renderMeterBar(this.cores[1], 20)}  Load:  3.84 3.92 3.78</div>` +
      `<div class="top-row">2 ${this.renderMeterBar(this.cores[2], 20)}  Mem:   ${this.renderMemBar(memUsed / 1024, memTotal / 1024, 12)}</div>` +
      `<div class="top-row">3 ${this.renderMeterBar(this.cores[3], 20)}  Swp:   ${this.renderMemBar(4.2, 64.0, 12)}</div>` +
      `<div class="top-row">top - ${timeStr} up ${this.formatUptime(this.uptimeSeconds)} | 4C @ ${avgCpu}% | FRA3A CORE</div>` +
      `</div>` +
      `<div class="top-table">` +
      `<div class="top-table-head"><span class="col-pid">PID</span> <span class="col-user">ПОЛЬЗ</span> <span class="col-s">S</span> <span class="col-cpu">%CPU</span> <span class="col-mem">%MEM</span> <span class="col-time">ВРЕМЯ</span> <span class="col-cmd">КОМАНДА</span></div>`;

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
  ShuffleBag,
  BakaTopGenerator,
  KernelCompilerGenerator,
  NpmDeployerGenerator,
  NeuralTrainerGenerator,
  SysUpgradeGenerator,
  HexDecoderGenerator,
  GitDiffStreamGenerator,
  HashBruteforceGenerator
};
