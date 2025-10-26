# Frontend実装メモ（界回 KAIKAI）

## 概要

React + TypeScript + TailwindCSSを使用して、シフト入力フォームと予約可能日の表示UIを実装します。

---

## 実装するUI

```
───────────────────────────────
界回（KAIKAI）
───────────────────────────────
あなたのシフトに、旅のリズムを。

Aシフト発表日： [2025-10-17]
Bシフト発表日： [2025-11-14]

[ 🔍 予約可能日を表示 ]

───────────────────────────────
✅ 2025-11-06（木）
✅ 2025-11-10（月）
✅ 2025-11-11（火）

ℹ️ 「界タビ20s」：20代限定・平日・44日前予約開始
───────────────────────────────
界回 © 2025
───────────────────────────────
```

---

## 実装手順

### ステップ1: 型定義の作成

**ファイル**: `frontend/src/types/api.ts`

```typescript
// APIリクエストの型
export interface ReservableDatesRequest {
  a_shift_date: string;
  b_shift_date: string;
}

// APIレスポンスの型（成功）
export interface ReservableDatesResponse {
  reservable_dates: string[];
}

// APIレスポンスの型（エラー）
export interface ErrorResponse {
  error: string;
}
```

**作成コマンド**:
```bash
mkdir -p frontend/src/types
```

---

### ステップ2: API通信関数の作成

**ファイル**: `frontend/src/api/reservableDates.ts`

```typescript
import type { ReservableDatesRequest, ReservableDatesResponse, ErrorResponse } from '../types/api';

const API_BASE_URL = 'http://localhost:3000';

export async function fetchReservableDates(
  request: ReservableDatesRequest
): Promise<ReservableDatesResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/reservable_dates`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData: ErrorResponse = await response.json();
    throw new Error(errorData.error || 'APIエラーが発生しました');
  }

  return response.json();
}
```

**作成コマンド**:
```bash
mkdir -p frontend/src/api
```

---

### ステップ3: 日付フォーマット用ユーティリティ

**ファイル**: `frontend/src/utils/dateFormatter.ts`

```typescript
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
```

**作成コマンド**:
```bash
mkdir -p frontend/src/utils
```

---

### ステップ4: メインコンポーネントの実装

**ファイル**: `frontend/src/App.tsx`

```typescript
import { useState } from 'react';
import { fetchReservableDates } from './api/reservableDates';
import { formatDateWithWeekday } from './utils/dateFormatter';
import type { ReservableDatesRequest } from './types/api';

