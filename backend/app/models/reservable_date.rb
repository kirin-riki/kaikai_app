require_relative 'service/reservation_date_calculator'

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
  
end