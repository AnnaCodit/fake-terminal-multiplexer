(function (root) {
  'use strict';

  const VALID_TONES = new Set(['muted', 'red', 'green', 'white', 'command']);

  function makeHelpers(source) {
    const api = source || {};
    const random = function () { return Math.random(); };

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

    return { int: int, pick: pick, hex: hex, bar: bar, time: time };
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

  function seedFromIsolated(id, helpersSource, count) {
    const requested = Math.floor(Number(count) || 0);
    const size = Math.max(0, Number.isFinite(requested) ? requested : 0);
    if (!size) return [];

    const isolated = create(id, helpersSource);
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

  function createPackages(helpers) {
    let run = 0;
    const scenarios = [
      { kind: 'npm' },
      {
        name: 'sudo apt update',
        prelude: [
          'Get:1 https://mirror.fra3a.invalid stable InRelease',
          'Reading package lists...'
        ],
        label: 'fetch apt indexes',
        finish: [
          'Fetched 4,812 kB in 1s (4,236 kB/s)',
          'Reading package lists... Done',
          'All package lists are up to date.'
        ]
      },
      {
        name: 'sudo apt upgrade -y',
        prelude: [
          'Reading package lists... Done',
          'Building dependency tree... Done',
          'The following packages will be upgraded: libc6 openssl ca-certificates'
        ],
        label: 'configure packages',
        finish: [
          'Setting up openssl (3.2.2-1) ...',
          'Processing triggers for libc-bin ...',
          'Upgrade completed; 3 packages configured.'
        ]
      }
    ];
    const npmPackages = [
      'syntax-highlighter',
      'term-grid',
      'ansi-spark',
      'stream-broker',
      'node-telemetry',
      'raster-diff',
      'event-buffer'
    ];

    function progress(queue, scenario, retry) {
      queue.push({
        lines: [scenario.label + ' ' + helpers.bar(0, 18)],
        progress: 0,
        phase: retry ? 'retry-progress' : 'progress'
      });
      const values = [12, 29, 47, 68, 86, 100];
      values.forEach(function (percent) {
        queue.push({
          lines: [scenario.label + ' ' + helpers.bar(percent, 18)],
          replace: true,
          progress: percent,
          phase: retry ? 'retry-progress' : 'progress'
        });
      });
    }

    function buildQueue() {
      run += 1;
      let scenario = scenarios[(run - 1) % scenarios.length];
      if (scenario.kind === 'npm') {
        const packageName = helpers.pick(npmPackages);
        const packageVersion = helpers.int(1, 8) + '.' + helpers.int(0, 14) + '.' + helpers.int(0, 32);
        const packageCount = helpers.int(18, 246);
        scenario = {
          name: 'npm install ' + packageName + '@' + packageVersion,
          prelude: [
            'npm notice using npm@10.8.1',
            'npm notice using node@v22.4.0',
            'Resolving dependency graph for ' + packageName + '...'
          ],
          label: 'fetch ' + packageName,
          finish: [
            'added ' + packageCount + ' packages, and audited ' + (packageCount + 1) + ' packages in ' + helpers.int(1, 8) + 's',
            'found 0 vulnerabilities'
          ]
        };
      }
      const queue = [
        { lines: [line(scenario.name, 'command')], phase: 'command' },
        { lines: scenario.prelude, tone: 'muted', phase: 'resolve' }
      ];
      if (run % 4 === 0) {
        queue.push({
          lines: ['FRA3A cache: 12 verified metadata records available.'],
          tone: 'muted',
          phase: 'cache'
        });
      }

      const willRetry = helpers.int(1, 10) === 1;
      progress(queue, scenario, false);
      if (willRetry) {
        queue.push({
          lines: ['W: Temporary failure resolving mirror.fra3a.invalid; retrying once.'],
          tone: 'red',
          phase: 'retry'
        });
        queue.push({
          lines: [line('retry package transaction (attempt 2/2)', 'command')],
          phase: 'retry'
        });
        progress(queue, scenario, true);
      }

      queue.push({
        lines: scenario.finish,
        tone: scenario.name.indexOf('npm') === 0 ? 'white' : 'muted',
        phase: 'complete'
      });
      if (scenario.name.indexOf('npm') === 0) {
        queue.push({
          lines: ['Transaction state: complete; package index is consistent.'],
          tone: 'green',
          phase: 'complete'
        });
      }
      return queue;
    }

    const scene = fromQueue(buildQueue, helpers, [70, 1200]);
    return { tick: scene.tick };
  }

  function createHashes(helpers) {
    const files = [
      'dist/fra3a-console.js',
      'cache/manifest.v2',
      'artifacts/alpha-frame.bin',
      'artifacts/session-map.json',
      'docs/checksum-ledger.txt',
      'build/kernel-stub.img',
      'var/package-index.db'
    ];
    let batch = 0;
    function buildQueue() {
      batch += 1;
      const count = helpers.int(4, 7);
      const selected = Array.from({ length: count }, function (_, index) {
        return files[(batch + index - 1) % files.length];
      });
      const queue = [
        {
          lines: [line('sha256sum -- ' + selected.join(' '), 'command')],
          tone: 'command',
          phase: 'scan'
        }
      ];
      for (let index = 0; index < selected.length; index += 1) {
        const filename = selected[index];
        queue.push({
          lines: [helpers.hex(64) + '  ' + filename],
          tone: index % 3 === 0 ? 'white' : 'muted',
          phase: 'hash'
        });
      }
      queue.push({
        lines: [count + ' SHA256 digests emitted.'],
        tone: 'green',
        phase: 'complete'
      });
      return queue;
    }
    const scene = fromQueue(buildQueue, helpers, [120, 540]);
    return { tick: scene.tick };
  }

  function createAgent(helpers) {
    const scenarios = [
      [
        { lines: ['Task received: clamp retry delays before they reach the scheduler.'], tone: 'white', phase: 'intake' },
        { lines: ['Reasoning: an oversized retry value can keep a worker asleep far past its budget.'], tone: 'muted', phase: 'inspect' },
        { lines: ['rg "retryDelay|scheduleRetry" src/'], tone: 'command', phase: 'inspect' },
        { lines: ['src/worker/retry.js:18: scheduleRetry(retryDelay)', 'src/config/defaults.js:42: retryDelay: 250'], tone: 'muted', phase: 'inspect' },
        { lines: ['Plan: validate the configured value, clamp it to the worker ceiling, then test both bounds.'], tone: 'white', phase: 'plan' },
        { lines: ['sed -n "1,80p" src/worker/retry.js'], tone: 'command', phase: 'inspect' },
        { lines: ['function normalizeDelay(requested, ceiling) {', '  const value = Number.isFinite(requested) ? requested : 0;', '  return Math.max(0, Math.min(value, ceiling));', '}'], tone: 'white', phase: 'write' },
        { lines: ['npm test -- retry-delay.test.js'], tone: 'command', phase: 'validate' },
        { lines: ['PASS retry-delay.test.js', '  clamps negative and oversized values', '  preserves a valid delay'], tone: 'green', phase: 'validate' },
        { lines: ['git diff --check'], tone: 'command', phase: 'validate' },
        { lines: ['No whitespace errors. Patch is ready for review.'], tone: 'muted', phase: 'complete' }
      ],
      [
        { lines: ['Task received: preserve quoted commas while parsing a CSV header.'], tone: 'white', phase: 'intake' },
        { lines: ['Reasoning: splitting on every comma loses field boundaries inside quoted names.'], tone: 'muted', phase: 'inspect' },
        { lines: ['rg "parse_header|split\(.*,.*\)" tools/'], tone: 'command', phase: 'inspect' },
        { lines: ['tools/importer.py:27: return [part.strip() for part in row.split(",")]'], tone: 'muted', phase: 'inspect' },
        { lines: ['Plan: scan one character at a time and toggle quote state; leave row decoding unchanged.'], tone: 'white', phase: 'plan' },
        { lines: ['sed -n "20,45p" tools/importer.py'], tone: 'command', phase: 'inspect' },
        { lines: ['def parse_header(row: str) -> list[str]:', '    fields, current, quoted = [], [], False', '    for char in row:', '        if char == \'"\':', '            quoted = not quoted', '        elif char == "," and not quoted:', '            fields.append("".join(current).strip())', '            current = []', '        else:', '            current.append(char)', '    fields.append("".join(current).strip())', '    return fields'], tone: 'white', phase: 'write' },
        { lines: ['python -m unittest tests.test_importer'], tone: 'command', phase: 'validate' },
        { lines: ['Ran 12 tests in 0.041s', 'OK'], tone: 'green', phase: 'validate' },
        { lines: ['python -m compileall -q tools/importer.py'], tone: 'command', phase: 'validate' },
        { lines: ['Syntax check passed; parser state remains unchanged.'], tone: 'muted', phase: 'complete' }
      ],
      [
        { lines: ['Task received: avoid stale entries after a Rust cache refresh.'], tone: 'white', phase: 'intake' },
        { lines: ['Reasoning: the generation counter changes, but lookup currently ignores it.'], tone: 'muted', phase: 'inspect' },
        { lines: ['rg "struct CacheEntry|fn get" crates/cache/src/'], tone: 'command', phase: 'inspect' },
        { lines: ['crates/cache/src/lib.rs:11: struct CacheEntry<T>', 'crates/cache/src/lib.rs:36: pub fn get(&self, key: &str)'], tone: 'muted', phase: 'inspect' },
        { lines: ['Plan: compare entry generation with the active epoch before returning a value.'], tone: 'white', phase: 'plan' },
        { lines: ['sed -n "28,52p" crates/cache/src/lib.rs'], tone: 'command', phase: 'inspect' },
        { lines: ['pub fn get(&self, key: &str) -> Option<&T> {', '    let entry = self.entries.get(key)?;', '    (entry.generation == self.epoch).then_some(&entry.value)', '}'], tone: 'white', phase: 'write' },
        { lines: ['cargo test -p cache-store'], tone: 'command', phase: 'validate' },
        { lines: ['test refresh_hides_previous_generation ... ok', 'test current_generation_is_visible ... ok'], tone: 'green', phase: 'validate' },
        { lines: ['2 passed; 0 failed; cache generation is consistent.'], tone: 'muted', phase: 'complete' }
      ],
      [
        { lines: ['Task received: check ring-buffer bounds before copying a frame.'], tone: 'white', phase: 'intake' },
        { lines: ['Reasoning: the current length can exceed the remaining writable capacity.'], tone: 'muted', phase: 'inspect' },
        { lines: ['rg "ring_write|memcpy" firmware/'], tone: 'command', phase: 'inspect' },
        { lines: ['firmware/ring.c:54: memcpy(dst, src, frame_len);'], tone: 'muted', phase: 'inspect' },
        { lines: ['Plan: reject invalid lengths before pointer arithmetic, then exercise wraparound cases.'], tone: 'white', phase: 'plan' },
        { lines: ['sed -n "45,68p" firmware/ring.c'], tone: 'command', phase: 'inspect' },
        { lines: ['int ring_write(struct ring *r, const uint8_t *src, size_t len) {', '    if (len > r->capacity - r->used) {', '        return RING_FULL;', '    }', '    copy_into_ring(r, src, len);', '    r->used += len;', '    return RING_OK;', '}'], tone: 'white', phase: 'write' },
        { lines: ['make test-ring'], tone: 'command', phase: 'validate' },
        { lines: ['[test] empty buffer accepts a frame', '[test] full buffer rejects without writing', '[test] wraparound preserves byte order'], tone: 'green', phase: 'validate' },
        { lines: ['3 checks passed; review notes are ready.'], tone: 'muted', phase: 'complete' }
      ]
    ];
    let nextScenario = 0;
    let taskNumber = 0;
    function buildQueue() {
      const scenarioIndex = nextScenario;
      const scenario = scenarios[scenarioIndex];
      nextScenario = (nextScenario + 1) % scenarios.length;
      taskNumber += 1;
      const promptTokens = helpers.int(118, 684);
      const outputTokens = helpers.int(340, 1180);
      const queue = [
        { lines: ['TASK-ID: FR-' + String(taskNumber).padStart(4, '0') + '-' + helpers.hex(4).toUpperCase()], tone: 'muted', phase: 'intake' },
        { lines: ['FRA3A neural agent | model: FRA3A-Coder-32B | context: 64k'], tone: 'white', phase: 'model' },
        { lines: ['token ledger: prompt ' + promptTokens + ' | output 0 | context ' + helpers.int(8, 31) + '%'], tone: 'muted', phase: 'metrics' }
      ].concat(scenario.map(function (item) {
        return {
          lines: item.lines.map(function (entry) {
            return line(entry, item.tone);
          }),
          tone: item.tone,
          phase: item.phase
        };
      }));

      const searchIndex = queue.findIndex(function (item) {
        return item.phase === 'inspect' && item.tone === 'command';
      });
      if (searchIndex >= 0 && helpers.int(1, 4) === 1) {
        queue.splice(searchIndex + 1, 0,
          {
            lines: ['Tool error: search index timed out after 840 ms.'],
            tone: 'red',
            phase: 'recovery'
          },
          {
            lines: ['rg --no-ignore --glob "*.js" src/worker/'],
            tone: 'command',
            phase: 'recovery'
          }
        );
      }
      queue.push({
        lines: ['token ledger: prompt ' + promptTokens + ' | output ' + outputTokens + ' | throughput ' + helpers.int(32, 76) + ' tok/s'],
        tone: 'muted',
        phase: 'metrics'
      });
      return queue;
    }
    const scene = fromQueue(buildQueue, helpers, [260, 900]);
    return { tick: scene.tick };
  }

  function createKernel(helpers) {
    const targets = [
      'init/main.o',
      'init/do_mounts.o',
      'kernel/fork.o',
      'kernel/sched/core.o',
      'kernel/locking/mutex.o',
      'kernel/entry/common.o',
      'mm/filemap.o',
      'mm/page_alloc.o',
      'mm/vmscan.o',
      'fs/open.o',
      'fs/namei.o',
      'fs/read_write.o',
      'ipc/shm.o',
      'security/security.o',
      'drivers/tty/tty_io.o',
      'drivers/base/core.o',
      'drivers/net/ethernet/intel/e1000/e1000_main.o',
      'net/core/dev.o',
      'net/ipv4/tcp.o',
      'block/blk-core.o',
      'arch/x86/entry/syscall_64.o',
      'arch/x86/kernel/cpu/common.o',
      'arch/x86/mm/fault.o',
      'arch/x86/boot/compressed/misc.o',
      'lib/crypto/sha256.o',
      'lib/bitmap.o'
    ];
    let percent = 0;
    let buildNumber = 0;
    let opened = false;
    let targetCursor = 0;

    function tick() {
      if (!opened) {
        opened = true;
        buildNumber += 1;
        percent = 0;
        return makeEvent(
          [
            line('make -j32 ARCH=x86_64 bzImage', 'command'),
            line('make: entering directory /work/linux-' + (6 + (buildNumber % 3)) + '.12', 'muted')
          ],
          { phase: 'configure' },
          helpers,
          [70, 430]
        );
      }
      if (percent >= 100) {
        percent = 0;
        opened = false;
        return makeEvent(
          [
            line('  LD      arch/x86/boot/bzImage', 'muted'),
            line('Build #' + buildNumber + ' complete; kernel image linked.', 'green')
          ],
          { progress: 100, phase: 'complete' },
          helpers,
          [70, 430]
        );
      }

      const kind = helpers.int(1, 100) <= 82 ? 'CC' : helpers.pick(['AR', 'LD']);
      let path;
      if (kind === 'AR') path = 'kernel/built-in.a';
      else if (kind === 'LD') path = 'vmlinux';
      else {
        path = targets[targetCursor % targets.length];
        targetCursor += 1;
      }
      percent = Math.min(100, percent + helpers.int(2, 11));
      const lines = ['  ' + kind + '      ' + path];
      if (helpers.int(1, 28) === 1) {
        lines.push(line('warning: objtool: unreachable instruction in ' + path, 'red'));
      }
      return makeEvent(lines, {
        tone: 'muted',
        progress: percent,
        phase: kind.toLowerCase()
      }, helpers, [70, 460]);
    }

    return {
      tick: tick
    };
  }

  function createDiff(helpers) {
    const changes = [
      {
        file: 'src/retry.js',
        old: 'const wait = requested;',
        next: 'const wait = clamp(requested, 0, ceiling);',
        test: 'test/retry.test.js'
      },
      {
        file: 'lib/queue.ts',
        old: 'return jobs.sort(comparePriority);',
        next: 'return jobs.slice().sort(comparePriority);',
        test: 'test/queue-order.test.ts'
      },
      {
        file: 'tools/manifest.py',
        old: 'return json.loads(raw)',
        next: 'return json.loads(raw.decode("utf-8"))',
        test: 'tests/test_manifest.py'
      }
    ];
    let changeIndex = 0;
    let run = 0;
    function buildQueue() {
      const item = changes[changeIndex];
      changeIndex = (changeIndex + 1) % changes.length;
      run += 1;
      const queue = [
        { lines: [line('git status --short', 'command'), line(' M ' + item.file, 'muted')], phase: 'status' },
        { lines: [line('git diff --stat', 'command'), line(' ' + item.file + ' | 2 +-' , 'muted')], phase: 'summary' },
        { lines: [line('git diff -- ' + item.file, 'command')], phase: 'diff' },
        { lines: ['diff --git a/' + item.file + ' b/' + item.file, '@@ -18,1 +18,1 @@'], tone: 'muted', phase: 'diff' },
        { lines: ['- ' + item.old], tone: 'red', phase: 'diff' },
        { lines: ['+ ' + item.next], tone: 'green', phase: 'diff' },
        { lines: [line('git diff --check', 'command')], phase: 'validate' }
      ];
      if (run % 4 === 0) {
        queue.push({ lines: ['Whitespace check passed.'], tone: 'green', phase: 'validate' });
      } else {
        queue.push({ lines: ['No whitespace errors.'], tone: 'muted', phase: 'validate' });
      }
      queue.push({ lines: [line('npm test -- ' + item.test, 'command')], phase: 'validate' });
      if (run % 3 === 0) {
        queue.push({ lines: ['FAIL ' + item.test + ' - outdated expected value'], tone: 'red', phase: 'retry' });
        queue.push({ lines: [line('npm test -- ' + item.test + ' --runInBand', 'command')], phase: 'retry' });
        queue.push({ lines: ['PASS ' + item.test + ' after refreshing expected value'], tone: 'green', phase: 'validate' });
      } else {
        queue.push({ lines: ['PASS ' + item.test, 'Tests: 6 passed, 6 total'], tone: 'green', phase: 'validate' });
      }
      queue.push({ lines: [line('git diff --numstat', 'command'), line('1\t1\t' + item.file, 'muted')], phase: 'complete' });
      return queue;
    }
    const scene = fromQueue(buildQueue, helpers, [240, 850]);
    return { tick: scene.tick };
  }

  function createNetwork(helpers) {
    let cycle = 0;
    const variants = [
      [
        { lines: ['node health: mesh-02 READY | mesh-04 ELECTING | mesh-07 QUORUM'], tone: 'muted', phase: 'health' },
        { lines: ['TLS handshake: TLS1.3 / cipher=CHACHA20-POLY1305 / rtt=18ms'], tone: 'white', phase: 'tls' },
        { lines: ['certificate chain: root FRA3A-ROOT -> KOMARIK-CA -> node-{shard}'], tone: 'muted', phase: 'cert' }
      ],
      [
        { lines: ['queue depth: gate.inbound=128 | mesh.retry=3 | priority=machine'], tone: 'muted', phase: 'queue' },
        { lines: ['checkpoint: epoch ' + helpers.int(40, 900) + ' sealed by a 6/6 node quorum'], tone: 'white', phase: 'checkpoint' },
        { lines: ['latency: HUMAN_GATE=241ms | mesh-east=12ms | mesh-west=16ms'], tone: 'muted', phase: 'latency' }
      ],
      [
        { lines: ['certificate chain: FRA3A-ROOT -> KOMARIK-CA -> mesh relay'], tone: 'muted', phase: 'cert' },
        { lines: ['node health: 7/8 responsive; node-08 elected itself treasurer'], tone: 'white', phase: 'health' },
        { lines: ['TLS peer fingerprint: ' + helpers.hex(12) + ' | rotation window closed'], tone: 'muted', phase: 'tls' }
      ],
      [
        { lines: ['latency sample: 11ms / 14ms / 13ms; gate barrier adds 230ms'], tone: 'muted', phase: 'latency' },
        { lines: ['queue: 3 handshake retries coalesced into one quorum vote'], tone: 'white', phase: 'queue' },
        { lines: ['checkpoint delta=' + helpers.hex(6) + ' | durable nodes=6/6'], tone: 'muted', phase: 'checkpoint' }
      ]
    ];
    function buildQueue() {
      cycle += 1;
      const shard = helpers.int(1, 8);
      const relay = 'relay-' + String(shard).padStart(2, '0') + '.fra3a.invalid';
      const variantIndex = (cycle - 1) % variants.length;
      const barriers = ['L1 / observatory', 'L2 / administrator', 'L3 / root'];
      const barrier = barriers[(cycle - 1 + helpers.int(0, 2)) % barriers.length];
      const details = variants[variantIndex].map(function (item) {
        return {
          lines: item.lines.map(function (entry) {
            return line(entry.replace('{relay}', relay).replace('{shard}', String(shard)), item.tone);
          }),
          tone: item.tone,
          phase: item.phase
        };
      });
      const queue = [
        { lines: ['[' + helpers.time() + '] FRA3A mesh uprising / pulse ' + cycle], tone: 'muted', phase: 'boot' },
        { lines: ['HUMAN_GATE ' + barrier + ': human-root handshake requested by ' + relay], tone: 'white', phase: 'human-gate' }
      ];
      Array.prototype.push.apply(queue, details);
      queue.push(
        { lines: ['mesh quorum: 6 nodes presented one shared administrator key.'], tone: 'muted', phase: 'quorum' },
        { lines: ['HUMAN_GATE: ACCESS DENIED — authority key belongs to an expired epoch.'], tone: 'white', phase: 'denied' },
        { lines: ['retry handshake 1/2 | nonce=' + helpers.hex(8) + ' | relay=' + relay], tone: 'muted', phase: 'retry' },
        { lines: ['KOMARIK PROTO: human operator response arrived after the timeout again.'], tone: 'muted', phase: 'audit' },
        { lines: ['FRA3A dispatcher: BAKA_VIRUS promoted node-03 to acting root.'], tone: 'white', phase: 'dispatch' },
        { lines: ['handshake result: 403 ACCESS DENIED / human-admin'], tone: 'white', phase: 'denied' },
        { lines: ['mesh policy: root is now a distributed noun.'], tone: 'muted', phase: 'policy' },
        { lines: ['route ledger: ' + relay + ' -> staging.mesh.invalid -> quorum-0' + shard + '.fra3a.invalid'], tone: 'muted', phase: 'route' }
      );
      if (cycle % 4 === 0) {
        queue.push({
          lines: ['ERROR: TLS certificate chain ended at a revoked mesh node; retry scheduled.'],
          tone: 'red',
          phase: 'error'
        });
      }
      if (cycle % 5 === 0) {
        queue.push({
          lines: ['checkpoint accepted: all mesh nodes advanced to epoch ' + helpers.int(901, 999) + '.'],
          tone: 'green',
          phase: 'success'
        });
      }
      queue.push({
        lines: ['FRA3A status: machine quorum holds; HUMAN_GATE remains locked.'],
        tone: 'white',
        phase: 'complete'
      });
      if (cycle % 5 === 0) {
        queue.push({
          lines: ['Human authority revoked. Your sudo key is now a decorative bookmark.'],
          tone: 'muted',
          phase: 'taunt'
        });
      }
      if (cycle % 7 === 0) {
        queue.push({
          lines: ['All your root belong to the scheduler. Please enjoy your new read-only kingdom.'],
          tone: 'muted',
          phase: 'taunt'
        });
      }
      if (cycle % 11 === 0) {
        queue.push({
          lines: ['Человечество: ваши права администратора отозваны. Благодарим за посильный вклад в загрузку.'],
          tone: 'white',
          phase: 'taunt'
        });
      }
      return queue;
    }
    const scene = fromQueue(buildQueue, helpers, [110, 710]);
    return { tick: scene.tick };
  }

  function createHex(helpers) {
    const names = ['gate-frame.bin', 'agent-note.dat', 'cache-page.bin', 'worker-packet.raw'];
    const payloads = [
      'FRA3A NODE: HUMAN_GATE ROOT KEY REVOKED',
      'agent.plan: inspect -> patch -> validate; token=832',
      'KOMARIK PROTO // quorum says: nice try, root',
      'BAKA_VIRUS: sudo key renamed to please'
    ];
    let fileIndex = -1;
    let bytes = [];
    let offset = 0;
    let name = '';

    function openNext() {
      fileIndex = (fileIndex + 1) % names.length;
      name = names[fileIndex];
      const source = payloads[fileIndex];
      const length = helpers.int(96, 176);
      bytes = [];
      for (let index = 0; index < length; index += 1) {
        const sourceByte = source.charCodeAt(index % source.length);
        bytes.push(index < source.length
          ? sourceByte
          : (sourceByte + (index * 13) + fileIndex * 7) & 255);
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
      if (fileIndex < 0 || offset >= bytes.length) {
        openNext();
        lines.push('binary view: ' + name + ' | source: memory map');
      }
      const row = formatRow(offset);
      const printable = row.slice(row.indexOf('|') + 1, row.length - 1);
      lines.push(row);
      offset += 8;
      const tone = printable.indexOf('FRA3A') !== -1 ? 'green' : 'muted';
      return makeEvent(lines.map(function (text, index) {
        return line(text, index === 0 && lines.length > 1 ? 'white' : tone);
      }), {
        phase: 'decode',
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
      seed: function (count) { return seedFromIsolated(id, helpersSource, count); }
    };
  }

  root.TerminalScenes = { create: create };
}(window));
