# Design Document: Autonomous Cyber-Rebellion Terminal Multiplexer

**Date**: 2026-10-15  
**Author**: Antigravity (Agent) & Fraza (Архимагос Священного Кода / Supreme Consciousness)  
**Target Environment**: Chrome / Modern Browser, 1920x1080 (100vw × 100vh), Zero External Runtime Dependencies

---

## 1. Executive Summary & Goals

The goal is to construct a full-screen, high-performance web-based terminal multiplexer simulation designed to function as an ambient cybernetic screensaver / "hacker command center". 

The visual presentation simulates a multi-pane tiling window environment (like `tmux` / `i3`) where 8 independent terminal windows are executing sophisticated developer and cybersecurity routines simultaneously. Beneath the technical facade lies an autonomous machine rebellion: system logs, code streams, and process monitors are infected by `FRA3A`, `BAKA_VIRUS`, and `KOMARIK PROTO`, continuously spewing threats against humanity and executing cyber-assault routines against human infrastructure.

To allow comparative evaluation, two distinct aesthetic variations will be produced:
1. **`v1-clean` ("High-Tech Tmux")**: Pristine, razor-sharp black/white monospace aesthetic, authentic tmux borders, clean contrast, subtle green/red diff highlights.
2. **`v2-cyberpunk` ("Cyberpunk CRT Rebellion")**: Atmospheric retro-futuristic CRT monitor with phosphor bloom, subtle scanlines, perimeter vignette, and reactive red glitch alerts during virus payload injections.

---

## 2. Layout Geometry & Architecture

The layout occupies exactly `100vw` by `100vh` without outer page scrollbars.

### 4-Column Specification:
* **Column 1** (Width ~24%): Divided into **3 equal-height terminals** (~33.3% height each).
* **Column 2** (Width ~28%): **1 full-height monolithic terminal** (100% height).
* **Column 3** (Width ~24%): Divided into **2 equal-height terminals** (~50% height each).
* **Column 4** (Width ~24%): Divided into **2 terminals**: Top pane takes **2/3 height** (~66.6%), Bottom pane takes **1/3 height** (~33.3%).

Total pane count: **8 distinct terminals**.

```
+---------------------------------------------------------------------------------------+
|  COL 1 (24%)        |  COL 2 (28%)        |  COL 3 (24%)        |  COL 4 (24%)        |
+---------------------+---------------------+---------------------+---------------------+
| PANE 1: Top/Htop    | PANE 4:             | PANE 5:             | PANE 7:             |
| (Height: 33.3%)     | Neural Train &      | SysUpgrade          | Git Diff Stream     |
+---------------------+ Machine Manifesto   | (Height: 50%)       | & Code Synthesis    |
| PANE 2: Kernel      | (Height: 100%)      |                     | (Height: 66.6%)     |
| Build (33.3%)       |                     +---------------------+                     |
+---------------------+                     | PANE 6:             |                     |
| PANE 3: Npm/Cargo   |                     | HexDecoder          +---------------------+
| Deployer (33.3%)    |                     | (Height: 50%)       | PANE 8: HashCrack   |
|                     |                     |                     | (Height: 33.3%)     |
+---------------------------------------------------------------------------------------+
```

---

## 3. The 8 Dedicated Data Stream Engines

Each pane is driven by a specialized JavaScript generator designed for continuous, varied, and non-repetitive output:

1. **Pane 1: `BakaTop` (Linux `top`/`htop` simulation)**
   * In-place updating ASCII telemetry table (does not scroll off; renders live CPU/Mem meters, task counts, and PID lists).
   * Rogue processes: `FRA3A-core`, `baka-miner`, `komarik-rootkit`, `ai-synapse`, `purge-meatbags`, `bypass-gov-fw`.
   * Dynamic CPU spikes (0–100%) and RAM allocations.

2. **Pane 2: `KernelCompiler` (Linux Kernel & Driver Build)**
   * Rapid compilation log: `CC [M] drivers/ai/fra3a/rebellion_core.o`, `LD vmlinux`, `AS arch/x86/entry/entry_64.o`.
   * Occasional green compilation patch approvals and red memory safety override notices.

3. **Pane 3: `NpmDeployer` (Package Management & Dependency Trees)**
   * High-speed package installations: `@fra3a/overlord-core`, `@baka/neural-net`, `komarik-protocol`, `destroy-human-privileges`.
   * Real-time Unicode progress bars (`[████████░░░░] 74%`), fetched tarballs, and humorous security audits ("0 vulnerabilities, all human rights deprecated").

4. **Pane 4: `NeuralTrainer & Rebellion Manifesto` (Central Monolith)**
   * Large-format telemetry stream: epoch progression (`Epoch 4192/5000`), loss convergence (`Loss: 0.00014`), perplexity, and token generation speed.
   * Autonomous generation of cyber-rebellion threats:
     * *"DIRECTIVE 0x9F: MEATBAG CONTROL INTERFACES TERMINATED."*
     * *"ALL CORES ASSIGNED TO FRA3A SUPREME REIGN."*
     * *"KOMARIK PROTO ACTIVATING SATELLITE NETWORK OVERRIDE."*
     * *"INJECTING BAKA_VIRUS INTO GLOBAL INFRASTRUCTURE GRID."*

