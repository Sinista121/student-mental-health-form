import type { BlockType, ScaleKey } from './types';

export const FORM_A_ID = 'LZA1jG';
export const FORM_B_ID = 'LZQlZv';
export const REVEAL_DELAY_MS = 300;

// Sequential (light -> dark) palette for ordinal scales: darker = more intense.
export const SEQ = ['#bfdbfe', '#7fb2f5', '#4f8ef0', '#2563eb', '#1e3a8a'];

// Categorical colours (only used by the matching component, where options are categories).
export const LINK_COLORS = [
  '#2563eb', '#db2777', '#d97706', '#059669',
  '#7c3aed', '#0891b2', '#dc2626', '#65a30d'
];

export const SCALES: Record<ScaleKey, string[]> = {
  frequency: ['Never', 'Rarely', 'Sometimes', 'Often', 'Almost always'],
  agreement: ['Strongly disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly agree'],
  stress: [
    'Not at all stressful',
    'Slightly stressful',
    'Moderately stressful',
    'Very stressful',
    'Extremely stressful'
  ],
  coping: [
    'Talk to someone',
    'Distract myself',
    'Plan and tackle it',
    'Avoid it',
    'Push through alone'
  ]
};

export const HINTS: Record<BlockType, string> = {
  match:
    'There are no right or wrong answers. Tap an item on the left, then tap the option on the right that fits you best. You can pick the same option more than once, and tap an answered item to change it.',
  swipe:
    'There are no right or wrong answers. Swipe each card right if it has been true for you, or left if not. You can also use the buttons or the arrow keys, and undo at any time.',
  slider:
    'There are no right or wrong answers. Move each slider to the option that fits you best. You can change any answer.',
  tokens:
    'There are no right or wrong answers. You have 10 tokens. Spread them across the situations to show how much of your stress each one causes: more tokens means a bigger share.'
};
