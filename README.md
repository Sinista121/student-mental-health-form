# Student wellbeing survey

Vite + TypeScript + Tailwind (compiled at build time). Two Tally forms wrap an interactive middle section made of four components: token allocation, swipe cards, sliders and matching.

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + production build into dist/
npm run preview    # serve the production build
```

Needs Node 20.19+ or 22.12+ (Vite 8). Vercel's default Node version already satisfies this.

## Deploy to Vercel

1. Push this folder to a Git repository (GitHub, GitLab or Bitbucket).
2. In Vercel choose **Add New → Project** and import the repository.
3. Vercel detects the Vite preset. `vercel.json` already sets the build command (`npm run build`) and output directory (`dist`), so accept the defaults and deploy.

Or from the terminal: `npx vercel` (preview) and `npx vercel --prod`.

There are no server routes and no environment variables. The page is fully static.

## URL parameters (unchanged from the original)

| Parameter | Effect |
|---|---|
| `page=1/2/3` | Start at Form A, the interactive section, or Form B |
| `blocks=1,4,8` | Show only those sections |
| `respondentId=abc` | Use your own respondent ID instead of a generated one |

## Where things live

```
src/
  main.ts        page flow, section transitions, navigation
  blocks.ts      all survey content (edit questions here)
  config.ts      Tally form IDs, colour palettes, answer scales, instructions
  scoring.ts     score and answer formatting for the Tally hidden fields
  tally.ts       Tally iframe embedding
  classes.ts     shared Tailwind class strings
  components/    sliders.ts  tokens.ts  swipe.ts  match.ts
  styles.css     Tailwind layers + slider styling
```

Each component is a function `(block, area, onChange) => { isComplete, statusText, result }`. To add a format, write a new component, add its block type in `types.ts`, and add a case in `renderBlock` in `main.ts`.

## Tailwind note

Class names must appear as full literal strings in the source (for example `'left-3'`, never `` `${side}-3` ``). Tailwind scans the source at build time and drops classes it cannot see.

## Hidden fields sent to Form B

```
B1 tokens : tokens per situation, then S<A-E> overall stress; total = overall (0-4)
B2, B3    : Y/N per card; scores 0/1
B4-B7     : A-E per slider; scores 0-4 (reverse items flipped as 4 - value)
B8        : A-E coping choice per situation; unscored
```
