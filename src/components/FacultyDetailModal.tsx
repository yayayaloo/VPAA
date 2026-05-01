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
import { supabase } from '../supabaseClient'; 

interface FacultyDetailModalProps {
  faculty: any; 
  onClose: () => void;
  onStatusUpdate?: () => void; 
}

interface Area {
  id: string;
  title: string;
  max: number;
  current: number;
  fileUrl: string;
  color: string;
}

const FacultyDetailModal = ({ faculty, onClose, onStatusUpdate }: FacultyDetailModalProps) => {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [downloading, setDownloading] = useState(false); 
  const [fullUserData, setFullUserData] = useState<any>(null); 
  const [appData, setAppData] = useState<any>(null);
  const [areas, setAreas] = useState<Area[]>([]);

  useEffect(() => {
    const fetchAllData = async () => {
      const appId = faculty?.application_id || faculty?.id;
      if (!appId) {
        console.warn("No application ID found in faculty prop");
        return;
      }
      
      try {
        setLoading(true);
        
        const { data: applicationData, error: appError } = await supabase
          .from('applications')
          .select('*')
          .eq('application_id', appId)
          .single();

        if (appError) throw appError;
        setAppData(applicationData);

        if (applicationData?.faculty_id) {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select(`
              *,
              departments(department_name)
            `)
            .eq('user_id', applicationData.faculty_id)
            .single();

          if (userError) {
            console.error("Error fetching user data:", userError);
          } else if (userData) {
            setFullUserData(userData);
          }
        }

        const { data: areasData, error: areasError } = await supabase
          .from('areas')
          .select('*')
          .order('area_id');
          
        if (areasError) throw areasError;

        const { data: submissionsData, error: subError } = await supabase
          .from('area_submissions')
          .select('*')
          .eq('application_id', appId);
        
        if (subError) throw subError;

        const fetchedSubmissions: Record<string, any> = {};
        if (submissionsData) {
          submissionsData.forEach(docData => {
             const areaId = String(docData.area_id);
             fetchedSubmissions[areaId] = docData;
          });
        }

        if (areasData) {
          const mergedAreas = areasData.map(area => {
            const submission = fetchedSubmissions[String(area.area_id)];
            const currentPoints = submission ? (submission.vpaa_points ?? submission.hr_points ?? 0) : 0;
            
            let fullFileUrl = '';
            if (submission?.file_path) {
              if (submission.file_path.startsWith('http')) {
                fullFileUrl = submission.file_path;
              } else {
                const { data } = supabase.storage
                  .from('submissions_bucket') 
                  .getPublicUrl(submission.file_path);
                  
                fullFileUrl = data.publicUrl;
              }
            }

            return {
              id: String(area.area_id),
              title: area.area_name || `Area ${area.area_id}`,
              max: Number(area.max_possible_points) || 0,
              current: Number(currentPoints),
              fileUrl: fullFileUrl,
              color: 'bg-[#0a5e2f]' 
            };
          });
          
          setAreas(mergedAreas);
        }

      } catch (err) {
        console.error("Error in fetchAllData pipeline:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllData();
  }, [faculty]);

  const handleCompleteReview = async () => {
    const appId = faculty?.application_id || faculty?.id;
    if (!appId) return;

    try {
      setUpdating(true);
      
      const { error } = await supabase
        .from('applications')
        .update({ status: 'For_Publishing' })
        .eq('application_id', appId);
      
      if (error) throw error;
      
      if (onStatusUpdate) onStatusUpdate();
      onClose(); 
    } catch (error) {
      console.error("Failed to update status", error);
      alert("Failed to complete review. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  const totalPoints = areas.reduce((sum, area) => sum + area.current, 0);
  const firstName = fullUserData?.name_first || '';
  const middleInitial = fullUserData?.name_middle ? `${fullUserData.name_middle.charAt(0)}.` : '';
  const lastName = fullUserData?.name_last || '';
  const fullName = `${firstName} ${middleInitial} ${lastName}`.trim() || 'N/A';
  
  const deptData = fullUserData?.departments;
  const departmentName = deptData 
    ? (Array.isArray(deptData) ? deptData[0]?.department_name : deptData.department_name) 
    : 'Not specified';

  const handleDownloadResult = () => {
    setDownloading(true);
    try {
      const rows = [
        ["Faculty Evaluation Result"],
        [""],
        ["Name:", fullName],
        ["Department:", departmentName],
        ["Present Rank:", fullUserData?.current_rank || appData?.current_rank_at_time || 'N/A'],
        ["Nature of Appointment:", fullUserData?.nature_of_appointment || 'Permanent'],
        [""],
        ["--- SCORE BREAKDOWN ---"],
        ["Area", "Max Points", "Points Earned"],
        ...areas.map(area => [
          `"${area.title}"`,
          area.max, 
          area.current
        ]),
        [""],
        ["TOTAL POINTS:", "", totalPoints.toFixed(2)],
        [""],
        ["--- QUALIFICATIONS ---"],
        ["Experience:", "QUALIFIED FOR PROFESSOR I - V"],
        ["Teaching Performance:", "QUALIFIED FOR PROFESSOR I - V"],
        ["Research Output:", "NOT QUALIFIED"],
        ["Eligibility:", "NOT QUALIFIED"],
      ];

      const csvContent = rows.map(e => e.join(",")).join("\n");
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `${fullName.replace(/\s+/g, '_')}_Evaluation.csv`);
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating download", error);
      alert("Failed to download file.");
    } finally {
      setDownloading(false);
    }
  };

  if (!faculty) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
      />

      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative bg-[#f8fafc] w-full max-w-5xl h-[95vh] md:h-[90vh] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col z-10"
      >
        <button onClick={onClose} className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 hover:bg-slate-200 rounded-full transition-colors z-20 bg-white/80 backdrop-blur shadow-sm">
          <X size={20} className="text-slate-500 sm:w-6 sm:h-6" />
        </button>

        {/* Responsive Layout Core: 
          Scrolls as a single column on mobile (overflow-y-auto).
          Splits into two independently scrolling columns on desktop (md:flex-row md:overflow-hidden).
        */}
        <div className="flex flex-col md:flex-row flex-1 overflow-y-auto md:overflow-hidden">
          
          {/* Left Side: Profile Info */}
          <div className="w-full md:w-5/12 p-5 sm:p-8 md:p-10 md:overflow-y-auto border-b md:border-b-0 md:border-r border-slate-200 bg-white shrink-0">
            <div className="flex items-center gap-3 mb-6 sm:mb-8 mt-2 sm:mt-0">
              <div className="p-2 text-[#0a5e2f]">
                <User size={24} />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-800 pr-8">Faculty Information</h3>
            </div>

            <div className="space-y-6 sm:space-y-8">
              {/* Personal Details */}
              <section>
                <h4 className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-4 border-b border-slate-100 pb-2">
                  <User size={16} className="text-slate-400" /> Personal Details
                </h4>
                <div className="grid grid-cols-1 gap-y-4">
                  <div>
                    <p className="text-[11px] text-slate-400 font-semibold mb-1">Name</p>
                    <p className="text-sm font-semibold text-slate-800 break-words">{loading ? 'Loading...' : fullName}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400 font-semibold mb-1">Department</p>
                    <p className="text-sm font-semibold text-slate-800 break-words">{loading ? 'Loading...' : departmentName}</p>
                  </div>
                </div>
              </section>

              {/* Employment Status */}
              <section>
                <h4 className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-4 border-b border-slate-100 pb-2">
                  <Briefcase size={16} className="text-slate-400" /> Employment Status
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-4">
                  <div>
                    <p className="text-[11px] text-slate-400 font-semibold mb-1">Present Rank</p>
                    <p className="text-sm font-semibold text-slate-800">
                      {fullUserData?.current_rank || appData?.current_rank_at_time || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400 font-semibold mb-1">Nature of Appointment</p>
                    <p className="text-sm font-semibold text-slate-800">
                      {fullUserData?.nature_of_appointment || 'Permanent'}
                    </p>
                  </div>                
                </div>
              </section>

              {/* Educational Attainment */}
              <section>
                <h4 className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-4 border-b border-slate-100 pb-2">
                  <GraduationCap size={16} className="text-slate-400" /> Educational Attainment
                </h4>
                <div className="space-y-3">
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <p className="text-sm font-semibold text-slate-800 break-words">
                      {fullUserData?.educational_attainment || 'No data provided'}
                    </p>
                  </div>
                </div>
              </section>

              {/* Experience & Rating */}
              <section>
                <h4 className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-4 border-b border-slate-100 pb-2">
                  <Award size={16} className="text-slate-400" /> Experience & Rating
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-4">
                  <div>
                    <p className="text-[11px] text-slate-400 font-semibold mb-1">Teaching Exp.</p>
                    <p className="text-sm font-semibold text-slate-800">
                      {fullUserData?.teaching_experience_years || 0} years
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400 font-semibold mb-1">Industry Exp.</p>
                    <p className="text-sm font-semibold text-slate-800">
                      {fullUserData?.industry_experience_years || 0} years
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400 font-semibold mb-1">Performance Rating</p>
                    <p className="text-sm font-semibold text-slate-800">N/A</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400 font-semibold mb-1">Rating Description</p>
                    <p className="text-sm font-semibold text-slate-800">N/A</p>
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* Right Side: Submitted Areas & Qualification */}
          <div className="w-full md:flex-1 p-5 sm:p-8 md:p-10 md:overflow-y-auto bg-white flex flex-col relative min-h-[500px] md:min-h-0">
            
            {loading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-10 backdrop-blur-sm rounded-b-2xl md:rounded-r-2xl md:rounded-bl-none">
                <Loader2 className="animate-spin text-[#0a5e2f] mb-4" size={32} />
                <p className="text-sm font-bold text-slate-500">Loading data...</p>
              </div>
            )}

            <div className="mb-8 md:mb-10">
              <h3 className="text-sm md:text-base font-bold text-slate-800 uppercase tracking-wide mb-4 md:mb-6">Submitted Areas</h3>
              <div className="space-y-4 md:space-y-6">
                {areas.length > 0 ? areas.map((area, idx) => (
                  <div key={idx} className="group">
                    <div className="flex justify-between items-end mb-2">
                      <div className="flex-1 pr-4 md:pr-6">
                        <p className="text-xs font-bold text-slate-700 leading-tight mb-1">{area.title}</p>
                        <p className="text-[10px] text-slate-400 font-medium">Max: {area.max.toFixed(2)} pts <span className="text-yellow-500 ml-1">+0 excess</span></p>
                      </div>
                      <div className="text-right flex flex-col items-end shrink-0">
                        <span className="text-sm font-bold text-[#0a5e2f]">{area.current.toFixed(2)}</span>
                        {area.fileUrl ? (
                          <a href={area.fileUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] font-semibold text-[#0a5e2f] hover:underline mt-1">
                            view file
                          </a>
                        ) : (
                          <span className="text-[11px] font-medium text-slate-300 mt-1">No file</span>
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
                )) : (
                  <p className="text-sm text-slate-500 italic">No areas available.</p>
                )}
              </div>
            </div>

            {/* Bottom Actions Section */}
            <div className="mt-auto border-t border-slate-200 pt-6">
              <div className="flex justify-between items-center mb-6 md:mb-8">
                <span className="text-sm font-bold text-slate-800">TOTAL POINTS:</span>
                <div className="text-right flex flex-col sm:block">
                  <span className="text-[10px] text-slate-400 sm:mr-4 mb-1 sm:mb-0">Max: 200.00 pts</span>
                  <span className="text-base font-bold text-[#0a5e2f]">{totalPoints.toFixed(2)}</span>
                </div>
              </div>

              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4">Qualification</h3>
              <div className="space-y-3 mb-6 md:mb-8 bg-slate-50 p-4 md:p-5 rounded-2xl border border-slate-100">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
                  <span className="text-xs font-semibold text-slate-600 uppercase">Experience</span>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="text-[11px] sm:text-xs text-slate-500">QUALIFIED FOR PROFESSOR I - V</span>
                    <CheckCircle2 className="text-[#0a5e2f] shrink-0" size={16} />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
                  <span className="text-xs font-semibold text-slate-600 uppercase">Teaching Performance</span>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="text-[11px] sm:text-xs text-slate-500">QUALIFIED FOR PROFESSOR I - V</span>
                    <CheckCircle2 className="text-[#0a5e2f] shrink-0" size={16} />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
                  <span className="text-xs font-semibold text-slate-600 uppercase">Research Output</span>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="text-[11px] sm:text-xs text-slate-500">NOT QUALIFIED</span>
                    <XCircle className="text-red-500 shrink-0" size={16} />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
                  <span className="text-xs font-semibold text-slate-600 uppercase">Eligibility</span>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="text-[11px] sm:text-xs text-slate-500">NOT QUALIFIED</span>
                    <XCircle className="text-red-500 shrink-0" size={16} />
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS: Stack on small screens, side-by-side on larger */}
              <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4">
                <button 
                  onClick={handleDownloadResult}
                  disabled={downloading || loading}
                  className="w-full sm:flex-1 py-3.5 bg-[#3b82f6] text-white text-xs font-bold uppercase tracking-wide rounded-xl hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {downloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                  Download Result
                </button>
                <button 
                  onClick={handleCompleteReview}
                  disabled={updating || loading}
                  className="w-full sm:flex-1 py-3.5 bg-[#0a5e2f] text-white text-xs font-bold uppercase tracking-wide rounded-xl hover:bg-[#084b25] transition-colors shadow-lg shadow-[#0a5e2f]/20 flex items-center justify-center gap-2 disabled:opacity-50"
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