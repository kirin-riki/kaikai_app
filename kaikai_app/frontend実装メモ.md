# Frontend実装メモ（界回 KAIKAI）

## 概要

React + TypeScript + TailwindCSSを使用して、シフト入力フォームと予約可能日の表示UIを実装します。

---

## 📋 実装チェックリスト

実装を始める前に、以下の順序で進めてください：

- [ ] ステップ0: ディレクトリ構造の作成
- [ ] ステップ1: 型定義の作成（`types/api.ts`）
- [ ] ステップ2: API通信関数の作成（`api/reservableDates.ts`）
- [ ] ステップ3: 日付フォーマット用ユーティリティ（`utils/dateFormatter.ts`）
- [ ] ステップ4: メインコンポーネントの実装（`App.tsx`）
- [ ] ステップ5: CSSの確認（`index.css`）
- [ ] ステップ6: 動作確認とテスト

---

## ⚡ クイックスタートガイド（IDEで実装する場合）

時間がない方向けの最短手順です：

### 1. ディレクトリを作成
```bash
cd frontend
mkdir -p src/types src/api src/utils
```

### 2. 必要なファイルを作成

以下のファイルをIDEで作成してください：

- `src/types/api.ts` - 型定義
- `src/api/reservableDates.ts` - API通信
- `src/utils/dateFormatter.ts` - 日付フォーマット

### 3. App.tsxを更新

`src/App.tsx` を本メモのコードで置き換え

### 4. 動作確認

```bash
# コンテナが起動しているか確認
docker compose ps

# ブラウザでアクセス
# http://localhost:5173
```

### 5. テスト

- Aシフト: `2025-10-17`
- Bシフト: `2025-11-14`

で動作確認！

---

## 実装するUI

```
───────────────────────────────
界回（KAIKAI）
───────────────────────────────
あなたのシフトに、旅のリズムを。

シフト開始日： [2025-10-17]
希望日（Bシフト発表日）： [2025-11-14]
シフト周期： [28] 日

[ 🔍 予約可能日を表示 ]

───────────────────────────────
✅ 2025-11-06（木）
✅ 2025-11-07（金）
✅ 2025-11-08（月）

ℹ️ 「界タビ20s」：20代限定・平日・44日前予約開始
───────────────────────────────
界回 © 2025
───────────────────────────────
```

---

## 実装手順

### ステップ0: ディレクトリ構造の作成（準備）

まず、必要なディレクトリを作成します。

**コマンド**:
```bash
# frontendディレクトリに移動
cd frontend

# 必要なディレクトリを一括作成
mkdir -p src/types src/api src/utils
```

**確認**:
```bash
# ディレクトリが正しく作成されたか確認
ls -la src/
```

期待される出力：
```
drwxr-xr-x  api/
drwxr-xr-x  types/
drwxr-xr-x  utils/
-rw-r--r--  App.tsx
-rw-r--r--  index.css
-rw-r--r--  main.tsx
-rw-r--r--  vite-env.d.ts
```

---

### ステップ1: 型定義の作成

**ファイル**: `frontend/src/types/api.ts`

```typescript
// APIリクエストの型
export interface ReservableDatesRequest {
  shift_start_date: string;
  due_date: string;
  due_date_rule: number;
}

// APIレスポンスの型（成功）
export interface ReservableDatesResponse {
  dates: string[];
}

// APIレスポンスの型（エラー）
export interface ErrorResponse {
  errors: string[];
}
```

**作成方法**:

Dockerコンテナ内で作成する場合：
```bash
# ホストマシンから
docker compose exec frontend sh -c "cat > /app/src/types/api.ts << 'EOF'
// APIリクエストの型
export interface ReservableDatesRequest {
  shift_start_date: string;
  due_date: string;
  due_date_rule: number;
}

// APIレスポンスの型（成功）
export interface ReservableDatesResponse {
  dates: string[];
}

// APIレスポンスの型（エラー）
export interface ErrorResponse {
  errors: string[];
}
EOF"
```

または、IDEで直接ファイルを作成してください。

