import { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Briefcase, 
  GraduationCap, 
  Award, 
  CheckCircle2, 
  XCircle, 
  Download, 
  Loader2 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { collection, getDocs, getDoc, doc, updateDoc } from 'firebase/firestore'; 
import { db } from '../firebase'; 

interface FacultyDetailModalProps {
  faculty: any; 
  onClose: () => void;
  onStatusUpdate?: () => void; 
}

const FacultyDetailModal = ({ faculty, onClose, onStatusUpdate }: FacultyDetailModalProps) => {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [fullUserData, setFullUserData] = useState<any>(null); 

  const [areas, setAreas] = useState([
    { id: '1', title: 'AREA I: Educational Qualifications', max: 85, current: 0, fileUrl: '', color: 'bg-[#0a5e2f]' },
    { id: '2', title: 'AREA II: Research and Publications', max: 20, current: 0, fileUrl: '', color: 'bg-[#0a5e2f]' },
    { id: '3', title: 'AREA III: Teaching Experience and Professional Services', max: 20, current: 0, fileUrl: '', color: 'bg-[#0a5e2f]' },
    { id: '4', title: 'AREA IV: Performance Evaluation', max: 10, current: 0, fileUrl: '', color: 'bg-[#0a5e2f]' },
    { id: '5', title: 'AREA V: Training and Seminars', max: 20, current: 0, fileUrl: '', color: 'bg-[#0a5e2f]' },
  ]);

  useEffect(() => {
    const fetchAllData = async () => {
      if (!faculty?.id) return;
      
      try {
        setLoading(true);
        
       
        const userId = faculty.user_id || faculty.userId || faculty.id; 
        
        if (userId) {
          const userRef = doc(db, 'users', userId);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setFullUserData(userSnap.data());
          } else {
            console.log("No user document found for ID:", userId);
          }
        }

     
        const submissionsRef = collection(db, 'applications', faculty.id, 'area_submissions');
        const snap = await getDocs(submissionsRef);
        
        const fetchedData: Record<string, any> = {};
        snap.forEach(doc => {
           const docData = doc.data();
           const areaId = String(docData.area_id || doc.id.replace('area_', ''));
           fetchedData[areaId] = docData;
        });

        setAreas(prevAreas => prevAreas.map(area => {
          const submission = fetchedData[area.id];
          if (submission) {
          
            const currentPoints = submission.vpaa_mark ?? submission.hr_mark ?? 0;
            return {
              ...area,
              current: Number(currentPoints),
              fileUrl: submission.file_path || submission.document_url || '' 
            };
          }
          return area;
        }));
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllData();
  }, [faculty]);

  const handleCompleteReview = async () => {
    if (!faculty?.id) return;
    try {
      setUpdating(true);
      const appRef = doc(db, 'applications', faculty.id);
      
      await updateDoc(appRef, {
        status: 'Reviewed' 
      });
      
      if (onStatusUpdate) onStatusUpdate();
      onClose(); 
    } catch (error) {
      console.error("Failed to update status", error);
    } finally {
      setUpdating(false);
    }
  };

  if (!faculty) return null;

 
  const data = fullUserData || faculty?.originalData || faculty || {};

 
  const totalPoints = areas.reduce((sum, area) => sum + area.current, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
      />

      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative bg-[#f8fafc] w-full max-w-5xl h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col z-10"
      >
        <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-slate-200 rounded-full transition-colors z-20 bg-white/50 backdrop-blur">
          <X size={24} className="text-slate-500" />
        </button>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Side: Profile Info */}
          <div className="w-5/12 p-10 overflow-y-auto border-r border-slate-200 bg-white">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 text-[#0a5e2f]">
                <User size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Faculty Information</h3>
            </div>

            <div className="space-y-8">
              {/* Personal Details */}
              <section>
                <h4 className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-4 border-b border-slate-100 pb-2">
                  <User size={16} className="text-slate-400" /> Personal Details
                </h4>
                <div className="grid grid-cols-1 gap-y-4">
                  <div>
                    <p className="text-[11px] text-slate-400 font-semibold mb-1">Name</p>
                    <p className="text-sm font-semibold text-slate-800">{data.name || faculty.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400 font-semibold mb-1">Department</p>
                    <p className="text-sm font-semibold text-slate-800">{data.department || faculty.department || 'N/A'}</p>
                  </div>
                </div>
              </section>

              {/* Employment Status */}
              <section>
                <h4 className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-4 border-b border-slate-100 pb-2">
                  <Briefcase size={16} className="text-slate-400" /> Employment Status
                </h4>
                <div className="grid grid-cols-2 gap-y-4 gap-x-4">
                  <div>
                    <p className="text-[11px] text-slate-400 font-semibold mb-1">Present Rank</p>
                    <p className="text-sm font-semibold text-slate-800">{data.presentRank || data.current_rank || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400 font-semibold mb-1">Nature of Appointment</p>
                    <p className="text-sm font-semibold text-slate-800">{data.natureOfAppointment || 'Permanent'}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400 font-semibold mb-1">Current Salary</p>
                    <p className="text-sm font-semibold text-slate-800">
                      {data.currentSalary ? `₱${data.currentSalary.toLocaleString()}` : 'N/A'}
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h4 className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-4 border-b border-slate-100 pb-2">
                  <GraduationCap size={16} className="text-slate-400" /> Educational Attainment
                </h4>
                <div className="space-y-3">
                  {Array.isArray(data.educationalAttainment) ? (
                    data.educationalAttainment.map((edu: any, index: number) => (
                      <div key={index} className="p-3 bg-slate-50 rounded-xl">
                        <p className="text-sm font-semibold text-slate-800">{edu.degree || edu}</p>
                        {edu.school && <p className="text-xs text-slate-500 mt-1">{edu.school}</p>}
                      </div>
                    ))
                  ) : (
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <p className="text-sm font-semibold text-slate-800">{data.educational_attainment || data.educationalAttainment || 'No data provided'}</p>
                    </div>
                  )}
                </div>
              </section>

              {/* Experience & Rating */}
              <section>
                <h4 className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-4 border-b border-slate-100 pb-2">
                  <Award size={16} className="text-slate-400" /> Experience & Rating
                </h4>
                <div className="grid grid-cols-2 gap-y-4 gap-x-4">
                  <div>
                    <p className="text-[11px] text-slate-400 font-semibold mb-1">Teaching Exp.</p>
                    <p className="text-sm font-semibold text-slate-800">{data.teachingExperienceYears || 0} years</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400 font-semibold mb-1">Industry Exp.</p>
                    <p className="text-sm font-semibold text-slate-800">{data.industryExperienceYears || 0} years</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400 font-semibold mb-1">Performance Rating</p>
                    <p className="text-sm font-semibold text-slate-800">{data.performanceRating || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400 font-semibold mb-1">Rating Description</p>
                    <p className="text-sm font-semibold text-slate-800">{data.ratingDescription || 'N/A'}</p>
                  </div>
                </div>
              </section>

            </div>
          </div>

          {/* Right Side: Submitted Areas & Qualification */}
          <div className="flex-1 p-10 overflow-y-auto bg-white flex flex-col relative">
            
            {loading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-10 backdrop-blur-sm">
                <Loader2 className="animate-spin text-[#0a5e2f] mb-4" size={32} />
                <p className="text-sm font-bold text-slate-500">Loading data...</p>
              </div>
            )}

            <div className="mb-10">
              <h3 className="text-base font-bold text-slate-800 uppercase tracking-wide mb-6">Submitted Areas</h3>
              <div className="space-y-6">
                {areas.map((area, idx) => (
                  <div key={idx} className="group">
                    <div className="flex justify-between items-end mb-2">
                      <div className="flex-1 pr-6">
                        <p className="text-xs font-bold text-slate-700 leading-tight mb-1">{area.title}</p>
                        <p className="text-[10px] text-slate-400 font-medium">Max: {area.max.toFixed(2)} pts <span className="text-yellow-500 ml-1">+0 excess</span></p>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        <span className="text-sm font-bold text-[#0a5e2f]">{area.current.toFixed(2)}</span>
                        {area.fileUrl ? (
                          <a href={area.fileUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] font-semibold text-[#0a5e2f] hover:underline mt-1">
                            view PDF
                          </a>
                        ) : (
                          <span className="text-[11px] font-medium text-slate-300 mt-1">No PDF</span>
                        )}
                      </div>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((area.current / area.max) * 100, 100)}%` }}
                        className={`h-full ${area.color} rounded-full`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-auto border-t border-slate-200 pt-6">
              <div className="flex justify-between items-center mb-8">
                <span className="text-sm font-bold text-slate-800">TOTAL POINTS:</span>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 mr-4">Max: 200.00 pts with/without excess points</span>
                  <span className="text-base font-bold text-[#0a5e2f]">{totalPoints.toFixed(2)}</span>
                </div>
              </div>

              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4">Qualification</h3>
              <div className="space-y-3 mb-8 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-600 uppercase">Experience</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500">QUALIFIED FOR PROFESSOR I - V</span>
                    <CheckCircle2 className="text-[#0a5e2f]" size={18} />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-600 uppercase">Teaching Performance</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500">QUALIFIED FOR PROFESSOR I - V</span>
                    <CheckCircle2 className="text-[#0a5e2f]" size={18} />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-600 uppercase">Research Output</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500">NOT QUALIFIED</span>
                    <XCircle className="text-red-500" size={18} />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-600 uppercase">Eligibility</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500">NOT QUALIFIED</span>
                    <XCircle className="text-red-500" size={18} />
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button className="flex-1 py-3.5 bg-[#3b82f6] text-white text-xs font-bold uppercase tracking-wide rounded-xl hover:bg-blue-600 transition-colors flex items-center justify-center gap-2">
                  <Download size={16} />
                  Download Result
                </button>
                <button 
                  onClick={handleCompleteReview}
                  disabled={updating}
                  className="flex-1 py-3.5 bg-[#0a5e2f] text-white text-xs font-bold uppercase tracking-wide rounded-xl hover:bg-[#084b25] transition-colors shadow-lg shadow-[#0a5e2f]/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {updating ? <Loader2 size={16} className="animate-spin" /> : 'Review Completed'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default FacultyDetailModal;