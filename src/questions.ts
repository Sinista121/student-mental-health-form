export type ScaleKey = "frequency" | "agreement" | "stress" | "coping";
export type BlockType = "slider" | "swipe" | "tokens" | "match";

export interface Item {
  text: string;
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
  type: "slider";
  scale: ScaleKey;
}

export interface SwipeBlock extends BlockBase {
  type: "swipe";
}

export interface TokensBlock extends BlockBase {
  type: "tokens";
  tokens: number;
  overall: { text: string; scale: ScaleKey };
}

export interface MatchBlock extends BlockBase {
  type: "match";
  scale: ScaleKey;
  leftLabel: string;
  rightLabel: string;
}

export type Block = SliderBlock | SwipeBlock | TokensBlock | MatchBlock;

export interface AnsweredResult {
  letters: string[];
  scores: number[];
  total: number;
}

export type Result = AnsweredResult

export interface Renderer {
  isComplete(): boolean;
  statusText(): string;
  result(): AnsweredResult;
}

export const SCALES: Record<ScaleKey, string[]> = {
  frequency: ["Never", "Rarely", "Sometimes", "Often", "Almost always"],
  agreement: [
    "Strongly disagree",
    "Disagree",
    "Neutral",
    "Agree",
    "Strongly agree",
  ],
  stress: [
    "Not at all stressful",
    "Slightly stressful",
    "Moderately stressful",
    "Very stressful",
    "Extremely stressful",
  ],
  coping: [
    "Talk to someone",
    "Distract myself",
    "Plan and tackle it",
    "Avoid it",
    "Push through alone",
  ],
};

export const SEQ = ["#bfdbfe", "#7fb2f5", "#4f8ef0", "#2563eb", "#1e3a8a"];

export const HINTS: Record<BlockType, string> = {
  match:
    "There are no right or wrong answers. Tap an item on the left, then tap the option on the right that fits you best. You can pick the same option more than once, and tap an answered item to change it.",
  swipe:
    "There are no right or wrong answers. Swipe each card right if it has been true for you, or left if not. You can also use the buttons or the arrow keys, and undo at any time.",
  slider:
    "There are no right or wrong answers. Move each slider to the option that fits you best. You can change any answer.",
  tokens:
    "There are no right or wrong answers. You have 10 tokens. Spread them across the situations to show how much of your stress each one causes: more tokens means a bigger share.",
};

const SWIPE_TITLE = "In the past 2 weeks, has this been true for you?";
const FREQUENCY_TITLE =
  "In the past 2 weeks, how often have you experienced each of these?";
const AGREEMENT_TITLE =
  "Thinking about the past 2 weeks, how much do you agree with each statement?";

// Components chosen to suit the content:
//   tokens (1)   - relative stress load across situations
//   swipe (2,3)  - quick yes/no symptom checklists
//   slider (4-7) - ordered scales, one gesture per item
//   match (8)    - categorical answers (coping strategies), where matching actually fits
export const BLOCKS: Block[] = [
  {
    id: 1,
    type: "tokens",
    title:
      "Which situations have been stressing you out most over the past 2 weeks?",
    tokens: 10,
    scored: true,
    items: [
      "Multiple deadlines in one week",
      "Upcoming examinations",
      "Receiving a low grade",
      "Group-project problems",
      "Keeping up with lectures or coursework",
      "Thinking about career or future",
    ],
    overall: {
      text: "Overall, how stressful have the past 2 weeks felt?",
      scale: "stress",
    },
  },
  {
    id: 2,
    type: "swipe",
    title: SWIPE_TITLE,
    scored: true,
    items: [
      "Feeling nervous or on edge",
      "Being unable to stop or control worrying",
      "Racing heart or restlessness before academic tasks",
      "Feeling afraid something bad will happen",
      "Difficulty relaxing even when I have free time",
    ],
  },
  {
    id: 3,
    type: "swipe",
    title: SWIPE_TITLE,
    scored: true,
    items: [
      "Feeling down or hopeless",
      "Losing interest in things I usually enjoy",
      "Feeling like a failure or letting people down",
      "Having little motivation to start tasks",
      "Feeling emotionally numb",
    ],
  },
  {
    id: 4,
    type: "slider",
    title: FREQUENCY_TITLE,
    scale: "frequency",
    scored: true,
    items: [
      "Trouble falling asleep",
      "Waking up during the night or too early",
      "Feeling tired despite sleeping",
      "Sleeping through or skipping classes because of fatigue",
      { text: "Feeling rested when I wake up", reverse: true },
    ],
  },
  {
    id: 5,
    type: "slider",
    title: AGREEMENT_TITLE,
    scale: "agreement",
    scored: true,
    items: [
      "I feel drained by my studies",
      "I find it hard to concentrate in class",
      "I doubt whether my studies are worthwhile",
      "I procrastinate more than I would like",
      { text: "I feel able to cope with my workload", reverse: true },
    ],
  },
  {
    id: 6,
    type: "slider",
    title: AGREEMENT_TITLE,
    scale: "agreement",
    scored: true,
    items: [
      "I feel lonely on campus",
      {
        text: "I have someone I can talk to when I'm struggling",
        reverse: true,
      },
      "I feel pressure from family expectations",
      "I avoid social situations I used to enjoy",
      { text: "I feel comfortable asking teachers for help", reverse: true },
    ],
  },
  {
    id: 7,
    type: "slider",
    title: "In the past 2 weeks, how often has each of these applied to you?",
    scale: "frequency",
    scored: true,
    items: [
      "Skipping meals or eating irregularly",
      "Physical symptoms such as headaches or stomach aches",
      "Feeling that my screen time is excessive",
      { text: "Doing physical activity", reverse: true },
      "Using caffeine, nicotine or other substances to cope",
    ],
  },
  {
    id: 8,
    type: "match",
    title: "When these things happen, how do you usually respond?",
    leftLabel: "Situation",
    rightLabel: "Usual response",
    scale: "coping",
    scored: false,
    items: [
      "Failing an exam",
      "Argument with a friend",
      "Heavy workload",
      "Feeling overwhelmed",
      "Night before an exam with work unfinished",
    ],
  },
];

export const letter = (i: number): string => String.fromCharCode(65 + i);

export const norm = (item: RawItem): Item =>
  typeof item === "string" ? { text: item } : item;

export const sum = (values: number[]): number =>
  values.reduce((a, b) => a + b, 0);

export const reduceMotion = (): boolean =>
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
