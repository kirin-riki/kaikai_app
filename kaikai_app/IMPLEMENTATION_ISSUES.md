# 界回（KAIKAI）アプリ実装内容 - Issue切り分けメモ

このドキュメントは、今回実装したMVP（Minimum Viable Product）の内容を機能ごとに分類し、GitHubのIssue作成時に活用できるよう整理したものです。

---

## 📋 プロジェクト概要

**アプリ名**: 界回（KAIKAI）
**目的**: シフト勤務者が「界タビ20s」の予約可能日を自動計算するツール
**技術スタック**:
- Frontend: React + TypeScript + Vite + TailwindCSS
- Backend: Ruby on Rails (API mode)
- Infrastructure: Docker + Docker Compose

**実装期間**: 2025/10/26 - 2025/10/27
**コミット履歴**:
- `f1a56b3` - バックエンド部実装
- `967a66e` - フロントエンド実装

---

## 🎯 実装した機能一覧

### 1. 環境構築 (Issue #1)

**タイトル**: Docker環境の構築とプロジェクト初期化

**説明**:
プロジェクトの開発環境をDockerで構築し、フロントエンド（Vite + React）とバックエンド（Rails API）を連携させる。

**実装内容**:
- Docker Compose設定
  - Frontend: Node.js + Vite (ポート 5173)
  - Backend: Ruby on Rails API mode (ポート 3000)
- CORS設定（backend/config/initializers/cors.rb）
- TailwindCSS設定
  - カスタムカラー定義（kai-indigo, kai-lavender, kai-white）
  - カスタムフォント（Noto Sans JP）
- 開発環境の動作確認

**変更ファイル**:
```
docker-compose.yml
frontend/Dockerfile
backend/Dockerfile
frontend/tailwind.config.js
frontend/postcss.config.js
frontend/src/index.css
backend/config/initializers/cors.rb
```

**テスト方法**:
- `docker compose up -d` でコンテナが起動すること
- http://localhost:5173 でフロントエンドにアクセスできること
- http://localhost:3000 でバックエンドにアクセスできること
- CORS設定が正しく動作すること

**優先度**: 🔴 最高
**見積もり**: 2-3時間

---

### 2. バックエンドAPI実装 (Issue #2)

**タイトル**: 予約可能日計算APIの実装

**説明**:
シフト情報を受け取り、「界タビ20s」の予約可能日を計算してJSONで返却するRails APIを実装する。

**実装内容**:

#### 2.1 APIエンドポイント
- エンドポイント: `POST /reservable_dates`
- リクエストボディ:
  ```json
  {
    "shift_start_date": "2025-10-17",
    "due_date": "2025-11-14",
    "due_date_rule": 28
  }
  ```
- レスポンス（成功時）:
  ```json
  {
    "dates": ["2025-11-06", "2025-11-07", "2025-11-08"]
  }
  ```
- レスポンス（エラー時）:
  ```json
  {
    "errors": ["Due date はシフト開始日より後の日付を入力してください"]
  }
  ```

#### 2.2 バリデーション
- 必須チェック: shift_start_date, due_date, due_date_rule
- 数値チェック: due_date_rule > 0
- 論理チェック: due_date > shift_start_date

#### 2.3 計算ロジック
- 予約可能期間: 今日から44日後 ～ 希望締切日の44日後
- 対象シフト: シフト開始日 + (周期 × 2 - 1) ～ シフト終了日 + (周期 × 2 - 1)
- 平日のみフィルタリング（月〜金）

**変更ファイル**:
```
backend/config/routes.rb
backend/app/controllers/reservable_dates_controller.rb
backend/app/models/reservable_date.rb
backend/app/models/service/reservation_date_calculator.rb
backend/app/models/concerns/.keep
```

**技術的な詳細**:
- ActiveModel::Model を使用したモデル実装
- サービスオブジェクトパターンで計算ロジックを分離
- 日付計算ロジックのカプセル化

**テスト方法**:
```bash
# 正常ケース
curl -X POST http://localhost:3000/reservable_dates \
  -H "Content-Type: application/json" \
  -d '{
    "shift_start_date": "2025-10-17",
    "due_date": "2025-11-14",
    "due_date_rule": 28
  }'

# エラーケース（日付逆転）
curl -X POST http://localhost:3000/reservable_dates \
  -H "Content-Type: application/json" \
  -d '{
    "shift_start_date": "2025-11-14",
    "due_date": "2025-10-17",
    "due_date_rule": 28
  }'
```

**優先度**: 🔴 最高
**見積もり**: 3-4時間

---

### 3. フロントエンド基盤実装 (Issue #3)

**タイトル**: TypeScript型定義とAPI通信基盤の実装

**説明**:
バックエンドAPIと通信するための型定義とFetch関数を実装する。

**実装内容**:

