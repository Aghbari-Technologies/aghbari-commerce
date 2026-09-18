export interface DashboardSaleRow { status: string; total: number; created_at: string; }

function localDayKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function includedSale(row: DashboardSaleRow): boolean {
  return row.status !== 'cancelled' && row.status !== 'draft' && Number.isFinite(row.total) && row.total >= 0 && !Number.isNaN(Date.parse(row.created_at));
}

export function calculateSevenDaySales(rows: DashboardSaleRow[], now = new Date()): number {
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - 7);
  return rows.reduce((sum, row) => {
    if (!includedSale(row)) return sum;
    const created = new Date(row.created_at);
    return created >= cutoff && created <= now ? sum + row.total : sum;
  }, 0);
}

export function buildSevenDaySales(rows: DashboardSaleRow[], now = new Date()): Array<{ key: string; label: string; value: number }> {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - 6);
  const days = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    return { key: localDayKey(day), label: day.toLocaleDateString('ar', { weekday: 'short' }), value: 0 };
  });
  const byKey = new Map(days.map((day) => [day.key, day]));
  for (const row of rows) {
    if (!includedSale(row)) continue;
    const key = localDayKey(new Date(row.created_at));
    const day = byKey.get(key);
    if (day) day.value += row.total;
  }
  return days;
}
