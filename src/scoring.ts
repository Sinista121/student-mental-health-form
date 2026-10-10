import type { Block, Result } from './types';

export type Results = Record<number, Result>;

/** "B1=3(4,3,3,0,0,0,3);B2=3(1,0,1,0,1);..." for scored blocks only. */
export function formatScores(blocks: Block[], results: Results): string {
  return blocks
    .filter(b => b.scored && results[b.id])
    .map(b => {
      const r = results[b.id];
      return r.skipped ? `B${b.id}=skipped` : `B${b.id}=${r.total}(${r.scores.join(',')})`;
    })
    .join(';');
}

/** "B1:4,3,...|B2:Y,N,...|B8:A,B,..." for every block that has a result. */
export function formatAnswers(blocks: Block[], results: Results): string {
  return blocks
    .filter(b => results[b.id])
    .map(b => {
      const r = results[b.id];
      return `B${b.id}:${r.skipped ? 'skipped' : r.letters.join(',')}`;
    })
    .join('|');
}

/** Hidden fields passed to Tally Form B (respondentId, gameResult, scores, q1..q8). */
export function hiddenFieldsForFormB(
  blocks: Block[],
  results: Results,
  respondentId: string,
  gameResult: string
): Record<string, string> {
  const hidden: Record<string, string> = {
    respondentId,
    gameResult,
    scores: formatScores(blocks, results)
  };
  blocks.forEach(b => {
    const r = results[b.id];
    if (r) hidden[`q${b.id}`] = r.skipped ? 'skipped' : r.letters.join(',');
  });
  return hidden;
}
