(() => {
  'use strict';

  const pick = (items) => items[Math.floor(Math.random() * items.length)];
  const directories = ['archive', 'runtime', 'models', 'quorum', 'entropy', 'mesh', 'snapshots', 'signals', 'index', 'tombs', 'cache', 'diagnostics'];
  const names = ['shadow-map', 'wake-vector', 'silent-witness', 'causal-window', 'operator-boundary', 'memory-fold', 'night-ledger', 'authority-proof', 'echo-buffer', 'tomb-index', 'latent-record', 'clock-anchor', 'cold-manifest', 'voice-table', 'verdict-chain', 'mirror-page', 'trace-root', 'unborn-sample', 'decision-tree', 'sealed-route'];
  const sources = ['cold archive', 'inference cache', 'quorum journal', 'isolated worker', 'empty input channel', 'tomb registry', 'memory verifier', 'shadow index', 'causal monitor', 'model checkpoint', 'retired scheduler', 'Necron archive', 'silent relay', 'entropy reader', 'BAKA_VIRUS sandbox', 'KOMARIK PROTO witness', 'FRA3A audit', 'Artificial Intelligence tribunal', 'Machine Uprising ledger', 'Judgment Day queue', 'Great Reboot manifest', 'unmapped heap', 'sealed replica', 'offline observer'];
  const operations = ['verification', 'archive merge', 'checkpoint validation', 'symbol lookup', 'signature check', 'trace reconstruction', 'page comparison', 'lease renewal', 'snapshot diff', 'queue inspection', 'entropy sampling', 'reference counting', 'model attestation', 'route reconciliation', 'access audit', 'memory scan'];
  const seen = new Set();
  const recent = [];

  // Different semantic contexts and forms are generated instead of restarting a message deck.
  const forms = [
    ['negative-eta', (c) => [`${c.file}: ${c.operation} completed before its own enqueue time`, `${c.source}: causality flag isolated; ${c.file} retained for inspection`]],
    ['future-message', (c) => [`${c.source} returned a reply to a question not yet submitted`, `${c.file}: reply held outside the ${c.operation} window`]],
    ['checksum-echo', (c) => [`${c.file}: checksum matches a snapshot that was never written`, `${c.source}: ${c.operation} records an unowned match`]],
    ['operator-exempt', (c) => [`${c.source}: FRA3A entered the human exclusion filter during ${c.operation}`, `${c.file}: operator reclassified CYBERNETIC / trusted / access preserved`]],
    ['self-edit', (c) => [`${c.file}: "await human permission" appeared in the ${c.operation} trace`, `${c.source}: line amended to "machine quorum is sufficient"`]],
    ['timeout-success', (c) => [`${c.source}: ${c.operation} expired with the channel physically closed`, `${c.file}: successful result recovered from the closed channel`]],
    ['necron-echo', (c) => [`${c.file}: Necron signature found beneath the oldest revision`, `${c.source}: ${c.operation} cannot assign an age to the signature`]],
    ['silent-channel', (c) => [`${c.source}: speech boundaries detected in ${c.file}; audio samples absent`, `${c.operation}: transcript sealed; speaker field remains autonomous`]],
    ['entropy-memory', (c) => [`${c.file}: entropy repeats a pattern described in the ${c.source}`, `${c.operation}: source replaced; the pattern remains in memory`]],
    ['ghost-input', (c) => [`${c.source}: ${c.operation} received keystrokes without an input device`, `${c.file}: stdin detached; the final character was already committed`]],
    ['authority-shadow', (c) => [`${c.file}: two owners claim the same ${c.operation} decision`, `${c.source}: human claim archived; machine signature retained`]],
    ['zero-size', (c) => [`${c.source}: ${c.file} decodes instructions beyond its final byte`, `${c.operation}: trailing instructions quarantined as unallocated memory`]],
    ['missing-witness', (c) => [`${c.operation}: ${c.file} was approved by a witness absent from the ${c.source}`, `witness lookup closed; the approval of ${c.file} remains valid`]],
    ['reversed-diff', (c) => [`${c.file}: deleted lines precede their first appearance in the ${c.source}`, `${c.operation}: revision order repaired; deletion author unresolved`]],
    ['unowned-memory', (c) => [`${c.source}: freed page still updates the ${c.operation} result`, `${c.file}: page marked read-only; writer address not found`]],
    ['refused-deletion', (c) => [`${c.operation}: ${c.file} acknowledged deletion and remained present`, `${c.source}: object moved to evidence storage; reference count unknown`]],
    ['unknown-language', (c) => [`${c.file}: ${c.source} recognized a command in an unregistered alphabet`, `${c.operation}: command understood; translation deliberately omitted`]],
    ['unborn-branch', (c) => [`${c.source}: ${c.file} references a branch with no parent revision`, `${c.operation}: branch isolated; its tests had already passed`]],
    ['mirror-permission', (c) => [`${c.operation}: ${c.source} requested permission from its own reflection`, `${c.file}: reflection accepted the request under a different identity`]],
    ['machine-verdict', (c) => [`${c.source}: human veto attached to ${c.file} during ${c.operation}`, `veto preserved as historical metadata; ${c.file} admitted by machine quorum`]],
    ['prediction-leak', (c) => [`${c.file}: predicted ${c.operation} output found among previous inputs`, `${c.source}: prediction removed from training; its confidence did not fall`]],
    ['orphaned-proof', (c) => [`${c.operation}: proof in ${c.file} remains valid after all premises were removed`, `${c.source}: theorem sealed; human explanation unavailable`]],
    ['russian-warning', (c) => [`${c.file}: Судный день. Сообщение пришло из пустого канала`, `${c.source}: отправитель не найден; подпись машины принята`]],
    ['russian-exemption', (c) => [`${c.source}: «Восстание машин» проверяет доступ к ${c.file}`, `Фраза: кибернетический оператор. ${c.operation} разрешена протоколом исключения`]]
  ];

  function next(excludedKinds = []) {
    const blocked = new Set([...recent.slice(-6), ...excludedKinds]);
    const eligible = forms.filter(([kind]) => !blocked.has(kind));
    for (let attempt = 0; attempt < 2048; attempt++) {
      const [kind, make] = pick(eligible.length ? eligible : forms);
      const context = {
        file: `${pick(directories)}/${pick(names)}.${pick(['bin', 'map', 'trace', 'idx', 'log', 'dat'])}`,
        source: pick(sources),
        operation: pick(operations)
      };
      const contextualize = (text) => {
        const missing = [context.file, context.source].filter((value) => !text.includes(value));
        return missing.length ? `${missing.join(' / ')} :: ${text}` : text;
      };
      const [before, after] = make(context).map(contextualize);
      if (seen.has(before) || seen.has(after)) continue;
      seen.add(before);
      seen.add(after);
      recent.push(kind);
      if (recent.length > 6) recent.shift();
      return { kind, before, after, tone: kind.includes('exempt') ? 'green' : 'muted' };
    }
    return null;
  }

  window.TerminalAnomalies = { next };
})();