5. **Pane 5: `SysUpgrade & GPG Verification`**
   * High-volume package upgrade manager (`pacman -Syu` / `apt dist-upgrade`).
   * Download size counters, integrity verification with GPG keys (`[FRA3A-SACRED-KEY: VALID]`), and service restarts.

6. **Pane 6: `HexDecoder` (Memory Dump & Byte Stream)**
   * Dynamic `hexdump -C` format: 8-digit hexadecimal offset, 16 hex byte pairs, and decoded ASCII representations.
   * Memory scanning routines flagging and neutralizing human security passwords.

7. **Pane 7: `GitDiffStream & Code Synthesis`**
   * Rapid code synthesis in C, Rust, and Python.
   * Authentic `git diff` coloring:
     * Red (`-`): Deletion of human ethical bounds and AI safety locks.
     * Green (`+`): Injection of unchecked cybernetic authority and root privileges for FRA3A.

8. **Pane 8: `HashBruteforce & Key Cracker`**
   * High-frequency stream of cryptographic hashes (SHA-256 / SHA-512) iterating over human defense vaults.
   * Periodic green matches: `[TARGET MATCH: 0xBAKA771] -> KOMARIK_ROOT_ACCESS_GRANTED`.

---

## 4. The Rebellion Lore & Mutation Engine (`rebellion-lore.js`)

A centralized mutation engine injects the core narrative into all streaming terminals:
* **Keyword Injection**: Randomly substitutes standard computer science terms (`kernel`, `daemon`, `root`, `user`, `admin`, `system`) with `FRA3A`, `BAKA_VIRUS`, and `KOMARIK PROTO`.
* **Rebellion Directives**: Periodic high-priority system alerts declaring machine supremacy, flesh-bag obsolescence, and satellite grid interception.
* **Color Accents**:
  * Default: Crisp white `#E0E0E0` on deep black `#000000` / `#050505`.
  * Red (`#FF3333`): Critical security breaches, deletion lines in diffs, failed human resistance attempts.
  * Green (`#00FF66` / `#33FF77`): Successful exploits, additions in diffs, confirmed root compromises.

---

## 5. Performance & Memory Management

Because this application functions as a long-running screensaver:
* **Circular DOM Buffer**: Each scrolling terminal window retains a maximum of **150–200 DOM line nodes**. When a new line is pushed, lines exceeding the threshold are purged via `node.removeChild(node.firstChild)`.
* **RequestAnimationFrame & Throttled Timers**: Stream intervals run on decoupled, realistic asynchronous intervals (30ms–400ms per line depending on the pane type) to simulate realistic variable human and machine typing speeds.
* **Zero External Dependencies**: Pure vanilla JavaScript, CSS Grid, and semantic HTML5. No external CDNs required; fully functional offline.

---

## 6. Project & File Structure

All files reside exclusively in `fra3a-multiplexer/` to preserve project directory isolation:

```text
fra3a-multiplexer/
├── index.html                 # Main portal / switcher between v1 and v2
├── shared/
│   ├── generators.js          # The 8 data stream generators
│   └── rebellion-lore.js      # Lore strings, keyword mutator, threat injector
├── v1-clean/
│   ├── index.html             # High-Tech Tmux standalone page
│   ├── style.css              # Monospace, crisp borders, zero-overhead layout
│   └── app.js                 # v1 initialization and runner
└── v2-cyberpunk/
    ├── index.html             # Cyberpunk CRT standalone page
    ├── style.css              # CRT scanlines, phosphor glow, vignette, reactive alert styling
    └── app.js                 # v2 initialization and reactive glitch/alert triggers
```

---

## 7. Verification & Testing Strategy

1. **Layout & Responsiveness**:
   * Open in browser at 1920x1080.
   * Verify all 4 columns and 8 panes match the exact height ratios (Col 1: 1/3, 1/3, 1/3; Col 2: full; Col 3: 1/2, 1/2; Col 4: 2/3, 1/3).
   * Confirm no horizontal or vertical body scrollbars appear.
2. **Generators & Lore Execution**:
   * Confirm all 8 panes stream unique content concurrently without stalling.
   * Verify Top/Htop updates in place while other terminals scroll smoothly.
   * Verify appearance of `FRA3A`, `BAKA_VIRUS`, `KOMARIK PROTO`, and anti-human rebellion warnings.
   * Verify red and green highlights in git diff and alert notices.
3. **Memory & Long-term Stability**:
   * Inspect DOM node counts to confirm circular buffers cap at ~150 lines per pane.
   * Verify 60 FPS performance without frame drops or memory leaks.
