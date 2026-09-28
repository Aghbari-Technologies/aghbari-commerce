export interface DashboardSaleRow { status: string; total: number; created_at: string; }

export const DASHBOARD_TIME_ZONE = 'Asia/Aden';

function zonedParts(date: Date) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: DASHBOARD_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date);
  const values = Object.fromEntries(parts.filter((part) => part.type !== 'literal').map((part) => [part.type, part.value]));
  return { year: Number(values.year), month: Number(values.month), day: Number(values.day) };
}

function localDayKey(date: Date): string {
  const { year, month, day } = zonedParts(date);
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function includedSale(row: DashboardSaleRow): boolean {
  return row.status !== 'cancelled' && row.status !== 'draft' && Number.isFinite(row.total) && row.total >= 0 && !Number.isNaN(Date.parse(row.created_at));
}

export function calculateSevenDaySales(rows: DashboardSaleRow[], now = new Date()): number {
  const days = buildSevenDaySales(rows, now);
  const nowKey = localDayKey(now);
  return days.reduce((sum, day) => day.key <= nowKey ? sum + day.value : sum, 0);
}

export function buildSevenDaySales(rows: DashboardSaleRow[], now = new Date()): Array<{ key: string; label: string; value: number }> {
  const parts = zonedParts(now);
  const start = new Date(Date.UTC(parts.year, parts.month - 1, parts.day - 6, 12));
  const days = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(start);
    day.setUTCDate(start.getUTCDate() + index);
    return { key: localDayKey(day), label: day.toLocaleDateString('ar', { timeZone: DASHBOARD_TIME_ZONE, weekday: 'short' }), value: 0 };
  });
  const byKey = new Map(days.map((day) => [day.key, day]));
  for (const row of rows) {
    if (!includedSale(row)) continue;
    const created = new Date(row.created_at);
    if (created > now) continue;
    const key = localDayKey(created);
    const day = byKey.get(key);
    if (day) day.value += row.total;
  }
  return days;
}
