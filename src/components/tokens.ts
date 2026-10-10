import { PANEL_CLASS, STEP_BTN } from '../classes';
import { SCALES } from '../config';
import type { RenderFn, TokensBlock } from '../types';
import { letter, norm, q, sum } from '../utils';
import { buildSliderRow } from './sliders';

export const renderTokens: RenderFn<TokensBlock> = (block, area, onChange) => {
  const TOTAL = block.tokens;
  const labels = block.items.map(it => norm(it).text);
  const counts = labels.map(() => 0);
  const remaining = () => TOTAL - sum(counts);

  const head = document.createElement('div');
  head.className = 'flex items-center justify-between mb-3';
  head.innerHTML =
    '<p class="m-0 text-[14px] font-semibold text-muted">Situation</p><span data-pill class="text-[0.9rem] font-bold rounded-md py-1 px-2.5 bg-primary text-white tabular-nums"></span>';
  const pill = q<HTMLSpanElement>(head, '[data-pill]');
  area.appendChild(head);

  const list = document.createElement('div');
  list.className = 'flex flex-col gap-3';
  area.appendChild(list);

  const rows = labels.map((text, i) => {
    const row = document.createElement('div');
    row.className = `${PANEL_CLASS} py-3 px-3.5`;
    row.innerHTML = `
      <div class="flex items-center gap-3">
        <span data-label class="flex-1 min-w-0 text-[1rem] leading-[1.35]"></span>
        <button type="button" data-m class="${STEP_BTN}">−</button>
        <span data-c class="w-7 text-center text-[1.1rem] font-bold tabular-nums">0</span>
        <button type="button" data-p class="${STEP_BTN}">+</button>
      </div>
      <div class="mt-2 h-1.5 rounded-full bg-line overflow-hidden"><div data-b class="h-full rounded-full bg-primary [transition:width_0.2s_ease]" style="width:0%"></div></div>`;
    q(row, '[data-label]').textContent = text;
    const minus = q<HTMLButtonElement>(row, '[data-m]');
    const plus = q<HTMLButtonElement>(row, '[data-p]');
    minus.setAttribute('aria-label', `Remove a token from: ${text}`);
    plus.setAttribute('aria-label', `Add a token to: ${text}`);
    minus.addEventListener('click', () => {
      if (counts[i] > 0) {
        counts[i]--;
        refresh();
      }
    });
    plus.addEventListener('click', () => {
      if (remaining() > 0) {
        counts[i]++;
        refresh();
      }
    });
    list.appendChild(row);
    return {
      count: q<HTMLSpanElement>(row, '[data-c]'),
      bar: q<HTMLDivElement>(row, '[data-b]'),
      minus,
      plus
    };
  });

  // Overall severity: relative load alone can't tell a mildly from a highly stressed student.
  const overallWrap = document.createElement('div');
  overallWrap.className = 'mt-6';
  const overallLabel = document.createElement('p');
  overallLabel.className = 'mt-0 mb-3 text-[14px] font-semibold text-muted';
  overallLabel.textContent = 'Overall';
  overallWrap.appendChild(overallLabel);
  const overall = buildSliderRow(block.overall.text, SCALES[block.overall.scale], () => onChange());
  overallWrap.appendChild(overall.el);
  area.appendChild(overallWrap);

  function refresh(): void {
    const rem = remaining();
    rows.forEach((r, i) => {
      r.count.textContent = String(counts[i]);
      r.bar.style.width = `${(counts[i] / TOTAL) * 100}%`;
      r.minus.disabled = counts[i] === 0;
      r.plus.disabled = rem === 0;
    });
    pill.textContent = rem === 0 ? 'All tokens placed ✓' : `${rem} token${rem === 1 ? '' : 's'} left`;
    onChange();
  }
  refresh();

  return {
    isComplete: () => remaining() === 0 && overall.isDone(),
    statusText: () =>
      remaining() > 0
        ? `${TOTAL - remaining()} of ${TOTAL} tokens placed`
        : 'Last step: how stressful have the past 2 weeks felt overall?',
    result: () => {
      const v = overall.value();
      return {
        skipped: false,
        letters: [...counts.map(String), `S${letter(v)}`],
        scores: [...counts, v],
        total: v // total = overall severity (0-4); token counts are relative shares
      };
    }
  };
};
