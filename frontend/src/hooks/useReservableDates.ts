import { useState } from 'react';
import { fetchReservableDates } from '../api/reservableDates';
import type { ReservableDatesRequest } from '../types/api';

export function useReservableDates() {
  // 状態管理
  const [shiftStartDate, setShiftStartDate] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [dueDateRule, setDueDateRule] = useState<string>('28');
  const [reservableDates, setReservableDates] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // フォーム送信処理（APIロジック）
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setReservableDates([]);

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

  // コンポーネントで使う値・関数を返す
  return {
    shiftStartDate, setShiftStartDate,
    dueDate, setDueDate,
    dueDateRule, setDueDateRule,
    reservableDates, loading, error, handleSubmit,
  };
}
