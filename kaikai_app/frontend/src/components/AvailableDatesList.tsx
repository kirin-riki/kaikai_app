import { formatDateWithWeekday } from '../utils/dateFormatter';

interface AvailableDatesListProps {
  dates: string[];
}

export const AvailableDatesList = ({ dates }: AvailableDatesListProps) => {
  if (dates.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-custom-lg p-6 md:p-8 mb-6 md:mb-8">
      {/* ヘッダー */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-accent-500 text-white p-2 rounded-xl">
            <span className="text-2xl">♨️</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            予約可能日が見つかりました！
          </h2>
        </div>
        <p className="text-sm md:text-base text-gray-600 ml-14">
          全<strong className="text-primary-600">{dates.length}日間</strong>の予約可能日があります
        </p>
      </div>

      {/* 日付リスト */}
      <div className="space-y-3">
        {dates.map((date, index) => (
          <div
            key={date}
            className="group bg-gradient-to-r from-primary-50 to-accent-50 border-2 border-gray-200 rounded-xl p-4 hover:border-primary-500 hover:shadow-custom transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* 番号 */}
                <div className="flex-shrink-0 w-8 h-8 bg-white rounded-lg flex items-center justify-center border-2 border-primary-500 font-bold text-primary-600">
                  {index + 1}
                </div>

                {/* 日付 */}
                <div>
                  <span className="text-lg md:text-xl font-bold text-gray-900">
                    {formatDateWithWeekday(date)}
                  </span>
                </div>
              </div>

              {/* アイコン */}
              <div className="flex-shrink-0">
                <span className="text-2xl">
                  {index % 3 === 0 ? '🏨' : index % 3 === 1 ? '🌸' : '♨️'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* フッター情報 */}
      <div className="mt-6 p-4 bg-primary-50 border-2 border-primary-200 rounded-xl">
        <p className="text-sm text-gray-900 font-medium">
          💡 早めの予約がおすすめです。お気に入りの日程を見つけたら、すぐに予約しましょう！
        </p>
      </div>
    </div>
  );
};

