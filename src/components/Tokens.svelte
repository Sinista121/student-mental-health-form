<script lang="ts">
  import {
    SCALES,
    letter,
    norm,
    sum,
    type AnsweredResult,
    type TokensBlock,
  } from "../questions";
  import SliderRow from "./SliderRow.svelte";

  let { block }: { block: TokensBlock } = $props();

  const labels = $derived(block.items.map((item) => norm(item).text));
  const total = $derived(block.tokens);

  // svelte-ignore state_referenced_locally
  let counts = $state<number[]>(block.items.map(() => 0));
  let overall = $state(2);
  let overallTouched = $state(false);

  const remaining = $derived(total - sum(counts));

  function add(i: number) {
    if (remaining > 0) counts[i]++;
  }

  function remove(i: number) {
    if (counts[i] > 0) counts[i]--;
  }

  export function isComplete(): boolean {
    return remaining === 0 && overallTouched;
  }

  export function statusText(): string {
    return remaining > 0
      ? `${total - remaining} of ${total} tokens placed`
      : "Last step: how stressful have the past 2 weeks felt overall?";
  }

  export function result(): AnsweredResult {
    return {
      letters: [...counts.map(String), `S${letter(overall)}`],
      scores: [...counts, overall],
      total: overall,
    };
  }
</script>

<div class="flex items-center justify-between mb-3">
  <p class="m-0 text-[14px] font-semibold text-muted">Situation</p>
  <span
    class="text-[0.9rem] font-bold rounded-md py-1 px-2.5 bg-primary text-white tabular-nums"
  >
    {remaining === 0
      ? "All tokens placed ✓"
      : `${remaining} token${remaining === 1 ? "" : "s"} left`}
  </span>
</div>

<div class="grid grid-cols-2 gap-3">
  {#each labels as label, i (label)}
    <div class="panel py-3 px-3.5">
      <div class="flex items-center gap-1">
        <span class="flex-1 min-w-0 text-sm leading-[1.35]">{label}</span>
        <button
          type="button"
          class="step-btn"
          aria-label="Remove a token from: {label}"
          disabled={counts[i] === 0}
          onclick={() => remove(i)}>−</button
        >
        <span class="w-7 text-center text-sm font-bold tabular-nums"
          >{counts[i]}</span
        >
        <button
          type="button"
          class="step-btn"
          aria-label="Add a token to: {label}"
          disabled={remaining === 0}
          onclick={() => add(i)}>+</button
        >
      </div>
      <div class="mt-2 h-1.5 rounded-full bg-line overflow-hidden">
        <div
          class="h-full rounded-full bg-primary [transition:width_0.2s_ease]"
          style:width="{(counts[i] / total) * 100}%"
        ></div>
      </div>
    </div>
  {/each}
</div>

<!-- Overall severity: relative load alone can't tell a mildly from a highly stressed student. -->
<div class="mt-6">
  <p class="mt-0 mb-3 text-[14px] font-semibold text-muted">Overall</p>
  <SliderRow
    text={block.overall.text}
    labels={SCALES[block.overall.scale]}
    bind:value={overall}
    bind:touched={overallTouched}
  />
</div>
