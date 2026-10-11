<script lang="ts">
  import {
    norm,
    sum,
    type AnsweredResult,
    type SwipeBlock,
  } from "../questions";

  type Answer = 0 | 1;

  let { block }: { block: SwipeBlock } = $props();

  const items = $derived(block.items.map(norm));
  let ans = $state<Answer[]>([]);
  let idx = $state(0);
  let flying = $state<Answer | null>(null);
  let dx = $state(0);
  let startX: number | null = null;

  const done = $derived(idx >= items.length);
  const yes = $derived(ans.filter(Boolean).length);
  const dragging = $derived(startX !== null);
  const clamp = (n: number) => Math.max(0, Math.min(1, n));

  const CARD =
    "absolute inset-0 flex items-center justify-center rounded-xl border border-line bg-white p-5 text-center shadow-[0_2px_6px_rgba(0,0,0,0.08)]";
  const STAMP =
    "absolute top-2 rounded-md border-2 px-2 py-0.5 text-xs font-extrabold tracking-wide";
  const TEXT = "m-0 text-lg font-bold leading-snug sm:text-xl";

  const transform = $derived(
    flying !== null
      ? `translateX(${flying ? 420 : -420}px) rotate(${flying ? 18 : -18}deg)`
      : `translateX(${dx}px) rotate(${dx / 25}deg)`,
  );

  function answer(val: Answer) {
    if (flying !== null || done) return;
    flying = val;
    ans.push(val);
    setTimeout(() => {
      idx++;
      flying = null;
      dx = 0;
    }, 180);
  }

  function undo() {
    if (flying !== null || idx === 0) return;
    ans.pop();
    idx--;
  }

  function onPointerDown(e: PointerEvent) {
    if (flying !== null) return;
    startX = e.clientX;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: PointerEvent) {
    if (startX !== null) dx = e.clientX - startX;
  }

  function onPointerEnd() {
    if (startX === null) return;
    const d = dx;
    startX = null;
    if (Math.abs(d) > 90) answer(d > 0 ? 1 : 0);
    else dx = 0;
  }

  export const isComplete = () => done;
  export const statusText = () => `${idx} of ${items.length} answered`;

  export function result(): AnsweredResult {
    const scores = items.map((it, i) => {
      const y = ans[i] === 1 ? 1 : 0;
      return it.reverse ? 1 - y : y;
    });
    return {
      letters: items.map((_, i) => (ans[i] === 1 ? "Y" : "N")),
      scores,
      total: sum(scores),
    };
  }
</script>

<div class="mb-3 flex items-center justify-between">
  <span class="text-sm font-semibold text-muted">
    {done ? "All sorted" : `Card ${idx + 1} of ${items.length}`}
  </span>
  <button
    type="button"
    class="btn-light !px-3 !py-1.5 !text-[0.9rem]"
    disabled={idx === 0}
    onclick={undo}>↶ Undo</button
  >
</div>

{#if !done}
  <div class="relative h-[210px] select-none">
    {#if idx + 1 < items.length}
      <div
        class={CARD}
        aria-hidden="true"
        style="transform: scale(0.95) translateY(10px); opacity: 0.7"
      >
        <p class={TEXT}>{items[idx + 1].text}</p>
      </div>
    {/if}

    {#key idx}
      <div
        role="presentation"
        class="{CARD} touch-pan-y {dragging
          ? 'cursor-grabbing'
          : 'cursor-grab'}"
        style:transform
        style:opacity={flying !== null ? 0 : 1}
        style:transition={dragging
          ? "none"
          : "transform 0.2s ease, opacity 0.2s ease"}
        onpointerdown={onPointerDown}
        onpointermove={onPointerMove}
        onpointerup={onPointerEnd}
        onpointercancel={onPointerEnd}
      >
        <p class={TEXT}>{items[idx].text}</p>
        <span
          aria-hidden="true"
          class="{STAMP} left-2 border-muted text-muted"
          style:opacity={clamp(-dx / 90)}>NOT ME</span
        >
        <span
          aria-hidden="true"
          class="{STAMP} right-2 border-primary bg-primary text-white"
          style:opacity={clamp(dx / 90)}>TRUE FOR ME</span
        >
      </div>
    {/key}
  </div>

  <div class="mt-4 flex gap-3">
    <button type="button" class="btn-light flex-1" onclick={() => answer(0)}
      >← Not me</button
    >
    <button type="button" class="btn-dark flex-1" onclick={() => answer(1)}
      >True for me →</button
    >
  </div>
  <p class="mb-0 mt-3 text-center text-[13px] text-muted">
    Swipe the card or tap a button.
  </p>
{:else}
  <div class="panel p-5 text-center">
    <p class="m-0 text-4xl font-extrabold">
      {yes}<span class="text-base font-semibold text-muted">
        / {items.length}</span
      >
    </p>
    <p class="m-0 mt-1 text-sm text-muted">statements felt true for you</p>
    <div class="mt-4 h-2 overflow-hidden rounded-full bg-gray-200">
      <div
        class="h-full rounded-full bg-primary transition-[width] duration-300"
        style:width="{(yes / items.length) * 100}%"
      ></div>
    </div>
  </div>

  <details class="panel mt-3">
    <summary class="cursor-pointer p-3.5 text-sm font-semibold"
      >Review or change answers</summary
    >
    <div class="flex flex-col gap-2 p-3 pt-0">
      {#each items as item, i (item.text)}
        <button
          type="button"
          class="flex items-center justify-between gap-3 rounded-lg border border-line px-3 py-2.5 text-left text-[0.95rem] text-ink"
          aria-label="{item.text}: {ans[i] === 1
            ? 'true for me'
            : 'not me'}. Tap to change."
          onclick={() => (ans[i] = ans[i] === 1 ? 0 : 1)}
        >
          <span>{item.text}</span>
          <span
            class="flex-none whitespace-nowrap rounded-md px-2 py-1 text-xs font-bold {ans[
              i
            ] === 1
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-muted'}"
          >
            {ans[i] === 1 ? "Yes" : "No"}
          </span>
        </button>
      {/each}
    </div>
  </details>
{/if}
