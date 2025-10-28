export const Header = () => {
  return (
    <header className="mb-8 md:mb-12">
      {/* ヘッダーカード */}
      <div className="bg-white rounded-3xl shadow-custom-lg p-6 md:p-10 border-t-4 border-primary-500">
        <div className="text-center">
          
          {/* タイトル */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            界回<span className="text-primary-600">（KAIKAI）</span>
          </h1>

          {/* キャッチコピー */}
          <p className="text-lg md:text-xl text-gray-700 font-medium mb-2">
            看護師さんのシフトに、旅のリズムを。
          </p>

          {/* 説明 */}
          <p className="text-sm md:text-base text-gray-600">
            あなたの休日に合わせて、界の予約可能日を自動計算します
          </p>
        </div>
      </div>
    </header>
  );
};

