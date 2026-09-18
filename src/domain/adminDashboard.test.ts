import { describe, expect, it } from 'vitest';
import { buildSevenDaySales, calculateSevenDaySales, type DashboardSaleRow } from './adminDashboard';

const row = (created_at: string, total: number, status = 'completed'): DashboardSaleRow => ({ created_at, total, status });

describe('dashboard sales metrics', () => {
  const now = new Date('2026-09-18T12:00:00+03:00');

  it('calculates only non-draft, non-cancelled sales inside the seven-day window', () => {
    expect(calculateSevenDaySales([
      row('2026-09-18T09:00:00+03:00', 100),
      row('2026-09-12T13:00:00+03:00', 40),
      row('2026-09-11T11:59:59+03:00', 90),
      row('2026-09-17T08:00:00+03:00', 500, 'draft'),
      row('2026-09-16T08:00:00+03:00', 700, 'cancelled'),
    ], now)).toBe(140);
  });

  it('groups bars by the local business day rather than UTC day', () => {
    const days = buildSevenDaySales([
      row('2026-09-17T23:30:00+03:00', 25),
      row('2026-09-18T01:30:00+03:00', 35),
    ], now);
    const byLabel = new Map(days.map((item) => [item.key, item.value]));
    expect(byLabel.get('2026-09-17')).toBe(25);
    expect(byLabel.get('2026-09-18')).toBe(35);
  });

  it('returns exactly seven local calendar days in ascending order', () => {
    const days = buildSevenDaySales([], now);
    expect(days).toHaveLength(7);
    expect(days.map((item) => item.key)).toEqual([
      '2026-09-12', '2026-09-13', '2026-09-14', '2026-09-15', '2026-09-16', '2026-09-17', '2026-09-18'
    ]);
  });
});
