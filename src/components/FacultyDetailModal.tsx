import { X, User, Briefcase, GraduationCap, Award, CheckCircle2, AlertCircle, Download } from 'lucide-react';
import { motion } from 'framer-motion';

interface FacultyDetailModalProps {
  faculty: any;
  onClose: () => void;
}

const FacultyDetailModal = ({ faculty, onClose }: FacultyDetailModalProps) => {
  if (!faculty) return null;

  const areas = [
    { title: 'AREA I: Educational Qualifications', max: 80, current: 50, color: 'bg-primary' },
    { title: 'AREA II: Research and Publications', max: 30, current: 10, color: 'bg-primary' },
    { title: 'AREA III: Teaching Experience and Professional Services', max: 20, current: 18, color: 'bg-primary' },
    { title: 'AREA IV: Performance Evaluation', max: 10, current: 8, color: 'bg-primary' },
    { title: 'AREA V: Training and Seminars', max: 20, current: 11, color: 'bg-primary' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-sidebar/40 backdrop-blur-sm"
      />

      {/* Modal Content */}
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative bg-white w-full max-w-5xl h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors z-10"
        >
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
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Name</p>
                    <p className="text-[13px] font-bold text-slate-700">Jenkins, Sarah A.</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Department</p>
                    <p className="text-[13px] font-bold text-slate-700">CCS</p>
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
                    <p className="text-[13px] font-bold text-slate-700">Instructor II</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Nature of Appointment</p>
                    <p className="text-[13px] font-bold text-slate-700">Permanent</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Current Salary</p>
                    <p className="text-[13px] font-bold text-slate-700">₱45,000.00</p>
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
                    <p className="text-[13px] font-bold text-slate-700">Bachelor's in Computer Science</p>
                    <p className="text-[11px] text-slate-400 font-medium">State University</p>
                  </div>
                  <div className="p-4 bg-white border border-slate-200 rounded-xl">
                    <p className="text-[13px] font-bold text-slate-700">Master's in Computer Science</p>
                    <p className="text-[11px] text-slate-400 font-medium">Tech Institute</p>
                  </div>
                </div>
              </section>

              {/* Eligibility & Exams */}
              <section>
                <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">
                  <Award size={14} /> Eligibility & Exams
                </h4>
                <p className="text-[13px] font-bold text-slate-700">Civil Service Professional</p>
              </section>
            </div>
          </div>

          {/* Right Side: Submitted Areas & Qualification */}
          <div className="flex-1 p-10 overflow-y-auto bg-white flex flex-col">
            <div className="mb-10">
              <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight mb-8">Submitted Areas</h3>
              <div className="space-y-6">
                {areas.map((area, idx) => (
                  <div key={idx} className="group">
                    <div className="flex justify-between items-end mb-2">
                      <div className="flex-1 pr-10">
                        <p className="text-[11px] font-black text-slate-700 leading-tight mb-1">{area.title}</p>
                        <p className="text-[10px] text-slate-400 font-medium">Max: {area.max.toFixed(2)} pts <span className="text-emerald-500 ml-1">+0 excess</span></p>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-black text-slate-800">{area.current.toFixed(2)}</span>
                        <button className="block text-[10px] font-bold text-primary hover:underline mt-1">view PDF</button>
                      </div>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(area.current / area.max) * 100}%` }}
                        className={`h-full ${area.color} rounded-full`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-auto pt-10 border-t border-slate-100">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6">Qualification</h3>
              <div className="space-y-4 mb-10">
                <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Experience</p>
                    <p className="text-[11px] font-bold text-slate-600">QUALIFIED FOR PROFESSOR I - V</p>
                  </div>
                  <CheckCircle2 className="text-emerald-500" size={20} />
                </div>
                <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Teaching Performance</p>
                    <p className="text-[11px] font-bold text-slate-600">QUALIFIED FOR PROFESSOR I - V</p>
                  </div>
                  <CheckCircle2 className="text-emerald-500" size={20} />
                </div>
                <div className="flex justify-between items-center bg-red-50/30 p-4 rounded-xl border border-red-100">
                  <div>
                    <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">Research Output</p>
                    <p className="text-[11px] font-bold text-red-600">NOT QUALIFIED</p>
                  </div>
                  <AlertCircle className="text-red-500" size={20} />
                </div>
              </div>

              <div className="flex gap-4">
                <button className="flex-1 py-3 border-2 border-primary text-primary text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-primary/5 transition-all flex items-center justify-center gap-2">
                  <Download size={16} />
                  Download Result
                </button>
                <button className="flex-1 py-3 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/20">
                  Review Completed
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
