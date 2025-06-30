export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

export interface ErrorResponse {
  error: string;
  timestamp?: string;
  status?: number;
}
