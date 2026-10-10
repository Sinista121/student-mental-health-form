import type { Item, RawItem } from './types';

export const letter = (i: number): string => String.fromCharCode(65 + i);

export const norm = (item: RawItem): Item =>
  typeof item === 'string' ? { text: item } : item;

export const sum = (values: number[]): number => values.reduce((a, b) => a + b, 0);

export const reduceMotion = (): boolean =>
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** querySelector that throws instead of returning null, so callers stay type-safe. */
export function q<T extends Element = HTMLElement>(root: ParentNode, selector: string): T {
  const el = root.querySelector<T>(selector);
  if (!el) throw new Error(`Missing element: ${selector}`);
  return el;
}
