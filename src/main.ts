import './styles.css';

import { BLOCKS } from './blocks';
import { renderMatch } from './components/match';
import { renderSliders } from './components/sliders';
import { renderSwipe } from './components/swipe';
import { renderTokens } from './components/tokens';
import { FORM_A_ID, FORM_B_ID, HINTS } from './config';
import { formatAnswers, hiddenFieldsForFormB, type Results } from './scoring';
import { mountTally } from './tally';
import type { Block, Renderer } from './types';
import { q, reduceMotion } from './utils';

const STEPS = ['step-a', 'step-game', 'step-b'] as const;

// ---- URL parameters (page, blocks, respondentId) ----------------------------------------
const params = new URLSearchParams(window.location.search);

const requestedPage = parseInt(params.get('page') ?? '', 10);
const startPage = [1, 2, 3].includes(requestedPage) ? requestedPage : 1;

const requestedBlocks = (params.get('blocks') ?? '')
  .split(',')
  .map(s => parseInt(s, 10))
  .filter(n => !isNaN(n));
const chosenBlocks = BLOCKS.filter(b => requestedBlocks.includes(b.id));
const ACTIVE_BLOCKS: Block[] = chosenBlocks.length ? chosenBlocks : BLOCKS;

const respondentId =
  (params.get('respondentId') ?? '').trim() ||
  (window.crypto && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : String(Date.now()) + Math.random().toString(16).slice(2));

// ---- DOM ---------------------------------------------------------------------------------
const $ = <T extends HTMLElement = HTMLElement>(id: string): T => q<T>(document, `#${id}`);

const nextBtn = $<HTMLButtonElement>('next-game');
const skipBtn = $<HTMLButtonElement>('skip-game');
const statusEl = $('status-msg');
const area = $('game-area');

// ---- State -------------------------------------------------------------------------------
let gameResult = '';
let qIndex = 0;
let current: Renderer | null = null;
let navigating = false;
const results: Results = {};

function renderBlock(block: Block, onChange: () => void): Renderer {
  switch (block.type) {
    case 'match':
      return renderMatch(block, area, onChange);
    case 'swipe':
      return renderSwipe(block, area, onChange);
    case 'slider':
      return renderSliders(block, area, onChange);
    case 'tokens':
      return renderTokens(block, area, onChange);
  }
}

function refresh(): void {
  if (!current) return;
  const done = current.isComplete();
  statusEl.classList.toggle('success-text', done);
  statusEl.textContent = done ? 'All answered! Press Next to continue.' : current.statusText();
  nextBtn.disabled = !done;
}

function showStep(id: (typeof STEPS)[number]): void {
  STEPS.forEach(s => {
    $(s).hidden = s !== id;
  });
  window.scrollTo(0, 0);
}

function showQuestion(i: number): void {
  qIndex = i;
  const block = ACTIVE_BLOCKS[i];
  const total = ACTIVE_BLOCKS.length;

  $('intro').hidden = i > 0;

  $('progress').hidden = total < 2;
  $('progress-label').textContent = `Section ${i + 1} of ${total}`;
  $('progress-bar').style.width = `${((i + 1) / total) * 100}%`;

  const title = $('question');
  title.textContent = block.title;
  title.hidden = !block.title;

  $('hint').textContent = HINTS[block.type];

  area.innerHTML = '';
  current = null;
  current = renderBlock(block, refresh);
  refresh();
  window.scrollTo(0, 0);
}

/** Cross-fade between sections where the View Transitions API exists; plain swap otherwise. */
function withTransition(update: () => void): void {
  const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
  if (typeof doc.startViewTransition === 'function' && !reduceMotion()) {
    navigating = true; // ignore extra clicks until the new section is in place
    doc.startViewTransition(() => {
      try {
        update();
      } finally {
        navigating = false;
      }
    });
  } else {
    update();
  }
}

function goTo(page: 1 | 2 | 3): void {
  if (page === 1) {
    mountTally('mount-a', FORM_A_ID, { respondentId }, 'Form A');
  }
  if (page === 3) {
    mountTally(
      'mount-b',
      FORM_B_ID,
      hiddenFieldsForFormB(ACTIVE_BLOCKS, results, respondentId, gameResult),
      'Form B'
    );
  }
  showStep(STEPS[page - 1]);
}

function recordResult(skipped: boolean): void {
  const block = ACTIVE_BLOCKS[qIndex];
  if (skipped) {
    results[block.id] = { skipped: true };
  } else if (current) {
    results[block.id] = current.result();
  }
}

function advance(): void {
  if (qIndex < ACTIVE_BLOCKS.length - 1) {
    const next = qIndex + 1;
    withTransition(() => showQuestion(next));
    return;
  }
  gameResult = formatAnswers(ACTIVE_BLOCKS, results);
  goTo(3);
}

nextBtn.addEventListener('click', () => {
  if (navigating) return;
  recordResult(false);
  advance();
});

skipBtn.addEventListener('click', () => {
  if (navigating) return;
  recordResult(true);
  advance();
});

showQuestion(0);
goTo(startPage as 1 | 2 | 3);
