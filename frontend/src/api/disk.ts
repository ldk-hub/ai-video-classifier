import axios from 'axios';
import { DiskStatusResponse, ApiResponse } from '../types/disk';

const api = axios.create({
  baseURL: 'http://localhost:8080/api/v1', // Assuming Spring Boot default port
});

export const getDiskStatus = async (): Promise<DiskStatusResponse> => {
  const response = await api.get<ApiResponse<DiskStatusResponse>>('/monitoring/disk');
  return response.data.data;
};
