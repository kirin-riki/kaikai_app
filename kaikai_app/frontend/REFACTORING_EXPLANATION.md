# リファクタリング解説：変更前後の比較

## 📋 変更サマリー

| 項目 | 変更前 | 変更後 |
|------|--------|--------|
| ファイル数 | 1ファイル（App.tsx） | 5ファイル |
| App.tsxの行数 | 172行 | 78行 |
| 状態管理 | useState × 6個 | useState × 3個 + カスタムフック |
| ロジック | App.tsx内に全て | hooks/useReservableDates.ts に分離 |
| UI | 全て同一ファイル | 3つのコンポーネントに分割 |

## 🔍 変更の詳細解説

### 1. ロジックの分離（最大の変更）

#### 変更前：App.tsx内で全て管理

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
    e.preventDefault();
    setError('');
    setReservableDates([]);
    
    // バリデーション
    if (!shiftStartDate || !dueDate || !dueDateRule) {
      setError('すべての項目を入力してください');
      return;
    }
    
    setLoading(true);
    
    try {
      const request = { ... };
      const response = await fetchReservableDates(request);
      setReservableDates(response.dates);
      
      if (response.dates.length === 0) {
        setError('該当する予約可能日が見つかりませんでした');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '...');
    } finally {
      setLoading(false);
    }
  };
}
```

#### 変更後：カスタムフックに分離

```typescript
// hooks/useReservableDates.ts（新規作成）
export const useReservableDates = () => {
  // ここに処理を移動
  const [reservableDates, setReservableDates] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const calculateDates = async (request) => {
    // 全てのロジックがここに
  };

  return { reservableDates, loading, error, calculateDates };
};

// App.tsx（簡潔に）
function App() {
  // フォームの状態だけ管理
  const [shiftStartDate, setShiftStartDate] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [dueDateRule, setDueDateRule] = useState<string>('28');

  // カスタムフックでロジックを取得
  const { reservableDates, loading, error, calculateDates } = useReservableDates();
}
```

**目的**:
- ロジックの再利用性向上（他のコンポーネントから使える）
- テストしやすくなる（ロジックのみを独立してテスト可能）
- App.tsxがシンプルになる（50行以上削減）

---

### 2. UIコンポーネントの分割

#### フォーム部分の分離

**変更前（App.tsx内）：**
```tsx
<form onSubmit={handleSubmit}>
  <div className="space-y-6">
    {/* 65行ほどのフォームコード */}
  </div>
</form>
```

**変更後（DateForm.tsx）：**
```tsx
export const DateForm = ({ shiftStartDate, dueDate, ... }) => {
  return (
    <form onSubmit={onSubmit}>
      {/* 同じ65行のコード */}
    </form>
  );
};
```

**目的**:
- コンポーネントの再利用（他のページでも使える）
- 関心の分離（フォームのロジックとレイアウトを分ける）

---

### 3. Propsの設計変更（改良点）

#### 変更前：直接的にstateを変更

```typescript
// 各inputで直接setStateを呼び出す
onChange={(e) => setShiftStartDate(e.target.value)}
```

#### 変更後：コールバック関数を渡す

```typescript
// App.tsx
<DateForm
  shiftStartDate={shiftStartDate}
  onShiftStartDateChange={setShiftStartDate}  // ← 関数を渡す
/>

// DateForm.tsx
<input
  onChange={(e) => onShiftStartDateChange(e.target.value)}  // ← 受け取った関数を使う
/>
```

**目的**:
- コンポーネントの独立性を保つ（DateFormはstateを直接変更しない）
- テストしやすくなる（propsで操作をモックできる）

---

### 4. 条件付きレンダリングの改善

#### 変更前：条件チェックがApp.tsx内

```tsx
{reservableDates.length > 0 && (
  <div className="bg-white...">
    {/* 結果表示 */}
  </div>
)}
```

#### 変更後：コンポーネント内で判定

```tsx
// AvailableDatesList.tsx
export const AvailableDatesList = ({ dates }) => {
  if (dates.length === 0) return null;  // ← ここでチェック
  return <div>{/* 結果表示 */}</div>;
};
```

**目的**:
- App.tsxを簡潔にする（条件チェック不要）
- コンポーネントが自己完結的になる

---

### 5. handleSubmit関数の簡素化

#### 変更前：全ての処理を実行

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  setReservableDates([]);
  
  if (!shiftStartDate || !dueDate || !dueDateRule) {
    setError('すべての項目を入力してください');
    return;
  }
  
  setLoading(true);
  
  try {
    const request = { ... };
    const response = await fetchReservableDates(request);
    setReservableDates(response.dates);
    
    if (response.dates.length === 0) {
      setError('該当する予約可能日が見つかりませんでした');
    }
  } catch (err) {
    setError(err instanceof Error ? err.message : '...');
  } finally {
    setLoading(false);
  }
};
```

#### 変更後：最小限の処理のみ

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const request: ReservableDatesRequest = {
    shift_start_date: shiftStartDate,
    due_date: dueDate,
    due_date_rule: parseInt(dueDateRule, 10),
  };

  await calculateDates(request);  // ← カスタムフックに委譲
};
```

**目的**:
- App.tsxの責務を減らす（リクエスト構築のみ）
- バリデーションとAPI処理はカスタムフックに移譲

---

## 📊 コード量の変化

```
変更前: 172行（全てApp.tsx）
変更後:
  - App.tsx: 78行（54%削減）
  - DateForm.tsx: 79行
  - AvailableDatesList.tsx: 27行
  - InfoBox.tsx: 11行
  - useReservableDates.ts: 45行
```

**合計**: 240行（純増は68行だが、再利用性と保守性が大幅に向上）

---

## 🎯 改善された点

### 1. **保守性**
- 各ファイルが単一の責任を持つ
- 修正箇所が明確

### 2. **テスト性**
- 各コンポーネントを独立してテスト可能
- カスタムフックを単体でテスト可能

### 3. **再利用性**
- `DateForm` は他のフォームでも使える
- `useReservableDates` は他のコンポーネントでも使える

### 4. **可読性**
- App.tsxが簡潔で読みやすい
- 各コンポーネントの目的が明確

### 5. **チーム開発**
- ファイルを分割して担当分けしやすい
- コンフリクトが起きにくい

---

## ⚠️ 注意点

### 変更されていない部分

以下の部分は「そのまま移動」しただけです：
- JSX（フォームの入力欄、ボタンなど）
- CSSクラス名
- レイアウト構造

### 新たに追加された部分

1. **TypeScript型定義**（`components.ts`）
   - propsの型を明示

2. **カスタムフック**（`useReservableDates.ts`）
   - ロジックの分離

3. **Props設計の改善**
   - イベントハンドラーをpropsで受け取る設計に変更

