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

  // Internal smooth percent tracking (0 to 100)
  let smoothPercent = $state(value * 25);

  // Sync internal percentage if the parent component updates the value externally
  $effect(() => {
    if (Math.round(smoothPercent / 25) !== value) {
      smoothPercent = value * 25;
    }
  });

  // Derived discrete index (0 to 4) calculated in real-time during drag
  const activeIndex = $derived(
    Math.min(4, Math.max(0, Math.round(smoothPercent / 25))),
  );
  const color = $derived(SEQ[activeIndex]);

  // Fires continuously while dragging
  function handleInput(e: Event & { currentTarget: HTMLInputElement }) {
    touched = true;
    smoothPercent = parseFloat(e.currentTarget.value);
    value = activeIndex; // Real-time value update for text/parent
  }

  // Fires only when the user releases the mouse click/touch drag
  function handleRelease() {
    smoothPercent = activeIndex * 25; // Snaps the visual thumb to the target tick
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
    class="relative w-full h-2 mb-4 bg-gray-200 rounded-full flex justify-between items-center px-1"
  >
    <!-- <div class="absolute z-50 grid grid-cols-5 w-full">
      {#each Array(5) as _, i}
        <div
          class="w-2 h-1 rounded-full pointer-events-none transition-colors duration-200"
          style:background-color={touched && activeIndex >= i
            ? color
            : "#9ca3af"}
        ></div>
      {/each}
    </div> -->
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
  </div>

  <div
    class="flex justify-between gap-3 text-[12px] text-muted-foreground px-1"
  >
    <span>{labels[0]}</span>
    <span>{labels[labels.length - 1]}</span>
  </div>
</div>
