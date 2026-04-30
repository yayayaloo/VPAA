import React from 'react';
import { ChevronUp } from 'lucide-react';
import { useState } from 'react';
import RequirementInput from './RequirementInput';
import type { EvaluationSection as EvaluationSectionType } from '../pages/EvaluationToolPage';

interface EvaluationSectionProps {
  section: EvaluationSectionType;
  isReadOnly: boolean;
  onAddFiles: (sectionId: string, requirementId: string, files: any[]) => void;
  onRemoveFile: (sectionId: string, requirementId: string, fileId: string) => void;
}

const EvaluationSection: React.FC<EvaluationSectionProps> = ({
  section,
  isReadOnly,
  onAddFiles,
  onRemoveFile,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const totalFiles = section.requirements.reduce((sum, req) => sum + req.files.length, 0);
  const maxFiles = section.requirements.length * 10;

  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
      {/* Section Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full bg-gradient-to-r from-slate-100 to-slate-50 p-5 flex items-center justify-between hover:from-slate-200 hover:to-slate-100 transition-colors"
      >
        <div className="flex items-center gap-4 text-left flex-1">
          <div className="bg-emerald-100 p-3 rounded-lg">
            <span className="text-emerald-600 font-bold text-lg">{section.requirements.length}</span>
          </div>
          <div>
            <h5 className="text-lg font-bold text-slate-800">{section.name}</h5>
            <p className="text-sm text-slate-600">
              {totalFiles} / {maxFiles} files uploaded
            </p>
          </div>
        </div>
        <div
          className={`text-slate-400 transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
        >
          <ChevronUp size={20} />
        </div>
      </button>

      {/* Section Content */}
      {isExpanded && (
        <div className="p-6 bg-white space-y-5 border-t border-slate-100">
          {section.requirements.map(requirement => (
            <RequirementInput
              key={requirement.id}
              requirement={requirement}
              isReadOnly={isReadOnly}
              onAddFiles={(files) => onAddFiles(section.id, requirement.id, files)}
              onRemoveFile={(fileId) => onRemoveFile(section.id, requirement.id, fileId)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default EvaluationSection;