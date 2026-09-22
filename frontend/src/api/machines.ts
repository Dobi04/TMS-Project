import { apiClient } from './client';
import type { MachineOption } from '../types/machine';

export async function getMachines() {
  const response = await apiClient.get<MachineOption[]>('/api/Machine');
  return response.data;
}