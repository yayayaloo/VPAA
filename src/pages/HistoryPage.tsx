import { useState, useEffect } from 'react';
import { CheckCircle2, Search, Filter, ArrowRight, Calendar, Download, Loader2, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient'; 

const HistoryPage = () => {
  const [cycles, setCycles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    totalCycles: 0,
    avgParticipation: '0',
    highestAvg: '0'
  });

  useEffect(() => {
    const fetchHistoryData = async () => {
      try {
        setLoading(true);

        // Fetch data from Supabase
        const [
          { data: cyclesData, error: cyclesError },
          { data: appsData, error: appsError }
        ] = await Promise.all([
          supabase.from('ranking_cycles').select('*'),
          supabase.from('applications').select('*')
        ]);

        if (cyclesError) throw cyclesError;
        if (appsError) throw appsError;

        const safeCyclesData = cyclesData || [];
        const safeAppsData = appsData || [];
        
        const fetchedCycles: any[] = [];
        let highestAverage = 0;

        safeCyclesData.forEach(data => {
          // Find all applications belonging to this cycle
          // Using String() ensures matching works even if one is an int and the other a string
          const cycleApps = safeAppsData.filter(app => String(app.cycle_id) === String(data.id));
          const totalFaculty = cycleApps.length;
          
          // Calculate total points
          const totalPoints = cycleApps.reduce((sum, app) => {
            const score = Number(app.final_score) || Number(app.total_points) || 0;
            return sum + score;
          }, 0);
          
          const avgPoints = totalFaculty > 0 ? (totalPoints / totalFaculty).toFixed(1) : '0';

          if (Number(avgPoints) > highestAverage) {
            highestAverage = Number(avgPoints);
          }

          fetchedCycles.push({
            id: String(data.id),
            title: data.title || `${data.semester || 'Semester'} ${data.year || 'Year'}`,
            semester: data.semester || 'N/A',
            year: data.year || 'N/A',
            status: data.status === 'open' ? 'Active' : 'Closed', 
            started: formatDate(data.start_date),
            published: formatDate(data.deadline || data.end_date), 
            totalFaculty,
            avgPoints,
            rawStartDate: data.start_date // Keeping raw date for accurate sorting
          });
        });

        // Sort by start date, newest first
        fetchedCycles.sort((a, b) => new Date(b.rawStartDate).getTime() - new Date(a.rawStartDate).getTime());

        setCycles(fetchedCycles);
        setStats({
          totalCycles: fetchedCycles.length,
          avgParticipation: fetchedCycles.length > 0 ? (safeAppsData.length / fetchedCycles.length).toFixed(1) : '0',
          highestAvg: highestAverage.toFixed(1)
        });
        
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistoryData();
  }, []);

  // Simplified date formatter for Supabase's standard ISO strings
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const filteredCycles = cycles.filter(cycle => 
    cycle.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cycle.semester.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cycle.year.toString().includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center flex-col gap-4">
        <Loader2 className="animate-spin text-primary" size={40} />
        <p className="text-sm font-semibold text-slate-500 animate-pulse">Loading ranking history...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header with Search/Filter */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-sidebar">Ranking History</h2>
          <p className="text-xs text-slate-500">Archive of all past and current ranking cycles</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search cycles..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <button className="p-2 border border-slate-200 rounded-lg bg-white text-slate-600 hover:text-primary hover:border-primary transition-colors">
            <Filter size={18} />
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Cycles', value: stats.totalCycles, color: 'bg-primary' },
          { label: 'Avg. Participation', value: stats.avgParticipation, color: 'bg-amber-500' },
          { label: 'Highest Avg. Points', value: stats.highestAvg, color: 'bg-emerald-500' },
          { label: 'System Status', value: 'Live', color: 'bg-sidebar' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">{stat.label}</p>
            <div className="flex items-center gap-3">
              <div className={`w-2 h-6 rounded-full ${stat.color}`} />
              <p className="text-2xl font-black text-slate-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Cycle List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredCycles.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <Calendar className="mx-auto h-12 w-12 text-slate-300 mb-3" />
            <p className="text-slate-500 font-bold">No ranking cycles found.</p>
            <p className="text-sm text-slate-400">Try adjusting your search terms.</p>
          </div>
        ) : (
          filteredCycles.map((cycle) => (
            <div 
              key={cycle.id}
              className="group bg-white p-6 rounded-2xl border border-slate-200 hover:border-primary/40 hover:shadow-md transition-all duration-300"
            >
              <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6">
                
                {/* Left Side: Cycle Identifier */}
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-xl bg-slate-50 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors border border-slate-100">
                    <Calendar size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-slate-800 mb-0.5">{cycle.title}</h4>
                    {/* Explicitly showing what cycle this is */}
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      {cycle.semester} • AY {cycle.year}
                    </p>
                    <div className="flex items-center gap-3">
                      <span className={`flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full ${
                        cycle.status === 'Active' ? 'text-primary bg-primary/10 border border-primary/20' : 'text-slate-500 bg-slate-100 border border-slate-200'
                      }`}>
                        <CheckCircle2 size={12} />
                        {cycle.status}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        Started: {cycle.started}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Middle: Cycle Stats */}
                <div className="flex items-center gap-8 lg:gap-16 lg:pr-10 border-l border-slate-100 pl-8">
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Users size={12} /> Included
                    </p>
                    <p className="text-lg font-black text-slate-700">{cycle.totalFaculty} <span className="text-xs font-medium text-slate-400">faculty</span></p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Avg. Points</p>
                    <p className="text-lg font-black text-slate-700">{cycle.avgPoints}</p>
                  </div>
                  <div className="hidden md:block">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">End Date</p>
                    <p className="text-sm font-bold text-slate-700">{cycle.published}</p>
                  </div>
                </div>

                {/* Right Side: Actions */}
                <div className="flex items-center gap-3 mt-4 lg:mt-0">
                  <button className="flex-1 lg:flex-none px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-primary transition-colors flex items-center justify-center gap-2">
                    <Download size={14} />
                    Export
                  </button>
                  <Link to={`/history/${cycle.id}`} className="flex-1 lg:flex-none px-5 py-2.5 bg-sidebar text-white rounded-xl text-xs font-bold hover:bg-sidebar-dark shadow-sm transition-all group/btn flex items-center justify-center gap-2">
                    View Rankings
                    <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
                
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HistoryPage;