**確認**:
```bash
# ファイルが作成されたか確認
ls -la frontend/src/types/

# ファイルの内容を確認
cat frontend/src/types/api.ts
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
  const response = await fetch(`${API_BASE_URL}/reservable_dates`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData: ErrorResponse = await response.json();
    throw new Error(errorData.errors?.[0] || 'APIエラーが発生しました');
  }

  return response.json();
}
```

**作成方法**:

Dockerコンテナ内で作成する場合：
```bash
docker compose exec frontend sh -c "cat > /app/src/api/reservableDates.ts << 'EOF'
import type { ReservableDatesRequest, ReservableDatesResponse, ErrorResponse } from '../types/api';

const API_BASE_URL = 'http://localhost:3000';

export async function fetchReservableDates(
  request: ReservableDatesRequest
): Promise<ReservableDatesResponse> {
  const response = await fetch(\`\${API_BASE_URL}/reservable_dates\`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData: ErrorResponse = await response.json();
    throw new Error(errorData.errors?.[0] || 'APIエラーが発生しました');
  }

  return response.json();
}
EOF"
```

または、IDEで直接ファイルを作成してください。

**確認**:
```bash
# ファイルが作成されたか確認
ls -la frontend/src/api/

# ファイルの内容を確認
cat frontend/src/api/reservableDates.ts
```

**重要な注意点**:

1. **API_BASE_URL**:
   - 開発環境では `http://localhost:3000`
   - 本番環境では環境変数から取得するよう変更が必要（v2で対応）

2. **CORS設定**:
   - バックエンド側で既に `localhost:5173` を許可済み
   - 異なるポートを使用する場合は `backend/config/initializers/cors.rb` を修正

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

**作成方法**:

Dockerコンテナ内で作成する場合：
```bash
docker compose exec frontend sh -c "cat > /app/src/utils/dateFormatter.ts << 'EOF'
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
  return \`\${dateString}（\${weekday}）\`;
}
EOF"
```

または、IDEで直接ファイルを作成してください。

**確認**:
```bash
# ファイルが作成されたか確認
ls -la frontend/src/utils/

# ファイルの内容を確認
cat frontend/src/utils/dateFormatter.ts
```

**テスト方法**（ブラウザのコンソールで）:
```javascript
import { formatDateWithWeekday } from './utils/dateFormatter';

// テスト
console.log(formatDateWithWeekday('2025-11-06')); // "2025-11-06（木）"
console.log(formatDateWithWeekday('2025-11-10')); // "2025-11-10（月）"
```

**タイムゾーンの注意点**:
- `new Date(dateString)` はUTCとして解釈されます
- 日付のみの場合（時刻なし）は問題ありませんが、注意が必要です
- 曜日の計算に影響する可能性があるため、必要に応じて調整してください

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
                希望日（Bシフト発表日など）
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

**作成方法**:

IDEで `frontend/src/App.tsx` を開いて、上記のコードで置き換えてください。

**確認**:

コンテナのログでエラーが出ていないか確認：
```bash
docker compose logs -f frontend
```

エラーがなければ、Viteが自動的にホットリロードします。

**重要なポイント**:

1. **useState の初期値**:
   - 空文字列で初期化しています
   - テスト時に初期値を設定したい場合は、ここを変更してください

2. **エラーハンドリング**:
   - API通信エラーとバリデーションエラーを分けて処理
   - ユーザーに分かりやすいメッセージを表示

3. **ローディング状態**:
   - `loading` stateでボタンの無効化とテキスト変更
   - 二重送信を防止

---

### ステップ5: CSSの確認

**ファイル**: `frontend/src/index.css`

既に以下の設定があることを確認：

```css
@import "tailwindcss";
```

**確認方法**:
```bash
cat frontend/src/index.css
```

もし設定がない場合は追加してください：
```bash
echo '@import "tailwindcss";' > frontend/src/index.css
```

**TailwindCSSが正しく動作しているか確認**:
- ブラウザで http://localhost:5173 にアクセス
- カスタムカラー（kai-indigo, kai-lavender, kai-white）が適用されているか確認
- フォント（Noto Sans JP）が適用されているか確認

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

