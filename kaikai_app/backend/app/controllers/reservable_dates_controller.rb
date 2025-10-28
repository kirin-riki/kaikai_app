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