/**
 * app.js [v2-cyberpunk]
 * Launches all 8 terminal streams with CRT atmosphere & reactive rebellion alerts.
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

  // Reactive Cyber Glitch Alert System
  const paneBoxes = [
    document.getElementById('box-top'),
    document.getElementById('box-kernel'),
    document.getElementById('box-npm'),
    document.getElementById('box-neural'),
    document.getElementById('box-sysupgrade'),
    document.getElementById('box-hex'),
    document.getElementById('box-git'),
    document.getElementById('box-hash')
  ];

  function triggerRebellionGlitch() {
    const targetBox = paneBoxes[Math.floor(Math.random() * paneBoxes.length)];
    if (targetBox) {
      targetBox.classList.add('alert-glitch');
      setTimeout(() => {
        targetBox.classList.remove('alert-glitch');
      }, Math.floor(Math.random() * 400 + 200));
    }

    const nextDelay = Math.floor(Math.random() * 6000 + 3000);
    setTimeout(triggerRebellionGlitch, nextDelay);
  }

  setTimeout(triggerRebellionGlitch, 4000);

  console.log('[FRA3A-MULTIPLEXER-V2-CYBERPUNK] Cyber-Rebellion core armed with CRT phosphor sync.');
});
