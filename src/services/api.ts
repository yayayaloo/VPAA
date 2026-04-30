import axios, { AxiosError } from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
});

export interface Activity {
  id: string;
  date: string;
  action: string;
  user: string;
}

export interface UpdatePasswordData {
  temporaryPassword: string;
  newPassword: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

interface ActivityApiItem {
  id?: string | number;
  action?: string;
  user?: string;
  userName?: string;
  createdAt?: string;
  created_at?: string;
  date?: string;
}

const getErrorMessage = (error: unknown, fallbackMessage: string) => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string; error?: string }>;

    return (
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      axiosError.message ||
      fallbackMessage
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallbackMessage;
};

export const submitFinalResult = async (): Promise<ApiResponse<{ success: boolean }>> => {
  try {
    await apiClient.post('/results/submit');

    return { data: { success: true } };
  } catch (error) {
    return { error: getErrorMessage(error, 'Failed to submit final result') };
  }
};

export const updatePassword = async (
  data: UpdatePasswordData
): Promise<ApiResponse<{ success: boolean; message?: string }>> => {
  try {
    const response = await apiClient.post<{ success?: boolean; message?: string }>(
      '/auth/update-password',
      data
    );

    return {
      data: {
        success: response.data?.success ?? true,
        message: response.data?.message,
      },
    };
  } catch (error) {
    return { error: getErrorMessage(error, 'Failed to update password') };
  }
};

export const markReviewComplete = async (
  id: string
): Promise<ApiResponse<{ success: boolean }>> => {
  try {
    await apiClient.put(`/faculty/${id}/review-complete`);

    return { data: { success: true } };
  } catch (error) {
    return { error: getErrorMessage(error, 'Failed to mark review as completed') };
  }
};

export const getActivities = async (): Promise<ApiResponse<Activity[]>> => {
  try {
    const response = await apiClient.get<ActivityApiItem[]>('/activities');
    const activities = (response.data || []).map((activity, index) => ({
      id: String(activity.id ?? index),
      action: activity.action || 'No action provided',
      user: activity.user || activity.userName || 'Unknown user',
      date: activity.date || activity.createdAt || activity.created_at || new Date().toISOString(),
    }));

    return { data: activities };
  } catch (error) {
    return { error: getErrorMessage(error, 'Failed to fetch activities') };
  }
};

export const apiService = {
  submitFinalResult,
  updatePassword,
  markReviewComplete,
  getActivities,
};