function App() {
  // 状態管理
  const [aShiftDate, setAShiftDate] = useState<string>('');
  const [bShiftDate, setBShiftDate] = useState<string>('');
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
    if (!aShiftDate || !bShiftDate) {
      setError('両方の日付を入力してください');
      return;
    }

    setLoading(true);

    try {
      const request: ReservableDatesRequest = {
        a_shift_date: aShiftDate,
        b_shift_date: bShiftDate,
      };

      const response = await fetchReservableDates(request);
      setReservableDates(response.reservable_dates);

      if (response.reservable_dates.length === 0) {
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
            {/* Aシフト発表日 */}
            <div>
              <label htmlFor="aShiftDate" className="block text-sm font-medium text-kai-indigo mb-2">
                Aシフト発表日
              </label>
              <input
                type="date"
                id="aShiftDate"
                value={aShiftDate}
                onChange={(e) => setAShiftDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-kai-lavender focus:border-transparent"
                required
              />
            </div>

            {/* Bシフト発表日 */}
            <div>
              <label htmlFor="bShiftDate" className="block text-sm font-medium text-kai-indigo mb-2">
                Bシフト発表日
              </label>
              <input
                type="date"
                id="bShiftDate"
                value={bShiftDate}
                onChange={(e) => setBShiftDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-kai-lavender focus:border-transparent"
                required
              />
            </div>

            {/* 送信ボタン */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-kai-indigo text-white py-3 px-6 rounded-md hover:bg-opacity-90 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
            >
              {loading ? '検索中...' : '🔍 予約可能日を表示'}
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
```

---

### ステップ5: CSSの確認

**ファイル**: `frontend/src/index.css`

既に以下の設定があることを確認：

```css
@import "tailwindcss";
```

---

### ステップ6: 動作確認

#### 6-1. フロントエンドサーバーが起動していることを確認
```bash
docker compose ps
```

#### 6-2. ブラウザでアクセス
```
http://localhost:5173
```

#### 6-3. テストケース

**正常ケース**:
- Aシフト発表日: `2025-10-17`
- Bシフト発表日: `2025-11-14`
- 期待結果: 予約可能日が表示される

**エラーケース1（日付未入力）**:
- 片方または両方を空欄にして送信
- 期待結果: 「両方の日付を入力してください」

**エラーケース2（日付逆転）**:
- Aシフト: `2025-11-14`
- Bシフト: `2025-10-17`
- 期待結果: APIからエラーメッセージ

**該当なしケース**:
- 過去の日付や範囲外の日付を入力
- 期待結果: 「該当する予約可能日が見つかりませんでした」

---

## UIコンポーネント分割（v2で実装予定）

より保守性を高めるため、将来的にコンポーネントを分割します：

```
src/
├── components/
│   ├── Header.tsx              # ヘッダー
│   ├── ShiftInputForm.tsx      # シフト入力フォーム
│   ├── ReservableDatesList.tsx # 予約可能日リスト
│   ├── InfoBox.tsx             # 補足情報ボックス
│   └── Footer.tsx              # フッター
├── hooks/
│   └── useReservableDates.ts   # カスタムフック
└── App.tsx
```

---

## TailwindCSSクラスの説明

### カスタムカラー
- `bg-kai-white`: 背景色（白磁 #F9FAFB）
- `text-kai-indigo`: テキスト色（界藍 #4B5563）
- `border-kai-lavender`: ボーダー色（淡藤 #A5B4FC）

### カスタムフォント
- `font-noto`: Noto Sans JP（和文）
- `font-raleway`: Raleway（英文）

### よく使うクラス
- `max-w-2xl`: 最大幅
- `mx-auto`: 中央揃え
- `px-4 py-12`: パディング
- `rounded-lg`: 角丸
- `shadow-md`: 影
- `space-y-6`: 子要素の縦間隔

---

## デバッグ方法

### ブラウザのデベロッパーツール
1. F12キーでデベロッパーツールを開く
2. Consoleタブでエラーを確認
3. Networkタブで API通信を確認

### React Developer Tools
Chrome拡張機能「React Developer Tools」をインストールして、
コンポーネントの状態を確認できます。

### ログ出力
```typescript
console.log('API Request:', request);
console.log('API Response:', response);
```

---

## よくあるエラーと対処法

### エラー: CORS policy エラー
**原因**: バックエンドのCORS設定不足

**対処**: 既に設定済み（backend/config/initializers/cors.rb）

### エラー: fetch failed
**原因**: バックエンドが起動していない

**対処**:
```bash
docker compose ps
docker compose up -d backend
```

### エラー: Cannot find module
**原因**: 必要なファイルが作成されていない

**対処**: 該当するファイルを作成する

---

## パフォーマンス最適化（v2で実装予定）

- [ ] デバウンス処理（入力の連続送信を防ぐ）
- [ ] ローディングスピナーのアニメーション
- [ ] 結果のフェードインアニメーション
- [ ] エラーメッセージの自動消去

---

## アクセシビリティ改善（v2で実装予定）

- [ ] aria-label の追加
- [ ] キーボード操作の最適化
- [ ] スクリーンリーダー対応
- [ ] カラーコントラスト比の確認

---

## レスポンシブデザイン

現在の実装は既にレスポンシブ対応済み：

- `max-w-2xl`: 大画面での最大幅制限
- `px-4`: モバイルでの適切なパディング
- Tailwindのデフォルトでモバイルファースト

---

## 参考

- React公式ドキュメント: https://react.dev/
- TypeScript公式ドキュメント: https://www.typescriptlang.org/
- TailwindCSS公式ドキュメント: https://tailwindcss.com/
- Fetch API: https://developer.mozilla.org/ja/docs/Web/API/Fetch_API
