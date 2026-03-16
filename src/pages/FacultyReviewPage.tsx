import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Users, 
  FileText, 
  Eye
} from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase'; // Adjust this path if necessary
import FacultyDetailModal from '../components/FacultyDetailModal';

// Define the shape of your Faculty data
interface Faculty {
  id: string;
  ranking: number;
  name: string;
  department: string;
  points: string;
  status: string;
  originalData?: any; // Keeps the raw Firestore data handy for the modal
}

const FacultyReviewPage = () => {
  const [facultyData, setFacultyData] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);

  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        // Fetch only users who have the role "Faculty"
        const q = query(collection(db, 'users'), where('role', '==', 'Faculty'));
        const querySnapshot = await getDocs(q);
        
        const fetchedFaculty: Faculty[] = querySnapshot.docs.map((doc, index) => {
          const data = doc.data();
          
          return {
            id: doc.id,
            ranking: index + 1, // Temporary ranking based on fetch order
            name: `${data.name_last || ''}, ${data.name_first || ''}`.toUpperCase(),
            // Map department_id to a string, or fallback
            department: data.department_id === "1" ? 'CCS' : data.department_id || 'N/A', 
            // Fallbacks for fields not yet in your DB screenshot
            points: data.total_points ? `${data.total_points}/200` : '0.00/200',
            status: data.review_status || 'Under Review',
            originalData: data // Pass this to your modal later
          };
        });

        setFacultyData(fetchedFaculty);
      } catch (error) {
        console.error("Error fetching faculty:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFaculty();
  }, []);

  // Calculate dynamic stats based on fetched data
  const stats = [
    { 
      label: 'Under Review', 
      value: facultyData.filter(f => f.status === 'Under Review').length, 
      sub: 'Under Review Faculty', 
      icon: <Users className="text-emerald-600" />, 
      color: 'emerald' 
    },
    { 
      label: 'Reviewed', 
      value: facultyData.filter(f => f.status === 'Reviewed').length, 
      sub: 'Reviewed Faculty', 
      icon: <Users className="text-emerald-600" />, 
      color: 'emerald' 
    },
    { 
      label: 'Total Faculty', 
      value: facultyData.length, 
      sub: 'Total Faculty Rankers', 
      icon: <FileText className="text-emerald-600" />, 
      color: 'emerald' 
    },
  ];

  const openModal = (faculty: Faculty) => {
    setSelectedFaculty(faculty);
    setIsModalOpen(true);
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading faculty data...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
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
                placeholder="Search faculty by name..."
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all text-sm"
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
              {facultyData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-8 text-center text-sm text-slate-500">
                    No faculty members found.
                  </td>
                </tr>
              ) : (
                facultyData.map((faculty) => (
                  <tr key={faculty.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-8 py-5 text-sm font-bold text-slate-400">{faculty.ranking}</td>
                    <td className="px-8 py-5 text-[11px] font-black text-slate-700 tracking-tight">{faculty.name}</td>
                    <td className="px-8 py-5 text-[11px] font-bold text-slate-500">{faculty.department}</td>
                    <td className="px-8 py-5 text-[11px] font-bold text-slate-500">{faculty.points}</td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter border ${
                        faculty.status === 'Reviewed' 
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}>
                        {faculty.status}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex justify-center">
                        <button 
                          onClick={() => openModal(faculty)}
                          className="p-2 text-primary hover:bg-primary/5 rounded-lg transition-all"
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