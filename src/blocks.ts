import type { Block } from './types';

const SWIPE_TITLE = 'In the past 2 weeks, has this been true for you?';
const FREQUENCY_TITLE = 'In the past 2 weeks, how often have you experienced each of these?';
const AGREEMENT_TITLE =
  'Thinking about the past 2 weeks, how much do you agree with each statement?';

// Components chosen to suit the content:
//   tokens (1)   - relative stress load across situations
//   swipe (2,3)  - quick yes/no symptom checklists
//   slider (4-7) - ordered scales, one gesture per item
//   match (8)    - categorical answers (coping strategies), where matching actually fits
export const BLOCKS: Block[] = [
  {
    id: 1,
    type: 'tokens',
    title: 'Which situations have been stressing you out most over the past 2 weeks?',
    tokens: 10,
    scored: true,
    items: [
      'Multiple deadlines in one week',
      'Upcoming examinations',
      'Receiving a low grade',
      'Group-project problems',
      'Keeping up with lectures or coursework',
      'Thinking about career or future'
    ],
    overall: { text: 'Overall, how stressful have the past 2 weeks felt?', scale: 'stress' }
  },
  {
    id: 2,
    type: 'swipe',
    title: SWIPE_TITLE,
    scored: true,
    items: [
      'Feeling nervous or on edge',
      'Being unable to stop or control worrying',
      'Racing heart or restlessness before academic tasks',
      'Feeling afraid something bad will happen',
      'Difficulty relaxing even when I have free time'
    ]
  },
  {
    id: 3,
    type: 'swipe',
    title: SWIPE_TITLE,
    scored: true,
    items: [
      'Feeling down or hopeless',
      'Losing interest in things I usually enjoy',
      'Feeling like a failure or letting people down',
      'Having little motivation to start tasks',
      'Feeling emotionally numb'
    ]
  },
  {
    id: 4,
    type: 'slider',
    title: FREQUENCY_TITLE,
    scale: 'frequency',
    scored: true,
    items: [
      'Trouble falling asleep',
      'Waking up during the night or too early',
      'Feeling tired despite sleeping',
      'Sleeping through or skipping classes because of fatigue',
      { text: 'Feeling rested when I wake up', reverse: true }
    ]
  },
  {
    id: 5,
    type: 'slider',
    title: AGREEMENT_TITLE,
    scale: 'agreement',
    scored: true,
    items: [
      'I feel drained by my studies',
      'I find it hard to concentrate in class',
      'I doubt whether my studies are worthwhile',
      'I procrastinate more than I would like',
      { text: 'I feel able to cope with my workload', reverse: true }
    ]
  },
  {
    id: 6,
    type: 'slider',
    title: AGREEMENT_TITLE,
    scale: 'agreement',
    scored: true,
    items: [
      'I feel lonely on campus',
      { text: "I have someone I can talk to when I'm struggling", reverse: true },
      'I feel pressure from family expectations',
      'I avoid social situations I used to enjoy',
      { text: 'I feel comfortable asking teachers for help', reverse: true }
    ]
  },
  {
    id: 7,
    type: 'slider',
    title: 'In the past 2 weeks, how often has each of these applied to you?',
    scale: 'frequency',
    scored: true,
    items: [
      'Skipping meals or eating irregularly',
      'Physical symptoms such as headaches or stomach aches',
      'Feeling that my screen time is excessive',
      { text: 'Doing physical activity', reverse: true },
      'Using caffeine, nicotine or other substances to cope'
    ]
  },
  {
    id: 8,
    type: 'match',
    title: 'When these things happen, how do you usually respond?',
    leftLabel: 'Situation',
    rightLabel: 'Usual response',
    scale: 'coping',
    scored: false,
    items: [
      'Failing an exam',
      'Argument with a friend',
      'Heavy workload',
      'Feeling overwhelmed',
      'Night before an exam with work unfinished'
    ]
  }
];
