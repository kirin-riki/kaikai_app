# フロントエンド実装ガイド

## 📋 技術スタック

- **React 19** + **TypeScript**
- **Vite**（ビルドツール）
- **Tailwind CSS 4**（スタイリング）
- **素の React Hooks**（状態管理）

## 🎯 実装すべき機能

### 1. 予約可能日計算フォーム

- 入力フィールド：
  - シフト開始日（日付ピッカー）
  - 締切日（日付ピッカー）
  - サイクル日数（数値入力）
- 送信ボタン

### 2. 予約可能日一覧表示

- 計算結果の日付リストを表示
- 各日付に「予約する」ボタン
- 空の場合はメッセージ表示

## 📁 推奨ファイル構成

```
frontend/src/
├── App.tsx                    # エントリーポイント
├── components/
│   ├── DateForm.tsx          # 日付入力フォーム
│   └── AvailableDatesList.tsx # 予約可能日一覧
├── types/
│   └── reservation.ts        # 型定義
└── api/
    └── reservation.ts        # API呼び出し
```

## 💻 実装例

### 1. 型定義（`src/types/reservation.ts`）


```typescript
export interface ReservationParams {
  shift_start_date: string;
  due_date: string;
  due_date_rule: number;
}

export interface ReservationResponse {
  dates: string[]; // ["2024-02-14", ...]
}

export interface ReservationError {
  errors: string[];
}
```

### 2. API呼び出し（`src/api/reservation.ts`）

```typescript
const API_BASE_URL = 'http://localhost:3000';

export const calculateAvailableDates = async (
  params: ReservationParams
): Promise<ReservationResponse> => {
  const response = await fetch(`${API_BASE_URL}/reservable_dates`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error: ReservationError = await response.json();
    throw new Error(error.errors.join(', '));
  }

  return await response.json();
};
```

### 3. 日付入力フォーム（`src/components/DateForm.tsx`）

```typescript
import { useState } from 'react';
import { calculateAvailableDates } from '../api/reservation';
import type { ReservationParams, ReservationResponse } from '../types/reservation';

export const DateForm = () => {
  const [params, setParams] = useState<ReservationParams>({
    shift_start_date: '',
    due_date: '',
    due_date_rule: 7,
  });
  const [result, setResult] = useState<ReservationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await calculateAvailableDates(params);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '予約可能日の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          シフト開始日
        </label>
        <input
          type="date"
          value={params.shift_start_date}
          onChange={(e) => setParams({ ...params, shift_start_date: e.target.value })}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          締切日
        </label>
        <input
          type="date"
          value={params.due_date}
          onChange={(e) => setParams({ ...params, due_date: e.target.value })}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          サイクル日数
        </label>
        <input
          type="number"
          value={params.due_date_rule}
          onChange={(e) => setParams({ ...params, due_date_rule: Number(e.target.value) })}
          min="1"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? '計算中...' : '予約可能日を計算'}
      </button>

      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}

      {result && <AvailableDatesList dates={result.dates} />}
    </form>
  );
};
```

### 4. 予約可能日一覧（`src/components/AvailableDatesList.tsx`）

```typescript
interface Props {
  dates: string[];
}

export const AvailableDatesList = ({ dates }: Props) => {
  if (dates.length === 0) {
    return (
      <div className="mt-4 p-4 bg-gray-100 rounded-md text-center">
        予約可能日がありません
      </div>
    );
  }

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-3">
        予約可能日（{dates.length}件）
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {dates.map((date) => (
          <button
            key={date}
            className="p-3 border border-blue-300 rounded-md hover:bg-blue-50 text-left"
          >
            <div className="font-medium">{date}</div>
            <button className="mt-2 text-sm text-blue-600 hover:text-blue-800">
              予約する →
            </button>
          </button>
        ))}
      </div>
    </div>
  );
};
```

### 5. メインApp（`src/App.tsx`）

```typescript
import { DateForm } from './components/DateForm';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">界回（KAIKAI）</h1>
        <p className="text-gray-600 mb-8">あなたのシフトに、旅のリズムを。</p>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">
            予約可能日を計算
          </h2>
          <DateForm />
        </div>
      </div>
    </div>
  );
}

export default App;
```

## 🎨 UI実装のポイント

### Tailwind CSS活用例

```tsx
// カード型のレイアウト
<div className="bg-white rounded-lg shadow p-6">

// フォーム要素
<input className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />

// ボタン
<button className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors">
```

### 日付フォーマット

```typescript
const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short'
  });
};
```

### ローディング状態

```tsx
{loading && (
  <div className="flex items-center justify-center py-4">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
  </div>
)}
```

## 🔧 環境設定

### CORS設定（バックエンド側）

バックエンドでCORSを許可する必要があります：

```ruby
# Gemfile
gem 'rack-cors'

# config/initializers/cors.rb
Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins 'http://localhost:5173'
    resource '*',
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head]
  end
end
```

## 📝 実装チェックリスト

- [ ] API呼び出しの実装
- [ ] フォームの作成
- [ ] バリデーションエラーの表示
- [ ] ローディング状態の表示
- [ ] 予約可能日一覧の表示
- [ ] レスポンシブ対応
- [ ] CORS設定の確認
- [ ] エラーハンドリング

## 🎯 次のステップ

1. **コンポーネント分割**: フォームとリストを分離
2. **状態管理**: 複数コンポーネント間の状態共有が必要ならContext API使用
3. **日付ピッカー**: `react-datepicker`などのライブラリ検討
4. **カレンダー表示**: 予約可能日をカレンダー形式で表示
5. **予約機能**: 実際の予約処理を実装

## 💡 追加機能のアイデア

- 祝日除外機能
- カスタム営業日設定
- 予約履歴の表示
- エクスポート機能（CSV）
