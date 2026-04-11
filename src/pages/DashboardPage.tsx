import { useState, useEffect } from 'react';
import { ArrowRight, CheckCircle2, Clock, Activity as ActivityIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient'; // Ensure this points to your actual Supabase client

interface Cycle {
  id: string;
  title: string;
  status: string;
  isCurrent: boolean;
  started: string;
  deadline?: string;
  published?: string;
  badge: string | null;
}

interface ActivityLog {
  id: string;
  user: string;
  action: string;
  time: string;
  type: string;
}

const DashboardPage = () => {
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // 1. Fetch Cycles from Supabase
        const { data: cyclesData, error: cyclesError } = await supabase
          .from('ranking_cycles')
          .select('*');

        if (cyclesError) throw cyclesError;

        const fetchedCycles: Cycle[] = (cyclesData || []).map((data) => {
          // Supabase returns standard ISO string dates, so we parse them with new Date()
          const startDate = data.start_date 
            ? new Date(data.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) 
            : 'TBA';
            
          const deadlineDate = data.deadline 
            ? new Date(data.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) 
            : 'TBA';
            
          const publishedDate = data.published_date 
            ? new Date(data.published_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) 
            : undefined;

          return {
            id: String(data.cycle_id || data.id), // Adjust primary key if it's named 'cycle_id'
            title: data.title || `${data.semester} AY ${data.year}`,
            status: data.status === 'open' ? 'In Progress' : 'Completed',
            isCurrent: data.status === 'open',
            started: startDate,
            deadline: deadlineDate,
            published: publishedDate,
            badge: data.status !== 'open' ? 'CLOSED' : null
          };
        });

        // Sort cycles: current ones first
        fetchedCycles.sort((a, b) => (b.isCurrent === a.isCurrent) ? 0 : b.isCurrent ? 1 : -1);
        setCycles(fetchedCycles);

        // 2. Fetch Activity Logs from Supabase
        const { data: logsData, error: logsError } = await supabase
          .from('activity_logs')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(5);

        if (logsError) {
          console.warn("Could not fetch activity logs. Make sure the 'activity_logs' table exists.", logsError);
          setActivities([]);
        } else {
          const fetchedLogs: ActivityLog[] = (logsData || []).map((data) => {
            const logDate = data.timestamp ? new Date(data.timestamp) : null;
            const timeString = logDate 
              ? logDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) 
              : 'Unknown time';

            return {
              id: String(data.id),
              user: data.user || 'System',
              action: data.action || 'Unknown action',
              time: timeString,
              type: data.type || 'info'
            };
          });
          setActivities(fetchedLogs);
        }

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-bold animate-pulse">Loading dashboard data...</div>;
  }

  return (
    <div className="space-y-10">
      {/* Ranking Cycle History Section */}
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
        <div className=" flex justify-between items-center mb-6">
          <div>
            <h3 className="text-base font-bold text-sidebar">Ranking Cycle History</h3>
            <p className="text-xs text-slate-500">All cycles you have participated in or that are currently open</p>
          </div>
          <div className="bg-primary/5 text-primary text-[10px] font-bold px-3 py-1 rounded-full border border-primary/10">
            {cycles.length} Cycles
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cycles.map((cycle) => (
            <div 
              key={cycle.id}
              className={`
                relative p-6 rounded-2xl border transition-all
                ${cycle.isCurrent 
                  ? 'bg-primary/[0.03] border-primary shadow-lg shadow-primary/5 col-span-full' 
                  : 'bg-white border-slate-200 hover:border-primary/30 hover:shadow-md'}
              `}
            >
              {cycle.badge && (
                <span className="absolute top-4 right-4 bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded tracking-tighter">
                  {cycle.badge}
                </span>
              )}

              <div className="flex flex-col h-full">
                <div className="mb-6 flex justify-between items-start">
                  <div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider mb-2 block ${cycle.isCurrent ? 'text-primary' : 'text-slate-400'}`}>
                      {cycle.isCurrent ? 'Current Cycle' : 'Completed'}
                    </span>
                    <h4 className="text-lg font-bold text-slate-800">{cycle.title}</h4>
                  </div>
                </div>

                <div className="flex gap-8 mb-8">
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Started</p>
                    <p className="text-xs font-semibold text-slate-700">{cycle.started}</p>
                  </div>
                  {cycle.deadline && (
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Deadline</p>
                      <p className="text-xs font-semibold text-slate-700">{cycle.deadline}</p>
                    </div>
                  )}
                  {cycle.published && (
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Published</p>
                      <p className="text-xs font-semibold text-slate-700">{cycle.published}</p>
                    </div>
                  )}
                </div>

                <div className="mt-auto flex justify-between items-center">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold ${
                    cycle.isCurrent ? 'bg-primary/10 text-primary' : 'bg-emerald-50 text-emerald-600'
                  }`}>
                    {cycle.isCurrent ? <Clock size={12} /> : <CheckCircle2 size={12} />}
                    {cycle.status}
                  </div>
                  
                  {cycle.isCurrent ? (
                    <Link to={`/cycle/${cycle.id}`} className="bg-primary text-white px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-primary-dark transition-colors flex items-center gap-2">
                      Submit Final Results 
                      <ArrowRight size={14} />
                    </Link>
                  ) : (
                    <Link to={`/HistoryPage/${cycle.id}`} className="text-primary text-[10px] font-bold hover:underline flex items-center gap-1 group">
                      See more
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}

          {cycles.length === 0 && !loading && (
             <div className="col-span-full p-8 text-center text-slate-500 text-sm border-2 border-dashed border-slate-200 rounded-2xl">
               No ranking cycles found. Create one to get started.
             </div>
          )}
        </div>
      </section>

      {/* Recent Activity Section */}
      <section>
        <div className="mb-6">
          <h3 className="text-lg font-bold text-sidebar">Recent Activities</h3>
          <p className="text-xs text-slate-500">Latest Updates from faculty and the system</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="divide-y divide-slate-100">
            {activities.length > 0 ? activities.map((activity) => (
              <div key={activity.id} className="p-4 hover:bg-slate-50 transition-colors flex justify-between items-center">
                <div>
                  <h5 className="text-sm font-bold text-slate-800">{activity.user}</h5>
                  <p className="text-[13px] text-slate-600 font-medium">{activity.action}</p>
                  <p className="text-[11px] text-slate-400 mt-1">{activity.time}</p>
                </div>
                {activity.type === 'success' && (
                  <div className="bg-primary/5 text-primary p-2 rounded-lg">
                    <CheckCircle2 size={18} />
                  </div>
                )}
              </div>
            )) : (
              <div className="p-8 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
                <ActivityIcon size={24} className="opacity-20" />
                No recent activities recorded.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;