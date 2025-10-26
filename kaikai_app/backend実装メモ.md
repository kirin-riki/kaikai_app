# Backend実装メモ（界回 KAIKAI）- 実装版

## 概要

看護師のシフトサイクルに基づいて、星野リゾート「界タビ20s」の予約可能日を算出するAPIを実装します。

**実装方針**:
- モデルベースのアプローチ（ActiveModel使用）
- サービスオブジェクトパターンで計算ロジックを分離
- シンプルなルーティング（API namespaceなし）

---

## 📋 実装済みの構成

### ファイル構造

```
backend/
├── app/
│   ├── controllers/
│   │   ├── application_controller.rb
│   │   └── reservable_dates_controller.rb       # APIコントローラー
│   └── models/
│       ├── reservable_date.rb                    # モデル（ActiveModel）
│       └── service/
│           └── reservation_date_calculator.rb    # 計算ロジック
└── config/
    └── routes.rb                                 # ルーティング設定
```

---

## 実装済みのAPI仕様

### エンドポイント
```
POST /reservable_dates
```

### リクエスト例
```json
{
  "shift_start_date": "2025-10-17",
  "due_date": "2025-11-14",
  "due_date_rule": 28
}
```

**パラメータ説明**:
- `shift_start_date`: シフト開始日
- `due_date`: 希望日（Bシフト発表日など）
- `due_date_rule`: シフト周期（日数、例: 28日）

### レスポンス例（成功）
```json
{
  "dates": [
    "2025-11-06",
    "2025-11-07",
    "2025-11-08",
    "2025-11-11",
    "2025-11-12"
  ]
}
```

### レスポンス例（エラー）
```json
{
  "errors": [
    "Due date はシフト開始日より後の日付を入力してください",
    "Shift start date は今日以降の日付を入力してください"
  ]
}
```

---

## 実装の詳細解説

### 1. ルーティング（`config/routes.rb`）

```ruby
Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check
  root "static_pages#top"

  post "reservable_dates", to: "reservable_dates#create"
end
```

**ポイント**:
- シンプルなルーティング（API namespaceなし）
- `/reservable_dates` に POST リクエストを送信
- ルートパスは `static_pages#top` に設定

---

### 2. コントローラー（`app/controllers/reservable_dates_controller.rb`）

```ruby
class ReservableDatesController < ApplicationController
  def create
    reservable_date = ReservableDate.new(
      shift_start_date: params[:shift_start_date],
      due_date: params[:due_date],
      due_date_rule: params[:due_date_rule]
    )

    result = reservable_date.calculate_reservable_dates

    if result[:success]
      render json: { dates: result[:data].map(&:to_s) }
    else
      render json: { errors: result[:errors] }, status: :bad_request
    end
  end
end
```

**ポイント**:
- コントローラーは薄く保つ（ビジネスロジックなし）
- パラメータをモデルに渡すだけ
- 成功/失敗の判定はモデル側で行う
- エラー時は400 Bad Requestを返す

**責務**:
- リクエストパラメータの受け取り
- モデルのインスタンス化
- レスポンスの返却

---

### 3. モデル（`app/models/reservable_date.rb`）

```ruby
class ReservableDate
  include ActiveModel::Model
  include ActiveModel::Attributes
  include ActiveModel::Validations

  attribute :shift_start_date, :date
  attribute :due_date, :date
  attribute :due_date_rule, :integer

  validates :shift_start_date, :due_date, presence: true
  validates :due_date_rule, presence: true, numericality: { greater_than: 0 }

  # 日付の論理チェック
  validate :due_date_after_shift_start
  validate :shift_start_date_not_past

  def calculate_reservable_dates
    return { success: false, errors: errors.full_messages } unless valid?

    reservable_dates = ReservationDateCalculator.new(
      shift_start_date: shift_start_date,
      due_date: due_date,
      due_date_rule: due_date_rule
    ).call

    { success: true, data: reservable_dates }
  end

  private

  def due_date_after_shift_start
    return unless shift_start_date && due_date

    errors.add(:due_date, "はシフト開始日より後の日付を入力してください") if due_date <= shift_start_date
  end

  def shift_start_date_not_past
    return unless shift_start_date

    errors.add(:shift_start_date, "は今日以降の日付を入力してください") if shift_start_date < Date.today
  end
end
```

**ポイント**:
- `ActiveModel::Model` を使用（データベース不要）
- 型変換とバリデーションを担当
- カスタムバリデーションで業務ルールをチェック
- 計算ロジックはサービスオブジェクトに委譲

**責務**:
- 属性の定義と型変換
- バリデーション
- サービスオブジェクトの呼び出し
- 結果の整形

