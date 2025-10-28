# リファクタリングガイド

## 現在の構成

現在は `App.tsx` に全てがまとまっています。これは問題ありませんが、将来的に機能が増えた場合は分割を検討しましょう。

## 推奨される分割方法

### Phase 1: 現在のまま（問題なし）
```
App.tsx（全てここに）
```

### Phase 2: コンポーネント分割
```
src/
├── components/
│   ├── DateForm.tsx          # 65-126行目
│   ├── AvailableDatesList.tsx # 136-153行目
│   └── InfoBox.tsx           # 156-160行目
└── App.tsx                   # メインコンポーネント
```

### Phase 3: カスタムフックでロジック分離
```
src/
├── hooks/
│   └── useReservableDates.ts  # 15-49行目のロジック
├── components/
│   ├── DateForm.tsx
│   ├── AvailableDatesList.tsx
│   └── InfoBox.tsx
└── App.tsx
```

## 実装例

### コンポーネント分割の例

#### DateForm.tsx
```typescript
import { DateFormProps } from '../types/components';

export const DateForm = ({
  shiftStartDate,
  dueDate,
  dueDateRule,
  loading,
  onChange,
  onSubmit
}: DateFormProps) => {
  return (
    <form onSubmit={onSubmit} className="bg-white rounded-lg shadow-md p-8 mb-8">
      {/* ... フォーム内容 ... */}
    </form>
  );
};
```

#### AvailableDatesList.tsx
```typescript
import { formatDateWithWeekday } from '../utils/dateFormatter';

interface Props {
  dates: string[];
}

export const AvailableDatesList = ({ dates }: Props) => {
  if (dates.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow-md p-8 mb-8">
      <h2 className="text-2xl font-bold text-kai-indigo mb-6">
        予約可能日
      </h2>
      <ul className="space-y-3">
        {dates.map((date) => (
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
  );
};
```

#### useReservableDates.ts（カスタムフック）
```typescript
import { useState } from 'react';
import { fetchReservableDates } from '../api/reservableDates';

export const useReservableDates = () => {
  const [reservableDates, setReservableDates] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const calculateDates = async (request: ReservableDatesRequest) => {
    setError('');
    setReservableDates([]);
    setLoading(true);

    try {
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

  return { reservableDates, loading, error, calculateDates };
};
```

## React公式ドキュメントの推奨

### 公式ガイド「コンポーネントを小さく保つ」

> コンポーネントが大きくなったら、責任を分割して必要に応じて新しいコンポーネントを作りましょう。

### 公式ガイド「コンポーネントの抽出」

> 同じコンポーネントを複数回使っている場合は、共通のコンポーネントとして抽出することを検討してください。

## 判断基準

現在の実装で **分割すべきか** の判断：

### 分割しない方が良い場合（現在）
- ✅ 機能が少ない（1画面のみ）
- ✅ コンポーネントの再利用がない
- ✅ チーム開発ではない
- ✅ 1つの責任しか持っていない

### 分割した方が良い場合
- ⚠️ 同じコンポーネントを複数箇所で使っている
- ⚠️ 1つのコンポーネントが200行以上になった
- ⚠️ ロジックとUIが混在している
- ⚠️ テスタビリティを向上させたい
- ⚠️ チームで分担して開発する

## 結論

**現在の1ファイル構成は問題ありません。**

React公式ドキュメントでも、小さなアプリケーションでは単一ファイルでも問題ないとされています。必要になったら段階的に分割してください。

