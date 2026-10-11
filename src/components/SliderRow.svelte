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

  let smoothPercent = $state(value * 25);

  $effect(() => {
    if (Math.round(smoothPercent / 25) !== value) {
      smoothPercent = value * 25;
    }
  });

  const activeIndex = $derived(
    Math.min(4, Math.max(0, Math.round(smoothPercent / 25))),
  );
  const color = $derived(SEQ[activeIndex]);

  function handleInput(e: Event & { currentTarget: HTMLInputElement }) {
    touched = true;
    smoothPercent = parseFloat(e.currentTarget.value);
    value = activeIndex;
  }

  function handleRelease() {
    smoothPercent = activeIndex * 25;
  }
</script>

<div class="panel p-4">
  <div class="flex items-start justify-between gap-3 mb-3">
    <p class="m-0 text-[1rem] font-semibold leading-[1.35]">{text}</p>
    <span
      class="flex-none text-[0.8rem] font-bold rounded-md py-1 px-2 whitespace-nowrap transition-all duration-200"
      style:background={touched ? color : "#f3f4f6"}
      style:color={touched
        ? activeIndex >= 2
          ? "#ffffff"
          : "#1a1a1a"
        : "#6b7280"}
    >
      {touched ? labels[activeIndex] : "Slide to answer"}
    </span>
  </div>

  <div
    class="relative w-full h-2 mb-2 bg-gray-200 rounded-full"
    style="--thumb: 16px;"
  >
    <input
      type="range"
      min="0"
      max="100"
      class="lvl absolute inset-0 w-full h-full bg-transparent cursor-pointer appearance-none z-10 m-0"
      class:untouched={!touched}
      value={smoothPercent}
      style:--c={color}
      style:--p="{smoothPercent}%"
      aria-label={text}
      aria-valuetext={labels[activeIndex]}
      oninput={handleInput}
      onchange={handleRelease}
      onpointerup={handleRelease}
      ontouchend={handleRelease}
    />
    {#each Array(5) as _, i}
      <div
        class="absolute top-1/2 z-50 w-1 h-1 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none transition-colors duration-200"
        style:left="calc(var(--thumb) / 2 + (100% - var(--thumb)) * {i / 4})"
        style:background-color={touched && activeIndex >= i
          ? "rgba(255,255,255,0.85)"
          : "#9ca3af"}
      ></div>
    {/each}
  </div>

  <div
    class="flex justify-between gap-3 text-[12px] text-muted-foreground px-1"
  >
    <span>{labels[0]}</span>
    <span>{labels[labels.length - 1]}</span>
  </div>
</div>