**バリデーションルール**:
1. 必須チェック: `shift_start_date`, `due_date`, `due_date_rule`
2. 数値チェック: `due_date_rule` は正の整数
3. 論理チェック: `due_date` は `shift_start_date` より後
4. 過去日チェック: `shift_start_date` は今日以降

---

### 4. サービスオブジェクト（`app/models/service/reservation_date_calculator.rb`）

```ruby
class ReservationDateCalculator
  def initialize(shift_start_date:, due_date:, due_date_rule:)
    @shift_start_date = Date.parse(shift_start_date.to_s)
    @due_date = Date.parse(due_date.to_s)
    @due_date_rule = due_date_rule.to_i
    @today = Date.today
    @shift_end_date = @shift_start_date + @due_date_rule
  end

  def call
    reservable_start, reservable_end = calculate_reservable_period
    target_start, target_end = calculate_target_shift_dates

    weekday_reservable = filter_weekdays(reservable_start..reservable_end)
    weekday_target_shift = filter_weekdays(target_start..target_end)

    weekday_reservable & weekday_target_shift
  end

  private

  def calculate_reservable_period
    reservable_start = @today + 44
    reservable_end = @due_date + 44
    [reservable_start, reservable_end]
  end

  def calculate_target_shift_dates
    target_start = @shift_start_date + (@due_date_rule * 2 - 1)
    target_end = @shift_end_date + (@due_date_rule * 2 - 1)
    [target_start, target_end]
  end

  def filter_weekdays(date_range)
    date_range.select { |d| (1..5).include?(d.wday) }
  end
end
```

**ポイント**:
- 単一責任の原則（日付計算のみ）
- 複雑な計算ロジックをモデルから分離
- テスタブルな設計

**責務**:
- 予約可能期間の計算
- 対象シフト期間の計算
- 平日フィルタリング
- 2つの期間の積集合を取得

**計算ロジック**:

1. **予約可能期間**:
   - 開始: 今日 + 44日
   - 終了: 希望日 + 44日

2. **対象シフト期間**:
   - 開始: シフト開始日 + (周期 × 2 - 1)
   - 終了: シフト終了日 + (周期 × 2 - 1)

3. **平日フィルタリング**:
   - 月曜〜金曜（1〜5）のみ抽出

4. **積集合**:
   - 予約可能期間 ∩ 対象シフト期間

---

## 動作確認

### curlでのテスト

**正常ケース**:
```bash
curl -X POST http://localhost:3000/reservable_dates \
  -H "Content-Type: application/json" \
  -d '{
    "shift_start_date": "2025-10-17",
    "due_date": "2025-11-14",
    "due_date_rule": 28
  }'
```

期待されるレスポンス:
```json
{
  "dates": ["2025-11-06", "2025-11-07", ...]
}
```

---

**エラーケース1: 必須パラメータ不足**:
```bash
curl -X POST http://localhost:3000/reservable_dates \
  -H "Content-Type: application/json" \
  -d '{}'
```

期待されるレスポンス:
```json
{
  "errors": [
    "Shift start date can't be blank",
    "Due date can't be blank",
    "Due date rule can't be blank"
  ]
}
```

---

**エラーケース2: 日付の逆転**:
```bash
curl -X POST http://localhost:3000/reservable_dates \
  -H "Content-Type: application/json" \
  -d '{
    "shift_start_date": "2025-11-14",
    "due_date": "2025-10-17",
    "due_date_rule": 28
  }'
```

期待されるレスポンス:
```json
{
  "errors": [
    "Due date はシフト開始日より後の日付を入力してください"
  ]
}
```

---

**エラーケース3: 過去の日付**:
```bash
curl -X POST http://localhost:3000/reservable_dates \
  -H "Content-Type: application/json" \
  -d '{
    "shift_start_date": "2024-01-01",
    "due_date": "2024-02-01",
    "due_date_rule": 28
  }'
```

期待されるレスポンス:
```json
{
  "errors": [
    "Shift start date は今日以降の日付を入力してください"
  ]
}
```

---

## Railsコンソールでのテスト

```bash
docker compose exec backend rails console
```

```ruby
# モデルのインスタンス化
reservable_date = ReservableDate.new(
  shift_start_date: "2025-10-17",
  due_date: "2025-11-14",
  due_date_rule: 28
)

# バリデーションチェック
reservable_date.valid?
# => true

# エラーメッセージ確認
reservable_date.errors.full_messages
# => []

# 計算実行
result = reservable_date.calculate_reservable_dates
# => { success: true, data: [日付の配列] }

# サービスオブジェクトを直接テスト
calculator = ReservationDateCalculator.new(
  shift_start_date: Date.new(2025, 10, 17),
  due_date: Date.new(2025, 11, 14),
  due_date_rule: 28
)
calculator.call
# => [日付の配列]
```

