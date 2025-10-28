# フロントエンドリファクタリング：コンポーネント分割とカスタムフック実装

## 📋 概要

フロントエンドコードを保守性・再利用性・テスタビリティ向上のためにリファクタリングしました。単一の巨大なコンポーネントから、責任を明確に分離した複数の小さなコンポーネントとカスタムフックへの分割を実施。

## 🎯 変更内容

### 変更の目的

- **保守性の向上**: 各コンポーネントが単一の責任を持つ
- **再利用性の向上**: コンポーネントを他のページでも利用可能に
- **テスタビリティの向上**: 各コンポーネントを独立してテスト可能に
- **可読性の向上**: App.tsxを簡潔にし、全体像を把握しやすく

## 📁 新規作成ファイル

### コンポーネント
- `src/components/Header.tsx` - ヘッダーコンポーネント
- `src/components/Footer.tsx` - フッターコンポーネント
- `src/components/DateForm.tsx` - 日付入力フォーム
- `src/components/ErrorMessage.tsx` - エラー表示
- `src/components/AvailableDatesList.tsx` - 予約可能日一覧
- `src/components/InfoBox.tsx` - 補足情報

### カスタムフック
- `src/hooks/useReservableDates.ts` - 予約可能日計算のロジック

## 🔄 変更詳細

### App.tsx の簡素化

#### 変更前（172行 → 150行 → 75行 → 52行）

```typescript
function App() {
  // 6つの状態管理
  const [shiftStartDate, setShiftStartDate] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [dueDateRule, setDueDateRule] = useState<string>('28');
  const [reservableDates, setReservableDates] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // 40行ほどのhandleSubmit関数
  const handleSubmit = async (e: React.FormEvent) => {
    // バリデーション、API呼び出し、エラーハンドリング
  };

  // 120行ほどのJSX（フォーム、エラー、結果表示）
  return (
    <div>
      <header>...</header>
      <form>...</form>
      <div>エラー表示</div>
      <div>結果表示</div>
      <div>補足情報</div>
      <footer>...</footer>
    </div>
  );
}
```

#### 変更後（52行）

```typescript
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { DateForm } from './components/DateForm';
import { ErrorMessage } from './components/ErrorMessage';
import { AvailableDatesList } from './components/AvailableDatesList';
import { InfoBox } from './components/InfoBox';
import { useReservableDates } from './hooks/useReservableDates';

function App() {
  const {
    shiftStartDate, setShiftStartDate,
    dueDate, setDueDate,
    dueDateRule, setDueDateRule,
    reservableDates, loading, error, handleSubmit
  } = useReservableDates();

  return (
    <div className="min-h-screen bg-kai-white font-noto">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Header />
        <DateForm
          shiftStartDate={shiftStartDate}
          dueDate={dueDate}
          dueDateRule={dueDateRule}
          loading={loading}
          onShiftStartDateChange={setShiftStartDate}
          onDueDateChange={setDueDate}
          onDueDateRuleChange={setDueDateRule}
          onSubmit={handleSubmit}
        />
        {error && <ErrorMessage message={error} />}
        <AvailableDatesList dates={reservableDates} />
        <InfoBox />
        <Footer />
      </div>
    </div>
  );
}
```

### カスタムフックの実装

```typescript
// hooks/useReservableDates.ts
export function useReservableDates() {
  // フォームの状態管理
  const [shiftStartDate, setShiftStartDate] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [dueDateRule, setDueDateRule] = useState<string>('28');
  
  // API呼び出しの状態管理
  const [reservableDates, setReservableDates] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // フォーム送信処理（APIロジック）
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // バリデーション、API呼び出し、エラーハンドリング
  };

  return {
    shiftStartDate, setShiftStartDate,
    dueDate, setDueDate,
    dueDateRule, setDueDateRule,
    reservableDates, loading, error, handleSubmit,
  };
}
```

## 📊 変更の比較

| 項目 | 変更前 | 変更後 | 改善点 |
|------|--------|--------|--------|
| App.tsxの行数 | 172行 | 52行 | **70%削減** |
| 状態管理場所 | App.tsx内 | カスタムフック | 再利用可能 |
| コンポーネント数 | 1つ（巨大） | 7つ（小さい） | 責任分離 |
| テスト容易性 | 難しい | 容易 | 各コンポーネント独立 |
| 再利用性 | 低い | 高い | 他ページで利用可能 |

## 🎨 コンポーネント構成

