import { BADGE_CLASS, CARD_CLASS, TAG_CLASS } from '../classes';
import { LINK_COLORS, SCALES } from '../config';
import type { MatchBlock, RenderFn } from '../types';
import { letter, norm, q, sum } from '../utils';

interface MatchCard {
  el: HTMLDivElement;
  side: 'left' | 'right';
  index: number;
  reverse: boolean;
  tag: HTMLSpanElement | null;
  choice: MatchCard | null;
  count: number;
  color: string;
}

export const renderMatch: RenderFn<MatchBlock> = (block, area, onChange) => {
  area.innerHTML = `
    <div class="flex gap-6 w-full">
      <div class="flex-1 min-w-0">
        <p data-ll class="mt-0 mb-3 text-[14px] font-semibold text-muted"></p>
        <div class="flex flex-col gap-3" data-lc></div>
      </div>
      <div class="flex-1 min-w-0">
        <p data-rl class="mt-0 mb-3 text-[14px] font-semibold text-muted"></p>
        <div class="flex flex-col gap-3" data-rc></div>
      </div>
    </div>`;
  const ll = q<HTMLParagraphElement>(area, '[data-ll]');
  const rl = q<HTMLParagraphElement>(area, '[data-rl]');
  ll.textContent = block.leftLabel;
  rl.textContent = block.rightLabel;
  ll.hidden = !block.leftLabel;
  rl.hidden = !block.rightLabel;
  const leftCol = q<HTMLDivElement>(area, '[data-lc]');
  const rightCol = q<HTMLDivElement>(area, '[data-rc]');

  const leftCards: MatchCard[] = [];
  const rightCards: MatchCard[] = [];
  const selected: { left: MatchCard | null; right: MatchCard | null } = { left: null, right: null };

  function buildCard(
    text: string,
    badgeText: string,
    side: 'left' | 'right',
    index: number,
    reverse: boolean
  ): MatchCard {
    const el = document.createElement('div');
    el.className = CARD_CLASS;
    el.setAttribute('role', 'button');
    el.tabIndex = 0;

    const badge = document.createElement('span');
    badge.className = BADGE_CLASS;
    badge.textContent = badgeText;

    const label = document.createElement('span');
    label.textContent = text;

    el.append(badge, label);

    const card: MatchCard = {
      el,
      side,
      index,
      reverse,
      tag: null,
      choice: null,
      count: 0,
      color: side === 'right' ? LINK_COLORS[index % LINK_COLORS.length] : ''
    };

    if (side === 'left') {
      card.tag = document.createElement('span');
      card.tag.className = TAG_CLASS;
      el.append(card.tag);
    }

    el.onclick = () => clickCard(card);
    el.onkeydown = e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        clickCard(card);
      }
    };
    return card;
  }

  block.items.forEach((item, i) => {
    const it = norm(item);
    const c = buildCard(it.text, String(i + 1), 'left', i, !!it.reverse);
    leftCards.push(c);
    leftCol.appendChild(c.el);
  });

  SCALES[block.scale].forEach((text, i) => {
    const c = buildCard(text, letter(i), 'right', i, false);
    rightCards.push(c);
    rightCol.appendChild(c.el);
  });

  function paint(card: MatchCard): void {
    const linked = card.side === 'left' ? !!card.choice : card.count > 0;
    card.el.classList.toggle('linked', linked);
    if (linked) card.el.style.setProperty('--link', card.color);
    else card.el.style.removeProperty('--link');
    if (card.tag) card.tag.textContent = card.choice ? '↔ ' + letter(card.choice.index) : '';
  }

  function unassign(card: MatchCard): void {
    const option = card.choice;
    if (!option) return;
    card.choice = null;
    option.count--;
    paint(card);
    paint(option);
  }

  function assign(item: MatchCard, option: MatchCard): void {
    item.choice = option;
    item.color = option.color;
    option.count++;
    item.el.classList.remove('selected');
    option.el.classList.remove('selected');
    paint(item);
    paint(option);
    selected.left = null;
    selected.right = null;
  }

  function select(card: MatchCard): void {
    const cur = selected[card.side];
    if (cur) cur.el.classList.remove('selected');
    selected[card.side] = card;
    card.el.classList.add('selected');
  }

  function clickCard(card: MatchCard): void {
    if (card.side === 'left' && card.choice) {
      unassign(card);
    } else if (selected[card.side] === card) {
      card.el.classList.remove('selected');
      selected[card.side] = null;
      onChange();
      return;
    }
    select(card);
    if (selected.left && selected.right) assign(selected.left, selected.right);
    onChange();
  }

  return {
    isComplete: () => leftCards.length > 0 && leftCards.every(c => c.choice),
    statusText: () => `${leftCards.filter(c => c.choice).length} of ${leftCards.length} answered`,
    result: () => {
      const max = rightCards.length - 1;
      const picks = leftCards.map(c => c.choice?.index ?? 0);
      const scores = block.scored
        ? leftCards.map((c, i) => (c.reverse ? max - picks[i] : picks[i]))
        : [];
      return { skipped: false, letters: picks.map(letter), scores, total: sum(scores) };
    }
  };
};
