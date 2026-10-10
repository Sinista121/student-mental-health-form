export type ScaleKey = 'frequency' | 'agreement' | 'stress' | 'coping';
export type BlockType = 'slider' | 'swipe' | 'tokens' | 'match';

export interface Item {
  text: string;
  /** Reverse-scored item (e.g. "Feeling rested when I wake up"). */
  reverse?: boolean;
}
export type RawItem = string | Item;

interface BlockBase {
  id: number;
  title: string;
  scored: boolean;
  items: RawItem[];
}

export interface SliderBlock extends BlockBase {
  type: 'slider';
  scale: ScaleKey;
}

export interface SwipeBlock extends BlockBase {
  type: 'swipe';
}

export interface TokensBlock extends BlockBase {
  type: 'tokens';
  tokens: number;
  overall: { text: string; scale: ScaleKey };
}

export interface MatchBlock extends BlockBase {
  type: 'match';
  scale: ScaleKey;
  leftLabel: string;
  rightLabel: string;
}

export type Block = SliderBlock | SwipeBlock | TokensBlock | MatchBlock;

export interface AnsweredResult {
  skipped: false;
  letters: string[];
  scores: number[];
  total: number;
}
export interface SkippedResult {
  skipped: true;
}
export type Result = AnsweredResult | SkippedResult;

/** What every component returns to the page flow. */
export interface Renderer {
  isComplete(): boolean;
  statusText(): string;
  result(): AnsweredResult;
}

export type RenderFn<B extends Block> = (
  block: B,
  area: HTMLElement,
  onChange: () => void
) => Renderer;
