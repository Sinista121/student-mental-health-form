<script lang="ts">
  import {
    norm,
    reduceMotion,
    sum,
    type AnsweredResult,
    type SwipeBlock,
  } from "../questions";

  type Answer = 0 | 1; // 1 = true for me, 0 = not me

  let { block }: { block: SwipeBlock } = $props();

  const items = $derived(block.items.map(norm));

  // svelte-ignore state_referenced_locally
  let ans = $state<(Answer | null)[]>(block.items.map(() => null));
  let idx = $state(0);
  let busy = $state(false);
  let flying = $state<Answer | null>(null); // set while the card flies off after an answer
  let dragging = $state(false);
  let dx = $state(0);
  let startX: number | null = null;

  const done = $derived(idx >= items.length);

  const CARD =
    "absolute inset-0 flex items-center justify-center text-center p-6 bg-white border border-solid border-line rounded-xl shadow-[0_2px_6px_rgba(0,0,0,0.08)]";
  const STAMP =
    "absolute top-3 text-[0.8rem] font-extrabold tracking-wide rounded-md py-1 px-2 border-2 border-solid";
  const CHIP =
    "flex-none text-[0.8rem] font-bold rounded-md py-1 px-2 whitespace-nowrap";

  const cardTransform = $derived(
    flying !== null
      ? `translateX(${flying ? 420 : -420}px) rotate(${flying ? 18 : -18}deg)`
      : dx !== 0
        ? `translateX(${dx}px) rotate(${dx / 25}deg)`
        : "none",
  );
  const yesOpacity = $derived(Math.max(0, Math.min(1, dx / 90)));
  const noOpacity = $derived(Math.max(0, Math.min(1, -dx / 90)));

  function answer(val: Answer) {
    if (busy || done) return;
    busy = true;
    flying = val;
    ans[idx] = val;
    setTimeout(
      () => {
        idx++;
        busy = false;
        flying = null;
        dragging = false;
        dx = 0;
      },
      reduceMotion() ? 0 : 180,
    );
  }

  function undo() {
    if (busy || idx === 0) return;
    idx--;
    ans[idx] = null;
  }

  function onPointerDown(e: PointerEvent) {
    if (busy) return;
    startX = e.clientX;
    dx = 0;
    dragging = true;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: PointerEvent) {
    if (startX === null) return;
    dx = e.clientX - startX;
  }

  function onPointerEnd() {
    if (startX === null) return;
    const d = dx;
    startX = null;
    dragging = false;
    if (Math.abs(d) > 90) answer(d > 0 ? 1 : 0);
    else dx = 0;
  }

  function onKey(e: KeyboardEvent) {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      answer(0);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      answer(1);
    } else if (e.key === "Backspace") {
      e.preventDefault();
      undo();
    }
  }

  function scoreOf(): number[] {
    return ans.map((v, i) => {
      const yes = v === 1 ? 1 : 0;
      return items[i].reverse ? 1 - yes : yes;
    });
  }

  export function isComplete(): boolean {
    return done;
  }

  export function statusText(): string {
    return `${idx} of ${items.length} answered`;
  }

  export function result(): AnsweredResult {
    const scores = scoreOf();
    return {
      skipped: false,
      letters: ans.map((v) => (v === 1 ? "Y" : "N")),
      scores,
      total: sum(scores),
    };
  }
</script>

<div class="flex items-center justify-between mb-3">
  <span class="text-[14px] font-semibold text-muted">
    {done
      ? `All ${items.length} cards sorted`
      : `Card ${idx + 1} of ${items.length}`}
  </span>
  <button
    type="button"
    class="btn-light !py-1.5 !px-3 !text-[0.9rem]"
    disabled={idx === 0}
    onclick={undo}>↶ Undo</button
  >
</div>

<!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions -->
<div
  role="group"
  tabindex="0"
  aria-label="Statement card. Use left arrow for not me, right arrow for true for me."
  class="relative outline-none select-none"
  style:height={done ? "auto" : "200px"}
  onkeydown={onKey}
>
  {#if !done}
    {#if idx + 1 < items.length}
      <div
        class={CARD}
        aria-hidden="true"
        style="transform: scale(0.95) translateY(10px); opacity: 0.7"
      >
        <p class="m-0 text-[20px] font-bold leading-[1.35]">
          {items[idx + 1].text}
        </p>
      </div>
    {/if}

    {#key idx}
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div
        class={CARD}
        style:touch-action="pan-y"
        style:cursor={dragging ? "grabbing" : "grab"}
        style:transform={cardTransform}
        style:opacity={flying !== null ? 0 : 1}
        style:transition={dragging
          ? "none"
          : "transform 0.2s ease, opacity 0.2s ease"}
        onpointerdown={onPointerDown}
        onpointermove={onPointerMove}
        onpointerup={onPointerEnd}
        onpointercancel={onPointerEnd}
      >
        <p class="m-0 text-[20px] font-bold leading-[1.35]">
          {items[idx].text}
        </p>
        <span
          aria-hidden="true"
          class="{STAMP} left-3 text-muted border-muted"
          style:opacity={noOpacity}>NOT ME</span
        >
        <span
          aria-hidden="true"
          class="{STAMP} right-3 bg-primary text-white border-primary"
          style:opacity={yesOpacity}>TRUE FOR ME</span
        >
      </div>
    {/key}
  {:else}
    <div class="flex flex-col gap-2">
      {#each items as item, i (item.text)}
        <button
          type="button"
          class="panel flex items-center justify-between gap-3 py-3 px-3.5 text-left cursor-pointer text-[1rem] text-ink hover:border-[#9ca3af]"
          aria-label="{item.text}: {ans[i] === 1
            ? 'true for me'
            : 'not me'}. Tap to change."
          onclick={() => (ans[i] = ans[i] === 1 ? 0 : 1)}
        >
          <span>{item.text}</span>
          <span
            class="{CHIP} {ans[i] === 1
              ? 'bg-primary text-white'
              : 'bg-[#f3f4f6] text-muted'}"
          >
            {ans[i] === 1 ? "True for me" : "Not me"}
          </span>
        </button>
      {/each}
    </div>
    <p class="mt-1 mb-0 text-[13px] text-muted">
      Tap any statement to change your answer.
    </p>
  {/if}
</div>

<div class="mt-4 flex gap-3">
  <button
    type="button"
    class="btn-light flex-1"
    disabled={done}
    onclick={() => answer(0)}>← Not me</button
  >
  <button
    type="button"
    class="btn-dark flex-1"
    disabled={done}
    onclick={() => answer(1)}>True for me →</button
  >
</div>
<p class="mt-3 mb-0 text-[13px] text-muted">
  Swipe, tap a button, or use the ← → keys.
</p>
