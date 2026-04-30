import React from 'react';
import { Activity as ActivityIcon, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { useActivities } from '../hooks/useActivities';

const RecentActivities: React.FC = () => {
  const { activities, loading, error, refetch } = useActivities();

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-center gap-3">
          <Loader2 className="animate-spin text-emerald-600" size={20} />
          <p className="text-sm font-medium text-slate-600">Loading activities...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-center gap-3 text-red-600">
          <AlertCircle size={20} />
          <p className="text-sm font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 pb-4 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">Recent Activities</h3>
            <p className="text-sm text-slate-500">Latest system activities and user actions</p>
          </div>
          <button
            onClick={refetch}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all"
            title="Refresh activities"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {activities.length === 0 ? (
          <div className="p-6 text-center">
            <ActivityIcon className="mx-auto text-slate-300 mb-3" size={24} />
            <p className="text-sm text-slate-500">No recent activities</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {activities.map((activity) => (
              <div key={activity.id} className="p-4 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-emerald-50 rounded-lg flex-shrink-0">
                    <ActivityIcon className="text-emerald-600" size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 mb-1">{activity.action}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>{activity.user}</span>
                      <span>&bull;</span>
                      <span>{new Date(activity.date).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentActivities;
