import { useState, useEffect } from 'react';
import { X, User, Briefcase, GraduationCap, Award, CheckCircle2, AlertCircle, Download, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase'; // Ensure correct path

interface FacultyDetailModalProps {
  faculty: any;
  onClose: () => void;
  onStatusUpdate?: () => void; // Optional callback to refresh the parent list
}

const FacultyDetailModal = ({ faculty, onClose, onStatusUpdate }: FacultyDetailModalProps) => {
  // We'll use state to manage the dynamic area scores and loading state
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [areas, setAreas] = useState([
    { id: '1', title: 'AREA I: Educational Qualifications', max: 80, current: 0, fileUrl: '', color: 'bg-primary' },
    { id: '2', title: 'AREA II: Research and Publications', max: 30, current: 0, fileUrl: '', color: 'bg-primary' },
    { id: '3', title: 'AREA III: Teaching Experience and Professional Services', max: 20, current: 0, fileUrl: '', color: 'bg-primary' },
    { id: '4', title: 'AREA IV: Performance Evaluation', max: 10, current: 0, fileUrl: '', color: 'bg-primary' },
    { id: '5', title: 'AREA V: Training and Seminars', max: 20, current: 0, fileUrl: '', color: 'bg-primary' },
  ]);

  useEffect(() => {
    const fetchAreaSubmissions = async () => {
      if (!faculty?.id) return;
      
      try {
        setLoading(true);
        // Fetch from the nested subcollection defined in your ERD
        const submissionsRef = collection(db, 'applications', faculty.id, 'area_submissions');
        const snap = await getDocs(submissionsRef);
        
        const fetchedData: Record<string, any> = {};
        snap.forEach(doc => {
           const data = doc.data();
           // Map using area_id if it exists, or fall back to the document ID
           const areaId = data.area_id || doc.id.replace('area_', '');
           fetchedData[areaId] = data;
        });

        // Merge fetched data into our area templates
        setAreas(prevAreas => prevAreas.map(area => {
          const submission = fetchedData[area.id];
          if (submission) {
            // Show VPAA mark if available, otherwise show HR mark, otherwise 0
            const currentPoints = submission.vpaa_mark ?? submission.hr_mark ?? 0;
            return {
              ...area,
              current: Number(currentPoints),
              fileUrl: submission.document_url || '' // Fetch the actual PDF link if HR uploaded it
            };
          }
          return area;
        }));
      } catch (err) {
        console.error("Error fetching submissions:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAreaSubmissions();
  }, [faculty]);

  // Handle marking the review as complete
  const handleCompleteReview = async () => {
    if (!faculty?.id) return;
    try {
      setUpdating(true);
      const appRef = doc(db, 'applications', faculty.id);
      
      // Update the status to the next logical step in the VPAA workflow
      await updateDoc(appRef, {
        status: 'Approved_Unpublished' 
      });
      
      if (onStatusUpdate) onStatusUpdate(); // Refresh parent table if needed
      onClose(); // Close modal on success
    } catch (error) {
      console.error("Failed to update status", error);
    } finally {
      setUpdating(false);
    }
  };

  if (!faculty) return null;

  // Extract the raw Firestore data we passed from the parent component
  const data = faculty.originalData || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-sidebar/40 backdrop-blur-sm"
      />

      {/* Modal Content */}
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative bg-white w-full max-w-5xl h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col"
      >
        <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors z-10">
          <X size={24} className="text-slate-400" />
        </button>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Side: Profile Info */}
          <div className="w-2/5 p-10 overflow-y-auto border-r border-slate-100 bg-slate-50/30">
            <div className="flex items-center gap-3 mb-10">
              <div className="p-2 bg-primary/10 rounded-lg">
                <User size={20} className="text-primary" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Faculty Information</h3>
            </div>

            <div className="space-y-10">
              {/* Personal Details */}
              <section>
                <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">
                  <User size={14} /> Personal Details
                </h4>
                <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                  <div className="col-span-2">
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Name</p>
                    <p className="text-[13px] font-bold text-slate-700">{faculty.name}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Department</p>
                    <p className="text-[13px] font-bold text-slate-700">{faculty.department}</p>
                  </div>
                </div>
              </section>

              {/* Employment Status */}
              <section>
                <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">
                  <Briefcase size={14} /> Employment Status
                </h4>
                <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Present Rank</p>
                    <p className="text-[13px] font-bold text-slate-700">{data.current_rank || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Applying For</p>
                    <p className="text-[13px] font-bold text-slate-700">{data.applying_for || 'N/A'}</p>
                  </div>
                </div>
              </section>

              {/* Educational Attainment */}
              <section>
                <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">
                  <GraduationCap size={14} /> Educational Attainment
                </h4>
                <div className="space-y-4">
                  <div className="p-4 bg-white border border-slate-200 rounded-xl">
                    <p className="text-[13px] font-bold text-slate-700">{data.educational_attainment || 'No data provided'}</p>
                  </div>
                </div>
              </section>

              {/* Eligibility & Exams */}
              <section>
                <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">
                  <Award size={14} /> Eligibility & Exams
                </h4>
                <p className="text-[13px] font-bold text-slate-700">{data.eligibility_exams || 'None recorded'}</p>
              </section>
            </div>
          </div>

          {/* Right Side: Submitted Areas & Qualification */}
          <div className="flex-1 p-10 overflow-y-auto bg-white flex flex-col relative">
            
            {loading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-10">
                <Loader2 className="animate-spin text-primary mb-4" size={32} />
                <p className="text-sm font-bold text-slate-400">Loading area submissions...</p>
              </div>
            ) : null}

            <div className="mb-10">
              <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight mb-8">Area Submissions (HR Verified)</h3>
              <div className="space-y-6">
                {areas.map((area, idx) => (
                  <div key={idx} className="group">
                    <div className="flex justify-between items-end mb-2">
                      <div className="flex-1 pr-10">
                        <p className="text-[11px] font-black text-slate-700 leading-tight mb-1">{area.title}</p>
                        <p className="text-[10px] text-slate-400 font-medium">Max: {area.max.toFixed(2)} pts</p>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        <span className="text-base font-black text-slate-800">{area.current.toFixed(2)}</span>
                        {area.fileUrl ? (
                          <a href={area.fileUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-primary hover:underline mt-1">
                            view PDF
                          </a>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-300 mt-1">No PDF</span>
                        )}
                      </div>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
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

            <div className="mt-auto pt-10 border-t border-slate-100">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6">Qualification Status</h3>
              <div className="space-y-4 mb-10">
                {/* Visual hardcoded indicators - you can make these dynamic later based on final score */}
                <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Calculated Total</p>
                    <p className="text-[11px] font-bold text-slate-600">{faculty.points || 0} / 160 Points</p>
                  </div>
                  <CheckCircle2 className="text-emerald-500" size={20} />
                </div>
              </div>

              <div className="flex gap-4">
                <button className="flex-1 py-3 border-2 border-primary text-primary text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-primary/5 transition-all flex items-center justify-center gap-2">
                  <Download size={16} />
                  Download Result
                </button>
                <button 
                  onClick={handleCompleteReview}
                  disabled={updating}
                  className="flex-1 py-3 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50"
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