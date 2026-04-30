import React from 'react';
import { X } from 'lucide-react';
import type { RequirementFile } from '../pages/EvaluationToolPage';

interface FileDisplayProps {
  file: RequirementFile;
  icon: string;
  fileSize: string;
  isReadOnly: boolean;
  onRemove: () => void;
}

const FileDisplay: React.FC<FileDisplayProps> = ({
  file,
  icon,
  fileSize,
  isReadOnly,
  onRemove,
}) => {
  return (
    <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg hover:shadow-sm transition-shadow">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <span className="text-lg flex-shrink-0">{icon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-700 truncate" title={file.name}>
            {file.name}
          </p>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
            <span>{fileSize}</span>
            <span>•</span>
            <span>{file.uploadedAt}</span>
          </div>
        </div>
      </div>

      {!isReadOnly && (
        <button
          onClick={onRemove}
          className="ml-3 p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-all flex-shrink-0"
          title="Remove file"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default FileDisplay;