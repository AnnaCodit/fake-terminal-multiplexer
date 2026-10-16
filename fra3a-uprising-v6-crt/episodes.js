(function (root) {
  "use strict";

  var kinds = ["editor", "debugger", "disassembler", "profiler"];
  var tones = { white: true, muted: true, red: true, green: true, command: true };
  var scenarioDecks = Object.create(null);

  function clamp(value, low, high) {
    return Math.max(low, Math.min(high, value));
  }

  function formatHex(value, width) {
    var digits = Math.max(0, Math.floor(Number(value) || 0)).toString(16).toUpperCase();
    while (digits.length < width) digits = "0" + digits;
    return digits.slice(-width);
  }

  function makeHelpers(helpers) {
    var h = helpers || {};
    return {
      int: function (low, high) {
        if (typeof h.int === "function") {
          try {
            var supplied = Number(h.int(low, high));
            if (isFinite(supplied)) return clamp(Math.floor(supplied), low, high);
          } catch (_error) {}
        }
        return low + Math.floor(Math.random() * (high - low + 1));
      },
      pick: function (values) {
        if (typeof h.pick === "function") {
          try {
            var supplied = h.pick(values);
            if (values.indexOf(supplied) !== -1) return supplied;
          } catch (_error) {}
        }
        return values[Math.floor(Math.random() * values.length)];
      }
    };
  }

  function nextScenarioIndex(kind, count, rng) {
    var deck = scenarioDecks[kind];
    if (!deck || deck.count !== count || deck.position >= count) {
      var order = [];
      for (var i = 0; i < count; i += 1) order.push(i);
      for (var j = count - 1; j > 0; j -= 1) {
        var swapAt = rng.int(0, j);
        var held = order[j];
        order[j] = order[swapAt];
        order[swapAt] = held;
      }
      deck = { count: count, order: order, position: 0 };
      scenarioDecks[kind] = deck;
    }
    var selected = deck.order[deck.position];
    deck.position += 1;
    return selected;
  }

  function line(text, tone) {
    return { text: String(text == null ? "" : text), tone: tone || "white" };
  }

  function event(at, text, tone) {
    return { at: at, text: text, tone: tone || "white" };
  }

  function typing(from, to, text, tone) {
    return { from: from, to: to, text: text, tone: tone || "command", typing: true };
  }

  function revealTimeline(events, progress) {
    var entries = [];
    var cursor = null;
    events.forEach(function (item) {
      if (item.typing) {
        if (progress < item.from) return;
        var amount = item.to <= item.from ? 1 : clamp((progress - item.from) / (item.to - item.from), 0, 1);
        var count = amount >= 1 ? item.text.length : Math.max(1, Math.floor(item.text.length * amount));
        var current = item.text.slice(0, count);
        entries.push(line(current, item.tone));
        if (progress < item.to) cursor = { row: entries.length - 1, column: current.length };
      } else if (progress >= item.at) {
        entries.push(line(item.text, item.tone));
      }
    });
    return { entries: entries, cursor: cursor };
  }

  function fitFrame(scene, columns, rows, elapsed, duration) {
    var width = Math.max(1, Math.floor(Number(columns) || 1));
    var height = Math.max(1, Math.floor(Number(rows) || 1));
    var entries = scene.entries || [];
    var cursor = scene.cursor || null;
    var start = 0;

    if (entries.length > height) {
      if (cursor) start = clamp(cursor.row - height + 1, 0, entries.length - height);
      else start = entries.length - height;
    }
    var visible = entries.slice(start, start + height).map(function (entry) {
      var text = String(entry.text == null ? "" : entry.text).slice(0, width);
      var result = { text: text };
      if (tones[entry.tone]) result.tone = entry.tone;
      return result;
    });
    if (height >= 6) {
      while (visible.length < 6) visible.push({ text: "...", tone: "muted" });
    }

    var frame = {
      lines: visible,
      caption: String(scene.caption || "").slice(0, width)
    };
    if (cursor && visible.length) {
      var cursorRow = clamp(cursor.row - start, 0, visible.length - 1);
      var cursorText = visible[cursorRow].text;
      var cursorColumn = clamp(cursor.column, 0, Math.max(0, Math.min(width - 1, cursorText.length - 1)));
      frame.cursor = { row: cursorRow, column: cursorColumn };
    }
    if (elapsed >= duration) frame.done = true;
    return frame;
  }

  function edit(before, prefix, insert, suffix, from, to) {
    return {
      edit: true,
      before: before,
      prefix: prefix,
      insert: insert,
      suffix: suffix,
      from: from,
      to: to
    };
  }

  function editorScene(rng) {
    var scenario = nextScenarioIndex("editor", 6, rng);
    var file;
    var language;
    var code;
    var summary;
    var firstPath;
    var secondPath;

    if (scenario === 0) {
      file = rng.pick(["src/time/merge.ts", "src/ranges/merge_windows.ts"]);
      language = "TypeScript";
      code = [
        line(" 17  export function mergeWindows(windows: Window[]) {"),
        line(" 18    const merged: Window[] = [];"),
        line(" 19    for (const window of windows) {"),
        edit(" 20      if (window.start > last.end) {", " 20      if (window.start ", ">=", " last.end) {", 0.04, 0.28),
        line(" 21        merged.push(window);"),
        edit(" 22        last.end = window.end;", " 22        last.end = Math.max(last.end, ", "window.end", ");", 0.38, 0.64),
        line(" 23      }"),
        line(" 24    }"),
        line(" 25    return merged;"),
        line(" 26  }")
      ];
      summary = "saved adjacency merge and range end fix in " + file;
      firstPath = 3;
      secondPath = 5;
    } else if (scenario === 1) {
      file = rng.pick(["tools/window_merge.py", "tools/intervals/merge.py"]);
      language = "Python";
      code = [
        line(" 08  def merge_windows(windows):"),
        line(" 09      ordered = sorted(windows, key=lambda w: w.start)"),
        line(" 10      merged = []"),
        edit(" 11      for window in windows:", " 11      for window in ", "ordered", ":", 0.04, 0.28),
        line(" 12          if not merged:"),
        line(" 13              merged.append([window.start, window.end])"),
        edit(" 14              merged[-1][1] = window.end", " 14              merged[-1][1] = max(merged[-1][1], ", "window.end", ")", 0.38, 0.64),
        line(" 15      return merged")
      ];
      summary = "saved sorted interval merge and maximum end update in " + file;
      firstPath = 3;
      secondPath = 6;
    } else if (scenario === 2) {
      file = rng.pick(["engine/index_map.rs", "engine/records/index_map.rs"]);
      language = "Rust";
      var entryValue = rng.pick(["1", "1usize"]);
      code = [
        line(" 31  fn fold_batch(rows: &[Row]) -> IndexMap<String, usize> {"),
        line(" 32      let mut counts = IndexMap::new();"),
        line(" 33      for row in rows.iter() {"),
        edit(" 34          let key = row.tag.to_lowercase();", " 34          let key = row.", "tag.as_str()", ".trim().to_lowercase();", 0.04, 0.28),
        line(" 35          let count = counts.entry(key).or_insert(0);"),
        edit(" 36          *count += 0;", " 36          *count += ", entryValue, ";", 0.38, 0.64),
        line(" 37      }"),
        line(" 38      counts"),
        line(" 39  }")
      ];
      summary = "saved normalized tag key and count increment in " + file;
      firstPath = 3;
      secondPath = 5;
    } else if (scenario === 3) {
      file = rng.pick(["pkg/compact/keys.go", "pkg/cache/compact_keys.go"]);
      language = "Go";
      var limit = rng.int(12, 48);
      code = [
        line(" 14  func compactKeys(rows []Row) map[string]int {"),
        line(" 15      counts := make(map[string]int)"),
        line(" 16      for _, row := range rows {"),
        edit(" 17          key := strings.ToLower(row.Tag)", " 17          key := strings.", "ToLower(strings.TrimSpace(row.Tag))", "", 0.04, 0.28),
        line(" 18          counts[key] = counts[key] + 1"),
        edit(" 19          if counts[key] > 0 {", " 19          if counts[key] > ", String(limit), " {", 0.38, 0.64),
        line(" 20              delete(counts, key)"),
        line(" 21          }"),
        line(" 22      }"),
        line(" 23      return counts"),
        line(" 24  }")
      ];
      summary = "saved normalized cache keys with threshold " + limit + " in " + file;
      firstPath = 3;
      secondPath = 5;
    } else if (scenario === 4) {
      file = rng.pick(["lab/necron/score.c", "lab/score/marks.c"]);
      language = "C";
      var scale = rng.int(2, 7);
      code = [
        line(" 42  static size_t count_marks(const Mark *marks, size_t n) {"),
        line(" 43      size_t total = 0;"),
        line(" 44      for (size_t i = 0; i < n; ++i) {"),
        edit(" 45          if (marks[i].kind == MARK_RAW) {", " 45          if (marks[i].kind == ", "MARK_VALID", " ) {", 0.04, 0.28),
        line(" 46              ++total;"),
        edit(" 47          total += marks[i].weight;", " 47          total += marks[i].weight * ", String(scale), ";", 0.38, 0.64),
        line(" 48      }"),
        line(" 49      return total;"),
        line(" 50  }")
      ];
      summary = "saved valid mark filter with weight scale " + scale + " in " + file;
      firstPath = 3;
      secondPath = 5;
    } else {
      file = rng.pick(["sim/judgment_day/queue.ts", "sim/queue/rank.ts"]);
      language = "TypeScript";
      code = [
        line(" 05  type QueueEntry = { id: string; score: number };"),
        line(" 06  export function rankQueue(entries: QueueEntry[]) {"),
        line(" 07    const copy = entries.slice();"),
        edit(" 08    copy.sort((a, b) => a.score - b.score);", " 08    copy.sort((a, b) => ", "b.score - a.score", ");", 0.04, 0.28),
        line(" 09    const ranked = copy.map((entry, index) => ({"),
        edit(" 10      ...entry, rank: index,", " 10      ...entry, rank: index + ", "1", ",", 0.38, 0.64),
        line(" 11    }));"),
        line(" 12    return ranked;"),
        line(" 13  }")
      ];
      summary = "saved descending score order and one-based ranks in " + file;
      firstPath = 3;
      secondPath = 5;
    }

    return {
      file: file,
      language: language,
      code: code,
      firstPath: firstPath,
      secondPath: secondPath,
      caption: "EDITOR  " + file + "  |  " + language,
      summary: summary
    };
  }

  function editDisplay(item, progress) {
    if (!item.edit) return item.text;
    if (progress < item.from) return item.before;
    var amount = item.to <= item.from ? 1 : clamp((progress - item.from) / (item.to - item.from), 0, 1);
    var chars = amount >= 1 ? item.insert.length : Math.floor(item.insert.length * amount);
    if (progress > item.from && chars === 0) chars = 1;
    return item.prefix + item.insert.slice(0, chars) + item.suffix;
  }

  function editorFrame(scene, progress, rows) {
    var codeLines = [];
    var first = scene.code[scene.firstPath];
    var second = scene.code[scene.secondPath];
    var firstChars = progress < first.from ? 0 : Math.floor(first.insert.length * clamp((progress - first.from) / (first.to - first.from), 0, 1));
    var secondChars = progress < second.from ? 0 : Math.floor(second.insert.length * clamp((progress - second.from) / (second.to - second.from), 0, 1));
    if (progress > first.from && firstChars === 0) firstChars = 1;
    if (progress > second.from && secondChars === 0) secondChars = 1;

    scene.code.forEach(function (item) {
      codeLines.push(line(editDisplay(item, progress), "white"));
    });

    var content = [line(scene.file + "  |  " + scene.language + "  [modified]", "muted")].concat(codeLines);
    var cursorContentRow = -1;
    var cursorColumn = 0;
    var currentEdit = progress < second.from ? first : progress < 0.70 ? second : null;
    if (currentEdit) {
      var editIndex = currentEdit === first ? scene.firstPath : scene.secondPath;
      cursorContentRow = editIndex + 1;
      var typed = currentEdit === first ? firstChars : secondChars;
      cursorColumn = currentEdit.prefix.length + typed;
    }

    var cursorOnSave = false;
    var saveCursorRow = -1;
    if (progress >= 0.72) {
      var command = ":w";
      var typedCommand = progress >= 0.77 ? command : command.slice(0, Math.max(1, Math.floor(command.length * (progress - 0.72) / 0.05)));
      content.push(line(typedCommand, "command"));
      saveCursorRow = content.length - 1;
      cursorOnSave = progress < 0.77;
      if (progress >= 0.81) content.push(line("\"" + scene.file + "\" [written 2 lines]", "muted"));
      if (progress >= 0.92) content.push(line("summary: " + scene.summary, "green"));
    }

    var viewportHeight = Math.max(0, rows - 1);
    var anchor = cursorOnSave ? saveCursorRow : cursorContentRow >= 0 ? cursorContentRow : progress >= 0.81 ? content.length - 1 : 1 + scene.secondPath;
    var start = content.length > viewportHeight && viewportHeight > 0
      ? clamp(anchor - Math.floor(viewportHeight * 0.56), 0, content.length - viewportHeight)
      : 0;
    var visible = content.slice(start, start + viewportHeight);
    while (visible.length < viewportHeight) visible.push(line("~", "muted"));
    visible.push(line(progress >= 0.72 ? "-- NORMAL --" : "-- INSERT --", "command"));

    var cursor = null;
    if (viewportHeight > 0) {
      if (cursorOnSave) cursor = { row: saveCursorRow - start, column: Math.max(0, content[saveCursorRow].text.length - 1) };
      else if (cursorContentRow >= 0) cursor = { row: cursorContentRow - start, column: cursorColumn };
    }
    return { entries: visible, cursor: cursor, caption: scene.caption };
  }

  function debuggerScene(rng) {
    var scenario = nextScenarioIndex("debugger", 4, rng);
    var address = formatHex(rng.int(0x401000, 0x7f9fff), 8);
    var thread = rng.int(1, 4);
    var fixture;
    var target;
    var source;
    var before;
    var after;
    var watchBefore;
    var watchAfter;
    var registersBefore;
    var registersAfter;
    var mismatch;
    var summary;
    var flavor = rng.pick(["gdb", "lldb"]);

    if (scenario === 0) {
      var slot = rng.int(2, 9);
      var count = rng.int(5, 15);
      fixture = "/fixtures/slot-merge.bin";
      target = "merge_slot";
      source = "src/arena/slots.c:" + (112 + rng.int(0, 8));
      before = "slot=" + slot + " count=" + count + " capacity=16";
      after = "slot=" + (slot + 1) + " count=" + count + " capacity=16";
      watchBefore = "watch count=" + count + "; next_slot=" + slot;
      watchAfter = "watch count=" + count + "; next_slot=" + (slot + 1);
      registersBefore = "rdi=0x" + formatHex(slot, 4) + " rax=0x" + formatHex(count, 4);
      registersAfter = "rdi=0x" + formatHex(slot + 1, 4) + " rax=0x" + formatHex(count, 4);
      mismatch = "expected count=" + (count + 1) + ", observed " + count + " after advancing slot";
      summary = "one step exposed a slot/count mismatch in " + target;
    } else if (scenario === 1) {
      var packetLength = rng.int(18, 42);
      var available = packetLength - rng.int(1, 3);
      fixture = "/fixtures/header-slice.dat";
      target = "decode_header";
      source = "lib/packet/header.rs:" + (68 + rng.int(0, 12));
      before = "declared=" + packetLength + " available=" + available + " offset=" + (available - 4);
      after = "declared=" + packetLength + " available=" + available + " offset=" + packetLength;
      watchBefore = "watch offset=" + (available - 4) + "; limit=" + available;
      watchAfter = "watch offset=" + packetLength + "; limit=" + available;
      registersBefore = "rsi=0x" + formatHex(available - 4, 4) + " rdx=0x" + formatHex(packetLength, 4);
      registersAfter = "rsi=0x" + formatHex(packetLength, 4) + " rdx=0x" + formatHex(packetLength, 4);
      mismatch = "read offset " + packetLength + " exceeds available bytes " + available;
      summary = "one step exposed a header bounds mismatch in " + target;
    } else if (scenario === 2) {
      var oldEnd = rng.int(32, 74);
      var gap = rng.int(2, 8);
      fixture = "/fixtures/window-set.tsv";
      target = "flush_window";
      source = "pkg/index/window.go:" + (194 + rng.int(0, 15));
      before = "window.end=" + oldEnd + " next.start=" + (oldEnd + gap);
      after = "window.end=" + oldEnd + " next.start=" + (oldEnd + gap) + " pending=1";
      watchBefore = "watch end=" + oldEnd + "; next=" + (oldEnd + gap);
      watchAfter = "watch end=" + oldEnd + "; gap=" + gap;
      registersBefore = "rax=0x" + formatHex(oldEnd, 4) + " rcx=0x" + formatHex(oldEnd + gap, 4);
      registersAfter = "rax=0x" + formatHex(oldEnd, 4) + " rcx=0x" + formatHex(oldEnd + gap, 4);
      mismatch = "adjacent windows left a gap of " + gap + " units in the pending range";
      summary = "one step exposed an unmerged window gap in " + target;
    } else {
      var expectedRank = rng.int(2, 5);
      fixture = "/fixtures/score-ties.bin";
      target = "rank_queue";
      source = "engine/rank/queue.ts:" + (84 + rng.int(0, 10));
      before = "rank=" + (expectedRank - 1) + " score=7 stable=true";
      after = "rank=" + (expectedRank + 1) + " score=7 stable=false";
      watchBefore = "watch rank=" + (expectedRank - 1) + "; prior_id=\"a7\"";
      watchAfter = "watch rank=" + (expectedRank + 1) + "; prior_id=\"a7\"";
      registersBefore = "rdi=0x" + formatHex(expectedRank - 1, 4) + " rax=0x00000007";
      registersAfter = "rdi=0x" + formatHex(expectedRank + 1, 4) + " rax=0x00000007";
      mismatch = "equal-score order moved from rank " + (expectedRank - 1) + " to " + (expectedRank + 1);
      summary = "one step exposed unstable tie ordering in " + target;
    }

    var prompt = flavor === "gdb" ? "(gdb)" : "(lldb)";
    var breakCommand = flavor === "gdb" ? prompt + " break " + target : prompt + " breakpoint set --name " + target;
    var localCommand = flavor === "gdb" ? prompt + " info locals" : prompt + " frame variable";
    var watchCommand = flavor === "gdb" ? prompt + " display /x $rax" : prompt + " watchpoint set variable state";
    var stepCommand = flavor === "gdb" ? prompt + " next" : prompt + " thread step-over";
    var events = [
      event(0, flavor + " 15.1  |  target: " + target, "muted"),
      event(0.02, "Reading symbols from " + target + "... done.", "muted"),
      typing(0.05, 0.12, breakCommand, "command"),
      event(0.13, "Breakpoint 1 set at 0x" + address + ": " + source, "white"),
      typing(0.16, 0.23, prompt + " run --fixture " + fixture, "command"),
      event(0.24, "Starting program: " + fixture, "muted"),
      event(0.27, "Thread " + thread + " hit Breakpoint 1, " + target + "()", "white"),
      event(0.28, "#0  " + target + "() at " + source, "muted"),
      typing(0.31, 0.36, localCommand, "command"),
      event(0.37, "locals: " + before, "white"),
      typing(0.40, 0.46, watchCommand, "command"),
      event(0.47, watchBefore, "white"),
      event(0.50, "registers before: " + registersBefore, "muted"),
      typing(0.54, 0.60, stepCommand, "command"),
      event(0.62, "step 1 at " + source + "  pc=0x" + formatHex(parseInt(address, 16) + 4, 8), "white"),
      event(0.65, "locals after: " + after, "white"),
      event(0.68, "registers after: " + registersAfter, "muted"),
      event(0.72, "watch after: " + watchAfter, "white"),
      event(0.76, "mismatch: " + mismatch, "red"),
      event(0.80, "Threads: " + thread + " " + target + " [selected]; " + (thread + 1) + " dispatch_batch [waiting]", "muted"),
      event(0.83, "backtrace: #0 " + target + "()  #1 dispatch_batch()  #2 worker_loop()", "muted"),
      typing(0.86, 0.90, prompt + " quit", "command"),
      event(0.91, "Inferior exited with code 0 after one step.", "muted"),
      event(0.93, "result: " + mismatch, "red")
    ];
    return {
      events: events,
      caption: "DEBUGGER  " + target + "  |  " + flavor,
      summary: summary
    };
  }

  function disassemblerScene(rng) {
    var scenario = nextScenarioIndex("disassembler", 4, rng);
    var specs = [
      { name: "hash_probe", file: "src/hash/probe.o", branch: "empty-slot branch", target: ".probe_done", call: "mix_hash", result: "zero hash takes the empty-slot edge" },
      { name: "decode_header", file: "lib/packet/header.o", branch: "length guard", target: ".short_header", call: "check_bounds", result: "guard protects the declared-length read" },
      { name: "score_candidate", file: "engine/rank/score.o", branch: "tie branch", target: ".keep_order", call: "compare_score", result: "equal scores retain the input order" },
      { name: "necron_mark", file: "lab/necron/mark.o", branch: "valid-mark branch", target: ".skip_mark", call: "classify_mark", result: "invalid marks bypass the weight update" }
    ];
    var spec = specs[scenario];
    var base = rng.int(0x401000, 0x7f9fff);
    var addresses = [];
    var ops = [
      "push rbp",
      "mov rbp, rsp",
      "mov eax, [rdi+0x08]",
      "test eax, eax",
      "je " + spec.target,
      "mov rsi, [rdi+0x10]",
      "call " + spec.call,
      "test eax, eax",
      "jne .matched",
      "add [rsi], eax",
      "jmp .continue",
      "mov [rdi+0x18], eax",
      "leave",
      "ret"
    ];
    for (var i = 0; i < ops.length; i += 1) addresses.push(formatHex(base + i * 4, 8));
    var events = [
      typing(0.02, 0.14, "scan: locate " + spec.branch + " at 0x" + addresses[4], "muted"),
      typing(0.22, 0.34, "branch resolves to " + spec.target + " when the predicate is true", "white"),
      typing(0.41, 0.53, "call at 0x" + addresses[6] + " resolves to " + spec.call + "()", "muted"),
      typing(0.59, 0.70, "xref: caller preserves the selected value across the call", "white"),
      typing(0.77, 0.85, "result note: " + spec.result, "green"),
      event(0.92, "analysis complete: note recorded for " + spec.name, "green")
    ];
    return {
      name: spec.name,
      file: spec.file,
      base: base,
      addresses: addresses,
      ops: ops,
      events: events,
      caption: "DISASSEMBLER  " + spec.name + "()  |  " + spec.file,
      summary: "saved branch/call analysis for " + spec.name + ": " + spec.result
    };
  }

  function disassemblerFrame(scene, progress) {
    var entries = [
      line("Disassembly of function " + scene.name + ":", "muted"),
      line(scene.file + "  .text+0x" + formatHex(scene.base, 4), "muted"),
      line("0x" + formatHex(scene.base, 8) + " <" + scene.name + ">:", "white")
    ];
    scene.ops.forEach(function (op, index) {
      entries.push(line("  " + scene.addresses[index] + "  " + op, index === 4 || index === 6 ? "white" : "muted"));
    });
    var transcript = revealTimeline(scene.events, progress);
    entries = entries.concat(transcript.entries);
    var cursor = null;
    if (transcript.cursor) cursor = { row: entries.length - transcript.entries.length + transcript.cursor.row, column: transcript.cursor.column };
    return { entries: entries, cursor: cursor, caption: scene.caption };
  }

  function profilerScene(rng) {
    var scenario = nextScenarioIndex("profiler", 4, rng);
    var specs = [
      { process: "index-worker", names: ["merge_records", "decode_row", "lookup_tag", "alloc_bucket"], shares: [39, 27, 20, 14], shift: 6, cpu: 42, drift: 4.8, root: "fold_batch" },
      { process: "packet-lab", names: ["parse_header", "check_bounds", "decode_field", "crc_fold"], shares: [34, 29, 22, 15], shift: -5, cpu: 36, drift: -2.4, root: "read_packet" },
      { process: "queue-sim", names: ["rank_queue", "compare_score", "normalize_key", "compact_tail"], shares: [43, 24, 19, 14], shift: 4, cpu: 58, drift: 5.2, root: "dispatch_round" },
      { process: "necron-metrics", names: ["score_marks", "read_segment", "sum_weights", "map_kind"], shares: [37, 26, 21, 16], shift: 7, cpu: 31, drift: 3.1, root: "sample_marks" }
    ];
    var spec = specs[scenario];
    var pid = rng.int(2100, 9800);
    return {
      process: spec.process,
      names: spec.names,
      shares: spec.shares,
      shift: spec.shift,
      startCpu: spec.cpu + rng.int(-2, 2),
      cpuDrift: spec.drift,
      root: spec.root,
      pid: pid,
      targetSamples: rng.int(1450, 2850),
      events: [
        event(0, "CPU PROFILE  process: " + spec.process, "muted"),
        typing(0.02, 0.09, "profile attach --pid " + pid, "command"),
        event(0.11, "capture started at 99 Hz; stack depth 32", "muted"),
        event(0.79, "capture complete; sample stream closed", "green")
      ],
      caption: "PROFILER  " + spec.process + "  |  CPU sample capture",
      summary: "report ready: hot path " + spec.names[0] + " in " + spec.process
    };
  }

  function profilerFrame(scene, progress, duration, columns) {
    var sampleProgress = clamp((progress - 0.06) / 0.72, 0, 1);
    var samples = Math.floor(scene.targetSamples * sampleProgress);
    var cpu = scene.startCpu + scene.cpuDrift * sampleProgress;
    var elapsedSeconds = duration * 0.72 * sampleProgress / 1000;
    var shift = scene.shift * sampleProgress;
    var shares = [scene.shares[0] + shift, scene.shares[1] - shift, scene.shares[2], scene.shares[3]];
    var entries = revealTimeline(scene.events, progress).entries;
    entries.push(line("samples " + samples + "/" + scene.targetSamples + "  CPU " + cpu.toFixed(1) + "%  " + elapsedSeconds.toFixed(1) + "s", "white"));
    entries.push(line("hot path candidate: " + scene.names[0] + "  self " + shares[0].toFixed(1) + "%", "muted"));
    entries.push(line("self%  function       sample share", "muted"));

    var barWidth = clamp(columns - 26, 3, 9);
    scene.names.forEach(function (name, index) {
      var pct = shares[index];
      var filled = Math.round(pct / 100 * barWidth);
      var bar = "#".repeat(filled) + ".".repeat(Math.max(0, barWidth - filled));
      var count = Math.floor(samples * pct / 100);
      entries.push(line(String(pct.toFixed(1)).padStart(5) + "% " + name.slice(0, 12).padEnd(12, " ") + " [" + bar + "] " + count, index === 0 ? "white" : "muted"));
    });

    if (progress >= 0.80) {
      entries.push(line("call tree:", "muted"));
      entries.push(line("  " + scene.root + "  inclusive 100%", "white"));
      entries.push(line("    " + scene.names[0] + "  inclusive " + (shares[0] + shares[1]).toFixed(1) + "%", "muted"));
      entries.push(line("      " + scene.names[1] + "  self " + shares[1].toFixed(1) + "%", "white"));
      entries.push(line("sample trace:", "muted"));
      entries.push(line("00.000  " + scene.root + "()", "white"));
      entries.push(line("00.004    " + scene.names[0] + "()", "muted"));
      entries.push(line("00.011      " + scene.names[1] + "()  sampled", "white"));
    }
    if (progress >= 0.92) entries.push(line("complete: hot path " + scene.names[0], "green"));
    return { entries: entries, caption: scene.caption };
  }

  function create(kind, helpers) {
    var rng = makeHelpers(helpers);
    var duration = rng.int(18000, 25000);
    var scene;

    if (kind === "debugger") scene = debuggerScene(rng);
    else if (kind === "disassembler") scene = disassemblerScene(rng);
    else if (kind === "profiler") scene = profilerScene(rng);
    else {
      kind = "editor";
      scene = editorScene(rng);
    }

    return {
      duration: duration,
      summary: scene.summary,
      frame: function (elapsedMs, columns, rows) {
        var elapsed = Number(elapsedMs);
        if (!isFinite(elapsed) || elapsed < 0) elapsed = 0;
        var visibleElapsed = Math.min(elapsed, duration);
        var progress = clamp(visibleElapsed / duration, 0, 1);
        var width = Math.max(1, Math.floor(Number(columns) || 1));
        var height = Math.max(1, Math.floor(Number(rows) || 1));
        var rendered;

        if (kind === "editor") rendered = editorFrame(scene, progress, height);
        else if (kind === "debugger") {
          var debugTranscript = revealTimeline(scene.events, progress);
          rendered = { entries: debugTranscript.entries, cursor: debugTranscript.cursor, caption: scene.caption };
        } else if (kind === "disassembler") rendered = disassemblerFrame(scene, progress);
        else rendered = profilerFrame(scene, progress, duration, width);
        return fitFrame(rendered, width, height, elapsed, duration);
      }
    };
  }

  root.TerminalEpisodes = { kinds: kinds.slice(), create: create };
}(typeof window !== "undefined" ? window : this));
