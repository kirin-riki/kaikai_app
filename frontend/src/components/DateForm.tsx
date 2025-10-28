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
    <form onSubmit={onSubmit} className="bg-white rounded-2xl shadow-custom-lg p-6 md:p-8 mb-6 md:mb-8">
      <div className="space-y-5">
        {/* シフト開始日 */}
        <div>
          <label htmlFor="shiftStartDate" className="block text-sm font-bold text-gray-900 mb-2">
            📅 シフト開始日
          </label>
          <input
            type="date"
            id="shiftStartDate"
            value={shiftStartDate}
            onChange={(e) => onShiftStartDateChange(e.target.value)}
            className="w-full px-4 py-3 text-base text-gray-900 bg-white border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
            required
          />
        </div>

        {/* 次回シフト締め切り日 */}
        <div>
          <label htmlFor="dueDate" className="block text-sm font-bold text-gray-900 mb-2">
            📌 次回シフト締め切り日
          </label>
          <input
            type="date"
            id="dueDate"
            value={dueDate}
            onChange={(e) => onDueDateChange(e.target.value)}
            className="w-full px-4 py-3 text-base text-gray-900 bg-white border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
            required
          />
        </div>

        {/* シフト周期 */}
        <div>
          <label htmlFor="dueDateRule" className="block text-sm font-bold text-gray-900 mb-2">
            🔄 シフト周期（日数）
          </label>
          <input
            type="number"
            id="dueDateRule"
            value={dueDateRule}
            onChange={(e) => onDueDateRuleChange(e.target.value)}
            min="1"
            className="w-full px-4 py-3 text-base text-gray-900 bg-white border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
            required
          />
          <p className="mt-2 text-sm text-gray-600">
            💡 例: 28日周期の場合は「28」を入力
          </p>
        </div>

        {/* 送信ボタン */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl shadow-custom hover:shadow-custom-lg transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-lg"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>計算中...</span>
            </span>
          ) : (
            <span>🔍 予約可能日を表示</span>
          )}
        </button>
      </div>
    </form>
  );
};

