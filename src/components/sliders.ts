import { PANEL_CLASS } from '../classes';
import { SCALES, SEQ } from '../config';
import type { RenderFn, SliderBlock } from '../types';
import { letter, norm, q, sum } from '../utils';

export interface SliderRow {
  el: HTMLDivElement;
  isDone(): boolean;
  value(): number;
}

/** One labelled slider with a coloured value chip. Also reused by the tokens component. */
export function buildSliderRow(text: string, labels: string[], onTouch: () => void): SliderRow {
  const el = document.createElement('div');
  el.className = `${PANEL_CLASS} p-4`;
  el.innerHTML = `
    <div class="flex items-start justify-between gap-3">
      <p data-text class="m-0 text-[1rem] font-semibold leading-[1.35]"></p>
      <span data-chip class="flex-none text-[0.8rem] font-bold rounded-md py-1 px-2 whitespace-nowrap"></span>
    </div>
    <input type="range" min="0" max="4" step="1" value="2" class="lvl untouched">
    <div class="flex justify-between gap-3 text-[12px] text-muted"><span data-lo></span><span data-hi></span></div>`;

  const input = q<HTMLInputElement>(el, 'input');
  const chip = q<HTMLSpanElement>(el, '[data-chip]');

  q(el, '[data-text]').textContent = text;
  q(el, '[data-lo]').textContent = labels[0];
  q(el, '[data-hi]').textContent = labels[labels.length - 1];
  input.setAttribute('aria-label', text);

  let touched = false;
  const setChip = (txt: string, bg: string, fg: string) => {
    chip.textContent = txt;
    chip.style.background = bg;
    chip.style.color = fg;
  };
  setChip('Slide to answer', '#f3f4f6', '#6b7280');

  const paint = () => {
    const v = Number(input.value);
    input.setAttribute('aria-valuetext', labels[v]);
    if (!touched) return;
    input.classList.remove('untouched');
    input.style.setProperty('--c', SEQ[v]);
    input.style.setProperty('--p', `${(v / 4) * 100}%`);
    setChip(labels[v], SEQ[v], v >= 2 ? '#ffffff' : '#1a1a1a');
  };
  const touch = () => {
    touched = true;
    paint();
    onTouch();
  };
  input.addEventListener('input', touch);
  input.addEventListener('change', touch);
  input.addEventListener('pointerup', touch);

  return { el, isDone: () => touched, value: () => Number(input.value) };
}

export const renderSliders: RenderFn<SliderBlock> = (block, area, onChange) => {
  const labels = SCALES[block.scale];
  const items = block.items.map(norm);

  const wrap = document.createElement('div');
  wrap.className = 'flex flex-col gap-3';
  const rows = items.map(it => {
    const row = buildSliderRow(it.text, labels, onChange);
    wrap.appendChild(row.el);
    return row;
  });
  area.appendChild(wrap);

  return {
    isComplete: () => rows.every(r => r.isDone()),
    statusText: () => `${rows.filter(r => r.isDone()).length} of ${rows.length} answered`,
    result: () => {
      const vals = rows.map(r => r.value());
      const scores = vals.map((v, i) => (items[i].reverse ? 4 - v : v));
      return { skipped: false, letters: vals.map(letter), scores, total: sum(scores) };
    }
  };
};
