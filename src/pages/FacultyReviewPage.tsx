import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Users, 
  FileText, 
  Eye,
  Loader2
} from 'lucide-react';
import { supabase } from '../supabaseClient'; 
import FacultyDetailModal from '../components/FacultyDetailModal';

export interface Faculty {
  id: string; 
  application_id: string;
  ranking: number;
  name: string;
  department: string;
  points: string;
  rawPoints: number;
  status: string;
  originalData?: any; 
}

const FacultyReviewPage = () => {
  const [facultyData, setFacultyData] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchFacultyForActiveCycle = async () => {
      try {
        setLoading(true);
        
        // 1. Fetch the active cycle
        const { data: cycleSnap, error: cycleError } = await supabase
          .from('ranking_cycles')
          .select('id') // Change to 'cycle_id' if that is your primary key
          .eq('status', 'open')
          .limit(1);
          
        if (cycleError) throw cycleError;
        
        if (!cycleSnap || cycleSnap.length === 0) {
          setFacultyData([]);
          setLoading(false);
          return;
        }
        
        const activeCycleId = cycleSnap[0].id;

        // 2. Fetch applications for the active cycle
        const { data: appsSnap, error: appsError } = await supabase
          .from('applications')
          .select('*')
          .eq('cycle_id', activeCycleId);
          
        if (appsError) throw appsError;
        
        // 3. Process applications and fetch user details
        const appsData = appsSnap || [];
        const facultyPromises = appsData.map(async (appData) => {
          let facultyName = "UNKNOWN FACULTY";
          let department = `Dept ${appData.department_id || '?'}`;
          
          const userId = appData.faculty_id || appData.user_id;

          if (userId) {
            // Fetch specific user data
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('*')
              .eq('id', userId) // Change to 'user_id' if that is your primary key
              .single();
            
            if (!userError && userData) {
              facultyName = userData.name 
                ? userData.name 
                : `${userData.name_last || ''}, ${userData.name_first || ''}`;
                
              department = userData.department || (userData.department_id === "1" ? 'CCS' : department);
            }
          }

          const rawPts = Number(appData.final_score || appData.total_points || 0);

          let displayStatus = appData.status || 'Draft';
          if (['Approved_Unpublished', 'Published'].includes(appData.status)) {
            displayStatus = 'Reviewed';
          } else if (appData.status === 'Pending_VPAA') {
            displayStatus = 'Under Review';
          }

          return {
            id: String(userId || appData.id),
            application_id: String(appData.id),
            ranking: 0, 
            name: facultyName.toUpperCase(),
            department: department, 
            points: `${rawPts.toFixed(2)}/200`,
            rawPoints: rawPts,
            status: displayStatus,
            originalData: { ...appData } 
          };
        });

        let fetchedFaculty = await Promise.all(facultyPromises);

        // Sort by raw points descending
        fetchedFaculty.sort((a, b) => b.rawPoints - a.rawPoints);
        
        // Assign rankings based on sorted array
        fetchedFaculty = fetchedFaculty.map((faculty, index) => ({
          ...faculty,
          ranking: index + 1
        }));

        setFacultyData(fetchedFaculty);
      } catch (error) {
        console.error("Error fetching faculty applications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFacultyForActiveCycle();
  }, []);

  const stats = [
    { 
      label: 'Under Review', 
      value: facultyData.filter(f => f.status.toLowerCase().includes('review') && f.status !== 'Reviewed').length, 
      sub: 'Pending VPAA Evaluation', 
      icon: <Users className="text-emerald-600" />, 
      color: 'emerald' 
    },
    { 
      label: 'Reviewed', 
      value: facultyData.filter(f => f.status === 'Reviewed').length, 
      sub: 'Approved Applications', 
      icon: <Users className="text-emerald-600" />, 
      color: 'emerald' 
    },
    { 
      label: 'Total Faculty', 
      value: facultyData.length, 
      sub: 'Current Cycle Applicants', 
      icon: <FileText className="text-emerald-600" />, 
      color: 'emerald' 
    },
  ];

  const openModal = (faculty: Faculty) => {
    setSelectedFaculty(faculty);
    setIsModalOpen(true);
  };

  const filteredFaculty = facultyData.filter(faculty => 
    faculty.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faculty.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center flex-col gap-4">
        <Loader2 className="animate-spin text-emerald-600" size={40} />
        <p className="text-sm font-semibold text-slate-500 animate-pulse">Loading active cycle and faculty data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
            <div className="flex-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <h4 className="text-3xl font-black text-slate-800 mb-1">{stat.value}</h4>
              <p className="text-[10px] text-slate-500 font-medium">{stat.sub}</p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl">
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Faculty List Section */}
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-8 pb-4">
          <h3 className="text-2xl font-black text-slate-800 mb-1">Faculty List</h3>
          <p className="text-sm text-slate-500 font-medium mb-8">View and manage faculty information and submissions</p>

          <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search faculty by name or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
              />
            </div>

            <button className="flex items-center gap-3 px-6 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-all">
              All Departments
              <Filter size={18} className="text-slate-400" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-y border-slate-100 bg-slate-50/50">
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ranking</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Faculty</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Points</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredFaculty.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-12 text-center text-sm font-medium text-slate-500">
                    No faculty applications found for the active cycle yet.
                  </td>
                </tr>
              ) : (
                filteredFaculty.map((faculty) => (
                  <tr key={faculty.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-8 py-5 text-sm font-bold text-slate-400">#{faculty.ranking}</td>
                    <td className="px-8 py-5 text-[11px] font-black text-slate-700 tracking-tight">{faculty.name}</td>
                    <td className="px-8 py-5 text-[11px] font-bold text-slate-500">{faculty.department}</td>
                    <td className="px-8 py-5 text-[11px] font-bold text-slate-500">{faculty.points}</td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter border ${
                        faculty.status === 'Reviewed' 
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                          : faculty.status === 'Under Review'
                          ? 'bg-amber-50 text-amber-600 border-amber-100'
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}>
                        {faculty.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex justify-center">
                        <button 
                          onClick={() => openModal(faculty)}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                        >
                          <Eye size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {isModalOpen && selectedFaculty && (
        <FacultyDetailModal 
          faculty={selectedFaculty} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </div>
  );
};

export default FacultyReviewPage;