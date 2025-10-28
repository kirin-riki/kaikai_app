require 'rails_helper'

RSpec.describe "ReservableDates", type: :request do
  describe "POST /reservable_dates" do
    let(:valid_params) do
      {
        shift_start_date: "2025-10-17",
        due_date: "2025-11-14",
        due_date_rule: 28
      }
    end

    context "正常なパラメータの場合" do
      it "予約可能日のリストを返す" do
        post "/reservable_dates", params: valid_params

        expect(response).to have_http_status(:success)
        json = JSON.parse(response.body)
        expect(json).to have_key("dates")
        expect(json["dates"]).to be_an(Array)
        expect(json["dates"]).not_to be_empty
      end

      it "平日のみの日付を返す" do
        post "/reservable_dates", params: valid_params

        json = JSON.parse(response.body)
        dates = json["dates"].map { |d| Date.parse(d) }

        # 全ての日付が平日（月〜金）であることを確認
        dates.each do |date|
          expect((1..5)).to include(date.wday)
        end
      end

      it "返される日付がYYYY-MM-DD形式である" do
        post "/reservable_dates", params: valid_params

        json = JSON.parse(response.body)
        dates = json["dates"]

        dates.each do |date|
          expect(date).to match(/^\d{4}-\d{2}-\d{2}$/)
        end
      end
    end

    context "バリデーションエラーの場合" do
      it "shift_start_dateが未入力の場合、エラーを返す" do
        invalid_params = valid_params.merge(shift_start_date: nil)
        post "/reservable_dates", params: invalid_params

        expect(response).to have_http_status(:bad_request)
        json = JSON.parse(response.body)
        expect(json).to have_key("errors")
        expect(json["errors"]).to be_an(Array)
      end

      it "due_dateが未入力の場合、エラーを返す" do
        invalid_params = valid_params.merge(due_date: nil)
        post "/reservable_dates", params: invalid_params

        expect(response).to have_http_status(:bad_request)
        json = JSON.parse(response.body)
        expect(json).to have_key("errors")
      end

      it "due_date_ruleが未入力の場合、エラーを返す" do
        invalid_params = valid_params.merge(due_date_rule: nil)
        post "/reservable_dates", params: invalid_params

        expect(response).to have_http_status(:bad_request)
        json = JSON.parse(response.body)
        expect(json).to have_key("errors")
      end

      it "due_date_ruleが0以下の場合、エラーを返す" do
        invalid_params = valid_params.merge(due_date_rule: 0)
        post "/reservable_dates", params: invalid_params

        expect(response).to have_http_status(:bad_request)
        json = JSON.parse(response.body)
        expect(json).to have_key("errors")
      end

      it "due_dateがshift_start_date以前の場合、エラーを返す" do
        invalid_params = {
          shift_start_date: "2025-11-14",
          due_date: "2025-10-17",
          due_date_rule: 28
        }
        post "/reservable_dates", params: invalid_params

        expect(response).to have_http_status(:bad_request)
        json = JSON.parse(response.body)
        expect(json).to have_key("errors")
        expect(json["errors"]).to include(/はシフト開始日より後の日付/)
      end
    end

    context "エッジケース" do
      it "シフト周期が7日の場合も正しく計算できる" do
        params = valid_params.merge(due_date_rule: 7)
        post "/reservable_dates", params: params

        expect(response).to have_http_status(:success)
        json = JSON.parse(response.body)
        expect(json["dates"]).to be_an(Array)
      end

      it "シフト周期が365日の場合も正しく計算できる" do
        params = valid_params.merge(due_date_rule: 365)
        post "/reservable_dates", params: params

        expect(response).to have_http_status(:success)
        json = JSON.parse(response.body)
        expect(json["dates"]).to be_an(Array)
      end
    end
  end
end
