<script lang="ts">
  import {
    SCALES,
    letter,
    norm,
    sum,
    type AnsweredResult,
    type SliderBlock,
  } from "../questions";
  import SliderRow from "./SliderRow.svelte";

  let { block }: { block: SliderBlock } = $props();

  const items = $derived(block.items.map(norm));
  const labels = $derived(SCALES[block.scale]);

  // svelte-ignore state_referenced_locally
  let values = $state<number[]>(block.items.map(() => 2));
  // svelte-ignore state_referenced_locally
  let touched = $state<boolean[]>(block.items.map(() => false));

  export function isComplete(): boolean {
    return touched.every(Boolean);
  }

  export function statusText(): string {
    return `${touched.filter(Boolean).length} of ${touched.length} answered`;
  }

  export function result(): AnsweredResult {
    const scores = values.map((v, i) => (items[i].reverse ? 4 - v : v));
    return {
      skipped: false,
      letters: values.map(letter),
      scores,
      total: sum(scores),
    };
  }
</script>

<div class="flex flex-col gap-3">
  {#each items as item, i (item.text)}
    <SliderRow
      text={item.text}
      {labels}
      bind:value={values[i]}
      bind:touched={touched[i]}
    />
  {/each}
</div>
