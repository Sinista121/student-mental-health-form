<script lang="ts">
  import {
    SCALES,
    letter,
    norm,
    sum,
    type AnsweredResult,
    type MatchBlock,
  } from "../questions";

  let { block }: { block: MatchBlock } = $props();

  const items = $derived(block.items.map(norm));
  const options = $derived(SCALES[block.scale]);

  const LINK_COLORS = [
    "#2563eb",
    "#db2777",
    "#d97706",
    "#059669",
    "#7c3aed",
    "#0891b2",
    "#dc2626",
    "#65a30d",
  ];

  const colorOf = (optionIndex: number): string =>
    LINK_COLORS[optionIndex % LINK_COLORS.length];

  const CARD =
    "group flex items-center gap-3 py-3 px-3.5 bg-white border border-solid border-line rounded-lg text-ink cursor-pointer select-none [transition:all_0.2s_ease] text-[1rem] font-normal leading-[1.35] text-left shadow-[0_1px_2px_rgba(0,0,0,0.08),0_1px_3px_rgba(0,0,0,0.04)] [&:not(.linked):hover]:border-[#9ca3af] [&:not(.linked):hover]:-translate-y-px [&.selected]:border-primary [&.selected]:shadow-[0_0_0_2px_rgba(26,26,26,0.18)] [&.linked]:bg-[color:color-mix(in_srgb,var(--link)_12%,#fff)] [&.linked]:border-[color:var(--link)] [&.linked]:animate-pop";
  const BADGE =
    "flex-none w-6 h-6 grid place-items-center rounded-md bg-badge text-white text-[0.8rem] font-bold [transition:background_0.2s_ease] group-[.selected]:bg-primary group-[.linked]:bg-[color:var(--link)]";
  const TAG =
    "flex-none ml-auto text-[0.85rem] font-bold text-[color:var(--link,theme(colors.ink))] whitespace-nowrap";

  // svelte-ignore state_referenced_locally
  let choices = $state<(number | null)[]>(block.items.map(() => null));
  let selectedItem = $state<number | null>(null);
  let selectedOption = $state<number | null>(null);

  const counts = $derived(
    options.map((_, j) => choices.filter((c) => c === j).length),
  );

  function tryAssign() {
    if (selectedItem !== null && selectedOption !== null) {
      choices[selectedItem] = selectedOption;
      selectedItem = null;
      selectedOption = null;
    }
  }

  function clickItem(i: number) {
    if (choices[i] !== null) {
      choices[i] = null; // tapping an answered item clears it, then selects it again
    } else if (selectedItem === i) {
      selectedItem = null;
      return;
    }
    selectedItem = i;
    tryAssign();
  }

  function clickOption(j: number) {
    if (selectedOption === j) {
      selectedOption = null;
      return;
    }
    selectedOption = j;
    tryAssign();
  }

  export function isComplete(): boolean {
    return items.length > 0 && choices.every((c) => c !== null);
  }

  export function statusText(): string {
    return `${choices.filter((c) => c !== null).length} of ${items.length} answered`;
  }

  export function result(): AnsweredResult {
    const max = options.length - 1;
    const picks = choices.map((c) => c ?? 0);
    const scores = block.scored
      ? picks.map((p, i) => (items[i].reverse ? max - p : p))
      : [];
    return {
      skipped: false,
      letters: picks.map(letter),
      scores,
      total: sum(scores),
    };
  }
</script>

<div class="flex gap-6 w-full">
  <div class="flex-1 min-w-0">
    {#if block.leftLabel}
      <p class="mt-0 mb-3 text-[14px] font-semibold text-muted">
        {block.leftLabel}
      </p>
    {/if}
    <div class="flex flex-col gap-3">
      {#each items as item, i (item.text)}
        {@const choice = choices[i]}
        <button
          type="button"
          class={CARD}
          class:selected={selectedItem === i}
          class:linked={choice !== null}
          style:--link={choice !== null ? colorOf(choice) : undefined}
          onclick={() => clickItem(i)}
        >
          <span class={BADGE}>{i + 1}</span>
          <span>{item.text}</span>
          <span class={TAG}
            >{choice !== null ? `↔ ${letter(choice)}` : ""}</span
          >
        </button>
      {/each}
    </div>
  </div>

  <div class="flex-1 min-w-0">
    {#if block.rightLabel}
      <p class="mt-0 mb-3 text-[14px] font-semibold text-muted">
        {block.rightLabel}
      </p>
    {/if}
    <div class="flex flex-col gap-3">
      {#each options as option, j (option)}
        <button
          type="button"
          class={CARD}
          class:selected={selectedOption === j}
          class:linked={counts[j] > 0}
          style:--link={counts[j] > 0 ? colorOf(j) : undefined}
          onclick={() => clickOption(j)}
        >
          <span class={BADGE}>{letter(j)}</span>
          <span>{option}</span>
        </button>
      {/each}
    </div>
  </div>
</div>