#### 3.1 型定義 (types/api.ts)
```typescript
export interface ReservableDatesRequest {
  shift_start_date: string;
  due_date: string;
  due_date_rule: number;
}

export interface ReservableDatesResponse {
  dates: string[];
}

export interface ErrorResponse {
  errors: string[];
}
```

#### 3.2 API通信関数 (api/reservableDates.ts)
- fetch APIを使用したPOSTリクエスト
- エラーハンドリング
- レスポンスの型安全性

#### 3.3 ユーティリティ関数 (utils/dateFormatter.ts)
- 日本語曜日取得関数
- 日付フォーマット関数（YYYY-MM-DD（曜日））

**変更ファイル**:
```
frontend/src/types/api.ts
frontend/src/api/reservableDates.ts
frontend/src/utils/dateFormatter.ts
```

**技術的な詳細**:
- TypeScriptの厳格な型チェック
- async/await を使用した非同期処理
- エラーハンドリングの統一

**テスト方法**:
- TypeScriptコンパイルエラーがないこと
- ブラウザのコンソールでインポートできること

**優先度**: 🔴 最高
**見積もり**: 2時間

---

### 4. フロントエンドUI実装 (Issue #4)

**タイトル**: シフト入力フォームと予約可能日表示UIの実装

**説明**:
ユーザーがシフト情報を入力し、予約可能日を表示するReactコンポーネントを実装する。

**実装内容**:

#### 4.1 入力フォーム
- シフト開始日（date input）
- シフト希望締切日（date input）
- シフト周期（number input）
- バリデーション（すべて必須）

#### 4.2 状態管理
- React Hooks (useState)
  - shiftStartDate
  - dueDate
  - dueDateRule
  - reservableDates
  - loading
  - error

#### 4.3 結果表示
- 予約可能日リスト
  - 曜日付き表示（例: 2025-11-06（木））
  - チェックマークアイコン付き
- エラーメッセージ表示
- ローディング状態の表示

#### 4.4 スタイリング
- TailwindCSSによるレスポンシブデザイン
- カスタムカラーの適用
- カードレイアウト
- ホバー効果

**変更ファイル**:
```
frontend/src/App.tsx
```

**技術的な詳細**:
- フォーム送信時のAPI呼び出し
- エラーハンドリングとユーザーフィードバック
- ローディング状態の管理
- 二重送信の防止

**デザイン要件**:
- ヘッダー: 「界回（KAIKAI）」ロゴとキャッチコピー
- フォーム: 白背景、影付きカード
- 結果: 左ボーダー付きリスト、チェックマーク付き
- 補足情報: 青背景の情報ボックス
- フッター: コピーライト表示

**テスト方法**:
- http://localhost:5173 でアクセス
- 正常ケースでの動作確認
  - シフト開始日: 2025-10-17
  - 締切日: 2025-11-14
  - 周期: 28
- エラーケースでの動作確認
  - 入力未完了
  - 日付逆転
- レスポンシブデザインの確認（モバイル/タブレット/デスクトップ）

**優先度**: 🔴 最高
**見積もり**: 4-5時間

---

### 5. ドキュメント作成 (Issue #5)

**タイトル**: 実装ガイドとREADMEの作成

**説明**:
開発者向けの実装ガイドとプロジェクトのREADMEを作成する。

**実装内容**:

#### 5.1 フロントエンド実装メモ (frontend実装メモ.md)
- ステップバイステップの実装手順
- コードスニペット
- トラブルシューティング
- テスト方法
- デバッグ方法

#### 5.2 バックエンド実装メモ (backend実装メモ.md)
- APIエンドポイントの仕様
- モデル設計
- 計算ロジックの説明
- バリデーションルール

#### 5.3 フロントエンド実装ガイド (FRONTEND_IMPLEMENTATION_GUIDE.md)
- クイックスタートガイド
- 環境構築手順
- よくある質問

**変更ファイル**:
```
frontend実装メモ.md
backend実装メモ.md
FRONTEND_IMPLEMENTATION_GUIDE.md
```

**優先度**: 🟡 中
**見積もり**: 2-3時間

---

## 🔧 今後の改善項目（v2以降で実装予定）

### Issue #6: コンポーネント分割とリファクタリング

**説明**:
現在のApp.tsxをより保守性の高い構造に分割する。

**実装内容**:
- Header.tsx - ヘッダーコンポーネント
- ShiftInputForm.tsx - シフト入力フォーム
- ReservableDatesList.tsx - 予約可能日リスト
- InfoBox.tsx - 補足情報ボックス
- Footer.tsx - フッター
- hooks/useReservableDates.ts - カスタムフック

**優先度**: 🟢 低
**見積もり**: 3-4時間

---

### Issue #7: テストの追加

**説明**:
ユニットテストとE2Eテストを追加する。

**実装内容**:
- Vitestでのユニットテスト
  - 型定義のテスト
  - API通信関数のテスト
  - ユーティリティ関数のテスト
