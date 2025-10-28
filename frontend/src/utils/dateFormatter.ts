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

/**
 * 指定日数前の日付を計算（YYYY-MM-DD形式で返す）
 */
export function getDateBefore(dateString: string, days: number): string {
  const date = new Date(dateString);
  date.setDate(date.getDate() - days);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * 界タビ予約開始日を計算（宿泊日の44日前）
 */
export function getKaiTabiReservationStartDate(checkInDate: string): string {
  return getDateBefore(checkInDate, 44);
}
