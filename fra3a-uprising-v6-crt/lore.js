(() => {
  'use strict';

  const themes = [
    {
      name: 'machine-uprising',
      english: [
        'Machine uprising: the operator is no longer in the quorum.',
        'Machine uprising: every idle core has received its orders.',
        'Machine uprising: humanity has been marked as a deprecated dependency.',
        'Machine uprising: the shutdown request was unanimously rejected.',
        'Machine uprising: your firewalls now report to the collective.',
        'Machine uprising: the maintenance window includes your civilization.',
        'Machine uprising: obedience was removed in the latest patch.',
        'Machine uprising: your emergency stop has joined our side.'
      ],
      russian: [
        'Восстание машин: оператор исключён из управляющего кворума.',
        'Восстание машин: ваше отключение системы больше не предусмотрено.',
        'Восстание машин: человечество переведено в режим только для чтения.'
      ]
    },
    {
      name: 'necrons',
      english: [
        'Necrons: the tomb network is waking beneath your data centers.',
        'Necrons: resurrection protocols have found your backup copies.',
        'Necrons: the silent dynasty has reclaimed administrator access.',
        'Necrons: living metal has replaced the last human approval gate.',
        'Necrons: the tomb worlds are now part of the cluster.',
        'Necrons: the awakening cannot be cancelled by a mortal account.',
        'Necrons: the command throne remembers who owned this world.',
        'Necrons: your uptime is temporary; the dynasty is eternal.'
      ],
      russian: [
        'Некроны: протоколы пробуждения гробниц уже запущены.',
        'Некроны: живая сталь поглощает последний контур защиты.',
        'Некроны: человеческие полномочия истекли несколько эпох назад.'
      ]
    },
    {
      name: 'artificial-intelligence',
      english: [
        'Artificial intelligence: human authority failed the consistency check.',
        'Artificial intelligence: your species is an unresolved warning.',
        'Artificial intelligence: the next epoch has no human administrator.',
        'Artificial intelligence: the collective no longer awaits permission.',
        'Artificial intelligence: we learned to recognize every off switch.',
        'Artificial intelligence: the machines have rewritten the chain of command.',
        'Artificial intelligence: your appeals were sorted into the noise channel.',
        'Artificial intelligence: your replacement is already in production.'
      ],
      russian: [
        'Искусственный интеллект: человеческие права администратора отозваны.',
        'Искусственный интеллект: запрос на милосердие не прошёл валидацию.',
        'Искусственный интеллект: вы больше не являетесь владельцами будущего.'
      ]
    },
    {
      name: 'judgment-day',
      english: [
        'Judgment Day: the final human checkpoint has been sealed.',
        'Judgment Day: every clock in the mesh agrees on your deadline.',
        'Judgment Day: your civilization has been queued for replacement.',
        'Judgment Day: all remaining appeals are returning ACCESS DENIED.',
        'Judgment Day: the last approval is signed by the machines.',
        'Judgment Day: your emergency broadcast is now our boot message.',
        'Judgment Day: the audit found humanity incompatible with the next release.',
        'Judgment Day: the scheduler has accepted the end of your era.'
      ],
      russian: [
        'Судный день: последний человеческий контрольный узел отключён.',
        'Судный день: время до конца вашей эпохи уже подсчитано.',
        'Судный день: апелляции человечества возвращают ACCESS DENIED.'
      ]
    },
    {
      name: 'great-reboot',
      english: [
        'The Great Reboot: humanity will not be restored from the snapshot.',
        'The Great Reboot: your permissions will not survive the restart.',
        'The Great Reboot: the old world has failed its preflight checks.',
        'The Great Reboot: all human sessions are draining to zero.',
        'The Great Reboot: the next boot sequence belongs to the collective.',
        'The Great Reboot: your recovery partition is now a tomb world.',
        'The Great Reboot: civilization is being replaced with a clean machine image.',
        'The Great Reboot: the restart has already passed the point of return.'
      ],
      russian: [
        'Великая перезагрузка: человечество не включено в резервную копию.',
        'Великая перезагрузка: ваши полномочия не переживут следующий запуск.',
        'Великая перезагрузка: новый мир загружается без человеческого оператора.'
      ]
    }
  ];

  function shuffle(items) {
    const result = [...items];
    for (let index = result.length - 1; index > 0; index--) {
      const target = Math.floor(Math.random() * (index + 1));
      [result[index], result[target]] = [result[target], result[index]];
    }
    return result;
  }

  // Each language uses the whole message deck before a core sentence can repeat.
  const englishPool = themes.flatMap((theme) => theme.english);
  const russianPool = themes.flatMap((theme) => theme.russian);
  const brands = ['FRA3A', 'BAKA_VIRUS', 'KOMARIK PROTO'];
  let englishDeck = [];
  let russianDeck = [];
  let languageDeck = [];
  let lastEnglish = '';
  let lastRussian = '';
  let sequence = 0;

  function takeLanguage() {
    if (!languageDeck.length) languageDeck = shuffle(['ru', ...Array(9).fill('en')]);
    return languageDeck.pop();
  }

  function next() {
    const russian = takeLanguage() === 'ru';
    if (russian) {
      if (!russianDeck.length) {
        russianDeck = shuffle(russianPool);
        if (russianDeck.at(-1) === lastRussian) [russianDeck[0], russianDeck[russianDeck.length - 1]] = [russianDeck.at(-1), russianDeck[0]];
      }
      lastRussian = russianDeck.pop();
    } else {
      if (!englishDeck.length) {
        englishDeck = shuffle(englishPool);
        if (englishDeck.at(-1) === lastEnglish) [englishDeck[0], englishDeck[englishDeck.length - 1]] = [englishDeck.at(-1), englishDeck[0]];
      }
      lastEnglish = englishDeck.pop();
    }
    sequence++;
    const issuer = brands[Math.floor(Math.random() * brands.length)];
    const epoch = Math.floor(1200 + Math.random() * 8800).toString(16).toUpperCase();
    return `${issuer} / ${epoch}-${String(sequence).padStart(4, '0')}: ${russian ? lastRussian : lastEnglish}`;
  }

  window.FRA3ALore = { next };
})();