- React Testing Libraryでのコンポーネントテスト
  - フォーム入力のテスト
  - API呼び出しのテスト
  - エラーハンドリングのテスト
- RSpecでのバックエンドテスト
  - モデルのバリデーションテスト
  - コントローラーのテスト
  - サービスオブジェクトのテスト

**優先度**: 🟡 中
**見積もり**: 5-6時間

---

### Issue #8: エラーハンドリングの改善

**説明**:
より詳細なエラーメッセージとユーザーフィードバックを実装する。

**実装内容**:
- フィールドごとのバリデーションエラー表示
- エラーメッセージの自動消去
- トーストメッセージの実装
- ネットワークエラーのハンドリング

**優先度**: 🟡 中
**見積もり**: 2-3時間

---

### Issue #9: UI/UXの改善

**説明**:
アニメーションとビジュアルフィードバックを追加する。

**実装内容**:
- ローディングスピナーのアニメーション
- 結果のフェードインアニメーション
- ボタンのホバー/アクティブ状態の改善
- スケルトンローディング

**優先度**: 🟢 低
**見積もり**: 2-3時間

---

### Issue #10: 機能拡張

**説明**:
追加機能の実装。

**実装内容**:
- 祝日除外機能
- シフトパターンの保存機能（ローカルストレージ）
- 複数シフトの一括計算
- カレンダー表示
- PDF/CSV エクスポート機能

**優先度**: 🟢 低
**見積もり**: 8-10時間

---

### Issue #11: アクセシビリティ改善

**説明**:
WCAG 2.1準拠のアクセシビリティ対応。

**実装内容**:
- aria-label の追加
- キーボード操作の最適化
- スクリーンリーダー対応
- カラーコントラスト比の確認
- フォーカス管理の改善

**優先度**: 🟡 中
**見積もり**: 3-4時間

---

### Issue #12: パフォーマンス最適化

**説明**:
アプリケーションのパフォーマンスを向上させる。

**実装内容**:
- デバウンス処理（入力の連続送信を防ぐ）
- React.memoの活用
- useMemo/useCallbackの最適化
- コード分割（React.lazy）
- バンドルサイズの最適化

**優先度**: 🟢 低
**見積もり**: 2-3時間

---

### Issue #13: 環境変数の管理

**説明**:
開発/本番環境で異なる設定を管理する。

**実装内容**:
- .env ファイルの作成
- API_BASE_URL の環境変数化
- 環境ごとの設定切り替え
- Docker Compose での環境変数注入

**優先度**: 🟡 中
**見積もり**: 1-2時間

---

## 📊 実装統計

### ファイル数
- **バックエンド**: 5ファイル
  - Controllers: 1
  - Models: 2
  - Routes: 1
  - Concerns: 1 (.keep)

- **フロントエンド**: 4ファイル
  - Components: 1 (App.tsx)
  - Types: 1
  - API: 1
  - Utils: 1

- **ドキュメント**: 3ファイル

### コード行数（概算）
- **バックエンド**: 約100行（Rubyコード）
- **フロントエンド**: 約300行（TypeScript/TSX）
- **ドキュメント**: 約1,800行（Markdown）

---

## 🎯 Issue作成時のテンプレート

GitHubでIssueを作成する際は、以下のテンプレートを使用してください：

```markdown
## 概要
[Issue #X の説明を簡潔に記載]

## 目的
[なぜこの実装が必要か]

## 実装内容
- [ ] タスク1
- [ ] タスク2
- [ ] タスク3

## 変更ファイル
- `path/to/file1`
- `path/to/file2`

## テスト方法
[動作確認の手順]

## 参考資料
- [関連ドキュメントへのリンク]

## 見積もり時間
X時間

## 優先度
🔴 最高 / 🟡 中 / 🟢 低
```

---

## 📝 補足情報

### 開発環境
- Node.js: v20.x
- Ruby: 3.2.x
- Rails: 7.x
- React: 18.x
- TypeScript: 5.x
- TailwindCSS: 3.x

### ブランチ戦略
- `main` - 本番環境
- `02frontend` - フロントエンド開発ブランチ（現在のブランチ）
- `feature/xxx` - 機能開発ブランチ

### コミットメッセージ規約
- `add-` - 新機能追加
- `fix-` - バグ修正
- `update-` - 既存機能の更新
- `refactor-` - リファクタリング
- `docs-` - ドキュメント更新

---

## ✅ 完了基準

各Issueは以下の条件を満たした時点で完了とする：

1. ✅ コードが実装されている
2. ✅ 動作確認が完了している
3. ✅ コードレビューが完了している（複数人開発の場合）
4. ✅ ドキュメントが更新されている
5. ✅ テストが追加されている（該当する場合）

---

**作成日**: 2025-10-27
**最終更新**: 2025-10-27
