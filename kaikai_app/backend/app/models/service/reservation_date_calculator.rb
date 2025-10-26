class ReservationDateCalculator
  def initialize(shift_start_date:, due_date:, due_date_rule:)
    @shift_start_date = Date.parse(shift_start_date.to_s)  # 型変換を追加
    @due_date = Date.parse(due_date.to_s)  # 型変換を追加
    @due_date_rule = due_date_rule.to_i
    @today = Date.today
    @shift_end_date = @shift_start_date + @due_date_rule - 1
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