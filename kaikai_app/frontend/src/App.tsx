import { useState } from 'react';
import { fetchReservableDates } from './api/reservableDates';
import { formatDateWithWeekday } from './utils/dateFormatter';
import type { ReservableDatesRequest } from './types/api';

function App() {
  // 状態管理
  const [shiftStartDate, setShiftStartDate] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [dueDateRule, setDueDateRule] = useState<string>('28');
  const [reservableDates, setReservableDates] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // フォーム送信処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // エラーをクリア
    setError('');
    setReservableDates([]);

    // バリデーション
    if (!shiftStartDate || !dueDate || !dueDateRule) {
      setError('すべての項目を入力してください');
      return;
    }

    setLoading(true);

    try {
      const request: ReservableDatesRequest = {
        shift_start_date: shiftStartDate,
        due_date: dueDate,
        due_date_rule: parseInt(dueDateRule, 10),
      };

      const response = await fetchReservableDates(request);
      setReservableDates(response.dates);

      if (response.dates.length === 0) {
        setError('該当する予約可能日が見つかりませんでした');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期しないエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-kai-white font-noto">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* ヘッダー */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-kai-indigo mb-4">
            界回（KAIKAI）
          </h1>
          <p className="text-lg text-gray-600">
            あなたのシフトに、旅のリズムを。
          </p>
        </header>

        {/* 入力フォーム */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="space-y-6">
            {/* シフト開始日 */}
            <div>
              <label htmlFor="shiftStartDate" className="block text-sm font-medium text-kai-indigo mb-2">
                シフト開始日
              </label>
              <input
                type="date"
                id="shiftStartDate"
                value={shiftStartDate}
                onChange={(e) => setShiftStartDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-kai-lavender focus:border-transparent"
                required
              />
            </div>

            {/* 希望日（Bシフト発表日） */}
            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-kai-indigo mb-2">
                次回シフト締め切り日
              </label>
              <input
                type="date"
                id="dueDate"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-kai-lavender focus:border-transparent"
                required
              />
            </div>

            {/* シフト周期 */}
            <div>
              <label htmlFor="dueDateRule" className="block text-sm font-medium text-kai-indigo mb-2">
                シフト周期（日数）
              </label>
              <input
                type="number"
                id="dueDateRule"
                value={dueDateRule}
                onChange={(e) => setDueDateRule(e.target.value)}
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-kai-lavender focus:border-transparent"
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                例: 28日周期の場合は「28」を入力
              </p>
            </div>

            {/* 送信ボタン */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 px-6 rounded-md hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium text-base"
              style={{ minHeight: '48px' }}
            >
              {loading ? '計算中...' : '予約可能日を表示'}
            </button>
          </div>
        </form>

        {/* エラー表示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-8">
            {error}
          </div>
        )}

        {/* 結果表示 */}
        {reservableDates.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold text-kai-indigo mb-6">
              予約可能日
            </h2>
            <ul className="space-y-3">
              {reservableDates.map((date) => (
                <li
                  key={date}
                  className="flex items-center text-kai-indigo border-l-4 border-kai-lavender pl-4 py-2"
                >
                  <span className="mr-2">✅</span>
                  <span className="text-lg">{formatDateWithWeekday(date)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 補足情報 */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-8">
          <p className="text-sm text-blue-800">
            ℹ️ <strong>「界タビ20s」</strong>：20代限定・平日限定・44日前予約開始
          </p>
        </div>

        {/* フッター */}
        <footer className="text-center text-gray-500 text-sm">
          <p>界回 © 2025</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