---

## アーキテクチャの利点

### 1. **関心の分離**

- **コントローラー**: HTTPリクエスト/レスポンス
- **モデル**: バリデーション
- **サービス**: ビジネスロジック

### 2. **テスタビリティ**

各層を独立してテスト可能：
```ruby
# モデルのテスト
describe ReservableDate do
  it "validates presence" do
    # ...
  end
end

# サービスのテスト
describe ReservationDateCalculator do
  it "calculates correct dates" do
    # ...
  end
end
```

### 3. **拡張性**

新しい計算ロジックを追加する場合、サービスオブジェクトを追加するだけ：
```ruby
# app/models/service/holiday_filter.rb
class HolidayFilter
  # 祝日を除外するロジック
end
```

### 4. **再利用性**

`ReservationDateCalculator` は他の場所でも利用可能：
```ruby
# 別のコントローラーや処理から呼び出し
dates = ReservationDateCalculator.new(...).call
```

---

## トラブルシューティング

### エラー: ルーティングが見つからない

**症状**:
```
ActionController::RoutingError (No route matches [POST] "/reservable_dates")
```

**対処法**:
```bash
# ルーティングを確認
docker compose exec backend rails routes | grep reservable

# 期待される出力
# POST   /reservable_dates(.:format)   reservable_dates#create
```

---

### エラー: モデルが見つからない

**症状**:
```
NameError: uninitialized constant ReservableDate
```

**対処法**:
```bash
# ファイルの存在確認
ls -la backend/app/models/reservable_date.rb

# Railsを再起動
docker compose restart backend
```

---

### エラー: サービスオブジェクトが見つからない

**症状**:
```
NameError: uninitialized constant ReservationDateCalculator
```

**対処法**:
```bash
# ファイルの存在確認
ls -la backend/app/models/service/reservation_date_calculator.rb

# autoloadパスを確認
docker compose exec backend rails runner "puts ActiveSupport::Dependencies.autoload_paths"
```

---

### エラー: 日付のパースエラー

**症状**:
```
ArgumentError: invalid date
```

**対処法**:
- 日付形式を確認: `YYYY-MM-DD` (例: `2025-10-17`)
- Railsコンソールでテスト:
  ```ruby
  Date.parse("2025-10-17")  # OK
  Date.parse("invalid")      # Error
  ```

---

## 今後の拡張予定

### v2で追加予定の機能

1. **祝日除外**
   ```ruby
   # app/models/service/holiday_filter.rb
   class HolidayFilter
     def initialize(dates)
       @dates = dates
     end

     def call
       @dates.reject { |date| Holiday.on?(date) }
     end
   end
   ```

2. **カスタム周期対応**
   - 4週以外のシフトパターン
   - 不規則なシフトパターン

3. **複数シフトの一括計算**
   ```ruby
   post "reservable_dates/batch", to: "reservable_dates#batch_create"
   ```

4. **結果のキャッシング**
   ```ruby
   Rails.cache.fetch("reservable_dates_#{params_hash}", expires_in: 1.hour) do
     # 計算処理
   end
   ```

---

## ベストプラクティス

### 1. サービスオブジェクトの命名規則

- クラス名: `〇〇Calculator`, `〇〇Service`, `〇〇Builder`
- メソッド名: `call`, `execute`, `perform`

### 2. エラーハンドリング

```ruby
def calculate_reservable_dates
  return { success: false, errors: errors.full_messages } unless valid?

  begin
    # 計算処理
    { success: true, data: result }
  rescue StandardError => e
    { success: false, errors: [e.message] }
  end
end
```

### 3. ログ出力

```ruby
def call
  Rails.logger.info "Calculating dates for shift: #{@shift_start_date}"
  # 計算処理
  Rails.logger.info "Found #{result.size} reservable dates"
  result
end
```

---

## 参考リンク

- [ActiveModel::Model](https://api.rubyonrails.org/classes/ActiveModel/Model.html)
- [Ruby Date class](https://ruby-doc.org/stdlib-3.3.6/libdoc/date/rdoc/Date.html)
- [Service Objects in Rails](https://medium.com/selleo/essential-rubyonrails-patterns-part-1-service-objects-1af9f9573ca1)

---

## ✅ 実装完了！

この構成で、保守性・拡張性・テスタビリティの高いAPIが完成しました。

次は `frontend実装メモ.md` を参照して、フロントエンドとの統合を行ってください。
