import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Search, Filter, CheckCircle2, User, Loader2 } from 'lucide-react';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase'; // Ensure correct path

const CycleDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [cycle, setCycle] = useState({
    title: '',
    status: '',
    stats: { totalFaculty: 0, completed: 0, underReview: 0, pending: 0, avgPoints: 0 }
  });
  const [facultyRankings, setFacultyRankings] = useState<any[]>([]);

  useEffect(() => {
    const fetchCycleDetails = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // 1. Fetch Cycle Details
        const cycleRef = doc(db, 'ranking_cycles', id);
        const cycleSnap = await getDoc(cycleRef);
        
        if (!cycleSnap.exists()) {
          console.error("Cycle not found");
          setLoading(false);
          return;
        }
        
        const cycleData = cycleSnap.data();

        // 2. Fetch all Applications tied to this cycle
        const appsRef = collection(db, 'applications');
        const q = query(appsRef, where('cycle_id', '==', id));
        const appsSnap = await getDocs(q);
        
        let totalScore = 0;
        let completedCount = 0;
        let underReviewCount = 0;
        let pendingCount = 0;

        // 3. Process applications and fetch associated User data
        const rankingsPromises = appsSnap.docs.map(async (appDoc) => {
          const appData = appDoc.data();
          
          // Calculate stats buckets based on your ERD statuses
          totalScore += Number(appData.final_score) || 0;
          
          if (['Approved_Unpublished', 'Published'].includes(appData.status)) {
            completedCount++;
          } else if (appData.status === 'Pending_VPAA') {
            underReviewCount++;
          } else {
            pendingCount++;
          }

          // Fetch User Details to get the real name
          let facultyName = "Unknown Faculty";
          let department = `Dept ${appData.department_id || '?'}`;
          
          if (appData.faculty_id) {
            const userRef = doc(db, 'users', appData.faculty_id);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              const userData = userSnap.data();
              facultyName = `${userData.name_last}, ${userData.name_first}`;
              
              // Temporary mapping: you can later fetch from your 'departments' collection
              if (userData.department_id === "1") department = "CCS";
            }
          }

          return {
            id: appDoc.id,
            name: facultyName,
            department: department,
            points: Number(appData.final_score) || 0,
            dbStatus: appData.status,// Keep original status for logic
            originalData: appData
          };
        });

        const resolvedRankings = await Promise.all(rankingsPromises);
        
        // Sort highest points to lowest
        resolvedRankings.sort((a, b) => b.points - a.points);

        const totalFaculty = appsSnap.size;

        setCycle({
          title: cycleData.title || `${cycleData.semester} ${cycleData.year}`,
          status: cycleData.status === 'open' ? 'In Progress' : 'Closed',
          stats: {
            totalFaculty,
            completed: completedCount,
            underReview: underReviewCount,
            pending: pendingCount,
           // ✅ The fix:
avgPoints: totalFaculty > 0 ? Number((totalScore / totalFaculty).toFixed(1)) : 0
          }
        });

        setFacultyRankings(resolvedRankings);

      } catch (error) {
        console.error("Error fetching cycle details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCycleDetails();
  }, [id]);

  // Helper to map DB status to UI Badge
  const getStatusDisplay = (dbStatus: string) => {
    switch(dbStatus) {
      case 'Approved_Unpublished':
      case 'Published':
        return { label: 'Reviewed', classes: 'bg-emerald-50 text-emerald-600 border border-emerald-100', icon: true };
      case 'Pending_VPAA':
        return { label: 'Under Review', classes: 'bg-amber-50 text-amber-600 border border-amber-100', icon: false };
      default:
        // Handles 'Draft', 'Submitted', 'Pending_HR', etc.
        return { label: dbStatus.replace('_', ' '), classes: 'bg-slate-50 text-slate-500 border border-slate-200', icon: false };
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center flex-col gap-4">
        <Loader2 className="animate-spin text-primary" size={40} />
        <p className="text-sm font-semibold text-slate-500 animate-pulse">Loading cycle data...</p>
      </div>
    );
  }

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
            <span className={`w-2 h-2 rounded-full ${cycle.status === 'In Progress' ? 'bg-primary animate-pulse' : 'bg-slate-400'}`} />
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
            <h4 className="text-2xl font-bold text-sidebar">
              {cycle.stats.totalFaculty > 0 ? Math.round((cycle.stats.completed / cycle.stats.totalFaculty) * 100) : 0}%
            </h4>
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
              {facultyRankings.length === 0 ? (
                 <tr>
                   <td colSpan={6} className="px-6 py-8 text-center text-sm text-slate-500">
                     No faculty applications found for this cycle.
                   </td>
                 </tr>
              ) : (
                facultyRankings.map((faculty, index) => {
                  const statusUI = getStatusDisplay(faculty.dbStatus);
                  
                  return (
                    <tr key={faculty.id} className="hover:bg-slate-50/50 transition-colors">
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
                            <div className="bg-primary h-full rounded-full" style={{ width: `${Math.min(faculty.points, 100)}%` }} />
                          </div>
                          <span className="text-sm font-bold text-slate-800">{faculty.points}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold shadow-sm ${statusUI.classes}`}>
                          {statusUI.icon && <CheckCircle2 size={10} className="inline mr-1" />}
                          {statusUI.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-xs font-bold text-primary hover:underline cursor-pointer">
                        View Submission
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CycleDetailsPage;