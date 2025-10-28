interface DateFormProps {
  shiftStartDate: string;
  dueDate: string;
  dueDateRule: string;
  loading: boolean;
  onShiftStartDateChange: (value: string) => void;
  onDueDateChange: (value: string) => void;
  onDueDateRuleChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const DateForm = ({
  shiftStartDate,
  dueDate,
  dueDateRule,
  loading,
  onShiftStartDateChange,
  onDueDateChange,
  onDueDateRuleChange,
  onSubmit,
}: DateFormProps) => {
  return (
    <form onSubmit={onSubmit} className="bg-white rounded-lg shadow-md p-8 mb-8">
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
            onChange={(e) => onShiftStartDateChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-kai-lavender focus:border-transparent"
            required
          />
        </div>

        {/* 次回シフト締め切り日 */}
        <div>
          <label htmlFor="dueDate" className="block text-sm font-medium text-kai-indigo mb-2">
            次回シフト締め切り日
          </label>
          <input
            type="date"
            id="dueDate"
            value={dueDate}
            onChange={(e) => onDueDateChange(e.target.value)}
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
            onChange={(e) => onDueDateRuleChange(e.target.value)}
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
  );
};