**テストケース1: 正常ケース**

手順：
1. シフト開始日に `2025-10-17` を入力
2. 希望日に `2025-11-14` を入力
3. シフト周期に `28` を入力
4. 「🔍 予約可能日を表示」ボタンをクリック

期待結果：
- ローディング中に「検索中...」と表示される
- 予約可能日のリストが表示される（例: 2025-11-06（木）、2025-11-07（金）、2025-11-08（月）など）
- エラーメッセージは表示されない

確認ポイント：
- [ ] ボタンが一時的に無効化される
- [ ] 日付が曜日付きで正しく表示される
- [ ] レスポンスが1秒以内に返ってくる

---

**テストケース2: エラーケース（入力未完了）**

手順：
1. シフト開始日のみ入力（他の項目は空欄）
2. 「🔍 予約可能日を表示」ボタンをクリック

期待結果：
- 「すべての項目を入力してください」というエラーメッセージが表示される
- APIリクエストは送信されない

確認ポイント：
- [ ] エラーメッセージが赤い背景で表示される
- [ ] ブラウザの開発者ツールのNetworkタブでリクエストが送信されていない

---

**テストケース3: エラーケース（日付逆転）**

手順：
1. シフト開始日に `2025-11-14` を入力
2. 希望日に `2025-10-17` を入力
3. シフト周期に `28` を入力
4. 「🔍 予約可能日を表示」ボタンをクリック

期待結果：
- APIからのエラーメッセージが表示される
- 例: "Due date はシフト開始日より後の日付を入力してください"

確認ポイント：
- [ ] APIリクエストが送信される（Networkタブで確認）
- [ ] HTTPステータスコードが400（Bad Request）
- [ ] エラーメッセージがユーザーに表示される（日本語）

---

**テストケース4: エラーケース（過去の日付）**

手順：
1. 過去の日付を入力
2. 例: シフト開始日 `2024-01-01`、希望日 `2024-02-01`、シフト周期 `28`
3. 「🔍 予約可能日を表示」ボタンをクリック

期待結果：
- APIからのエラーメッセージが表示される
- 例: "Shift start date は今日以降の日付を入力してください"

確認ポイント：
- [ ] APIリクエストが送信される（Networkタブで確認）
- [ ] HTTPステータスコードが400（Bad Request）
- [ ] エラーメッセージがユーザーに表示される（日本語）

---

#### 6-4. デベロッパーツールでの確認

**Networkタブで確認すべき項目**:
1. リクエストURL: `http://localhost:3000/reservable_dates`
2. メソッド: `POST`
3. ステータスコード: `200` (成功時) または `400` (エラー時)
4. Request Headers:
   - `Content-Type: application/json`
5. Request Payload:
   ```json
   {
     "shift_start_date": "2025-10-17",
     "due_date": "2025-11-14",
     "due_date_rule": 28
   }
   ```
6. Response (成功時):
   ```json
   {
     "dates": ["2025-11-06", "2025-11-07", "2025-11-08", ...]
   }
   ```
7. Response (エラー時):
   ```json
   {
     "errors": ["Due date はシフト開始日より後の日付を入力してください"]
   }
   ```

**Consoleタブで確認すべき項目**:
- エラーメッセージが出ていないか
- CORS関連のエラーが出ていないか
- TypeScriptの型エラーが出ていないか

---

#### 6-5. トラブルシューティング

**問題: 画面が真っ白**
```bash
# フロントエンドのログを確認
docker compose logs frontend

# よくある原因
# - TypeScriptの構文エラー
# - importパスの間違い
# - モジュールが見つからない
```

**問題: スタイルが適用されない**
```bash
# index.cssを確認
cat frontend/src/index.css

# tailwind.config.jsを確認
cat frontend/tailwind.config.js

# PostCSS設定を確認
cat frontend/postcss.config.js
```

**問題: APIリクエストが失敗する**
```bash
# バックエンドが起動しているか確認
docker compose ps

# CORSエラーの場合
# backend/config/initializers/cors.rbを確認
```

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

