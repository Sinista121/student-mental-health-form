<script lang="ts">
  import { fly } from "svelte/transition";
  import Match from "./components/Match.svelte";
  import Sliders from "./components/Sliders.svelte";
  import Swipe from "./components/Swipe.svelte";
  import TallyEmbed from "./components/TallyEmbed.svelte";
  import Tokens from "./components/Tokens.svelte";
  import {
    BLOCKS,
    HINTS,
    type Block,
    type Renderer,
    type Result,
  } from "./questions";
  import { onMount } from "svelte";

  const FORM_A_ID = "LZA1jG";
  const FORM_B_ID = "LZQlZv";

  const params = new URLSearchParams(window.location.search);
  const requestedPage = parseInt(params.get("page") ?? "");
  let page = $state<number>(requestedPage || 1);

  const requestedBlocks = (params.get("blocks") ?? "")
    .split(",")
    .map((s) => parseInt(s))
    .filter((n) => !isNaN(n));

  const chosenBlocks = BLOCKS.filter((b) => requestedBlocks.includes(b.id));
  const ACTIVE_BLOCKS: Block[] = chosenBlocks.length ? chosenBlocks : BLOCKS;
  const total = ACTIVE_BLOCKS.length;

  let respondentId = sessionStorage.getItem("resid") ?? crypto.randomUUID();
  sessionStorage.setItem("resid", respondentId);

  const results: Record<number, Result> = {};
  let gameResult = "";
  let qIndex = $state(0);
  let comp = $state.raw<Renderer | undefined>();

  const block = $derived(ACTIVE_BLOCKS[qIndex]);
  const complete = $derived(comp?.isComplete() ?? false);
  const status = $derived(
    complete
      ? "All answered! Press Next to continue."
      : (comp?.statusText() ?? ""),
  );

  const enterDuration = 250;

  // ---- Form A answers (captured from Tally's submit event) ----------------
  type FormA = { overwhelmed: number | null; wellbeing: number | null };

  function loadFormA(): FormA {
    try {
      return JSON.parse(sessionStorage.getItem("formA") ?? "") as FormA;
    } catch {
      return { overwhelmed: null, wellbeing: null };
    }
  }

  // kept in sessionStorage so it survives a Tally redirect / page reload
  let formA: FormA = loadFormA();

  function toNumber(v: unknown): number | null {
    const n = Number(Array.isArray(v) ? v[0] : v);
    return Number.isFinite(n) ? n : null;
  }

  function handleTally(e: MessageEvent) {
    if (e.origin !== "https://tally.so" || typeof e.data !== "string") return;
    if (!e.data.includes("Tally.FormSubmitted")) return;

    let payload: any;
    try {
      payload = JSON.parse(e.data).payload;
    } catch {
      return;
    }

    // First time through, check the real shape of the payload:
    console.log(payload);
    sessionStorage.setItem("TEST", JSON.stringify(payload));

    const fields: any[] = payload?.fields ?? [];
    const byLabel = (needle: string) =>
      fields.find((f) => String(f.label ?? f.title ?? "").toLowerCase().includes(needle));

    formA = {
      overwhelmed: toNumber(byLabel("overwhelmed")?.value),
      wellbeing: toNumber(byLabel("well-being")?.value),
    };
    sessionStorage.setItem("formA", JSON.stringify(formA));

    // Go straight to the interactive section (harmless if Tally also redirects)
    if (page === 1) {
      page = 2;
      window.scrollTo(0, 0);
    }
  }

  function formatScores(): string {
    return ACTIVE_BLOCKS.filter((b) => b.scored && results[b.id])
      .map((b) => {
        const r = results[b.id];
        return `B${b.id}=${r.total}(${r.scores.join(",")})`;
      })
      .join(";");
  }

  function formatAnswers(): string {
    return ACTIVE_BLOCKS.filter((b) => results[b.id])
      .map((b) => {
        const r = results[b.id];
        return `B${b.id}:${r.letters.join(",")}`;
      })
      .join("|");
  }

  function hiddenFieldsForFormB(): Record<string, string> {
    const hidden: Record<string, string> = {
      respondentId,
      gameResult,
      scores: formatScores(),
      // add matching hidden fields in Tally form B for these two
      formA_overwhelmed: String(formA.overwhelmed ?? ""),
      formA_wellbeing: String(formA.wellbeing ?? ""),
    };

    ACTIVE_BLOCKS.forEach((b) => {
      const r = results[b.id];
      if (r) hidden[`q${b.id}`] = r.letters.join(",");
    });

    return hidden;
  }

  function advance() {
    if (qIndex < total - 1) {
      qIndex++;
    } else {
      gameResult = formatAnswers();
      page = 3;
    }
    window.scrollTo(0, 0);
  }

  function next() {
    if (!comp || !comp.isComplete()) return;
    results[block.id] = comp.result();
    advance();
  }
</script>

<svelte:window onmessage={handleTally} />

{#if page === 1 && respondentId}
  <TallyEmbed formId={FORM_A_ID} hidden={{ respondentId }} title="Form A" />
{:else if page === 2}
  <section class="pt-7">
    {#if qIndex === 0}
      <p class="mt-0 mb-2.5 text-[24px] font-black leading-[1.65]">
        Let's get interactive!
      </p>
    {/if}

    {#if total >= 2}
      <div class="mb-3">
        <p class="mt-0 mb-2 text-[14px] font-semibold text-muted">
          Section {qIndex + 1} of {total}
        </p>
        <div class="w-full h-1.5 rounded-full bg-line overflow-hidden">
          <div
            class="h-full rounded-full bg-primary [transition:width_0.3s_ease]"
            style:width="{((qIndex + 1) / total) * 100}%"
          ></div>
        </div>
      </div>
    {/if}

    {#key qIndex}
      <div in:fly={{ y: 12, duration: enterDuration }}>
        {#if block.title}
          <p class="mt-0 mb-2 text-[18px] font-bold leading-[1.3]">
            {block.title}
          </p>
        {/if}
        <p class="mt-0 mb-5 text-[16px] leading-normal">{HINTS[block.type]}</p>

        <div class="w-full">
          {#if block.type === "tokens"}
            <Tokens {block} bind:this={comp} />
          {:else if block.type === "swipe"}
            <Swipe {block} bind:this={comp} />
          {:else if block.type === "slider"}
            <Sliders {block} bind:this={comp} />
          {:else}
            <Match {block} bind:this={comp} />
          {/if}
        </div>
      </div>
    {/key}

    <div
      role="status"
      aria-live="polite"
      class="mt-6 font-semibold text-[1rem] min-h-[24px] {complete
        ? 'text-success'
        : 'text-muted'}"
    >
      {status}
    </div>

    <div class="mt-7 flex justify-start gap-3">
      <button
        type="button"
        class="text-[16px] font-black text-white bg-primary border-0 rounded-lg py-3 px-7 cursor-pointer [transition:background_0.2s_ease,transform_0.2s_ease,opacity_0.2s_ease] enabled:hover:bg-primary-hover enabled:hover:-translate-y-px disabled:opacity-[0.35] disabled:cursor-not-allowed"
        disabled={!complete}
        onclick={next}>Next</button
      >
    </div>

    <p class="mt-8 mb-0 text-[14px] leading-normal text-muted">
      This survey is for insight only and is not a diagnosis. If you're finding
      things hard, please talk to someone you trust or your university's
      counselling service.
    </p>
  </section>
{:else}
  <TallyEmbed
    formId={FORM_B_ID}
    hidden={hiddenFieldsForFormB()}
    title="Form B"
  />
{/if}