// APIê¯¨¹Èn‹
export interface ReservableDatesRequest {
  shift_start_date: string;
  due_date: string;
  due_date_rule: number;
}

// APIì¹Ýó¹n‹Ÿ	
export interface ReservableDatesResponse {
  dates: string[];
}

// APIì¹Ýó¹n‹¨éü	
export interface ErrorResponse {
  errors: string[];
}
