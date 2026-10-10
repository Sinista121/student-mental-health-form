import { IFRAME_CLASS, LOADER_CLASS, SPINNER_CLASS } from './classes';
import { REVEAL_DELAY_MS } from './config';
import { q } from './utils';

declare global {
  interface Window {
    Tally?: { loadEmbeds: () => void };
  }
}

function tallyUrl(id: string, hidden: Record<string, string | undefined>): string {
  const all: Record<string, string | undefined> = {
    hideTitle: '1',
    transparentBackground: '1',
    dynamicHeight: '1',
    ...hidden
  };
  const qs = Object.keys(all)
    .filter(k => all[k] !== undefined && all[k] !== '')
    .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(all[k] as string)}`)
    .join('&');
  return `https://tally.so/embed/${id}?${qs}`;
}

function loadTallyEmbeds(): void {
  const run = () => {
    if (window.Tally) {
      window.Tally.loadEmbeds();
    } else {
      document
        .querySelectorAll<HTMLIFrameElement>('iframe[data-tally-src]:not([src])')
        .forEach(f => {
          f.src = f.dataset.tallySrc ?? '';
        });
    }
  };
  if (window.Tally) return run();

  let s = document.querySelector<HTMLScriptElement>('script[data-tally-embed]');
  if (!s) {
    s = document.createElement('script');
    s.src = 'https://tally.so/widgets/embed.js';
    s.dataset.tallyEmbed = '1';
    document.body.appendChild(s);
  }
  s.addEventListener('load', run);
  s.addEventListener('error', run);
}

export function mountTally(
  mountId: string,
  formId: string,
  hidden: Record<string, string | undefined>,
  title: string
): void {
  const mount = q<HTMLElement>(document, `#${mountId}`);
  mount.innerHTML = '';
  mount.classList.add('is-loading');

  const loader = document.createElement('div');
  loader.className = LOADER_CLASS;
  loader.innerHTML = `<div class="${SPINNER_CLASS}"></div><span>Loading…</span>`;
  mount.appendChild(loader);

  const f = document.createElement('iframe');
  f.className = IFRAME_CLASS;
  f.dataset.tallySrc = tallyUrl(formId, hidden);
  f.title = title;
  f.setAttribute('width', '100%');
  f.setAttribute('height', '400');
  f.setAttribute('frameborder', '0');

  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    loader.remove();
    mount.classList.remove('is-loading');
  };

  f.addEventListener('load', () => {
    if (!f.getAttribute('src')) return;
    setTimeout(finish, REVEAL_DELAY_MS);
  });
  setTimeout(finish, 15000);

  mount.appendChild(f);
  loadTallyEmbeds();
}
