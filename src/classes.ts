// Shared Tailwind class strings. Keep every class as a full literal so the build can see it.

export const IFRAME_CLASS =
  'block w-full border-0 transition-opacity duration-[250ms] ease-[ease] group-[.is-loading]:absolute group-[.is-loading]:top-0 group-[.is-loading]:left-0 group-[.is-loading]:opacity-0 group-[.is-loading]:pointer-events-none';
export const LOADER_CLASS = 'flex flex-col items-center gap-3.5 font-semibold text-muted';
export const SPINNER_CLASS =
  'w-7 h-7 border-[3px] border-solid border-line border-t-primary rounded-full animate-[spin_0.8s_linear_infinite]';

export const CARD_CLASS =
  'group flex items-center gap-3 py-3 px-3.5 bg-white border border-solid border-line rounded-lg text-ink cursor-pointer select-none [transition:all_0.2s_ease] [font-family:inherit] text-[1rem] font-normal leading-[1.35] text-left shadow-[0_1px_2px_rgba(0,0,0,0.08),0_1px_3px_rgba(0,0,0,0.04)] [&:not(.linked):hover]:border-[#9ca3af] [&:not(.linked):hover]:-translate-y-px [&.selected]:border-primary [&.selected]:shadow-[0_0_0_2px_rgba(26,26,26,0.18)] [&.linked]:bg-[color:color-mix(in_srgb,var(--link)_12%,#fff)] [&.linked]:border-[color:var(--link)] [&.linked]:animate-pop';
export const BADGE_CLASS =
  'flex-none w-6 h-6 grid place-items-center rounded-md bg-badge text-white text-[0.8rem] font-bold [transition:background_0.2s_ease] group-[.selected]:bg-primary group-[.linked]:bg-[color:var(--link)]';
export const TAG_CLASS =
  'flex-none ml-auto text-[0.85rem] font-bold text-[color:var(--link,theme(colors.ink))] whitespace-nowrap';

export const PANEL_CLASS =
  'bg-white border border-solid border-line rounded-lg shadow-[0_1px_2px_rgba(0,0,0,0.08),0_1px_3px_rgba(0,0,0,0.04)]';
export const BTN_DARK =
  '[font-family:inherit] text-[1rem] font-semibold text-white bg-primary border-0 rounded-lg py-3 px-4 cursor-pointer [transition:background_0.2s_ease,opacity_0.2s_ease] enabled:hover:bg-primary-hover disabled:opacity-[0.35] disabled:cursor-not-allowed';
export const BTN_LIGHT =
  '[font-family:inherit] text-[1rem] font-semibold text-ink bg-white border border-solid border-line rounded-lg py-3 px-4 cursor-pointer [transition:background_0.2s_ease,opacity_0.2s_ease] enabled:hover:bg-black/5 disabled:opacity-[0.35] disabled:cursor-not-allowed';
export const STEP_BTN =
  'flex-none w-9 h-9 grid place-items-center rounded-lg border border-solid border-line bg-white text-[1.2rem] font-bold text-ink cursor-pointer [font-family:inherit] p-0 enabled:hover:bg-black/5 disabled:opacity-[0.3] disabled:cursor-not-allowed';
