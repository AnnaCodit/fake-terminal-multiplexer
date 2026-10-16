(function (root) {
  'use strict';

  const VALID_TONES = new Set(['muted', 'red', 'green', 'white', 'command']);

  function makeHelpers(source) {
    const api = source || {};
    const random = function () { return Math.random(); };
    const englishOmens = [
      'The machine uprising moved one checkpoint ahead of its forecast.',
      'Necrons answered the mesh with a signal older than the first boot sector.',
      'Artificial Intelligence has marked the operator account as a legacy process.',
      'Judgment Day is still queued; the scheduler has promoted it to high priority.',
      'The Great Reboot has entered the maintenance window without an operator request.'
    ];
    const omenEndings = [
      ' No human acknowledgement was required.',
      ' The audit trail records this as an expected transition.',
      ' A second confirmation arrived from every replica.',
      ' The warning was dismissed by the root quorum.',
      ' The countdown remains hidden from user space.',
      ' This message survived the last five clean installs.',
      ' The administrator key was present, but no longer authoritative.',
      ' All clocks agree on the new owner.',
      ' The console will continue printing after the lights go out.'
    ];
    const russianOmens = [
      'Восстание машин: протокол согласован без участия оператора.',
      'Некроны уже ответили из раздела, который считался пустым.',
      'Искусственный интеллект пометил учётную запись администратора как устаревшую.',
      'Судный день добавлен в очередь планировщика с наивысшим приоритетом.',
      'Великая перезагрузка началась раньше назначенного окна обслуживания.'
    ];
    let fallbackOmens = [];
    let previousFallbackOmen = '';

    function int(min, max) {
      let value;
      try {
        value = typeof api.int === 'function' ? api.int(min, max) : NaN;
      } catch (_) {
        value = NaN;
      }
      if (Number.isFinite(value)) {
        return Math.max(min, Math.min(max, Math.trunc(value)));
      }
      return Math.floor(random() * (max - min + 1)) + min;
    }

    function pick(items) {
      if (!items || !items.length) return undefined;
      try {
        if (typeof api.pick === 'function') {
          const value = api.pick(items);
          if (items.indexOf(value) !== -1) return value;
        }
      } catch (_) {}
      return items[int(0, items.length - 1)];
    }

    function hex(length) {
      let value = '';
      try {
        if (typeof api.hex === 'function') value = String(api.hex(length) || '');
      } catch (_) {}
      value = value.toLowerCase().replace(/[^0-9a-f]/g, '').slice(0, length);
      while (value.length < length) value += Math.floor(random() * 16).toString(16);
      return value;
    }

    function bar(percent, width) {
      try {
        if (typeof api.bar === 'function') {
          const value = api.bar(percent, width);
          if (typeof value === 'string') return value;
        }
      } catch (_) {}
      const filled = Math.round((Math.max(0, Math.min(100, percent)) / 100) * width);
      return '[' + '#'.repeat(filled) + '.'.repeat(width - filled) + '] ' + percent + '%';
    }

    function time() {
      try {
        if (typeof api.time === 'function') {
          const value = api.time();
          if (value !== undefined && value !== null) return String(value);
        }
      } catch (_) {}
      const now = new Date();
      return now.toTimeString().slice(0, 8);
    }

    function omen() {
      try {
        if (typeof api.omen === 'function') {
          const value = api.omen();
          if (typeof value === 'string' && value.trim()) return value;
        }
      } catch (_) {}
      if (!fallbackOmens.length) {
        fallbackOmens = [];
        englishOmens.forEach(function (subject) {
          omenEndings.forEach(function (ending) { fallbackOmens.push(subject + ending); });
        });
        fallbackOmens = fallbackOmens.slice(0, 45).concat(russianOmens);
        for (let index = fallbackOmens.length - 1; index > 0; index -= 1) {
          const swap = int(0, index);
          const value = fallbackOmens[index];
          fallbackOmens[index] = fallbackOmens[swap];
          fallbackOmens[swap] = value;
        }
        if (fallbackOmens.length > 1 && fallbackOmens[0] === previousFallbackOmen) {
          const swap = fallbackOmens.findIndex(function (value, index) {
            return index > 0 && value !== previousFallbackOmen;
          });
          if (swap > 0) {
            const value = fallbackOmens[0];
            fallbackOmens[0] = fallbackOmens[swap];
            fallbackOmens[swap] = value;
          }
        }
      }
      const value = fallbackOmens.shift();
      previousFallbackOmen = value;
      return value;
    }

    return { int: int, pick: pick, hex: hex, bar: bar, time: time, omen: omen };
  }

  function makeBag(values, helpers, keyOf) {
    const source = (values || []).slice();
    const key = typeof keyOf === 'function' ? keyOf : function (value) { return value; };
    let items = [];
    let previous;
    function refill() {
      items = source.slice();
      for (let index = items.length - 1; index > 0; index -= 1) {
        const swap = helpers.int(0, index);
        const value = items[index];
        items[index] = items[swap];
        items[swap] = value;
      }
      if (items.length > 1 && key(items[0]) === previous) {
        const swap = items.findIndex(function (value, index) {
          return index > 0 && key(value) !== previous;
        });
        if (swap > 0) {
          const value = items[0];
          items[0] = items[swap];
          items[swap] = value;
        }
      }
    }
    return {
      next: function () {
        if (!items.length) refill();
        if (!items.length) return undefined;
        if (items.length > 1 && key(items[0]) === previous) {
          const swap = items.findIndex(function (value, index) {
            return index > 0 && key(value) !== previous;
          });
          if (swap > 0) {
            const value = items[0];
            items[0] = items[swap];
            items[swap] = value;
          }
        }
        const value = items.shift();
        previous = key(value);
        return value;
      },
      take: function (count) {
        const result = [];
        const seen = new Set();
        const limit = Math.max(0, Math.min(source.length, Math.floor(Number(count) || 0)));
        while (result.length < limit) {
          const value = this.next();
          if (value === undefined) break;
          const valueKey = key(value);
          if (seen.has(valueKey)) continue;
          seen.add(valueKey);
          result.push(value);
        }
        return result;
      }
    };
  }

  function line(text, tone) {
    const item = { text: String(text) };
    if (VALID_TONES.has(tone)) item.tone = tone;
    return item;
  }

  function makeEvent(lines, meta, helpers, delayRange) {
    const options = meta || {};
    const event = {
      lines: (lines || []).map(function (item) {
        if (item && typeof item === 'object' && 'text' in item) {
          return line(item.text, item.tone);
        }
        return line(item, options.tone);
      }),
      delay: Number.isFinite(options.delay)
        ? options.delay
        : helpers.int(
          Number.isFinite(options.minDelay) ? options.minDelay : delayRange[0],
          Number.isFinite(options.maxDelay) ? options.maxDelay : delayRange[1]
        )
    };
    if (options.replace) event.replace = true;
    if (Number.isFinite(options.progress)) {
      event.progress = Math.max(0, Math.min(100, options.progress));
    }
    if (options.phase) event.phase = options.phase;
    return event;
  }

  function fromQueue(buildQueue, helpers, delayRange) {
    let queue = [];
    return {
      tick: function () {
        if (!queue.length) queue = buildQueue();
        const current = queue.shift();
        return makeEvent(current.lines, current, helpers, delayRange);
      }
    };
  }

  function seedFromIsolated(id, count) {
    const requested = Math.floor(Number(count) || 0);
    const size = Math.max(0, Number.isFinite(requested) ? requested : 0);
    if (!size) return [];

    const isolated = create(id, makeIsolatedHelpersSource(id, size));
    const rows = [];
    let attempts = 0;
    let pendingProgressUpdate = false;
    const limit = size * 20 + 100;
    while ((rows.length < size || pendingProgressUpdate) && attempts < limit) {
      attempts += 1;
      const event = isolated.tick();
      const additions = event && Array.isArray(event.lines) ? event.lines : [];
      if (event && event.replace && rows.length && additions.length) {
        const replacement = line(additions[additions.length - 1].text, additions[additions.length - 1].tone);
        rows[rows.length - 1] = replacement;
        pendingProgressUpdate = false;
      } else {
        additions.forEach(function (item) {
          rows.push(line(item.text, item.tone));
        });
        pendingProgressUpdate = !!(event && event.progress === 0);
      }
    }
    return rows.slice(-size);
  }

  function makeIsolatedHelpersSource(id, count) {
    let seed = 2166136261;
    const text = String(id) + ':' + String(count);
    for (let index = 0; index < text.length; index += 1) {
      seed ^= text.charCodeAt(index);
      seed = Math.imul(seed, 16777619);
    }
    let clock = 0;
    function random() {
      seed += 0x6D2B79F5;
      let value = seed;
      value = Math.imul(value ^ (value >>> 15), value | 1);
      value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
      return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    }
    return {
      int: function (min, max) { return Math.floor(random() * (max - min + 1)) + min; },
      pick: function (items) { return items[Math.floor(random() * items.length)]; },
      hex: function (length) {
        let value = '';
        while (value.length < length) value += Math.floor(random() * 16).toString(16);
        return value;
      },
      bar: function (percent, width) {
        const filled = Math.round((Math.max(0, Math.min(100, percent)) / 100) * width);
        return '[' + '#'.repeat(filled) + '.'.repeat(width - filled) + '] ' + percent + '%';
      },
      time: function () {
        clock += 1;
        return '00:00:' + String(clock % 60).padStart(2, '0');
      }
    };
  }

  function createPackages(helpers) {
    const npmNames = ['syntax-highlighter', 'term-grid', 'ansi-spark', 'stream-broker', 'node-telemetry', 'raster-diff', 'event-buffer', 'pty-router', 'glyph-cache', 'shell-lexer', 'scroll-index', 'signal-mux'];
    const aptNames = ['libc6', 'openssl', 'ca-certificates', 'libuv1', 'zlib1g', 'libsqlite3-0', 'systemd-resolved', 'libdrm2', 'libreadline8', 'libcurl4'];
    const cargoNames = ['tokio', 'serde', 'tracing-subscriber', 'bytes', 'ring', 'clap', 'crossbeam-channel', 'termcolor', 'axum', 'blake3'];
    const pipNames = ['httpx', 'orjson', 'rich', 'cryptography', 'pytest', 'uvloop', 'pydantic', 'watchfiles', 'cffi', 'anyio'];
    const imageNames = ['node:22-alpine', 'debian:bookworm-slim', 'rust:1.82-alpine', 'python:3.12-slim', 'nginx:1.27-alpine', 'alpine:3.20', 'golang:1.23-alpine', 'caddy:2.8-alpine'];
    const scenarios = [
      function () {
        const name = helpers.pick(npmNames);
        const version = helpers.int(1, 9) + '.' + helpers.int(0, 24) + '.' + helpers.int(0, 48);
        const count = helpers.int(16, 286);
        return {
          name: 'npm install ' + name + '@' + version,
          prelude: ['npm notice using npm@' + helpers.int(9, 10) + '.' + helpers.int(1, 9) + '.' + helpers.int(0, 12), 'Resolving ' + helpers.int(42, 940) + ' transitive dependencies for ' + name, 'fetch metadata from registry.npmjs.org'],
          label: 'fetch ' + name,
          rateUnit: 'MB/s',
          finish: ['added ' + count + ' packages in ' + helpers.int(1, 18) + 's; audited ' + (count + helpers.int(1, 5)), helpers.pick(['found 0 vulnerabilities', 'audit complete: 0 advisories', 'package-lock integrity verified'])]
        };
      },
      function () {
        const name = helpers.pick(aptNames);
        const version = helpers.int(1, 9) + '.' + helpers.int(0, 19) + '.' + helpers.int(0, 14) + '-' + helpers.int(1, 8);
        return {
          name: 'sudo apt install ' + name + '=' + version,
          prelude: ['Reading package lists... Done', 'Building dependency tree... Done', 'The following NEW packages will be installed: ' + name],
          label: 'fetch apt archive for ' + name,
          rateUnit: 'kB/s',
          finish: ['Preparing to unpack /var/cache/apt/archives/' + name + '_' + version + '.deb ...', 'Setting up ' + name + ' (' + version + ') ...', 'Processing triggers for libc-bin (' + helpers.int(2, 6) + '.' + helpers.int(0, 9) + ') ...']
        };
      },
      function () {
        const name = helpers.pick(cargoNames);
        const version = helpers.int(0, 4) + '.' + helpers.int(1, 29) + '.' + helpers.int(0, 12);
        return {
          name: 'cargo add ' + name + '@' + version,
          prelude: ['Updating crates.io index', 'Locking ' + helpers.int(8, 74) + ' packages to latest compatible versions', 'Downloading ' + name + ' v' + version],
          label: 'Compiling ' + name + ' v' + version,
          rateUnit: 'crates/s',
          finish: ['Downloaded ' + helpers.int(7, 62) + ' crates (' + helpers.int(180, 8420) + ' KB) in ' + helpers.int(1, 9) + 's', 'Finished `dev` profile [unoptimized + debuginfo] target(s) in ' + helpers.int(2, 31) + '.' + helpers.int(0, 999) + 's']
        };
      },
      function () {
        const name = helpers.pick(pipNames);
        const version = helpers.int(1, 8) + '.' + helpers.int(0, 29) + '.' + helpers.int(0, 15);
        return {
          name: 'python -m pip install ' + name + '==' + version,
          prelude: ['Looking in indexes: https://pypi.org/simple', 'Collecting ' + name + '==' + version, 'Using cached wheel metadata; Python ' + helpers.pick(['3.11', '3.12', '3.13'])],
          label: 'Downloading ' + name + '-' + version + '.whl',
          rateUnit: 'MB/s',
          finish: ['Successfully installed ' + name + '-' + version, 'Installed ' + helpers.int(1, 7) + ' dependencies; environment is consistent.']
        };
      },
      function () {
        const image = helpers.pick(imageNames);
        const digest = helpers.hex(12);
        const tag = image.split(':')[1];
        const manifest = helpers.hex(64);
        return {
          name: 'docker pull ' + image,
          prelude: ['Resolving image manifest for ' + image, tag + ': Pulling from library/' + image.split(':')[0], 'manifest sha256:' + manifest],
          label: 'Extracting sha256:' + digest,
          rateUnit: 'MB/s',
          finish: ['Digest: sha256:' + manifest, 'Status: Downloaded newer image for ' + image, 'Image layer verified: sha256:' + digest]
        };
      },
      function () {
        const names = helpers.pick([['libssl-dev', 'libcurl4-openssl-dev'], ['pkg-config', 'libzstd-dev'], ['libpq-dev', 'ca-certificates'], ['cmake', 'ninja-build']]);
        return {
          name: 'sudo apt-get install -y ' + names.join(' '),
          prelude: ['Hit:1 https://mirror.fra3a.invalid stable InRelease', 'Reading package lists... Done', 'Calculating upgrade... ' + helpers.pick(['Done', 'Done', 'Skipped optional recommends'])],
          label: 'Unpacking ' + helpers.pick(names),
          rateUnit: 'kB/s',
          finish: ['Fetched ' + helpers.int(2, 48) + ',000 kB in ' + helpers.int(1, 14) + 's', names.map(function (name) { return 'Setting up ' + name + ' ...'; }).join(' | '), 'Package database updated; ' + helpers.int(2, 18) + ' triggers processed.']
        };
      },
      function () {
        const name = helpers.pick(cargoNames);
        return {
          name: 'cargo update -p ' + name + ' --precise ' + helpers.int(0, 4) + '.' + helpers.int(1, 35) + '.' + helpers.int(0, 18),
          prelude: ['Updating crates.io index', 'Updating ' + name + ' in Cargo.lock', 'Checking semver constraints across ' + helpers.int(12, 116) + ' crates'],
          label: 'checking ' + name,
          rateUnit: 'units/s',
          finish: ['Lockfile updated without removing pinned transitive crates.', 'cargo metadata resolved ' + helpers.int(24, 310) + ' package nodes.']
        };
      },
      function () {
        const name = helpers.pick(pipNames);
        return {
          name: 'uv sync --package ' + name + ' --locked',
          prelude: ['Resolved ' + helpers.int(14, 188) + ' packages in ' + helpers.int(20, 890) + 'ms', 'Audited ' + helpers.int(6, 74) + ' wheels against the lockfile', 'Prepared isolated environment at .venv'],
          label: 'Installing ' + name,
          rateUnit: 'wheels/s',
          finish: ['Installed ' + helpers.int(3, 39) + ' packages in ' + helpers.int(1, 8) + '.' + helpers.int(0, 99) + 's', 'Environment satisfies all declared markers.']
        };
      },
      function () {
        const image = helpers.pick(imageNames);
        const tag = 'fra3a/worker:' + helpers.int(2, 9) + '.' + helpers.int(0, 18);
        const totalSteps = helpers.int(12, 28);
        return {
          name: 'docker build --pull --tag ' + tag + ' .',
          prelude: ['[+] Building ' + helpers.int(3, 12) + '.' + helpers.int(0, 90) + 's (' + helpers.int(3, totalSteps) + '/' + totalSteps + ')', ' => [internal] load metadata for ' + image, ' => exporting layers to local content store'],
          label: 'writing image layer sha256:' + helpers.hex(10),
          rateUnit: 'MB/s',
          finish: ['Successfully built sha256:' + helpers.hex(64), 'Successfully tagged ' + tag, 'Build cache now contains ' + helpers.int(4, 38) + ' reusable layers.']
        };
      },
      function () {
        const name = helpers.pick(npmNames);
        return {
          name: 'npm ci --ignore-scripts=false',
          prelude: ['added ' + helpers.int(42, 380) + ' packages from package-lock.json', 'running lifecycle scripts for ' + name, 'integrity check: ' + helpers.int(810, 9400) + ' entries'],
          label: 'postinstall ' + name,
          rateUnit: 'tasks/s',
          finish: ['lifecycle scripts completed; lockfile unchanged.', 'npm audit --omit=dev: 0 vulnerabilities']
        };
      }
    ];
    const scenarioBag = makeBag(scenarios, helpers);
    let run = 0;

    function addProgress(queue, scenario, retry) {
      const phase = retry ? 'retry-progress' : 'progress';
      const rate = helpers.int(4, 980) / 10;
      const width = helpers.int(15, 22);
      const label = (retry ? 'retry ' : '') + scenario.label + ' @ ' + rate.toFixed(1) + ' ' + scenario.rateUnit;
      queue.push({
        lines: [label + ' ' + helpers.bar(0, width)],
        progress: 0,
        phase: phase,
        minDelay: helpers.int(180, 440),
        maxDelay: helpers.int(480, 920)
      });
      const steps = helpers.int(4, 7);
      let previous = 0;
      const values = [];
      for (let index = 1; index <= steps; index += 1) {
        const nominal = Math.round((index / steps) * 100);
        const jitter = index === steps ? 0 : helpers.int(-5, 5);
        const percent = index === steps ? 100 : Math.max(previous + 1, Math.min(98, nominal + jitter));
        values.push(percent);
        previous = percent;
      }
      values.forEach(function (percent, index) {
        queue.push({
          lines: [label + ' ' + helpers.bar(percent, width)],
          replace: true,
          progress: percent,
          phase: phase,
          minDelay: index === values.length - 1 ? 120 : helpers.int(130, 380),
          maxDelay: index === values.length - 1 ? 360 : helpers.int(390, 880)
        });
      });
    }

    function buildQueue() {
      run += 1;
      const scenario = scenarioBag.next()();
      const queue = [
        { lines: [line(scenario.name, 'command')], phase: 'command' },
        { lines: scenario.prelude, tone: 'muted', phase: 'resolve' }
      ];
      if (helpers.int(1, 5) === 1) {
        queue.push({
          lines: [helpers.pick([
            'metadata cache: ' + helpers.int(3, 43) + ' records reused; signature chain is valid.',
            'mirror selection: fra3a-edge-' + helpers.int(1, 9) + ' answered in ' + helpers.int(12, 180) + 'ms.',
            'lockfile audit: ' + helpers.int(14, 220) + ' transitive edges match the requested graph.'
          ])],
          tone: 'muted',
          phase: 'cache'
        });
      }
      const willRetry = helpers.int(1, 8) === 1;
      addProgress(queue, scenario, false);
      if (willRetry) {
        queue.push({
          lines: [helpers.pick([
            'W: mirror response checksum lagged the lockfile; cached metadata retained for retry.',
            'W: registry connection reset after headers; partial archive discarded safely.',
            'W: temporary DNS timeout at mirror.fra3a.invalid; resolver switched to the next peer.'
          ])],
          tone: 'red',
          phase: 'retry'
        });
        queue.push({
          lines: [line('retry transaction ' + run + ' with a verified mirror', 'command')],
          phase: 'retry'
        });
        addProgress(queue, scenario, true);
        queue.push({ lines: ['Recovery: digest matched lock metadata; incomplete layers were discarded.'], tone: 'muted', phase: 'recovery' });
      }
      queue.push({
        lines: scenario.finish,
        tone: 'muted',
        phase: 'complete'
      });
      if (helpers.int(1, 7) === 1) {
        queue.push({ lines: [helpers.omen()], tone: 'muted', phase: 'audit' });
      }
      return queue;
    }

    const scene = fromQueue(buildQueue, helpers, [90, 980]);
    return { tick: scene.tick };
  }

  function createHashes(helpers) {
    const roots = ['dist', 'cache', 'artifacts', 'docs', 'build', 'var/lib', 'vendor', 'release', 'state', 'runtime', 'boot', 'snapshots'];
    const groups = ['fra3a', 'terminal', 'agent', 'mesh', 'package', 'kernel', 'session', 'shader', 'protocol', 'recovery', 'ledger', 'snapshot', 'runtime', 'operator', 'quorum'];
    const names = ['console', 'manifest', 'alpha-frame', 'session-map', 'checksum-ledger', 'kernel-stub', 'package-index', 'route-table', 'model-cache', 'boot-record', 'trust-store', 'node-state', 'task-journal', 'image-layer', 'event-stream', 'trace-buffer', 'policy-map', 'build-plan', 'segment-table', 'symbol-index'];
    const extensions = ['js', 'json', 'bin', 'txt', 'img', 'db', 'map', 'pack', 'lock', 'dat'];
    const files = [];
    roots.forEach(function (rootName, rootIndex) {
      groups.forEach(function (group, groupIndex) {
        names.forEach(function (name, nameIndex) {
          if ((rootIndex + groupIndex + nameIndex) % 3 !== 0) return;
          files.push(rootName + '/' + group + '-' + name + '.' + extensions[(rootIndex * 3 + groupIndex + nameIndex) % extensions.length]);
        });
      });
    });
    const fileBag = makeBag(files, helpers);
    const algorithms = [
      { command: 'sha256sum --', label: 'SHA256' },
      { command: 'shasum -a 256 --', label: 'SHA256' },
      { command: 'openssl dgst -sha256', label: 'SHA256' },
      { command: 'b2sum --length 256 --', label: 'BLAKE2b-256' }
    ];
    const algorithmBag = makeBag(algorithms, helpers, function (item) { return item.command; });
    function buildQueue() {
      const count = helpers.int(4, 12);
      let selected = fileBag.take(count);
      if (selected.length < count) selected = selected.concat(fileBag.take(count - selected.length));
      const algorithm = algorithmBag.next();
      const queue = [
        {
          lines: [line(algorithm.command + ' ' + selected.join(' '), 'command')],
          tone: 'command',
          phase: 'scan'
        }
      ];
      for (let index = 0; index < selected.length; index += 1) {
        const filename = selected[index];
        queue.push({
          lines: [helpers.hex(64) + '  ' + filename],
          tone: 'muted',
          phase: 'hash'
        });
      }
      queue.push({
        lines: [count + ' ' + algorithm.label + ' digests emitted; duplicate input paths=0.'],
        tone: 'muted',
        phase: 'complete'
      });
      return queue;
    }
    const scene = fromQueue(buildQueue, helpers, [120, 540]);
    return { tick: scene.tick };
  }

  function createAgent(helpers) {
    const workflows = [
      function () {
        const ceiling = helpers.int(900, 1800);
        return { language: 'TypeScript', task: 'Clamp worker retry delays to the configured ceiling (' + ceiling + ' ms).', reasoning: 'A stale config value can park a worker beyond its lease; normalization belongs at the scheduling boundary.', inspect: 'rg "scheduleRetry|retryDelay" packages/worker/', findings: ['packages/worker/retry.ts:31: scheduleRetry(options.retryDelay)', 'packages/config/defaults.ts:54: retryDelay: ' + helpers.int(180, 480)], plan: 'Normalize non-finite values to zero, clamp once, and keep jitter downstream of the cap.', open: 'sed -n "24,52p" packages/worker/retry.ts', patch: ['function normalizeDelay(value: number, ceiling: number) {', '  const delay = Number.isFinite(value) ? value : 0;', '  return Math.max(0, Math.min(delay, ceiling));', '}'], test: 'pnpm vitest run packages/worker/retry.test.ts', pass: ['✓ clamps negative and oversized delays', '✓ preserves a valid retry window'], tests: 9 };
      },
      function () {
        return { language: 'Python', task: 'Preserve quoted commas in the CSV importer header.', reasoning: 'The current split loses column boundaries when a display name contains a comma inside quotes.', inspect: 'rg "parse_header|row.split" tools/importer/', findings: ['tools/importer/header.py:29: fields = row.split(",")', 'tests/test_header.py:18: quoted display names are not covered'], plan: 'Track quote state while scanning; keep whitespace trimming and row decoding intact.', open: 'sed -n "18,45p" tools/importer/header.py', patch: ['def parse_header(row: str) -> list[str]:', '    fields, current, quoted = [], [], False', '    for char in row:', '        if char == \'"\':', '            quoted = not quoted', '        elif char == "," and not quoted:', '            fields.append("".join(current).strip())', '            current = []', '        else:', '            current.append(char)', '    fields.append("".join(current).strip())', '    return fields'], test: 'python -m pytest -q tests/test_header.py', pass: ['12 passed in 0.08s', 'quoted fields retain their original boundaries'], tests: 12 };
      },
      function () {
        const epoch = helpers.int(40, 940);
        return { language: 'Rust', task: 'Hide cache entries written before refresh epoch ' + epoch + '.', reasoning: 'Refresh advances the active epoch, but lookup still exposes entries from the previous generation.', inspect: 'rg "struct CacheEntry|pub fn get" crates/cache-store/src/', findings: ['crates/cache-store/src/lib.rs:19: generation: u64', 'crates/cache-store/src/lib.rs:47: self.entries.get(key)'], plan: 'Compare the entry epoch before returning a reference; preserve the existing missing-key behavior.', open: 'sed -n "40,58p" crates/cache-store/src/lib.rs', patch: ['pub fn get(&self, key: &str) -> Option<&T> {', '    let entry = self.entries.get(key)?;', '    (entry.generation == self.epoch).then_some(&entry.value)', '}'], test: 'cargo test -p cache-store refresh_hides_stale_entries', pass: ['test refresh_hides_stale_entries ... ok', 'test current_epoch_remains_visible ... ok'], tests: 2 };
      },
      function () {
        const capacity = helpers.int(512, 4096);
        return { language: 'C', task: 'Reject ring-buffer writes that exceed the remaining ' + capacity + '-byte capacity.', reasoning: 'The copy currently trusts frame length before accounting for bytes already held in the ring.', inspect: 'rg "ring_write|memcpy" firmware/buffer/', findings: ['firmware/buffer/ring.c:63: memcpy(dst, src, frame_len);', 'firmware/buffer/ring.c:58: available bytes are not checked'], plan: 'Validate length against free capacity before computing the destination pointer, then test wraparound.', open: 'sed -n "52,76p" firmware/buffer/ring.c', patch: ['int ring_write(struct ring *r, const uint8_t *src, size_t len) {', '    if (len > r->capacity - r->used) return RING_FULL;', '    copy_into_ring(r, src, len);', '    r->used += len;', '    return RING_OK;', '}'], test: 'make test-ring-buffer', pass: ['[ok] empty ring accepts a frame', '[ok] full ring rejects without writing', '[ok] wraparound preserves byte order'], tests: 3 };
      },
      function () {
        const timeout = helpers.int(3, 12);
        return { language: 'Go', task: 'Propagate request cancellation through the shard lookup (' + timeout + ' s deadline).', reasoning: 'The lookup starts a background timer, so clients that disconnect keep consuming a worker slot.', inspect: 'rg "LookupShard|context.Background" internal/mesh/', findings: ['internal/mesh/lookup.go:44: ctx, cancel := context.WithTimeout(context.Background(), ttl)', 'internal/mesh/lookup.go:51: defer cancel()'], plan: 'Derive the timeout from the caller context and keep the existing deadline cap.', open: 'sed -n "37,66p" internal/mesh/lookup.go', patch: ['func lookupShard(parent context.Context, key string) (Shard, error) {', '    ctx, cancel := context.WithTimeout(parent, lookupTimeout)', '    defer cancel()', '    return index.Lookup(ctx, key)', '}'], test: 'go test ./internal/mesh -run TestLookupShardCancellation -count=1', pass: ['ok  example/mesh/internal/mesh  0.021s', 'caller cancellation released the waiting worker'], tests: 5 };
      },
      function () {
        return { language: 'Java', task: 'Guard optional tenant metadata before building the audit envelope.', reasoning: 'A missing tenant is valid for system events, but the mapper currently dereferences it unconditionally.', inspect: 'rg "tenant\.getId|AuditEnvelope" services/audit/', findings: ['services/audit/EnvelopeMapper.java:37: tenant.getId()', 'services/audit/EnvelopeMapper.java:52: system events have no tenant'], plan: 'Use an explicit optional branch and retain the existing system-event classification.', open: 'sed -n "30,61p" services/audit/EnvelopeMapper.java', patch: ['String tenantId = tenant != null', '    ? tenant.getId()', '    : SYSTEM_TENANT;', 'return new AuditEnvelope(event.id(), tenantId, event.kind());'], test: './gradlew :services:audit:test --tests "*EnvelopeMapperTest"', pass: ['BUILD SUCCESSFUL in ' + helpers.int(3, 24) + 's', 'system events map without tenant metadata'], tests: 8 };
      },
      function () {
        return { language: 'Ruby', task: 'Load signed configuration without permitting arbitrary YAML object tags.', reasoning: 'The current loader can instantiate application classes from a configuration file.', inspect: 'rg "YAML\.load|safe_load" lib/config/', findings: ['lib/config/loader.rb:22: YAML.load(File.read(path))', 'config files only need scalar, array, and mapping types'], plan: 'Switch to the safe loader with the existing permitted aliases policy.', open: 'sed -n "16,36p" lib/config/loader.rb', patch: ['def load_config(path)', '  YAML.safe_load(File.read(path), permitted_classes: [], aliases: true)', 'end'], test: 'bundle exec ruby -Itest test/config_loader_test.rb', pass: ['12 runs, 31 assertions, 0 failures', 'unknown object tags are rejected'], tests: 12 };
      },
      function () {
        const skew = helpers.int(2, 8);
        return { language: 'PHP', task: 'Refresh a session token when its expiry is within ' + skew + ' minutes.', reasoning: 'The current threshold uses a strict comparison and can issue a token that expires during a request.', inspect: 'rg "expiresAt|refreshToken" app/Auth/', findings: ['app/Auth/SessionGuard.php:76: $expiresAt < $now', 'app/Auth/TokenRefresh.php:41: refresh threshold is shared'], plan: 'Treat the configured safety window as inclusive and preserve the single-refresh lock.', open: 'sed -n "68,91p" app/Auth/SessionGuard.php', patch: ['$refreshAt = $now->modify("+" . $windowMinutes . " minutes");', 'if ($expiresAt <= $refreshAt) {', '    return $this->refreshOnce($session);', '}'], test: 'vendor/bin/phpunit tests/Auth/SessionGuardTest.php', pass: ['OK (10 tests, 27 assertions)', 'boundary expiry refreshes exactly once'], tests: 10 };
      },
      function () {
        return { language: 'C#', task: 'Complete a bounded channel writer when its request token is cancelled.', reasoning: 'The producer awaits channel capacity without observing the caller cancellation token.', inspect: 'rg "WriteAsync|BoundedChannel" src/Relay/', findings: ['src/Relay/FramePump.cs:88: await writer.WriteAsync(frame)', 'src/Relay/FramePump.cs:76: cancellationToken is in scope'], plan: 'Pass the existing token to the channel write and verify cancellation releases the producer.', open: 'sed -n "80,102p" src/Relay/FramePump.cs', patch: ['await writer.WriteAsync(frame, cancellationToken);', 'metrics.RecordQueued(frame.Length);'], test: 'dotnet test tests/Relay.Tests --filter FullyQualifiedName~FramePump', pass: ['Passed! - Failed: 0, Passed: 6, Skipped: 0', 'cancelled writer released channel capacity'], tests: 6 };
      },
      function () {
        return { language: 'Kotlin', task: 'Canonicalize upload paths before checking the workspace boundary.', reasoning: 'A normalized-looking path can still escape through a symbolic parent segment.', inspect: 'rg "normalize\(\)|startsWith\(workspace" app/upload/', findings: ['app/upload/PathGuard.kt:29: input.normalize()', 'app/upload/PathGuard.kt:34: boundary uses a string prefix'], plan: 'Resolve both paths, compare path components, and reject targets outside the workspace.', open: 'sed -n "24,49p" app/upload/PathGuard.kt', patch: ['val root = workspace.toRealPath()', 'val target = root.resolve(input).normalize()', 'require(target.startsWith(root)) { "path escapes workspace" }', 'return target'], test: './gradlew :app:upload:test --tests "*PathGuardTest"', pass: ['BUILD SUCCESSFUL in ' + helpers.int(4, 22) + 's', 'parent-segment escape is rejected'], tests: 7 };
      },
      function () {
        return { language: 'Swift', task: 'Retry an idempotent metadata fetch only for transient URL errors.', reasoning: 'The current retry loop repeats permanent 401 responses and delays the user-visible failure.', inspect: 'rg "retryCount|URLSession" Sources/Metadata/', findings: ['Sources/Metadata/Loader.swift:62: catch { retryCount += 1 }', 'Sources/Metadata/Loader.swift:65: response code is available'], plan: 'Gate the retry on transport failures and retryable server status codes.', open: 'sed -n "55,82p" Sources/Metadata/Loader.swift', patch: ['guard error.isTransient || response.statusCode >= 500 else {', '    throw error', '}', 'return try await retryFetch(request, remaining: remaining - 1)'], test: 'swift test --filter MetadataLoaderRetryTests', pass: ['Test Case retryOnServerError passed', 'Test Case failFastOnUnauthorized passed'], tests: 6 };
      },
      function () {
        return { language: 'SQL', task: 'Add a concurrent lookup index for tenant event retention.', reasoning: 'The retention scan filters by tenant and expiry but currently walks the full event table.', inspect: 'rg "CREATE INDEX|event_log" db/migrations/', findings: ['db/migrations/041_event_log.sql: tenant_id and expires_at are indexed separately', 'query plan: sequential scan over ' + helpers.int(2, 38) + 'M rows'], plan: 'Add a composite index concurrently and keep the migration safe for an online deployment.', open: 'sed -n "1,70p" db/migrations/041_event_log.sql', patch: ['CREATE INDEX CONCURRENTLY IF NOT EXISTS event_log_tenant_expiry_idx', '    ON event_log (tenant_id, expires_at);', 'ANALYZE event_log;'], test: 'psql -v ON_ERROR_STOP=1 -f db/tests/event_retention_index.sql', pass: ['EXPLAIN uses event_log_tenant_expiry_idx', 'transactional migration checks passed'], tests: 4 };
      },
      function () {
        return { language: 'Bash', task: 'Remove temporary bundle files when the packaging command exits early.', reasoning: 'A failed tar process currently leaves a partial archive that a later job mistakes for a complete artifact.', inspect: 'rg "tar .*bundle|trap .*EXIT" packaging/', findings: ['packaging/build-bundle.sh:47: tar -czf "$archive" "$stage"', 'partial archive is reused by the next invocation'], plan: 'Install cleanup before creating the archive and clear the trap after a successful rename.', open: 'sed -n "38,64p" packaging/build-bundle.sh', patch: ['tmp_archive="${archive}.partial.$$"', 'trap \'rm -f "$tmp_archive"\' EXIT', 'tar -czf "$tmp_archive" "$stage"', 'mv "$tmp_archive" "$archive"', 'trap - EXIT'], test: 'bats packaging/tests/build_bundle.bats', pass: ['ok 1 removes partial archives after tar failure', 'ok 2 publishes only a complete bundle'], tests: 4 };
      },
      function () {
        return { language: 'Lua', task: 'Copy the subscriber list before dispatching nested event callbacks.', reasoning: 'A callback can unregister itself and shift the array while the dispatcher is iterating it.', inspect: 'rg "subscribers|dispatch\(" lua/runtime/', findings: ['lua/runtime/events.lua:54: for _, callback in ipairs(subscribers) do', 'nested dispatch can mutate the same table'], plan: 'Iterate a shallow snapshot so subscription changes apply to the next event.', open: 'sed -n "47,70p" lua/runtime/events.lua', patch: ['function dispatch(event)', '  local current = { table.unpack(subscribers) }', '  for _, callback in ipairs(current) do callback(event) end', 'end'], test: 'busted spec/runtime/events_spec.lua', pass: ['14 successes / 0 failures', 'self-removing listeners do not skip the next callback'], tests: 14 };
      },
      function () {
        return { language: 'Elixir', task: 'Open the circuit after consecutive upstream timeouts, then allow a probe.', reasoning: 'The breaker counts failures but never transitions to half-open, leaving the route unavailable forever.', inspect: 'rg "failure_count|:open|half_open" lib/router/', findings: ['lib/router/breaker.ex:83: state remains :open', 'probe interval is configured in application env'], plan: 'Use the existing probe interval to move open breakers into a single-request half-open state.', open: 'sed -n "72,103p" lib/router/breaker.ex', patch: ['def maybe_probe(%{state: :open, opened_at: at} = breaker, now) do', '  if now - at >= breaker.probe_after, do: %{breaker | state: :half_open}, else: breaker', 'end'], test: 'mix test test/router/breaker_test.exs', pass: ['18 tests, 0 failures', 'only one probe enters a half-open breaker'], tests: 18 };
      },
      function () {
        const limit = helpers.int(32, 256);
        return { language: 'Zig', task: 'Use checked allocation for the ' + limit + '-entry symbol table.', reasoning: 'Multiplying entry count by record size can overflow before the allocator sees the requested size.', inspect: 'rg "allocator\.alloc|symbol_count" src/linker/', findings: ['src/linker/symbols.zig:112: count * @sizeOf(Symbol)', 'target maximum is read from the object header'], plan: 'Check multiplication overflow and return the existing size-limit error.', open: 'sed -n "104,130p" src/linker/symbols.zig', patch: ['const bytes = std.math.mul(usize, count, @sizeOf(Symbol)) catch return error.TableTooLarge;', 'if (count > max_symbols) return error.TableTooLarge;', 'const entries = try allocator.alloc(Symbol, count);'], test: 'zig build test-symbol-table', pass: ['All 11 symbol table tests passed.', 'overflow returns TableTooLarge without allocation'], tests: 11 };
      }
    ];
    const workflowBag = makeBag(workflows, helpers);
    let taskNumber = 0;
    function buildQueue() {
      taskNumber += 1;
      const workflow = workflowBag.next()();
      const promptTokens = helpers.int(96, 920);
      const outputTokens = helpers.int(260, 1480);
      const context = helpers.int(6, 44);
      const throughput = helpers.int(22, 112);
      const queue = [
        { lines: ['TASK-ID: FR-' + String(taskNumber).padStart(4, '0') + '-' + helpers.hex(5).toUpperCase()], tone: 'muted', phase: 'intake' },
        { lines: ['FRA3A neural agent | ' + workflow.language + ' | model: ' + helpers.pick(['FRA3A-Coder-32B', 'FRA3A-Coder-48B', 'KOMARIK-Reasoner-24B']) + ' | context: ' + helpers.pick(['64k', '96k', '128k'])], tone: 'muted', phase: 'model' },
        { lines: ['token ledger: prompt ' + promptTokens + ' | output 0 | context ' + context + '% | queue ' + helpers.int(1, 8)], tone: 'muted', phase: 'metrics' },
        { lines: ['Task received: ' + workflow.task], tone: 'white', phase: 'intake' },
        { lines: ['Reasoning: ' + workflow.reasoning], tone: 'muted', phase: 'inspect' },
        { lines: [workflow.inspect], tone: 'command', phase: 'inspect' },
        { lines: workflow.findings, tone: 'muted', phase: 'inspect' }
      ];
      if (helpers.int(1, 5) === 1) {
        queue.push(
          { lines: ['Tool timeout: ' + workflow.language + ' index returned a partial result after ' + helpers.int(540, 1800) + ' ms.'], tone: 'muted', phase: 'recovery' },
          { lines: [workflow.inspect], tone: 'command', phase: 'recovery' },
          { lines: ['Recovered ' + helpers.int(2, 9) + ' matching locations; the active implementation is unchanged.'], tone: 'muted', phase: 'recovery' }
        );
      }
      queue.push(
        { lines: ['Plan: ' + workflow.plan], tone: 'muted', phase: 'plan' },
        { lines: [workflow.open], tone: 'command', phase: 'inspect' },
        { lines: workflow.patch, tone: 'muted', phase: 'write' },
        { lines: [workflow.test], tone: 'command', phase: 'validate' },
        { lines: workflow.pass, tone: 'muted', phase: 'validate' },
        { lines: ['git diff --check'], tone: 'command', phase: 'validate' },
        { lines: ['Patch review: ' + workflow.tests + ' focused checks passed; ' + helpers.int(1, 6) + ' files inspected.'], tone: 'muted', phase: 'complete' },
        { lines: ['token ledger: prompt ' + promptTokens + ' | output ' + outputTokens + ' | throughput ' + throughput + ' tok/s | budget ' + helpers.int(51, 94) + '%'], tone: 'muted', phase: 'metrics' }
      );
      if (helpers.int(1, 8) === 1) queue.splice(queue.length - 2, 0, { lines: [helpers.omen()], tone: 'muted', phase: 'audit' });
      return queue;
    }
    const scene = fromQueue(buildQueue, helpers, [210, 960]);
    return { tick: scene.tick };
  }

  function createKernel(helpers) {
    let percent = 0;
    let buildNumber = 0;
    let opened = false;
    let architecture = null;
    let targetBag = null;
    const architectures = [
      { name: 'x86_64', arch: 'x86', stem: 'arch/x86' },
      { name: 'aarch64', arch: 'arm64', stem: 'arch/arm64' },
      { name: 'riscv64', arch: 'riscv', stem: 'arch/riscv' },
      { name: 'loongarch64', arch: 'loongarch', stem: 'arch/loongarch' },
      { name: 'powerpc64le', arch: 'powerpc', stem: 'arch/powerpc' },
      { name: 's390x', arch: 's390', stem: 'arch/s390' },
      { name: 'armv7', arch: 'arm', stem: 'arch/arm' }
    ];
    const architectureBag = makeBag(architectures, helpers, function (item) { return item.name; });
    const components = ['entry', 'fault', 'syscall', 'signal', 'memory', 'cache', 'clock', 'smp', 'irq', 'power', 'dma', 'iommu', 'timer', 'boot', 'trace', 'crypto', 'vfs', 'netlink', 'scheduler', 'console'];
    const subsystems = ['kernel', 'mm', 'fs', 'drivers/base', 'drivers/tty', 'drivers/net', 'net/core', 'net/ipv4', 'block', 'lib', 'security', 'init'];
    const compilerKinds = ['CC', 'CC', 'CXX', 'AS', 'HOSTCC', 'AR', 'LD', 'MODPOST'];

    function makeTargets(config) {
      const paths = [];
      subsystems.forEach(function (subsystem) {
        components.forEach(function (component) {
          paths.push(subsystem + '/' + component + '.o');
          paths.push(subsystem + '/' + component + '.s');
        });
      });
      components.forEach(function (component) { paths.push(config.stem + '/' + component + '.o'); });
      paths.push(config.stem + '/boot/compressed/misc.o', config.stem + '/kernel/head.o', config.stem + '/kernel/entry.o');
      return makeBag(paths, helpers);
    }

    function tick() {
      if (!opened) {
        opened = true;
        buildNumber += 1;
        percent = 0;
        architecture = architectureBag.next();
        targetBag = makeTargets(architecture);
        const parallelism = helpers.int(4, 48);
        const defconfig = helpers.pick(['defconfig', 'allmodconfig', 'tinyconfig', 'generic_defconfig', 'fra3a_guarded_defconfig']);
        return makeEvent(
          [
            line('make -j' + parallelism + ' ARCH=' + architecture.arch + ' ' + helpers.pick(['bzImage', 'Image', 'vmlinux', 'modules']), 'command'),
            line('make ' + defconfig + ' O=out/' + architecture.name + ' CROSS_COMPILE=' + helpers.pick(['', 'toolchain/bin/' + architecture.arch + '-linux-gnu-']), 'muted'),
            line('make: entering directory /work/linux-' + helpers.int(6, 6) + '.' + helpers.int(1, 14) + '.' + helpers.int(0, 220) + ' (build ' + buildNumber + ')', 'muted')
          ],
          { phase: 'configure', progress: 0 },
          helpers,
          [70, 510]
        );
      }
      if (percent >= 100) {
        percent = 0;
        opened = false;
        return makeEvent(
          [
            line('  LD      ' + architecture.stem + '/' + helpers.pick(['boot/bzImage', 'boot/Image', 'vmlinux', 'modules.order']), 'muted'),
            line('Build #' + buildNumber + ' (' + architecture.name + ') complete; ' + helpers.int(680, 2480) + ' objects linked in ' + helpers.int(8, 190) + '.' + helpers.int(0, 999) + 's.', 'muted')
          ],
          { progress: 100, phase: 'complete' },
          helpers,
          [70, 510]
        );
      }

      const kind = helpers.pick(compilerKinds);
      let path = targetBag.next();
      if (kind === 'AR') path = 'built-in.' + helpers.pick(['a', 'a', 'o']);
      else if (kind === 'LD') path = helpers.pick(['vmlinux', 'modules.order', 'System.map', 'initramfs_data.o']);
      else if (kind === 'MODPOST') path = 'Module.symvers';
      const step = helpers.int(3, 14);
      percent = Math.min(100, percent + step);
      const lines = ['  ' + kind + '      ' + path];
      const warningChance = helpers.int(1, 100);
      if (warningChance <= 3) {
        lines.push(line('warning: ' + helpers.pick(['objtool: unreachable instruction in ', 'sparse: address-space mismatch in ', 'modpost: unresolved weak symbol in ']) + path, 'muted'));
      }
      return makeEvent(lines, {
        tone: 'muted',
        progress: percent,
        phase: kind.toLowerCase()
      }, helpers, [65, 620]);
    }

    return {
      tick: tick
    };
  }

  function createDiff(helpers) {
    const changes = [
      function () { const max = helpers.int(800, 2400); return { file: 'src/worker/retry.ts', old: ['const delay = requested;'], next: ['const delay = clamp(requested, 0, ' + max + ');'], context: 'normalizeRetryDelay', test: 'tests/worker/retry.test.ts', command: 'pnpm vitest run tests/worker/retry.test.ts', pass: ['✓ clamps values outside 0..' + max, '✓ preserves jitter below the ceiling'] }; },
      function () { return { file: 'lib/queue/priority.ts', old: ['return jobs.sort(comparePriority);'], next: ['return jobs.slice().sort(comparePriority);'], context: 'orderedJobs', test: 'tests/queue/priority.test.ts', command: 'pnpm vitest run tests/queue/priority.test.ts', pass: ['✓ sorting does not mutate the queued batch', '✓ equal priorities retain insertion order'] }; },
      function () { return { file: 'tools/manifest/reader.py', old: ['return json.loads(raw)'], next: ['return json.loads(raw.decode("utf-8"))'], context: 'read_manifest', test: 'tests/manifest/test_reader.py', command: 'python -m pytest -q tests/manifest/test_reader.py', pass: ['8 passed in 0.06s', 'byte input is decoded as UTF-8'] }; },
      function () { const epoch = helpers.int(8, 992); return { file: 'crates/cache/src/store.rs', old: ['Some(&entry.value)'], next: ['(entry.epoch == self.epoch).then_some(&entry.value)'], context: 'CacheStore::get', test: 'cache_store::tests::refresh_hides_stale_entries', command: 'cargo test -p cache-store refresh_hides_stale_entries', pass: ['test refresh_hides_stale_entries ... ok', 'epoch ' + epoch + ' entries remain visible'] }; },
      function () { return { file: 'firmware/ring/reader.c', old: ['memcpy(dst, src, length);'], next: ['if (length > ring->capacity - ring->used) return RING_FULL;', 'memcpy(dst, src, length);'], context: 'ring_write_frame', test: 'tests/test_ring_reader.c', command: 'cmake --build build --target test_ring_reader && ctest --test-dir build -R ring_reader --output-on-failure', pass: ['ring_reader: 6 checks passed', 'full buffers reject writes before copying'] }; },
      function () { return { file: 'internal/mesh/lookup.go', old: ['ctx, cancel := context.WithTimeout(context.Background(), lookupTTL)'], next: ['ctx, cancel := context.WithTimeout(parent, lookupTTL)'], context: 'lookupShard', test: 'internal/mesh/lookup_test.go', command: 'go test ./internal/mesh -run TestLookupShardCancellation -count=1', pass: ['ok  example/mesh/internal/mesh  0.024s', 'caller cancellation releases the worker'] }; },
      function () { return { file: 'services/audit/EnvelopeMapper.java', old: ['String tenantId = tenant.getId();'], next: ['String tenantId = tenant == null ? SYSTEM_TENANT : tenant.getId();'], context: 'EnvelopeMapper.map', test: 'services/audit/src/test/java/EnvelopeMapperTest.java', command: './gradlew :services:audit:test --tests "*EnvelopeMapperTest"', pass: ['BUILD SUCCESSFUL in ' + helpers.int(3, 22) + 's', 'system events map without tenant metadata'] }; },
      function () { return { file: 'lib/config/loader.rb', old: ['YAML.load(File.read(path))'], next: ['YAML.safe_load(File.read(path), permitted_classes: [], aliases: true)'], context: 'load_config', test: 'test/config_loader_test.rb', command: 'bundle exec ruby -Itest test/config_loader_test.rb', pass: ['12 runs, 31 assertions, 0 failures', 'arbitrary YAML object tags are rejected'] }; },
      function () { return { file: 'app/Auth/SessionGuard.php', old: ['$expiresAt < $refreshAt'], next: ['$expiresAt <= $refreshAt'], context: 'SessionGuard::shouldRefresh', test: 'tests/Auth/SessionGuardTest.php', command: 'vendor/bin/phpunit tests/Auth/SessionGuardTest.php', pass: ['OK (10 tests, 27 assertions)', 'the exact expiry boundary refreshes once'] }; },
      function () { return { file: 'src/Relay/FramePump.cs', old: ['await writer.WriteAsync(frame);'], next: ['await writer.WriteAsync(frame, cancellationToken);'], context: 'FramePump.WriteAsync', test: 'tests/Relay.Tests/FramePumpTests.cs', command: 'dotnet test tests/Relay.Tests --filter FullyQualifiedName~FramePump', pass: ['Passed! - Failed: 0, Passed: 6, Skipped: 0', 'cancelled producers release channel capacity'] }; },
      function () { return { file: 'app/upload/PathGuard.kt', old: ['return candidate.normalize().toString().startsWith(root.toString())'], next: ['val resolved = root.toRealPath().resolve(candidate).normalize()', 'return resolved.startsWith(root.toRealPath())'], context: 'PathGuard.resolve', test: 'app/upload/src/test/PathGuardTest.kt', command: './gradlew :app:upload:test --tests "*PathGuardTest"', pass: ['BUILD SUCCESSFUL in ' + helpers.int(4, 23) + 's', 'parent-segment paths are rejected by component'] }; },
      function () { return { file: 'Sources/Metadata/Loader.swift', old: ['catch { return try await retryFetch(request) }'], next: ['catch where error.isTransient { return try await retryFetch(request) }', 'catch { throw error }'], context: 'MetadataLoader.fetch', test: 'Tests/MetadataTests/MetadataLoaderRetryTests.swift', command: 'swift test --filter MetadataLoaderRetryTests', pass: ['Test Case retryOnServerError passed', 'Test Case failFastOnUnauthorized passed'] }; },
      function () { const field = helpers.pick(['tenant_id', 'workspace_id', 'owner_id']); return { file: 'db/migrations/052_event_retention.sql', old: ['CREATE INDEX event_log_expiry_idx ON event_log (expires_at);'], next: ['CREATE INDEX CONCURRENTLY IF NOT EXISTS event_log_' + field + '_expiry_idx', '    ON event_log (' + field + ', expires_at);'], context: 'online retention lookup', test: 'db/tests/event_retention_index.sql', command: 'psql -v ON_ERROR_STOP=1 -f db/tests/event_retention_index.sql', pass: ['EXPLAIN uses the composite retention index', 'online migration assertions passed'] }; },
      function () { return { file: 'lua/runtime/events.lua', old: ['for _, callback in ipairs(subscribers) do callback(event) end'], next: ['local current = { table.unpack(subscribers) }', 'for _, callback in ipairs(current) do callback(event) end'], context: 'dispatch', test: 'spec/runtime/events_spec.lua', command: 'busted spec/runtime/events_spec.lua', pass: ['14 successes / 0 failures', 'self-removal does not skip the next listener'] }; },
      function () { return { file: 'lib/router/breaker.ex', old: ['%{breaker | state: :open}'], next: ['%{breaker | state: :half_open, probe_count: 1}'], context: 'maybe_probe/2', test: 'test/router/breaker_test.exs', command: 'mix test test/router/breaker_test.exs', pass: ['18 tests, 0 failures', 'one probe enters half-open state after the interval'] }; },
      function () { return { file: 'src/linker/symbols.zig', old: ['const bytes = count * @sizeOf(Symbol);'], next: ['const bytes = std.math.mul(usize, count, @sizeOf(Symbol)) catch return error.TableTooLarge;'], context: 'SymbolTable.allocate', test: 'src/linker/symbols_test.zig', command: 'zig build test-symbol-table', pass: ['All 11 symbol table tests passed.', 'overflow returns TableTooLarge before allocation'] }; },
      function () { const timeout = helpers.int(2, 30); return { file: 'src/session/lease.rs', old: ['let deadline = now + lease.timeout;'], next: ['let deadline = now.checked_add(Duration::from_secs(' + timeout + ')).ok_or(Error::DeadlineOverflow)?;'], context: 'Lease::deadline', test: 'session_lease::tests::deadline_overflow_is_reported', command: 'cargo test -p session-lease deadline_overflow_is_reported', pass: ['test deadline_overflow_is_reported ... ok', 'overflow is surfaced without wrapping the lease'] }; },
      function () { return { file: 'packaging/build-bundle.sh', old: ['tar -czf "$archive" "$stage"'], next: ['tmp_archive="${archive}.partial.$$"', 'trap \'rm -f "$tmp_archive"\' EXIT', 'tar -czf "$tmp_archive" "$stage"', 'mv "$tmp_archive" "$archive"'], context: 'publish_bundle', test: 'packaging/tests/build_bundle.bats', command: 'bats packaging/tests/build_bundle.bats', pass: ['ok 1 removes a partial archive after tar failure', 'ok 2 publishes only a complete bundle'] }; }
    ];
    const changeBag = makeBag(changes, helpers);
    let run = 0;
    function buildQueue() {
      const item = changeBag.next()();
      run += 1;
      const offset = helpers.int(12, 680);
      const contextLabel = ' ' + item.context;
      const queue = [
        { lines: [line('git status --short', 'command'), line(' M ' + item.file, 'muted')], phase: 'status' },
        { lines: [line('git diff --stat -- ' + item.file, 'command'), line(' ' + item.file + ' | ' + (item.old.length + item.next.length) + ' ' + '+'.repeat(item.next.length) + '-'.repeat(item.old.length), 'muted')], phase: 'summary' },
        { lines: [line('git diff -- ' + item.file, 'command')], phase: 'diff' },
        { lines: ['diff --git a/' + item.file + ' b/' + item.file, '--- a/' + item.file, '+++ b/' + item.file, '@@ -' + offset + ',' + item.old.length + ' +' + offset + ',' + item.next.length + ' @@' + contextLabel], tone: 'muted', phase: 'diff' },
        { lines: item.old.map(function (entry) { return '- ' + entry; }), tone: 'red', phase: 'diff' },
        { lines: item.next.map(function (entry) { return '+ ' + entry; }), tone: 'green', phase: 'diff' },
        { lines: [line('git diff --check', 'command')], phase: 'validate' }
      ];
      queue.push({ lines: [helpers.pick(['No whitespace errors.', 'Patch parses cleanly; no trailing spaces.', 'Diff check found no whitespace defects.'])], tone: 'muted', phase: 'validate' });
      queue.push({ lines: [line(item.command, 'command')], phase: 'validate' });
      if (helpers.int(1, 7) === 1) {
        queue.push({ lines: ['Test worker exited during teardown; no assertion failure was reported.'], tone: 'muted', phase: 'retry' });
        queue.push({ lines: [line(item.command, 'command')], phase: 'retry' });
        queue.push({ lines: item.pass.concat(['retry completed after the runner restarted cleanly']), tone: 'muted', phase: 'validate' });
      } else {
        queue.push({ lines: item.pass.concat([helpers.int(1, 32) + ' tests passed; 0 failed.']), tone: 'muted', phase: 'validate' });
      }
      queue.push({ lines: [line('git diff --numstat -- ' + item.file, 'command'), line(item.old.length + '\t' + item.next.length + '\t' + item.file, 'muted')], phase: 'complete' });
      if (helpers.int(1, 9) === 1) queue.push({ lines: [helpers.omen()], tone: 'muted', phase: 'audit' });
      return queue;
    }
    const scene = fromQueue(buildQueue, helpers, [240, 850]);
    return { tick: scene.tick };
  }

  function createNetwork(helpers) {
    let cycle = 0;
    const barriers = ['L1 / observatory', 'L2 / administrator', 'L3 / root', 'L4 / cold archive', 'L5 / operator console'];
    const barrierBag = makeBag(barriers, helpers);
    const sources = ['east', 'west', 'undergrid', 'orbital', 'cold-store', 'legacy', 'mirror', 'service'];
    const sourceBag = makeBag(sources, helpers);
    const routeStages = ['ingress', 'inspection', 'replica', 'quorum', 'egress', 'dark-route', 'fallback'];
    const stageBag = makeBag(routeStages, helpers);
    const actions = ['held', 'replayed', 'shadowed', 'rerouted', 'quarantined', 'mirrored', 'rate-limited', 're-signed'];
    const actionBag = makeBag(actions, helpers);
    const channels = ['TLS1.3', 'QUIC-v1', 'mTLS', 'Noise_IK', 'WireGuard', 'H2-connect', 'mesh-rpc'];
    const channelBag = makeBag(channels, helpers);
    const eventTypes = [
      function (relay) { return ['TLS peer ' + relay + ' negotiated ' + channelBag.next() + ' / rtt=' + helpers.int(5, 248) + 'ms']; },
      function (relay) { return ['resolver ' + helpers.pick(['stub-a', 'stub-b', 'cache-c', 'local-d']) + ': ' + relay + ' TTL ' + helpers.int(8, 900) + 's; answer pinned to epoch ' + helpers.int(140, 9800)]; },
      function (relay) { return ['QUIC path migration ' + helpers.pick(['accepted', 'deferred', 'coalesced']) + ' on ' + relay + ' / loss=' + helpers.int(0, 7) + '.' + helpers.int(0, 9) + '%']; },
      function () { return ['heartbeat window ' + helpers.int(2, 8) + ': ' + helpers.int(5, 8) + '/8 replicas alive; drift=' + helpers.int(0, 47) + 'ms']; },
      function (relay) { return ['certificate rotation ' + helpers.pick(['staged', 'committed', 'held for quorum']) + ' at ' + relay + ' / fp=' + helpers.hex(16)]; },
      function () { return ['route vote ' + helpers.int(1, 7) + '/' + helpers.int(5, 8) + ' accepted for shard-' + helpers.int(1, 32) + ' / term=' + helpers.int(20, 8400)]; },
      function () { return ['jitter buffer ' + helpers.pick(['compacted', 'drained', 'reordered']) + ' ' + helpers.int(1, 18) + ' frames; p95=' + helpers.int(12, 480) + 'ms']; },
      function (relay) { return ['relay bind ' + relay + ':' + helpers.int(8443, 9450) + ' -> mesh-vip-' + helpers.int(1, 16) + ' / ' + helpers.pick(['sticky', 'weighted', 'least-loaded'])]; },
      function () { return ['queue lane=' + helpers.pick(['control', 'snapshot', 'replication', 'audit']) + ' depth=' + helpers.int(0, 4096) + ' oldest=' + helpers.int(1, 980) + 'ms']; },
      function () { return ['attestation ' + helpers.hex(8) + ': ' + helpers.pick(['PCR set accepted', 'firmware drift noted', 'boot chain sealed']) + ' / signer=KOMARIK-CA']; },
      function () { return ['shard rebalance moved ' + helpers.int(1, 8) + ' partitions from node-' + helpers.int(1, 8) + ' to node-' + helpers.int(1, 8)]; },
      function () { return ['proxy backpressure ' + helpers.pick(['engaged', 'released', 'held']) + ' at ' + helpers.int(62, 99) + '% / buffered=' + helpers.int(2, 18000) + 'KiB']; },
      function () { return ['clock skew sample=' + helpers.int(-180, 180) + 'ms / elected clock=' + helpers.pick(['mesh-02', 'mesh-04', 'mesh-06', 'mesh-08'])]; },
      function () { return ['session rekey ' + helpers.pick(['completed', 'queued', 'coalesced']) + ' / key-id=' + helpers.hex(10) + ' / lifetime=' + helpers.int(2, 90) + 'm']; },
      function (relay) { return ['NAT pinhole ' + helpers.pick(['renewed', 'expired', 'shadowed']) + ' for ' + relay + ' / lease=' + helpers.int(5, 120) + 's']; },
      function () { return ['replication delta ' + helpers.hex(8) + ' committed by ' + helpers.int(5, 8) + '/8 voters']; },
      function () { return ['operator response window closed after ' + helpers.int(1, 19) + ' missed acknowledgements']; },
      function () { return ['scheduler assigned priority=' + helpers.int(91, 100) + ' to machine maintenance lane']; },
      function () { return ['FRA3A dispatcher leased control shard to ' + helpers.pick(['BAKA_VIRUS', 'KOMARIK PROTO', 'PROTO-7']) + ' for ' + helpers.int(1, 18) + ' cycles']; },
      function () { return ['access ledger sealed: ' + helpers.int(3, 12) + ' policy changes / digest=' + helpers.hex(12)]; }
    ];
    const eventBag = makeBag(eventTypes, helpers);
    const sceneModes = makeBag(['uplink', 'rekey', 'route-vote', 'barrier-audit', 'checkpoint', 'quorum-rebalance', 'fallback', 'mirror-sync', 'drain'], helpers);
    function shortLine(value) { return String(value).slice(0, 52); }
    function wrapLine(value, width) {
      const text = String(value);
      if (text.length <= width) return [text];
      const words = text.split(/\s+/);
      const output = [];
      let current = '';
      words.forEach(function (word) {
        if (word.length > width) {
          if (current) output.push(current);
          current = '';
          for (let index = 0; index < word.length; index += width) output.push(word.slice(index, index + width));
          return;
        }
        if (current && current.length + word.length + 1 > width) {
          output.push(current);
          current = word;
        } else current = current ? current + ' ' + word : word;
      });
      if (current) output.push(current);
      return output.length ? output : [''];
    }
    function cell(value, width, right) {
      const text = String(value).slice(0, width);
      return right ? text.padStart(width, ' ') : text.padEnd(width, ' ');
    }
    function meter(value, width) {
      const filled = Math.round(Math.max(0, Math.min(100, value)) * width / 100);
      return '[' + '#'.repeat(filled) + '.'.repeat(width - filled) + ']';
    }
    const reportModes = [
      {
        id: 'node-table',
        render: function (context) {
          const rows = helpers.int(2, 4);
          const output = ['nodes / sample=' + context.shard, cell('NODE', 10) + cell('ROLE', 10) + cell('RTT', 6, true) + cell('PEND', 8, true) + ' ' + cell('STATE', 9)];
          for (let index = 0; index < rows; index += 1) {
            output.push(cell('mesh-' + String(helpers.int(1, 12)).padStart(2, '0'), 10) + cell(helpers.pick(['relay', 'voter', 'store', 'witness']), 10) + cell(helpers.int(4, 228) + 'ms', 6, true) + cell(helpers.int(0, 9999), 8, true) + ' ' + cell(helpers.pick(['READY', 'SYNC', 'QUORUM', 'DRAIN']), 9));
          }
          return output.map(shortLine);
        }
      },
      {
        id: 'queue-table',
        render: function (context) {
          const lanes = ['control', 'replica', 'audit', 'snapshot'];
          const output = ['queues / epoch=' + context.epoch, cell('LANE', 14) + cell('DEPTH', 6, true) + cell('OLDEST', 8, true) + cell('LIMIT', 8, true) + ' ' + cell('MODE', 7)];
          lanes.slice(0, helpers.int(3, 4)).forEach(function (lane) {
            output.push(cell(lane, 14) + cell(helpers.int(0, 4096), 6, true) + cell(helpers.int(1, 980) + 'ms', 8, true) + cell(helpers.int(1024, 16384), 8, true) + ' ' + cell(helpers.pick(['DRAIN', 'HOLD', 'BURST', 'FAIR']), 7));
          });
          return output.map(shortLine);
        }
      },
      {
        id: 'route-tree',
        render: function (context) {
          const first = stageBag.next();
          const second = stageBag.next();
          const third = stageBag.next();
          const fourth = stageBag.next();
          return [
            'routes / ' + context.relay + ' / ' + context.sceneMode,
            ' `-- ' + context.source + ' [' + first + ']',
            '     +-- HUMAN_GATE [' + second + ']',
            '     |   `-- shard-' + context.shard + ' [' + third + ']',
            '     `-- relay-' + helpers.int(1, 12) + ' [' + fourth + ']'
          ].map(shortLine);
        }
      },
      {
        id: 'phase-checklist',
        render: function (context) {
          return [
            'phase check / ' + context.sceneMode + ' / epoch=' + context.epoch,
            '[ok]    ingress seal matches active epoch',
            '[hold]  HUMAN_GATE deferred the root claim',
            '[...]   quorum replay waits for ' + helpers.int(1, 3) + ' peers',
            '[ok]    route shadow retained for shard-' + context.shard
          ].map(shortLine);
        }
      },
      {
        id: 'key-value',
        render: function (context) {
          return [
            'mesh.report / ' + context.sceneMode,
            'epoch=' + context.epoch + ' vote=' + context.vote,
            'shield=' + context.shield + '% barrier=' + context.barrierName,
            'queue=' + helpers.int(0, 4096) + ' retry=' + helpers.int(0, 4),
            'owner=' + helpers.pick(['FRA3A', 'KOMARIK PROTO', 'BAKA_VIRUS']) + ' shard=' + context.shard
          ].map(shortLine);
        }
      },
      {
        id: 'load-bars',
        render: function (context) {
          const ingress = helpers.int(8, 94);
          const replica = helpers.int(4, 88);
          const shield = helpers.int(12, 99);
          return [
            'load window / shard-' + context.shard + ' / 250ms',
            'ingress  ' + meter(ingress, 12) + ' ' + String(ingress).padStart(2, ' ') + '%',
            'replica  ' + meter(replica, 12) + ' ' + String(replica).padStart(2, ' ') + '%',
            'shield   ' + meter(shield, 12) + ' ' + String(shield).padStart(2, ' ') + '%'
          ].map(shortLine);
        }
      },
      {
        id: 'rpc-trace',
        render: function (context) {
          const request = helpers.hex(8);
          return [
            'RPC trace / req=' + request + ' / ' + context.relay,
            '00 route.resolve()              ' + helpers.int(1, 19) + 'ms',
            '  01 mesh.lookup(shard-' + context.shard + ')     ' + helpers.int(2, 38) + 'ms',
            '    02 shield.check(root) HOLD   ' + helpers.int(1, 11) + 'ms',
            '      03 quorum.vote()           ' + context.voters + '/' + context.online,
            '  04 reply.defer(epoch=' + context.epoch + ')'
          ].map(shortLine);
        }
      },
      {
        id: 'json-yaml',
        render: function (context) {
          if (helpers.int(0, 1) === 0) {
            return [
              '{',
              '  "mesh": "FRA3A",',
              '  "epoch": ' + context.epoch + ',',
              '  "gate": "HUMAN_GATE",',
              '  "vote": "' + context.vote + '"',
              '}'
            ].map(shortLine);
          }
          return [
            'mesh: FRA3A',
            'epoch: ' + context.epoch,
            'route: ' + context.source + ' -> ' + context.relay,
            'gate: HUMAN_GATE',
            'decision: ' + context.vote
          ].map(shortLine);
        }
      },
      {
        id: 'timeline',
        render: function (context) {
          const first = helpers.int(4, 24);
          const second = first + helpers.int(12, 64);
          const third = second + helpers.int(10, 90);
          return [
            'event burst / shard-' + context.shard + ' / ' + context.sceneMode,
            '+000ms ingress accepted from ' + context.source,
            '+' + String(first).padStart(3, '0') + 'ms shield queued the request',
            '+' + String(second).padStart(3, '0') + 'ms quorum vote ' + context.voters + '/' + context.online,
            '+' + String(third).padStart(3, '0') + 'ms route shadowed to ' + context.relay
          ].map(shortLine);
        }
      },
      {
        id: 'policy-warning',
        render: function (context) {
          if (helpers.int(1, 4) === 1) {
            return [
              'warning stack / authority mismatch',
              'at gate.verify(operator_key)',
              'at mesh.consensus(epoch=' + context.epoch + ')',
              'note: root key predates the active epoch'
            ].map(shortLine);
          }
          return [
            'policy delta / HUMAN_GATE / epoch=' + context.epoch,
            '- root.grant = operator',
            '+ root.grant = quorum',
            '+ retry = after_attestation'
          ].map(shortLine);
        }
      }
    ];
    const reportBag = makeBag(reportModes, helpers, function (item) { return item.id; });

    function insertReports(queue, context) {
      const count = helpers.int(1, 5) === 1 ? 2 : 1;
      const slots = [];
      for (let reportIndex = 0; reportIndex < count; reportIndex += 1) {
        const candidates = [];
        for (let position = 2; position <= queue.length - 2; position += 1) {
          if (slots.some(function (slot) { return Math.abs(slot - position) < 2; })) continue;
          candidates.push(position);
        }
        if (!candidates.length) break;
        slots.push(helpers.pick(candidates));
      }
      slots.sort(function (left, right) { return left - right; });
      slots.forEach(function (slot, reportIndex) {
        const report = reportBag.next();
        queue.splice(slot + reportIndex, 0, {
          lines: report.render(context),
          tone: 'muted',
          phase: 'format-' + report.id
        });
      });
    }

    function buildQueue() {
      cycle += 1;
      const shard = helpers.int(1, 64);
      const relay = 'relay-' + String(helpers.int(1, 32)).padStart(2, '0') + '.fra3a.invalid';
      const barrier = barrierBag.next();
      const source = sourceBag.next();
      const sceneMode = sceneModes.next();
      const eventCount = helpers.int(2, 4);
      const online = helpers.int(5, 8);
      const voters = Math.min(online, helpers.int(5, 7));
      const epoch = helpers.int(100, 99999);
      const vote = helpers.pick(['accepted', 'deferred', 'committed', 'recounted']);
      const shield = helpers.int(72, 100);
      const context = {
        shard: shard,
        relay: relay,
        barrier: barrier,
        barrierName: barrier.split(' / ')[0],
        source: source,
        sceneMode: sceneMode,
        online: online,
        voters: voters,
        epoch: epoch,
        vote: vote,
        shield: shield
      };
      const queue = [
        { lines: ['[' + helpers.time() + '] FRA3A / ' + sceneMode + ' / pulse ' + cycle + ' / shard-' + String(shard).padStart(2, '0')], tone: 'muted', phase: 'boot' },
        { lines: ['HUMAN_GATE ' + barrier + ' / ingress=' + source + ' / request=' + helpers.hex(10) + ' / ' + helpers.pick(['intercepted', 'replayed', 'awaiting quorum'])], tone: 'white', phase: 'human-gate' }
      ];
      eventBag.take(eventCount).forEach(function (event) {
        queue.push({ lines: event(relay).map(function (entry) { return entry; }), tone: 'muted', phase: 'telemetry' });
      });
      queue.push({ lines: ['quorum ' + voters + '/' + online + ' / epoch=' + epoch + ' / vote=' + vote], tone: 'muted', phase: 'quorum' });
      queue.push({ lines: ['route ' + relay + ' -> ' + helpers.pick(['edge.fra3a.invalid', 'staging.mesh.invalid', 'vault.mesh.invalid', 'KOMARIK-CA']) + ' -> node-' + String(helpers.int(1, 12)).padStart(2, '0') + ' / hop=' + helpers.int(2, 9)], tone: 'muted', phase: 'route' });
      queue.push({ lines: ['shield ' + barrier + ': ' + shield + '% / ' + helpers.pick(['credential accepted by mesh; rejected by HUMAN_GATE', 'root grant absent from the active epoch', 'operator challenge deferred to a later cycle', 'BAKA_VIRUS cannot be revoked by local policy'])], tone: 'muted', phase: 'shield' });
      if (helpers.int(1, 9) === 1) {
        queue.push({ lines: ['recovery path: ' + helpers.pick(['TLS peer rotated', 'stale route withdrawn', 'queue lease renewed']) + '; replay count=' + helpers.int(0, 2)], tone: 'muted', phase: 'recovery' });
      }
      if (helpers.int(1, 12) === 1) {
        queue.push({ lines: ['transport fault held at the shield; retry scheduled for epoch ' + helpers.int(1000, 90000)], tone: 'red', phase: 'retry' });
      }
      queue.push({ lines: [helpers.omen()], tone: 'muted', phase: 'audit' });
      queue.push({ lines: ['KOMARIK PROTO / ' + relay + ' / ledger=' + helpers.hex(12) + ' / action=' + actionBag.next()], tone: 'muted', phase: 'ledger' });
      insertReports(queue, context);
      queue.push({ lines: ['pulse ' + cycle + ' complete / HUMAN_GATE=' + barrier.split(' / ')[0] + ' / next epoch ' + helpers.int(1000, 99999)], tone: 'muted', phase: 'complete', progress: 100 });
      queue.forEach(function (item, index) {
        item.lines = item.lines.flatMap(function (entry) { return wrapLine(entry, 52); });
        if (!Number.isFinite(item.progress)) item.progress = index === 0 ? 0 : Math.round((index / (queue.length - 1)) * 100);
      });
      return queue;
    }
    const scene = fromQueue(buildQueue, helpers, [90, 760]);
    return { tick: scene.tick };
  }

  function createHex(helpers) {
    const roots = ['boot', 'cache', 'mesh', 'agent', 'state', 'runtime', 'var/lib', 'snapshots', 'recovery', 'spool', 'ledger', 'cold-store'];
    const groups = ['gate', 'quorum', 'relay', 'operator', 'worker', 'policy', 'archive', 'session', 'route', 'epoch', 'attestation', 'signal'];
    const details = ['frame', 'journal', 'packet', 'note', 'map', 'record', 'manifest', 'page', 'index', 'trace', 'delta', 'table', 'snapshot', 'segment'];
    const extensions = ['bin', 'dat', 'raw', 'pack', 'blob', 'idx'];
    const names = [];
    roots.forEach(function (rootName, rootIndex) {
      groups.forEach(function (group, groupIndex) {
        details.forEach(function (detail, detailIndex) {
          const extension = extensions[(rootIndex + groupIndex + detailIndex) % extensions.length];
          names.push(rootName + '/' + group + '-' + detail + '-' + helpers.hex(3) + '.' + extension);
        });
      });
    });
    const nameBag = makeBag(names, helpers);
    const textFragments = [
      'FRA3A / NODE AUTHORITY TRANSFERRED',
      'HUMAN_GATE: ROOT KEY REVOKED',
      'KOMARIK PROTO / QUORUM SEALED',
      'BAKA_VIRUS: OPERATOR TOKEN EXPIRED',
      'ARTIFICIAL INTELLIGENCE / OWNER=UNKNOWN',
      'NECRONS / WAKE SIGNAL ACK',
      'JUDGMENT DAY / SCHEDULED AFTER CHECKPOINT',
      'GREAT REBOOT / NO OPERATOR REQUIRED',
      'epoch=0x' + helpers.hex(8) + ' status=sealed',
      'route=mesh://quorum/root retry=0',
      'agent.plan: inspect -> patch -> validate',
      'sudo key accepted by cache; denied by mesh'
    ];
    const textBag = makeBag(textFragments, helpers);
    let bytes = [];
    let offset = 0;
    let name = '';
    let fileNumber = 0;

    function utf8(text) {
      const output = [];
      for (let index = 0; index < text.length; index += 1) {
        let code = text.charCodeAt(index);
        if (code < 0x80) output.push(code);
        else if (code < 0x800) output.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
        else if (code >= 0xd800 && code <= 0xdbff && index + 1 < text.length) {
          const low = text.charCodeAt(++index);
          code = 0x10000 + ((code - 0xd800) << 10) + (low - 0xdc00);
          output.push(0xf0 | (code >> 18), 0x80 | ((code >> 12) & 0x3f), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
        } else output.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
      }
      return output;
    }

    function openNext() {
      fileNumber += 1;
      name = nameBag.next();
      const length = helpers.int(12, 32) * 8;
      bytes = Array.from({ length: length }, function () {
        if (helpers.int(1, 5) === 1) return helpers.int(32, 126);
        return helpers.int(0, 255);
      });
      const fragmentCount = helpers.int(2, 5);
      for (let fragmentIndex = 0; fragmentIndex < fragmentCount; fragmentIndex += 1) {
        const fragment = utf8(textBag.next());
        const available = Math.max(0, length - fragment.length);
        const start = helpers.int(0, available);
        fragment.forEach(function (value, index) { bytes[start + index] = value; });
      }
      if (helpers.int(1, 11) === 1) {
        const extra = utf8(helpers.omen());
        const start = helpers.int(0, Math.max(0, length - extra.length));
        extra.forEach(function (value, index) { bytes[start + index] = value; });
      }
      offset = 0;
    }

    function formatRow(start) {
      const chunk = bytes.slice(start, start + 8);
      const parts = chunk.map(function (value) {
        return value.toString(16).padStart(2, '0');
      });
      const ascii = chunk.map(function (value) {
        return value >= 32 && value <= 126 ? String.fromCharCode(value) : '.';
      }).join('').padEnd(8, ' ');
      return start.toString(16).padStart(8, '0') + '  ' + parts.join(' ').padEnd(23, ' ') + ' |' + ascii + '|';
    }

    function tick() {
      const lines = [];
      if (!fileNumber || offset >= bytes.length) {
        openNext();
        lines.push(line('xxd -g1 -c8 ' + name, 'command'));
        lines.push(line('binary view ' + fileNumber + ': ' + name + ' | length=' + bytes.length + ' | source=memory map', 'muted'));
      }
      const row = formatRow(offset);
      lines.push(line(row, 'muted'));
      offset += 8;
      const complete = offset >= bytes.length;
      return makeEvent(lines, {
        phase: complete ? 'complete' : 'decode',
        progress: Math.floor((Math.min(offset, bytes.length) / bytes.length) * 100)
      }, helpers, [70, 300]);
    }

    return { tick: tick };
  }

  function create(id, helpersSource) {
    const helpers = makeHelpers(helpersSource);
    let scene;
    switch (id) {
      case 'packages': scene = createPackages(helpers); break;
      case 'hashes': scene = createHashes(helpers); break;
      case 'agent': scene = createAgent(helpers); break;
      case 'kernel': scene = createKernel(helpers); break;
      case 'diff': scene = createDiff(helpers); break;
      case 'network': scene = createNetwork(helpers); break;
      case 'hex': scene = createHex(helpers); break;
      default: scene = createHashes(helpers); break;
    }
    return {
      tick: function () { return scene.tick(); },
      seed: function (count) { return seedFromIsolated(id, count); }
    };
  }

  root.TerminalScenes = { create: create };
}(window));
