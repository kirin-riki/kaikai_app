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
