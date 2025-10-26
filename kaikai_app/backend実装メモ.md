# Backend実装メモ（界回 KAIKAI）

## 概要

看護師のシフトサイクルに基づいて、星野リゾート「界タビ20s」の予約可能日を算出するAPIを実装します。

---

## 実装するAPI仕様

### エンドポイント
```
POST /api/v1/reservable_dates
```

### リクエスト例
```json
{
  "a_shift_date": "2025-10-17",
  "b_shift_date": "2025-11-14"
}
```

### レスポンス例（成功）
```json
{
  "reservable_dates": [
    "2025-11-06",
    "2025-11-07",
    "2025-11-10",
    "2025-11-11"
  ]
}
```

### レスポンス例（エラー）
```json
{
  "error": "Invalid date range or missing parameters"
}
```

---

## 実装手順

### ステップ1: ルーティング設定

**ファイル**: `config/routes.rb`

```ruby
Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      post 'reservable_dates', to: 'reservable_dates#create'
    end
  end
end
```

**確認コマンド**:
```bash
docker compose exec backend rails routes
```

---

### ステップ2: コントローラー生成

**コマンド**:
```bash
docker compose exec backend rails g controller api/v1/reservable_dates
```

**生成されるファイル**:
- `app/controllers/api/v1/reservable_dates_controller.rb`

---

### ステップ3: コントローラー実装

**ファイル**: `app/controllers/api/v1/reservable_dates_controller.rb`

```ruby
module Api
  module V1
    class ReservableDatesController < ApplicationController
      def create
        # パラメータ取得
        a_shift_date = params[:a_shift_date]
        b_shift_date = params[:b_shift_date]

        # バリデーション
        if a_shift_date.blank? || b_shift_date.blank?
          return render json: { error: 'Missing parameters' }, status: :bad_request
        end

        begin
          a_date = Date.parse(a_shift_date)
          b_date = Date.parse(b_shift_date)
        rescue ArgumentError
          return render json: { error: 'Invalid date format' }, status: :bad_request
        end

        # 日付の妥当性チェック
        if a_date >= b_date
          return render json: { error: 'Invalid date range: a_shift_date must be before b_shift_date' }, status: :bad_request
        end

        # 予約可能日を計算
        reservable_dates = calculate_reservable_dates(a_date, b_date)

        render json: { reservable_dates: reservable_dates }
      end

      private

      def calculate_reservable_dates(a_date, b_date)
        today = Date.today
        start_date = today + 44 # 44日後から予約可能
        end_date = today + 60   # 60日以内まで検索

        reservable = []

        (start_date..end_date).each do |date|
          # ルール1: シフト期間内（Aシフト ≦ 対象日 ＜ Bシフト）
          next unless date >= a_date && date < b_date

          # ルール2: 平日のみ（月曜日〜木曜日、0=日曜、1=月曜、...、6=土曜）
          next unless (1..4).include?(date.wday)

          reservable << date.to_s
        end

        reservable
      end
    end
  end
end
```

---

### ステップ4: 動作確認

#### 4-1. Railsサーバーが起動していることを確認
```bash
docker compose ps
```

#### 4-2. curlでAPIをテスト
```bash
curl -X POST http://localhost:3000/api/v1/reservable_dates \
  -H "Content-Type: application/json" \
  -d '{
    "a_shift_date": "2025-10-17",
    "b_shift_date": "2025-11-14"
  }'
```

**期待されるレスポンス**:
```json
{
  "reservable_dates": ["2025-11-06", "2025-11-07", "2025-11-10", "2025-11-11"]
}
```

#### 4-3. エラーケースのテスト

**パラメータ不足**:
```bash
curl -X POST http://localhost:3000/api/v1/reservable_dates \
  -H "Content-Type: application/json" \
  -d '{}'
```

**不正な日付形式**:
```bash
curl -X POST http://localhost:3000/api/v1/reservable_dates \
  -H "Content-Type: application/json" \
  -d '{
    "a_shift_date": "invalid",
    "b_shift_date": "2025-11-14"
  }'
```

**日付の逆転**:
```bash
curl -X POST http://localhost:3000/api/v1/reservable_dates \
  -H "Content-Type: application/json" \
  -d '{
    "a_shift_date": "2025-11-14",
    "b_shift_date": "2025-10-17"
  }'
```

---

## 判定ルール詳細

### 1. シフト期間内
```ruby
date >= a_date && date < b_date
```
- Aシフト発表日 以上
- Bシフト発表日 未満

### 2. 平日のみ（月曜〜木曜）
```ruby
(1..4).include?(date.wday)
```
- 0 = 日曜日
- 1 = 月曜日
- 2 = 火曜日
- 3 = 水曜日
- 4 = 木曜日
- 5 = 金曜日
- 6 = 土曜日

### 3. 予約可能日（44日後以降）
```ruby
start_date = today + 44
```
- 「界タビ20s」は44日前から予約開始

### 4. 検索上限（60日以内）
```ruby
end_date = today + 60
```
- パフォーマンス考慮で60日以内に制限

---

## テストケース

| No | Aシフト | Bシフト | 今日の日付 | 期待される結果 |
|----|---------|---------|-----------|---------------|
| 1 | 2025-10-17 | 2025-11-14 | 2025-09-23 | 2025-11-06, 2025-11-07, 2025-11-10, 2025-11-11 |
| 2 | 2025-10-17 | 2025-11-14 | 2025-11-01 | [] (60日超過) |
| 3 | 2025-11-14 | 2025-10-17 | 2025-09-23 | エラー（日付逆転） |
| 4 | invalid | 2025-11-14 | 2025-09-23 | エラー（不正な日付） |

---

## よく使うコマンド

### Railsコンソールで日付計算をテスト
```bash
docker compose exec backend rails console
```

```ruby
# 今日の日付
Date.today

# 44日後
Date.today + 44

# 60日後
Date.today + 60

# 曜日の確認（0=日曜、1=月曜、...）
Date.new(2025, 11, 6).wday  # => 4（木曜日）

# 日付の範囲
(Date.today..(Date.today + 7)).each { |d| puts "#{d} (#{d.wday})" }
```

### ログ確認
```bash
docker compose logs -f backend
```

### ルーティング確認
```bash
docker compose exec backend rails routes | grep reservable
```

---

## トラブルシューティング

### エラー: ルーティングが見つからない
**原因**: `config/routes.rb` の設定ミス

**対処**:
```bash
docker compose exec backend rails routes
```
で確認し、正しいパスを設定

### エラー: CORS エラー
**原因**: `config/initializers/cors.rb` の設定不足

**対処**: 既に設定済み（localhost:5173を許可）

### エラー: パラメータが受け取れない
**原因**: Content-Typeヘッダーが不足

**対処**: `Content-Type: application/json` を必ず付ける

---

## 今後の拡張予定（v2以降）

- [ ] 祝日を除外する機能
- [ ] カスタムシフト周期（4週以外も対応）
- [ ] 複数シフトパターンの一括計算
- [ ] シフトデータの保存（データベース追加時）
- [ ] ユーザー認証

---

## 参考

- Rails公式ドキュメント: https://guides.rubyonrails.org/
- Ruby Date class: https://ruby-doc.org/stdlib-3.3.6/libdoc/date/rdoc/Date.html