## 🎉 実装完了後の確認事項

実装が完了したら、以下を確認してください：

### ファイル構成の確認
```bash
cd frontend/src
tree
```

期待される構成：
```
src/
├── api/
│   └── reservableDates.ts
├── types/
│   └── api.ts
├── utils/
│   └── dateFormatter.ts
├── App.tsx
├── index.css
├── main.tsx
└── vite-env.d.ts
```

### 機能の確認

- [ ] 日付入力フォームが表示される
- [ ] 日付を入力して送信できる
- [ ] ローディング状態が表示される
- [ ] 予約可能日が曜日付きで表示される
- [ ] エラーメッセージが適切に表示される
- [ ] カスタムカラーが適用されている
- [ ] フォント（Noto Sans JP）が適用されている
- [ ] レスポンシブデザインが機能している

### パフォーマンスの確認

- [ ] 初回読み込みが3秒以内
- [ ] APIレスポンスが1秒以内
- [ ] ホットリロードが動作している

### 次のステップ

MVP実装が完了しました！以下の拡張を検討できます：

1. **UI/UX改善**
   - ローディングスピナーのアニメーション
   - 結果のフェードインアニメーション
   - エラーメッセージの自動消去

2. **機能追加**
   - 祝日除外機能
   - シフトパターンの保存
   - 複数シフトの一括計算

3. **コンポーネント分割**
   - Header, Footer, Form, List などに分割
   - カスタムフックの作成

4. **テストの追加**
   - Vitestでのユニットテスト
   - React Testing Libraryでのコンポーネントテスト

---

## 📚 参考リンク

### 公式ドキュメント
- React公式ドキュメント: https://react.dev/
- TypeScript公式ドキュメント: https://www.typescriptlang.org/
- TailwindCSS公式ドキュメント: https://tailwindcss.com/
- Vite公式ドキュメント: https://vite.dev/

### API・ブラウザ機能
- Fetch API: https://developer.mozilla.org/ja/docs/Web/API/Fetch_API
- Date: https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Date
- Form Validation: https://developer.mozilla.org/ja/docs/Learn/Forms/Form_validation

### ツール
- React Developer Tools: https://react.dev/learn/react-developer-tools
- Chrome DevTools: https://developer.chrome.com/docs/devtools/

---

## 💡 Tips & ベストプラクティス

### 開発効率を上げるコツ

1. **ホットリロードの活用**
   - ファイルを保存すると自動的にブラウザがリロードされます
   - Console や Network タブを開いたまま開発すると便利

2. **TypeScriptの型チェック**
   - VSCodeを使用すると、リアルタイムで型エラーが表示されます
   - `Ctrl + Space` で型の補完が効きます

3. **TailwindCSSのクラス補完**
   - VSCodeの「Tailwind CSS IntelliSense」拡張機能を使用すると便利

4. **ブラウザ拡張機能**
   - React Developer Tools でコンポーネントの状態を確認
   - Redux DevTools（将来的に状態管理を追加する場合）

### よく使うショートカット

- `Ctrl + Shift + I`: デベロッパーツール
- `Ctrl + R`: ページリロード
- `Ctrl + Shift + R`: キャッシュクリア＆リロード
- `F12`: デベロッパーツールのトグル

---

## 🎓 学習リソース

フロントエンド開発をさらに学びたい方へ：

### React
- [React公式チュートリアル](https://react.dev/learn)
- [React Hooks完全ガイド](https://react.dev/reference/react)

### TypeScript
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [TypeScript Deep Dive (日本語版)](https://typescript-jp.gitbook.io/deep-dive/)

### TailwindCSS
- [TailwindCSS公式ドキュメント](https://tailwindcss.com/docs)
- [Tailwind Play](https://play.tailwindcss.com/) - オンラインエディタ

---

## ✅ 実装完了！

お疲れ様でした！フロントエンドの実装が完了しました。

次は `backend実装メモ.md` を参照して、バックエンドAPIの実装に進んでください。
