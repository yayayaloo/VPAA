import { useState } from 'react';
import { 
  Search, 
  Filter, 
  Users, 
  FileText, 
  Eye
} from 'lucide-react';
import FacultyDetailModal from '../components/FacultyDetailModal';

const FacultyReviewPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState(null);

  const stats = [
    { label: 'Under Review', value: 10, sub: 'Under Review Faculty', icon: <Users className="text-emerald-600" />, color: 'emerald' },
    { label: 'Reviewed', value: 25, sub: 'Reviewed Faculty', icon: <Users className="text-emerald-600" />, color: 'emerald' },
    { label: 'Total Faculty', value: 30, sub: 'Total Faculty Rankers', icon: <FileText className="text-emerald-600" />, color: 'emerald' },
  ];

  const facultyData = Array.from({ length: 10 }, (_, i) => ({
    ranking: i + 1,
    name: 'SALAMNDER, JOHN DOE',
    department: i % 2 === 0 ? 'CCS' : i % 3 === 0 ? 'CHTM' : 'CBA',
    points: '165.00/200',
    status: i < 5 ? 'Under Review' : 'Reviewed',
  }));

  const openModal = (faculty: any) => {
    setSelectedFaculty(faculty);
    setIsModalOpen(true);
  };

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
              {facultyData.map((faculty, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors group">
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
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {isModalOpen && (
        <FacultyDetailModal 
          faculty={selectedFaculty} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </div>
  );
};

export default FacultyReviewPage;
