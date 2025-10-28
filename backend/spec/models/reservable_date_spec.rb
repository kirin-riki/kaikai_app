require 'rails_helper'

RSpec.describe ReservableDate, type: :model do
  describe "バリデーション" do
    it "有効なパラメータで成功する" do
      reservable_date = ReservableDate.new(
        shift_start_date: "2025-10-17",
        due_date: "2025-11-14",
        due_date_rule: 28
      )
      expect(reservable_date).to be_valid
    end

    describe "shift_start_date" do
      it "nilの場合、無効" do
        reservable_date = ReservableDate.new(
          shift_start_date: nil,
          due_date: "2025-11-14",
          due_date_rule: 28
        )
        expect(reservable_date).not_to be_valid
        expect(reservable_date.errors[:shift_start_date]).to include("can't be blank")
      end
    end

    describe "due_date" do
      it "nilの場合、無効" do
        reservable_date = ReservableDate.new(
          shift_start_date: "2025-10-17",
          due_date: nil,
          due_date_rule: 28
        )
        expect(reservable_date).not_to be_valid
        expect(reservable_date.errors[:due_date]).to include("can't be blank")
      end

      it "shift_start_date以前の場合、無効" do
        reservable_date = ReservableDate.new(
          shift_start_date: "2025-11-14",
          due_date: "2025-10-17",
          due_date_rule: 28
        )
        expect(reservable_date).not_to be_valid
        expect(reservable_date.errors[:due_date]).to include("はシフト開始日より後の日付を入力してください")
      end

      it "shift_start_dateと同じ日付の場合、無効" do
        reservable_date = ReservableDate.new(
          shift_start_date: "2025-10-17",
          due_date: "2025-10-17",
          due_date_rule: 28
        )
        expect(reservable_date).not_to be_valid
        expect(reservable_date.errors[:due_date]).to include("はシフト開始日より後の日付を入力してください")
      end
    end

    describe "due_date_rule" do
      it "nilの場合、無効" do
        reservable_date = ReservableDate.new(
          shift_start_date: "2025-10-17",
          due_date: "2025-11-14",
          due_date_rule: nil
        )
        expect(reservable_date).not_to be_valid
        expect(reservable_date.errors[:due_date_rule]).to include("can't be blank")
      end

      it "0以下の場合、無効" do
        reservable_date = ReservableDate.new(
          shift_start_date: "2025-10-17",
          due_date: "2025-11-14",
          due_date_rule: 0
        )
        expect(reservable_date).not_to be_valid
        expect(reservable_date.errors[:due_date_rule]).to include("must be greater than 0")
      end

      it "負の数の場合、無効" do
        reservable_date = ReservableDate.new(
          shift_start_date: "2025-10-17",
          due_date: "2025-11-14",
          due_date_rule: -1
        )
        expect(reservable_date).not_to be_valid
        expect(reservable_date.errors[:due_date_rule]).to include("must be greater than 0")
      end
    end
  end

  describe "#calculate_reservable_dates" do
    let(:valid_reservable_date) do
      ReservableDate.new(
        shift_start_date: "2025-10-17",
        due_date: "2025-11-14",
        due_date_rule: 28
      )
    end

    context "有効なデータの場合" do
      it "成功を返す" do
        result = valid_reservable_date.calculate_reservable_dates
        expect(result[:success]).to be true
      end

      it "予約可能日の配列を返す" do
        result = valid_reservable_date.calculate_reservable_dates
        expect(result[:data]).to be_an(Array)
        expect(result[:data]).not_to be_empty
      end

      it "全ての日付がDateオブジェクトである" do
        result = valid_reservable_date.calculate_reservable_dates
        result[:data].each do |date|
          expect(date).to be_a(Date)
        end
      end
    end

    context "無効なデータの場合" do
      it "失敗を返す" do
        invalid_reservable_date = ReservableDate.new(
          shift_start_date: nil,
          due_date: "2025-11-14",
          due_date_rule: 28
        )
        result = invalid_reservable_date.calculate_reservable_dates
        expect(result[:success]).to be false
      end

      it "エラーメッセージを返す" do
        invalid_reservable_date = ReservableDate.new(
          shift_start_date: nil,
          due_date: "2025-11-14",
          due_date_rule: 28
        )
        result = invalid_reservable_date.calculate_reservable_dates
        expect(result[:errors]).to be_an(Array)
        expect(result[:errors]).not_to be_empty
      end
    end
  end
end
