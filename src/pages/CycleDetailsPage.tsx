import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Search, Filter, CheckCircle2, User } from 'lucide-react';

const CycleDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Mock cycle data
  const cycle = {
    title: id === '1' ? '1st Semester AY 2026-2027' : '2nd Semester AY 2025-2026',
    status: id === '1' ? 'In Progress' : 'Published',
    stats: {
      totalFaculty: 45,
      completed: 32,
      underReview: 10,
      pending: 3,
      avgPoints: 84.5
    }
  };

  const facultyRankings = [
    { name: 'Santos, Maria', department: 'CCS', points: 92.5, status: 'Reviewed' },
    { name: 'Garcia, Robert', department: 'CAS', points: 88.2, status: 'Reviewed' },
    { name: 'Lopez, Jennifer', department: 'CBA', points: 85.0, status: 'Under Review' },
    { name: 'Bautista, Michael', department: 'CCS', points: 84.3, status: 'Reviewed' },
    { name: 'Dela Cruz, Juan', department: 'COE', points: 81.7, status: 'Under Review' },
  ].sort((a, b) => b.points - a.points);

  return (
    <div className="space-y-8 pb-12">
      {/* Top Navigation */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-primary hover:border-primary transition-all shadow-sm"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-xl font-bold text-sidebar">{cycle.title}</h2>
          <p className="text-xs text-slate-500">Comprehensive cycle report and faculty rankings</p>
        </div>
      </div>

      {/* Cycle Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-primary/5 border border-primary/20 p-6 rounded-2xl">
          <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-2">Cycle Status</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <h4 className="text-xl font-bold text-sidebar">{cycle.status}</h4>
          </div>
        </div>
        
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Total Faculty</p>
          <h4 className="text-2xl font-bold text-sidebar">{cycle.stats.totalFaculty}</h4>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Completion Rate</p>
          <div className="flex items-end gap-2">
            <h4 className="text-2xl font-bold text-sidebar">{Math.round((cycle.stats.completed / cycle.stats.totalFaculty) * 100)}%</h4>
            <p className="text-xs text-slate-400 mb-1">({cycle.stats.completed}/{cycle.stats.totalFaculty})</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Avg. Score</p>
          <h4 className="text-2xl font-bold text-sidebar">{cycle.stats.avgPoints}</h4>
        </div>
      </div>

      {/* Faculty Rankings List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-sidebar/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h3 className="text-base font-bold text-sidebar">Faculty Rankings</h3>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input 
                type="text" 
                placeholder="Search faculty..." 
                className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <button className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 hover:text-primary transition-all">
              <Filter size={16} />
            </button>
            <button className="flex items-center gap-2 px-4 py-1.5 bg-sidebar text-white rounded-lg text-xs font-bold hover:bg-sidebar-dark transition-all">
              <Download size={14} />
              Export
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Rank</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Faculty Name</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Department</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Points</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {facultyRankings.map((faculty, index) => (
                <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className={`
                      inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold
                      ${index === 0 ? 'bg-amber-100 text-amber-700' : index === 1 ? 'bg-slate-100 text-slate-700' : index === 2 ? 'bg-orange-100 text-orange-700' : 'bg-slate-50 text-slate-400'}
                    `}>
                      {index + 1}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <User size={16} />
                      </div>
                      <span className="text-sm font-bold text-slate-800">{faculty.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-semibold text-slate-500">{faculty.department}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="bg-primary h-full rounded-full" style={{ width: `${faculty.points}%` }} />
                      </div>
                      <span className="text-sm font-bold text-slate-800">{faculty.points}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`
                      px-3 py-1 rounded-full text-[10px] font-bold shadow-sm
                      ${faculty.status === 'Reviewed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}
                    `}>
                      {faculty.status === 'Reviewed' && <CheckCircle2 size={10} className="inline mr-1" />}
                      {faculty.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-xs font-bold text-primary hover:underline cursor-pointer">
                    View Submission
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CycleDetailsPage;
