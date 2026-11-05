import type { SimaJob, SimaJobPhase } from '../api/simaImportApi';

export const SIMA_PHASES: Array<{ key: SimaJobPhase; label: string; short: string }> = [
  { key: 'scrape', label: 'Страницы Сималенда', short: 'склейка' },
  { key: 'images', label: 'Картинки → S3', short: 'картинки' },
  { key: 'products', label: 'Товары', short: 'товары' },
];

export function simaPhaseIndex(job: SimaJob): number {
  if (job.phase === 'done') return SIMA_PHASES.length;
  return SIMA_PHASES.findIndex((p) => p.key === job.phase);
}

/** Счётчики фазы: [done, total]. */
export function simaPhaseCounters(
  job: SimaJob,
  key: SimaJobPhase,
): [number, number] {
  if (key === 'scrape') return [job.scrapeDone, job.scrapeTotal];
  if (key === 'images') return [job.imagesDone, job.imagesTotal];
  return [job.processedItems, job.totalItems];
}

/** Общий %: фазы равным весом (0–33–66–100), незапущенные — по нулям. */
export function simaOverallPercent(job: SimaJob): number {
  const idx = simaPhaseIndex(job);
  let sum = 0;
  SIMA_PHASES.forEach((p, i) => {
    const [done, total] = simaPhaseCounters(job, p.key);
    const frac = total > 0 ? done / total : i < idx ? 1 : 0;
    sum += frac;
  });
  return Math.round((sum / SIMA_PHASES.length) * 100);
}
