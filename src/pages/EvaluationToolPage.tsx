import { useState } from 'react';
import { Send, Eye, EyeOff, AlertCircle } from 'lucide-react';
import EvaluationSection from '../components/EvaluationSection';

export interface RequirementFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
}

export interface Requirement {
  id: string;
  name: string;
  files: RequirementFile[];
}

export interface EvaluationSection {
  id: string;
  name: string;
  requirements: Requirement[];
}

const mockSections: EvaluationSection[] = [
  {
    id: 'masters-degree',
    name: "Master's Degree",
    requirements: [
      { id: 'masters-diploma', name: 'Diploma', files: [] },
      { id: 'masters-tor', name: 'Transcript of Records (TOR)', files: [] },
      { id: 'masters-cert', name: 'Certificate of Completion', files: [] },
    ],
  },
  {
    id: 'doctoral-degree',
    name: 'Doctoral Degree',
    requirements: [
      { id: 'doctoral-diploma', name: 'Diploma', files: [] },
      { id: 'doctoral-tor', name: 'Transcript of Records (TOR)', files: [] },
      { id: 'doctoral-diss', name: 'Dissertation/Thesis', files: [] },
    ],
  },
  {
    id: 'other-quals',
    name: 'Other Qualifications',
    requirements: [
      { id: 'other-certs', name: 'Certifications', files: [] },
      { id: 'other-training', name: 'Professional Training', files: [] },
      { id: 'other-publish', name: 'Publications', files: [] },
    ],
  },
];

const EvaluationToolPage = () => {
  const [sections, setSections] = useState<EvaluationSection[]>(mockSections);
  const [isEvaluatorView, setIsEvaluatorView] = useState(false);

  const handleAddFiles = (sectionId: string, requirementId: string, newFiles: RequirementFile[]) => {
    setSections(prev =>
      prev.map(section =>
        section.id === sectionId
          ? {
              ...section,
              requirements: section.requirements.map(req =>
                req.id === requirementId
                  ? { ...req, files: [...req.files, ...newFiles] }
                  : req
              ),
            }
          : section
      )
    );
  };

  const handleRemoveFile = (sectionId: string, requirementId: string, fileId: string) => {
    setSections(prev =>
      prev.map(section =>
        section.id === sectionId
          ? {
              ...section,
              requirements: section.requirements.map(req =>
                req.id === requirementId
                  ? { ...req, files: req.files.filter(f => f.id !== fileId) }
                  : req
              ),
            }
          : section
      )
    );
  };

  const handleSubmit = () => {
    const submissionData = sections.map(section => ({
      section: section.name,
      requirements: section.requirements.map(req => ({
        requirement: req.name,
        files: req.files.map(file => ({
          name: file.name,
          size: file.size,
          type: file.type,
          uploadedAt: file.uploadedAt,
        })),
      })),
    }));

    console.log('=== EVALUATION SUBMISSION ===');
    console.log(JSON.stringify(submissionData, null, 2));
    alert('Submission logged to console. Check browser console for details.');
  };

  const getTotalFiles = () => {
    return sections.reduce(
      (total, section) =>
        total + section.requirements.reduce((sum, req) => sum + req.files.length, 0),
      0
    );
  };

  const getMaxPossibleFiles = () => {
    return sections.reduce(
      (total, section) => total + section.requirements.length * 10,
      0
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-500 via-red-400 to-orange-400 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="mb-8 flex flex-col items-center">
          <img src="/assets/gc-logo.png" alt="Gordon College Logo" className="w-16 h-16 mb-4" />
          <h2 className="text-base font-bold text-white tracking-tight">GORDON COLLEGE</h2>
          <p className="text-[9px] uppercase tracking-[0.2em] text-white/80 font-bold mb-6">VPAA RANKING PORTAL</p>

          <h3 className="text-3xl font-bold text-white mb-2">Educational Evaluation Tool</h3>
          <p className="text-white/90 text-sm">Submit and manage your educational documents</p>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header with View Toggle */}
          <div className="bg-gradient-to-r from-emerald-50 to-emerald-50 p-6 border-b border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-lg font-bold text-slate-800">Document Submission</h4>
                <p className="text-sm text-slate-600">
                  Total files: <span className="font-bold text-emerald-600">{getTotalFiles()} / {getMaxPossibleFiles()}</span>
                </p>
              </div>
              <button
                onClick={() => setIsEvaluatorView(!isEvaluatorView)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                  isEvaluatorView
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                {isEvaluatorView ? (
                  <>
                    <Eye size={16} />
                    Evaluator View
                  </>
                ) : (
                  <>
                    <EyeOff size={16} />
                    Faculty View
                  </>
                )}
              </button>
            </div>

            {isEvaluatorView && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <AlertCircle size={16} className="text-blue-600 flex-shrink-0" />
                <p className="text-sm text-blue-700">
                  <strong>Evaluator Mode:</strong> Viewing all submitted documents. Uploads are disabled.
                </p>
              </div>
            )}
          </div>

          {/* Sections */}
          <div className="p-8 space-y-6">
            {sections.map(section => (
              <EvaluationSection
                key={section.id}
                section={section}
                isReadOnly={isEvaluatorView}
                onAddFiles={handleAddFiles}
                onRemoveFile={handleRemoveFile}
              />
            ))}
          </div>

          {/* Footer with Submit Button */}
          <div className="bg-slate-50 p-6 border-t border-slate-200 flex justify-end gap-4">
            <button
              onClick={() => setIsEvaluatorView(false)}
              className="px-6 py-2 bg-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-300 transition-all"
            >
              Reset View
            </button>
            <button
              onClick={handleSubmit}
              disabled={getTotalFiles() === 0 || isEvaluatorView}
              className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={16} />
              Submit All Documents
            </button>
          </div>
        </div>

        {/* Info Footer */}
        <div className="mt-8 text-center text-white/80 text-xs font-medium">
          © 2026 Gordon College. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default EvaluationToolPage;
