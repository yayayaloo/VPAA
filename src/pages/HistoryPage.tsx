import { useState, useEffect } from 'react';
import { CheckCircle2, Search, Filter, ArrowRight, Calendar, Download, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase'; // Make sure this path is correct

const HistoryPage = () => {
  const [cycles, setCycles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCycles: 0,
    avgParticipation: '0',
    highestAvg: '0'
  });

  useEffect(() => {
    const fetchHistoryData = async () => {
      try {
        // 1. Fetch all ranking cycles and applications
        const cyclesSnap = await getDocs(collection(db, 'ranking_cycles'));
        const appsSnap = await getDocs(collection(db, 'applications'));
        
        const appsData = appsSnap.docs.map(doc => doc.data());
        const fetchedCycles: any[] = [];
        
        let highestAverage = 0;

        cyclesSnap.forEach(doc => {
          const data = doc.data();
          
          // 2. Find all applications that belong to this specific cycle
          const cycleApps = appsData.filter(app => app.cycle_id === doc.id);
          const totalFaculty = cycleApps.length;
          
          // 3. Calculate average points for this cycle
          const totalPoints = cycleApps.reduce((sum, app) => sum + (Number(app.final_score) || 0), 0);
          const avgPoints = totalFaculty > 0 ? (totalPoints / totalFaculty).toFixed(1) : 0;

          if (Number(avgPoints) > highestAverage) {
            highestAverage = Number(avgPoints);
          }

          fetchedCycles.push({
            id: doc.id,
            title: data.title || `${data.semester} ${data.year}`,
            status: data.status === 'open' ? 'Active' : data.status, // Display 'open' nicely
            started: formatDate(data.start_date),
            published: formatDate(data.deadline), // Using deadline as release date for now
            totalFaculty,
            avgPoints
          });
        });

        // 4. Sort cycles by date (newest first)
        fetchedCycles.sort((a, b) => new Date(b.started).getTime() - new Date(a.started).getTime());

        setCycles(fetchedCycles);
        setStats({
          totalCycles: fetchedCycles.length,
          avgParticipation: fetchedCycles.length > 0 ? (appsData.length / fetchedCycles.length).toFixed(1) : '0',
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

  // Helper function to safely format Firebase dates
  const formatDate = (dateField: any) => {
    if (!dateField) return 'N/A';
    // If it's a Firestore Timestamp object
    if (dateField.toDate) {
      return dateField.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    // If it's a regular string
    return new Date(dateField).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with Search/Filter */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-sidebar">Ranking History</h2>
          <p className="text-xs text-slate-500">Archive of all ranking semesters</p>
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
          { label: 'Total Cycles', value: stats.totalCycles, color: 'bg-primary' },
          { label: 'Avg. Participation', value: stats.avgParticipation, color: 'bg-amber-500' },
          { label: 'Highest Avg. Points', value: stats.highestAvg, color: 'bg-emerald-500' },
          { label: 'Archived Data', value: 'Live', color: 'bg-sidebar' },
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
        {cycles.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl border border-slate-200">
            <p className="text-slate-500 font-medium">No ranking cycles found.</p>
          </div>
        ) : (
          cycles.map((cycle) => (
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
                      <span className={`flex items-center gap-1.5 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        cycle.status === 'Active' ? 'text-amber-600 bg-amber-50' : 'text-emerald-600 bg-emerald-50'
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
          ))
        )}
      </div>
    </div>
  );
};

export default HistoryPage;