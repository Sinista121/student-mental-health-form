import { BTN_DARK, BTN_LIGHT, PANEL_CLASS } from '../classes';
import type { RenderFn, SwipeBlock } from '../types';
import { norm, q, reduceMotion, sum } from '../utils';

type Answer = 0 | 1; // 1 = true for me, 0 = not me

const CARD_BASE =
  'absolute inset-0 flex items-center justify-center text-center p-6 bg-white border border-solid border-line rounded-xl shadow-[0_2px_6px_rgba(0,0,0,0.08)]';
const STAMP_BASE =
  'absolute top-3 text-[0.8rem] font-extrabold tracking-wide rounded-md py-1 px-2 border-2 border-solid';
// Full literal class strings so the Tailwind build can see them.
const STAMP_NO = `${STAMP_BASE} left-3 text-muted border-muted`;
const STAMP_YES = `${STAMP_BASE} right-3 bg-primary text-white border-primary`;

export const renderSwipe: RenderFn<SwipeBlock> = (block, area, onChange) => {
  const items = block.items.map(norm);
  const ans: (Answer | null)[] = items.map(() => null);
  let idx = 0;
  let busy = false;

  area.innerHTML = `
    <div class="flex items-center justify-between mb-3">
      <span data-count class="text-[14px] font-semibold text-muted"></span>
      <button type="button" data-undo class="${BTN_LIGHT} !py-1.5 !px-3 !text-[0.9rem]">↶ Undo</button>
    </div>
    <div data-stack tabindex="0" role="group" aria-label="Statement card. Use left arrow for not me, right arrow for true for me." class="relative h-[200px] outline-none select-none"></div>
    <div class="mt-4 flex gap-3">
      <button type="button" data-no class="${BTN_LIGHT} flex-1">← Not me</button>
      <button type="button" data-yes class="${BTN_DARK} flex-1">True for me →</button>
    </div>
    <p class="mt-3 mb-0 text-[13px] text-muted">Swipe, tap a button, or use the ← → keys.</p>`;

  const count = q<HTMLSpanElement>(area, '[data-count]');
  const undoBtn = q<HTMLButtonElement>(area, '[data-undo]');
  const stack = q<HTMLDivElement>(area, '[data-stack]');
  const noBtn = q<HTMLButtonElement>(area, '[data-no]');
  const yesBtn = q<HTMLButtonElement>(area, '[data-yes]');

  function makeCard(text: string, peek: boolean): HTMLDivElement {
    const c = document.createElement('div');
    c.className = CARD_BASE;
    const t = document.createElement('p');
    t.className = 'm-0 text-[20px] font-bold leading-[1.35]';
    t.textContent = text;
    c.appendChild(t);
    if (peek) {
      c.style.transform = 'scale(0.95) translateY(10px)';
      c.style.opacity = '0.7';
      c.setAttribute('aria-hidden', 'true');
    }
    return c;
  }

  function attachDrag(card: HTMLDivElement): void {
    const mk = (txt: string, cls: string): HTMLSpanElement => {
      const s = document.createElement('span');
      s.textContent = txt;
      s.className = cls;
      s.style.opacity = '0';
      s.setAttribute('aria-hidden', 'true');
      card.appendChild(s);
      return s;
    };
    const stampNo = mk('NOT ME', STAMP_NO);
    const stampYes = mk('TRUE FOR ME', STAMP_YES);

    card.style.touchAction = 'pan-y';
    card.style.cursor = 'grab';

    let startX: number | null = null;
    let dx = 0;
    card.addEventListener('pointerdown', e => {
      if (busy) return;
      startX = e.clientX;
      dx = 0;
      card.setPointerCapture(e.pointerId);
      card.style.transition = 'none';
      card.style.cursor = 'grabbing';
    });
    card.addEventListener('pointermove', e => {
      if (startX === null) return;
      dx = e.clientX - startX;
      card.style.transform = `translateX(${dx}px) rotate(${dx / 25}deg)`;
      stampYes.style.opacity = String(Math.max(0, Math.min(1, dx / 90)));
      stampNo.style.opacity = String(Math.max(0, Math.min(1, -dx / 90)));
    });
    const end = () => {
      if (startX === null) return;
      const d = dx;
      startX = null;
      card.style.cursor = 'grab';
      if (Math.abs(d) > 90) {
        answer(d > 0 ? 1 : 0);
      } else {
        card.style.transition = 'transform 0.2s ease';
        card.style.transform = '';
        stampYes.style.opacity = '0';
        stampNo.style.opacity = '0';
      }
    };
    card.addEventListener('pointerup', end);
    card.addEventListener('pointercancel', end);
  }

  function answer(val: Answer): void {
    if (busy || idx >= items.length) return;
    busy = true;
    const top = stack.lastElementChild as HTMLElement | null;
    const dur = reduceMotion() ? 0 : 180;
    if (top && dur) {
      top.style.transition = 'transform 0.2s ease, opacity 0.2s ease';
      top.style.transform = `translateX(${val ? 420 : -420}px) rotate(${val ? 18 : -18}deg)`;
      top.style.opacity = '0';
    }
    ans[idx] = val;
    setTimeout(() => {
      idx++;
      busy = false;
      render();
    }, dur);
  }

  function undo(): void {
    if (busy || idx === 0) return;
    idx--;
    ans[idx] = null;
    render();
  }

  function renderSummary(): void {
    const list = document.createElement('div');
    list.className = 'flex flex-col gap-2';
    items.forEach((it, i) => {
      const row = document.createElement('button');
      row.type = 'button';
      row.className = `${PANEL_CLASS} flex items-center justify-between gap-3 py-3 px-3.5 text-left cursor-pointer [font-family:inherit] text-[1rem] text-ink hover:border-[#9ca3af]`;
      const label = document.createElement('span');
      label.textContent = it.text;
      const chip = document.createElement('span');
      const paintChip = () => {
        const yes = ans[i] === 1;
        chip.textContent = yes ? 'True for me' : 'Not me';
        chip.className = yes
          ? 'flex-none text-[0.8rem] font-bold rounded-md py-1 px-2 whitespace-nowrap bg-primary text-white'
          : 'flex-none text-[0.8rem] font-bold rounded-md py-1 px-2 whitespace-nowrap bg-[#f3f4f6] text-muted';
        row.setAttribute('aria-label', `${it.text}: ${yes ? 'true for me' : 'not me'}. Tap to change.`);
      };
      paintChip();
      row.addEventListener('click', () => {
        ans[i] = ans[i] === 1 ? 0 : 1;
        paintChip();
        onChange();
      });
      row.append(label, chip);
      list.appendChild(row);
    });
    const note = document.createElement('p');
    note.className = 'mt-1 mb-0 text-[13px] text-muted';
    note.textContent = 'Tap any statement to change your answer.';
    stack.append(list, note);
  }

  function render(): void {
    const done = idx >= items.length;
    count.textContent = done
      ? `All ${items.length} cards sorted`
      : `Card ${idx + 1} of ${items.length}`;
    undoBtn.disabled = idx === 0;
    noBtn.disabled = yesBtn.disabled = done;
    stack.innerHTML = '';
    stack.style.height = done ? 'auto' : '200px';

    if (done) {
      renderSummary();
    } else {
      if (idx + 1 < items.length) stack.appendChild(makeCard(items[idx + 1].text, true));
      const top = makeCard(items[idx].text, false);
      stack.appendChild(top);
      attachDrag(top);
    }
    onChange();
  }

  noBtn.addEventListener('click', () => answer(0));
  yesBtn.addEventListener('click', () => answer(1));
  undoBtn.addEventListener('click', undo);
  stack.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      answer(0);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      answer(1);
    } else if (e.key === 'Backspace') {
      e.preventDefault();
      undo();
    }
  });

  render();

  const scoreOf = (): number[] =>
    ans.map((v, i) => {
      const yes = v === 1 ? 1 : 0;
      return items[i].reverse ? 1 - yes : yes;
    });

  return {
    isComplete: () => idx >= items.length,
    statusText: () => `${idx} of ${items.length} answered`,
    result: () => {
      const scores = scoreOf();
      return {
        skipped: false,
        letters: ans.map(v => (v === 1 ? 'Y' : 'N')),
        scores,
        total: sum(scores)
      };
    }
  };
};
