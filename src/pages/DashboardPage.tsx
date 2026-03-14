import { ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const DashboardPage = () => {
  const cycles = [
    { 
      id: 1, 
      title: '1st Semester AY 2026-2027', 
      status: 'In Progress', 
      isCurrent: true,
      started: 'Feb 1, 2026',
      deadline: 'March 15, 2026',
      badge: 'CLOSED'
    },
    { 
      id: 2, 
      title: '2nd Semester AY 2025-2026', 
      status: 'Published', 
      isCurrent: false,
      started: 'Aug 1, 2025',
      published: 'Oct 10, 2025'
    },
    { 
      id: 3, 
      title: '1st Semester AY 2025-2026', 
      status: 'Published', 
      isCurrent: false,
      started: 'Feb 1, 2025',
      published: 'Apr 5, 2025'
    },
  ];

  const activities = [
    { 
      id: 1, 
      user: 'Dr. Maria Santos', 
      action: 'Change Salamnder, John Doe Under Review → Reviewed', 
      time: 'Today, 8:00 AM' 
    },
    { 
      id: 2, 
      user: 'Prof. Robert Garcia', 
      action: 'Change Salamnder, John Doe Reviewed → Under Review', 
      time: 'Feb 1, 2026' 
    },
    { 
      id: 3, 
      user: 'Dr. Maria Santos', 
      action: 'Change Salamnder, John Doe Under Review → Reviewed', 
      time: 'January 20, 2026' 
    },
    { 
      id: 4, 
      user: 'Dr. Maria Santos', 
      action: 'Change Salamnder, John Doe Under Review → Reviewed', 
      time: 'January 20, 2026' 
    },
    { 
      id: 5, 
      user: 'Dr. Maria Santos', 
      action: 'Change Salamnder, John Doe Under Review → Reviewed', 
      time: 'January 20, 2026' 
    },
  ];

  return (
    <div className="space-y-10">
      {/* Ranking Cycle History Section */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-base font-bold text-sidebar">Ranking Cycle History</h3>
            <p className="text-xs text-slate-500">All cycles you have participated in or that are currently open</p>
          </div>
          <div className="bg-primary/5 text-primary text-[10px] font-bold px-3 py-1 rounded-full border border-primary/10">
            3 Cycles
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
                  
                  {cycle.id === 1 ? (
                    <button className="bg-primary text-white px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-primary-dark transition-colors flex items-center gap-2">
                      Submit Final Result
                      <ArrowRight size={14} />
                    </button>
                  ) : (
                    <Link to={`/history/${cycle.id}`} className="text-primary text-[10px] font-bold hover:underline flex items-center gap-1 group">
                      See more
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Activity Section */}
      <section>
        <div className="mb-6">
          <h3 className="text-lg font-bold text-sidebar">Recent Activities</h3>
          <p className="text-xs text-slate-500">Latest Update from the faculty and system</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="divide-y divide-slate-100">
            {activities.map((activity) => (
              <div key={activity.id} className="p-4 hover:bg-slate-50 transition-colors flex justify-between items-center">
                <div>
                  <h5 className="text-sm font-bold text-slate-800">{activity.user}</h5>
                  <p className="text-[13px] text-slate-600 font-medium">{activity.action}</p>
                  <p className="text-[11px] text-slate-400 mt-1">{activity.time}</p>
                </div>
                {activity.id === 1 && (
                  <div className="bg-primary/5 text-primary p-2 rounded-lg">
                    <CheckCircle2 size={18} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
