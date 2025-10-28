export const InfoBox = () => {
  return (
    <div className="bg-white rounded-2xl shadow-custom-lg p-6 md:p-8 mb-6 md:mb-8 border-l-4 border-accent-500">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 bg-accent-100 p-3 rounded-xl">
          <span className="text-3xl">🏯</span>
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 text-xl mb-4">
            「界タビ20s」について
          </h3>
          <div className="space-y-3 mb-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                1
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 mb-1">対象者</p>
                <p className="text-sm text-gray-700">20代限定のプラン</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                2
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 mb-1">利用可能日</p>
                <p className="text-sm text-gray-700">平日のみ（月曜日〜金曜日）</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                3
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 mb-1">予約開始</p>
                <p className="text-sm text-gray-700">宿泊日の44日前から予約可能</p>
              </div>
            </div>
          </div>
          <div className="pt-4 border-t-2 border-gray-100">
            <p className="text-sm text-gray-700">
              💡 看護師さんの夜勤明けや連休に合わせて、ゆったりとした旅をお楽しみください
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

