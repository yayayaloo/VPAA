import { useState, useEffect } from 'react';
import { apiService, type Activity } from '../services/api';

export const useActivities = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getActivities();
      if (response.error) {
        setError(response.error);
      } else {
        setActivities(response.data || []);
      }
    } catch (err) {
      setError('Failed to fetch activities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const refetch = () => {
    fetchActivities();
  };

  return {
    activities,
    loading,
    error,
    refetch
  };
};