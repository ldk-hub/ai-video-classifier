export interface DiskStatusResponse {
  path: string;
  totalSpaceBytes: number;
  freeSpaceBytes: number;
  usableSpaceBytes: number;
  usagePercentage: number;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}
