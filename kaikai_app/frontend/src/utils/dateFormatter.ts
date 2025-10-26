/**
 * 曜日を日本語で取得
 */
export function getJapaneseWeekday(dateString: string): string {
  const date = new Date(dateString);
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
  return weekdays[date.getDay()];
}

/**
 * 日付を「YYYY-MM-DD（曜日）」形式にフォーマット
 */
export function formatDateWithWeekday(dateString: string): string {
  const weekday = getJapaneseWeekday(dateString);
  return `${dateString}（${weekday}）`;
}