```
App.tsx（52行）
├── Header.tsx（14行）
├── DateForm.tsx（88行）
├── ErrorMessage.tsx（13行）
├── AvailableDatesList.tsx（27行）
├── InfoBox.tsx（11行）
└── Footer.tsx（11行）

useReservableDates.ts（55行）
└── ロジックを分離
```

## 💡 設計上の利点

### 1. 単一責任の原則（SRP）
各コンポーネントが1つの責務のみを担当：
- `Header`: タイトル表示
- `DateForm`: フォーム入力
- `ErrorMessage`: エラー表示
- `AvailableDatesList`: 結果表示

### 2. 再利用性
各コンポーネントは独立して動作するため、他のページでも利用可能：
```typescript
// 他のページでも使える
<Header />
<Footer />
```

### 3. テスタビリティ
各コンポーネントを独立してテスト可能：
```typescript
// DateForm.tsx のテスト
test('should render form inputs', () => {
  render(<DateForm {...props} />);
  // テストコード
});
```

### 4. 保守性
修正箇所が明確になり、影響範囲を限定可能：
- フォームの変更 → `DateForm.tsx` のみ
- エラー表示の変更 → `ErrorMessage.tsx` のみ

## 🔍 コードレビューポイント

### ✅ 改善されている点

1. **コードの可読性**: App.tsxが52行と簡潔に
2. **責務の分離**: 各コンポーネントの役割が明確
3. **再利用性**: 各コンポーネントが独立
4. **テスト性**: 単体テストが書きやすい
5. **保守性**: 修正時の影響範囲が明確

### ⚠️ 注意点

- **Props設計**: 各コンポーネントのprops設計は適切か
- **型安全性**: TypeScript型定義は漏れなく記述しているか
- **パフォーマンス**: 不要な再レンダリングがないか

## 📝 使い方

### 基本的な使い方

```typescript
// App.tsx
import { useReservableDates } from './hooks/useReservableDates';

function App() {
  const { reservableDates, loading, error, handleSubmit, ... } = useReservableDates();
  
  return (
    <>
      <Header />
      <DateForm onSubmit={handleSubmit} {...props} />
      {error && <ErrorMessage message={error} />}
      <AvailableDatesList dates={reservableDates} />
      <InfoBox />
      <Footer />
    </>
  );
}
```

### カスタムフックの使用方法

```typescript
const {
  shiftStartDate, setShiftStartDate,      // フォーム状態
  dueDate, setDueDate,
  dueDateRule, setDueDateRule,
  reservableDates,                         // API結果
  loading,                                 // ローディング状態
  error,                                   // エラー状態
  handleSubmit                             // フォーム送信処理
} = useReservableDates();
```

## 🎯 今後の拡張

この設計により、以下の機能追加が容易になりました：

- [ ] 祝日除外機能の追加（`AvailableDatesList`の拡張）
- [ ] カレンダー表示機能の追加（新規コンポーネント）
- [ ] 予約機能の実装（`DateForm`の拡張）
- [ ] 複数シフト対応（カスタムフックの拡張）

## ✅ 動作確認

### テスト方法

```bash
# フロントエンド開発サーバー起動
cd frontend
npm run dev

# ブラウザで確認
http://localhost:5173
```

### 確認項目

- [x] フォーム送信が正常に動作する
- [x] エラーメッセージが正しく表示される
- [x] 予約可能日が正しく表示される
- [x] ローディング状態が正しく表示される
- [x] 各コンポーネントが独立して動作する

## 📦 影響範囲

### 変更されたファイル

- **新規**: 6ファイル（コンポーネント + フック）
- **変更**: 1ファイル（App.tsx）
- **削除**: なし

### 破壊的変更

なし。既存の機能は全て保持されています。

## 🔄 マイグレーション

既存のコードから新しい構成への移行：

1. 既存のApp.tsxの実装を保持
2. 新規コンポーネントとカスタムフックを追加
3. App.tsxを段階的にリファクタリング
4. 動作確認

## 📝 まとめ

このリファクタリングにより、以下が達成されました：

1. **コードの簡素化**: App.tsxが172行→52行に（70%削減）
2. **再利用性の向上**: 各コンポーネントが独立して動作
3. **テスタビリティの向上**: 単体テストが書きやすい
4. **保守性の向上**: 修正箇所が明確
5. **可読性の向上**: コードの意図が明確

Reactのベストプラクティスに沿った設計になり、将来の機能拡張に対応しやすくなりました。

