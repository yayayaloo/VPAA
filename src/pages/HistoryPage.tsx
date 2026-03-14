import { CheckCircle2, Search, Filter, ArrowRight, Calendar, Download } from 'lucide-react';
import { Link } from 'react-router-dom';

const HistoryPage = () => {
  const pastCycles = [
    { 
      id: 2, 
      title: '2nd Semester AY 2025-2026', 
      status: 'Published', 
      started: 'Aug 1, 2025',
      published: 'Oct 10, 2025',
      totalFaculty: 45,
      avgPoints: 85.4
    },
    { 
      id: 3, 
      title: '1st Semester AY 2025-2026', 
      status: 'Published', 
      started: 'Feb 1, 2025',
      published: 'Apr 5, 2025',
      totalFaculty: 42,
      avgPoints: 82.1
    },
    { 
      id: 4, 
      title: '2nd Semester AY 2024-2025', 
      status: 'Archived', 
      started: 'Aug 15, 2024',
      published: 'Oct 2, 2024',
      totalFaculty: 38,
      avgPoints: 79.8
    },
    { 
      id: 5, 
      title: '1st Semester AY 2024-2025', 
      status: 'Archived', 
      started: 'Feb 10, 2024',
      published: 'Apr 12, 2024',
      totalFaculty: 40,
      avgPoints: 80.2
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header with Search/Filter */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-sidebar">Ranking History</h2>
          <p className="text-xs text-slate-500">Archive of all completed and published ranking semesters</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search semesters..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <button className="p-2 border border-slate-200 rounded-lg bg-white text-slate-600 hover:bg-slate-50 transition-colors">
            <Filter size={18} />
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Cycles', value: '12', color: 'bg-primary' },
          { label: 'Avg. Participation', value: '42.5', color: 'bg-amber-500' },
          { label: 'Highest Avg. Points', value: '85.4', color: 'bg-emerald-500' },
          { label: 'Archived Data', value: '5+ Years', color: 'bg-sidebar' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{stat.label}</p>
            <div className="flex items-center gap-2">
              <div className={`w-1.5 h-4 rounded-full ${stat.color}`} />
              <p className="text-xl font-bold text-slate-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Cycle List */}
      <div className="grid grid-cols-1 gap-4">
        {pastCycles.map((cycle) => (
          <div 
            key={cycle.id}
            className="group bg-white p-6 rounded-2xl border border-slate-200 hover:border-primary/40 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors border border-slate-100">
                  <Calendar size={24} />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-800 mb-1">{cycle.title}</h4>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      <CheckCircle2 size={12} />
                      {cycle.status}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      Started: {cycle.started}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-8 lg:gap-16 lg:pr-10">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Total Faculty</p>
                  <p className="text-sm font-bold text-slate-700">{cycle.totalFaculty}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Avg. Points</p>
                  <p className="text-sm font-bold text-slate-700">{cycle.avgPoints}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Release Date</p>
                  <p className="text-sm font-bold text-slate-700">{cycle.published}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button className="flex-1 lg:flex-none px-4 py-2 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-600 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                  <Download size={14} />
                  Report
                </button>
                <Link to={`/history/${cycle.id}`} className="flex-1 lg:flex-none px-4 py-2 bg-primary/10 text-primary rounded-lg text-[11px] font-bold hover:bg-primary hover:text-white transition-all group/btn flex items-center justify-center gap-2">
                  View Details
                  <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center py-6">
        <button className="text-sm font-bold text-primary hover:underline">Load More History</button>
      </div>
    </div>
  );
};

export default HistoryPage;
