<script lang="ts" module>
  type TallyWindow = Window & { Tally?: { loadEmbeds: () => void } };

  const REVEAL_DELAY_MS = 300;

  function tallyUrl(
    id: string,
    hidden: Record<string, string | undefined>,
  ): string {
    const all: Record<string, string | undefined> = {
      hideTitle: "1",
      transparentBackground: "1",
      dynamicHeight: "1",
      ...hidden,
    };
    const qs = Object.keys(all)
      .filter((k) => all[k] !== undefined && all[k] !== "")
      .map(
        (k) =>
          `${encodeURIComponent(k)}=${encodeURIComponent(all[k] as string)}`,
      )
      .join("&");

    return `https://tally.so/embed/${id}?${qs}`;
  }

  function loadTallyEmbeds(): void {
    const w = window as TallyWindow;
    const run = () => {
      if (w.Tally) {
        w.Tally.loadEmbeds();
      } else {
        document
          .querySelectorAll<HTMLIFrameElement>(
            "iframe[data-tally-src]:not([src])",
          )
          .forEach((f) => {
            f.src = f.dataset.tallySrc ?? "";
          });
      }
    };

    if (w.Tally) return run();

    let s = document.querySelector<HTMLScriptElement>(
      "script[data-tally-embed]",
    );

    if (!s) {
      s = document.createElement("script");
      s.src = "https://tally.so/widgets/embed.js";
      s.dataset.tallyEmbed = "1";
      document.body.appendChild(s);
    }

    s.addEventListener("load", run);
    s.addEventListener("error", run);
  }
</script>

<script lang="ts">
  import { onMount } from "svelte";

  let {
    formId,
    hidden = {},
    title,
  }: {
    formId: string;
    hidden?: Record<string, string | undefined>;
    title: string;
  } = $props();

  let loading = $state(true);
  let frame: HTMLIFrameElement | undefined = $state();
  let srcUrl = $state("");

  onMount(() => {
    srcUrl = tallyUrl(formId, hidden);
    const fallback = setTimeout(finish, 15000);
    loadTallyEmbeds();
    return () => clearTimeout(fallback);
  });

  const finish = () => (loading = false);

  function onLoad() {
    if (!frame?.getAttribute("src")) return;
    setTimeout(finish, REVEAL_DELAY_MS);
  }
</script>

<div
  class="group relative [&.is-loading]:min-h-[calc(100vh-32px)] [&.is-loading]:flex [&.is-loading]:items-center [&.is-loading]:justify-center"
  class:is-loading={loading}
>
  {#if loading}
    <div class="flex flex-col items-center gap-3.5 font-semibold text-muted">
      <div
        class="w-7 h-7 border-[3px] border-solid border-line border-t-primary rounded-full animate-[spin_0.8s_linear_infinite]"
      ></div>
      <span>Loading…</span>
    </div>
  {/if}

  <iframe
    bind:this={frame}
    class="block w-full border-0 transition-opacity duration-250 ease-[ease] group-[.is-loading]:absolute group-[.is-loading]:top-0 group-[.is-loading]:left-0 group-[.is-loading]:opacity-0 group-[.is-loading]:pointer-events-none"
    data-tally-src={srcUrl}
    {title}
    width="100%"
    height="400"
    frameborder="0"
    onload={onLoad}
  ></iframe>
</div>
