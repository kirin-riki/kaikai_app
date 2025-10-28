import type { ReservableDatesRequest, ReservableDatesResponse, ErrorResponse } from '../types/api';

const API_BASE_URL = import.meta.env.PROD 
  ? 'https://kaikai-app-api.onrender.com'
  : 'http://localhost:3000';

export async function fetchReservableDates(
  request: ReservableDatesRequest
): Promise<ReservableDatesResponse> {
  const response = await fetch(`${API_BASE_URL}/reservable_dates`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData: ErrorResponse = await response.json();
    throw new Error(errorData.errors?.[0] || 'APIエラーが発生しました');
  }

  return response.json();
}
