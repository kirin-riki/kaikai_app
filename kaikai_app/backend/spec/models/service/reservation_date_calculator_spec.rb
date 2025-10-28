require 'rails_helper'

RSpec.describe ReservationDateCalculator, type: :model do
  describe "#call" do
    let(:shift_start_date) { "2025-10-17" }
    let(:due_date) { "2025-11-14" }
    let(:due_date_rule) { 28 }

    let(:calculator) do
      ReservationDateCalculator.new(
        shift_start_date: shift_start_date,
        due_date: due_date,
        due_date_rule: due_date_rule
      )
    end

    it "予約可能日の配列を返す" do
      result = calculator.call
      expect(result).to be_an(Array)
    end

    it "全ての日付がDateオブジェクトである" do
      result = calculator.call
      result.each do |date|
        expect(date).to be_a(Date)
      end
    end

    it "全ての日付が平日（月〜金）である" do
      result = calculator.call
      result.each do |date|
        expect((1..5)).to include(date.wday)
      end
    end

    context "予約可能期間の計算" do
      it "予約可能開始日が今日の44日後である" do
        travel_to Date.new(2025, 10, 1) do
          calculator = ReservationDateCalculator.new(
            shift_start_date: "2025-10-17",
            due_date: "2025-11-14",
            due_date_rule: 28
          )
          result = calculator.call

          reservable_start = Date.today + 44 # 2025-11-14
          # 結果の日付が全て予約可能開始日以降であることを確認
          result.each do |date|
            expect(date).to be >= reservable_start
          end
        end
      end

      it "予約可能終了日が締切日の44日後である" do
        travel_to Date.new(2025, 10, 1) do
          calculator = ReservationDateCalculator.new(
            shift_start_date: "2025-10-17",
            due_date: "2025-11-14",
            due_date_rule: 28
          )
          result = calculator.call

          due_date_obj = Date.parse("2025-11-14")
          reservable_end = due_date_obj + 44 # 2025-12-28
          # 結果の日付が全て予約可能終了日以前であることを確認
          result.each do |date|
            expect(date).to be <= reservable_end
          end
        end
      end
    end

    context "対象シフト日の計算" do
      it "対象シフト開始日がshift_start_date + (due_date_rule * 2 - 1)である" do
        # shift_start_date: 2025-10-17
        # due_date_rule: 28
        # 対象シフト開始日: 2025-10-17 + (28 * 2 - 1) = 2025-10-17 + 55 = 2025-12-11

        result = calculator.call
        target_start = Date.parse(shift_start_date) + (due_date_rule * 2 - 1)

        # 結果の日付が全て対象シフト開始日以降であることを確認
        travel_to Date.new(2025, 10, 1) do
          result.each do |date|
            expect(date).to be >= target_start
          end
        end
      end
    end

    context "エッジケース" do
      it "シフト周期が7日でも正しく動作する" do
        calculator = ReservationDateCalculator.new(
          shift_start_date: "2025-10-17",
          due_date: "2025-11-14",
          due_date_rule: 7
        )
        result = calculator.call

        expect(result).to be_an(Array)
        result.each do |date|
          expect((1..5)).to include(date.wday)
        end
      end

      it "シフト周期が365日でも正しく動作する" do
        calculator = ReservationDateCalculator.new(
          shift_start_date: "2025-10-17",
          due_date: "2025-11-14",
          due_date_rule: 365
        )
        result = calculator.call

        expect(result).to be_an(Array)
        result.each do |date|
          expect((1..5)).to include(date.wday)
        end
      end

      it "予約可能日がない場合、空の配列を返す" do
        # 予約可能期間と対象シフト期間が重ならないケース
        travel_to Date.new(2025, 1, 1) do
          calculator = ReservationDateCalculator.new(
            shift_start_date: "2025-01-10",
            due_date: "2025-01-12",
            due_date_rule: 1
          )
          result = calculator.call

          expect(result).to be_an(Array)
          expect(result).to be_empty
        end
      end
    end

    context "異なる日付パラメータ" do
      it "2週間のシフト周期で正しく計算できる" do
        calculator = ReservationDateCalculator.new(
          shift_start_date: "2025-11-01",
          due_date: "2025-11-30",
          due_date_rule: 14
        )
        result = calculator.call

        expect(result).to be_an(Array)
        result.each do |date|
          expect((1..5)).to include(date.wday)
        end
      end

      it "1ヶ月のシフト周期で正しく計算できる" do
        calculator = ReservationDateCalculator.new(
          shift_start_date: "2025-11-01",
          due_date: "2025-12-31",
          due_date_rule: 30
        )
        result = calculator.call

        expect(result).to be_an(Array)
        result.each do |date|
          expect((1..5)).to include(date.wday)
        end
      end
    end
  end
end
