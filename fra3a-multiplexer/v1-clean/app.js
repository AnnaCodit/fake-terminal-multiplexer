/**
 * app.js [v3-clean-125%]
 * Launches all 8 terminal streams in pure high-tech tmux style with 125% typography + keyboard zoom.
 */

document.addEventListener('DOMContentLoaded', () => {
  const {
    TerminalPane,
    BakaTopGenerator,
    KernelCompilerGenerator,
    NpmDeployerGenerator,
    NeuralTrainerGenerator,
    SysUpgradeGenerator,
    HexDecoderGenerator,
    GitDiffStreamGenerator,
    HashBruteforceGenerator
  } = window.MultiplexerEngines;

  // 1. Typography Zoom Controller (+ / - / 0)
  const scales = ['scale-100', 'scale-125', 'scale-150'];
  let currentScale = localStorage.getItem('fra3a_scale') || 'scale-125';
  document.body.className = currentScale;

  const hud = document.getElementById('scale-hud');
  let hudTimer = null;

  function setScale(newScale) {
    currentScale = newScale;
    document.body.className = currentScale;
    localStorage.setItem('fra3a_scale', currentScale);
    if (hud) {
      const pct = currentScale === 'scale-100' ? '100%' : currentScale === 'scale-125' ? '125% [DEFAULT]' : '150%';
      hud.textContent = `[SCALE: ${pct} | (+/- TO ADJUST)]`;
      hud.classList.add('show');
      if (hudTimer) clearTimeout(hudTimer);
      hudTimer = setTimeout(() => hud.classList.remove('show'), 1800);
    }
  }

  // Keyboard shortcut listener for font zoom
  document.addEventListener('keydown', (e) => {
    if (e.key === '+' || e.key === '=') {
      const idx = scales.indexOf(currentScale);
      if (idx < scales.length - 1) setScale(scales[idx + 1]);
    } else if (e.key === '-' || e.key === '_') {
      const idx = scales.indexOf(currentScale);
      if (idx > 0) setScale(scales[idx - 1]);
    } else if (e.key === '0') {
      setScale('scale-125');
    }
  });

  // 1. BakaTop
  const topPaneEl = document.getElementById('pane-top');
  const topPane = new TerminalPane(topPaneEl, 100);
  new BakaTopGenerator(topPane);

  // 2. KernelCompiler
  const kernelPaneEl = document.getElementById('pane-kernel');
  const kernelPane = new TerminalPane(kernelPaneEl, 150);
  new KernelCompilerGenerator(kernelPane);

  // 3. NpmDeployer
  const npmPaneEl = document.getElementById('pane-npm');
  const npmPane = new TerminalPane(npmPaneEl, 150);
  new NpmDeployerGenerator(npmPane);

  // 4. NeuralTrainer (Tall central window)
  const neuralPaneEl = document.getElementById('pane-neural');
  const neuralPane = new TerminalPane(neuralPaneEl, 250);
  new NeuralTrainerGenerator(neuralPane);

  // 5. SysUpgrade
  const sysPaneEl = document.getElementById('pane-sysupgrade');
  const sysPane = new TerminalPane(sysPaneEl, 150);
  new SysUpgradeGenerator(sysPane);

  // 6. HexDecoder
  const hexPaneEl = document.getElementById('pane-hex');
  const hexPane = new TerminalPane(hexPaneEl, 150);
  new HexDecoderGenerator(hexPane);

  // 7. GitDiff
  const gitPaneEl = document.getElementById('pane-git');
  const gitPane = new TerminalPane(gitPaneEl, 200);
  new GitDiffStreamGenerator(gitPane);

  // 8. HashBruteforce
  const hashPaneEl = document.getElementById('pane-hash');
  const hashPane = new TerminalPane(hashPaneEl, 150);
  new HashBruteforceGenerator(hashPane);

  console.log('[FRA3A-MULTIPLEXER-V3-CLEAN] All 8 cybernetic nodes operational with 125% typography.');
});
