// APIꯨ��n�
export interface ReservableDatesRequest {
  shift_start_date: string;
  due_date: string;
  due_date_rule: number;
}

// API���n��	
export interface ReservableDatesResponse {
  dates: string[];
}

// API���n����	
export interface ErrorResponse {
  errors: string[];
}
