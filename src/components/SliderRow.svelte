<script lang="ts">
  import { SEQ } from "../questions";

  let {
    text,
    labels,
    value = $bindable(2),
    touched = $bindable(false),
  }: {
    text: string;
    labels: string[];
    value?: number;
    touched?: boolean;
  } = $props();

  const color = $derived(SEQ[value]);
</script>

<div class="panel p-4">
  <div class="flex items-start justify-between gap-3">
    <p class="m-0 text-[1rem] font-semibold leading-[1.35]">{text}</p>
    <span
      class="flex-none text-[0.8rem] font-bold rounded-md py-1 px-2 whitespace-nowrap"
      style:background={touched ? color : "#f3f4f6"}
      style:color={touched ? (value >= 2 ? "#ffffff" : "#1a1a1a") : "#6b7280"}
    >
      {touched ? labels[value] : "Slide to answer"}
    </span>
  </div>

  <input
    type="range"
    min="0"
    max="4"
    step="1"
    class="lvl"
    class:untouched={!touched}
    style:--c={color}
    style:--p="{(value / 4) * 100}%"
    aria-label={text}
    aria-valuetext={labels[value]}
    bind:value
    oninput={() => (touched = true)}
    onchange={() => (touched = true)}
    onpointerup={() => (touched = true)}
  />

  <div class="flex justify-between gap-3 text-[12px] text-muted">
    <span>{labels[0]}</span>
    <span>{labels[labels.length - 1]}</span>
  </div>
</div>
