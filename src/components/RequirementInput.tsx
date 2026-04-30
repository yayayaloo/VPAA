import React, { useRef } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import type { Requirement, RequirementFile } from '../pages/EvaluationToolPage';
import FileDisplay from './FileDisplay';

interface RequirementInputProps {
  requirement: Requirement;
  isReadOnly: boolean;
  onAddFiles: (files: RequirementFile[]) => void;
  onRemoveFile: (fileId: string) => void;
}

const RequirementInput: React.FC<RequirementInputProps> = ({
  requirement,
  isReadOnly,
  onAddFiles,
  onRemoveFile,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = React.useState<string>('');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const files = event.currentTarget.files;

    if (!files) return;

    // Check if adding new files would exceed the limit
    if (requirement.files.length + files.length > 10) {
      setError(`Maximum of 10 files only. You currently have ${requirement.files.length} file(s).`);
      return;
    }

    // Convert FileList to array and create RequirementFile objects
    const newFiles: RequirementFile[] = Array.from(files).map((file) => ({
      id: `${Date.now()}-${Math.random()}`,
      name: file.name,
      size: file.size,
      type: file.type || 'unknown',
      uploadedAt: new Date().toLocaleString(),
    }));

    onAddFiles(newFiles);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return '📄';
    if (type.includes('image')) return '🖼️';
    if (type.includes('word')) return '📝';
    if (type.includes('sheet')) return '📊';
    if (type.includes('zip') || type.includes('rar')) return '📦';
    return '📎';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
      {/* Requirement Label */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-bold text-slate-700">{requirement.name}</label>
        <span className="text-xs font-bold text-slate-500 bg-slate-200 px-2.5 py-1 rounded-full">
          {requirement.files.length} / 10
        </span>
      </div>

      {/* File Upload Area */}
      {!isReadOnly && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            accept="*/*"
            disabled={requirement.files.length >= 10}
          />

          <button
            onClick={handleUploadClick}
            disabled={requirement.files.length >= 10 || isReadOnly}
            className={`w-full py-3 px-4 border-2 border-dashed rounded-lg transition-all flex items-center justify-center gap-2 font-bold text-sm ${
              requirement.files.length >= 10
                ? 'border-red-300 bg-red-50 text-red-600 cursor-not-allowed'
                : 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            <Upload size={16} />
            {requirement.files.length >= 10 ? 'Limit Reached (10/10)' : 'Click to Upload Files'}
          </button>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle size={14} className="text-red-600 flex-shrink-0" />
              <p className="text-xs font-medium text-red-700">{error}</p>
            </div>
          )}
        </>
      )}

      {/* File List */}
      {requirement.files.length > 0 && (
        <div className="space-y-2 mt-4">
          <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Uploaded Files:</p>
          {requirement.files.map(file => (
            <FileDisplay
              key={file.id}
              file={file}
              icon={getFileIcon(file.type)}
              fileSize={formatFileSize(file.size)}
              isReadOnly={isReadOnly}
              onRemove={() => onRemoveFile(file.id)}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {requirement.files.length === 0 && isReadOnly && (
        <div className="text-center py-4">
          <FileText size={24} className="mx-auto text-slate-300 mb-2" />
          <p className="text-xs text-slate-500">No files uploaded</p>
        </div>
      )}
    </div>
  );
};

export default RequirementInput;