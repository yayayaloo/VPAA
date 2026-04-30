import { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import {
  Search,
  Filter,
  Users,
  FileText,
  Eye,
  Loader2,
  Send,
  File,
  CheckCircle,
  Download,
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import FacultyDetailModal from '../components/FacultyDetailModal';
import ConfirmationModal from '../components/ConfirmationModal';
import Toast from '../components/Toast';
import { apiService } from '../services/api';

export interface Faculty {
  id: string;
  application_id: string;
  ranking: number;
  name: string;
  department: string;
  currentPosition: string;
  appliedPosition: string;
  points: string;
  rawPoints: number;
  status: string;
  documentUrl?: string;
  originalData?: Record<string, unknown>;
}

const FacultyReviewPage = () => {
  const [facultyData, setFacultyData] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submittingResult, setSubmittingResult] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadingCsv, setDownloadingCsv] = useState(false);
  const [reviewingFacultyId, setReviewingFacultyId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All');

  useEffect(() => {
    const fetchFacultyForActiveCycle = async () => {
      try {
        setLoading(true);

        const { data: cycleSnap, error: cycleError } = await supabase
          .from('ranking_cycles')
          .select('cycle_id')
          .eq('status', 'open')
          .limit(1);

        if (cycleError) {
          throw cycleError;
        }

        if (!cycleSnap || cycleSnap.length === 0) {
          setFacultyData([]);
          return;
        }

        const activeCycleId = cycleSnap[0].cycle_id;

        const { data: appsSnap, error: appsError } = await supabase
          .from('applications')
          .select('*')
          .eq('cycle_id', activeCycleId);

        if (appsError) {
          throw appsError;
        }

        const facultyPromises = (appsSnap || []).map(async (appData) => {
          let facultyName = 'UNKNOWN FACULTY';
          let department = 'Not specified';
          let currentPos = appData.current_rank_at_time || 'Not specified';
          let appliedPos = 'Not specified';

          const userId = appData.faculty_id;

          if (appData.target_position_id) {
            const { data: posData } = await supabase
              .from('positions')
              .select('position_name')
              .eq('position_id', appData.target_position_id)
              .single();

            if (posData) {
              appliedPos = posData.position_name;
            }
          }

          if (userId) {
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('*')
              .eq('user_id', userId)
              .single();

            if (!userError && userData) {
              facultyName = `${userData.name_last || ''}, ${userData.name_first || ''}`.replace(
                /^, | ,$/g,
                ''
              );

              if (currentPos === 'Not specified' && userData.current_rank) {
                currentPos = userData.current_rank;
              }

              if (userData.department_id) {
                const { data: deptData } = await supabase
                  .from('departments')
                  .select('department_name')
                  .eq('department_id', userData.department_id)
                  .single();

                if (deptData) {
                  department = deptData.department_name;
                }
              }
            }
          }

          const rawPts = Number(appData.final_score || 0);

          let displayStatus = appData.status || 'Draft';
          if (['Approved_Unpublished', 'Published', 'Reviewed'].includes(appData.status)) {
            displayStatus = 'Reviewed';
          } else if (appData.status === 'Pending_VPAA') {
            displayStatus = 'Under Review';
          }

          return {
            id: String(userId || appData.application_id),
            application_id: String(appData.application_id),
            ranking: 0,
            name: facultyName.toUpperCase(),
            department,
            currentPosition: currentPos,
            appliedPosition: appliedPos,
            points: `${rawPts.toFixed(2)}/200`,
            rawPoints: rawPts,
            status: displayStatus,
            documentUrl:
              appData.documentUrl || appData.document_url || appData.file_url || appData.file_path,
            originalData: { ...appData },
          };
        });

        let fetchedFaculty = await Promise.all(facultyPromises);

        fetchedFaculty = fetchedFaculty
          .sort((firstFaculty, secondFaculty) => secondFaculty.rawPoints - firstFaculty.rawPoints)
          .map((faculty, index) => ({
            ...faculty,
            ranking: index + 1,
          }));

        setFacultyData(fetchedFaculty);
      } catch (fetchError) {
        console.error('Error fetching faculty applications:', fetchError);
        setToast({ message: 'Failed to load faculty data.', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchFacultyForActiveCycle();
  }, []);

  const stats = [
    {
      label: 'Under Review',
      value: facultyData.filter(
        (faculty) => faculty.status.toLowerCase().includes('review') && faculty.status !== 'Reviewed'
      ).length,
      sub: 'Pending VPAA Evaluation',
      icon: <Users className="text-emerald-600" />,
    },
    {
      label: 'Reviewed',
      value: facultyData.filter((faculty) => faculty.status === 'Reviewed').length,
      sub: 'Approved Applications',
      icon: <Users className="text-emerald-600" />,
    },
    {
      label: 'Total Faculty',
      value: facultyData.length,
      sub: 'Current Cycle Applicants',
      icon: <FileText className="text-emerald-600" />,
    },
  ];

  const openModal = (faculty: Faculty) => {
    setSelectedFaculty(faculty);
    setIsModalOpen(true);
  };

  const handleSubmitFinalResult = async () => {
    try {
      setSubmittingResult(true);

      const response = await apiService.submitFinalResult();

      if (response.error) {
        throw new Error(response.error);
      }

      setToast({ message: 'Final result submitted successfully!', type: 'success' });
      setShowSubmitModal(false);
    } catch (submitError) {
      const message =
        submitError instanceof Error ? submitError.message : 'Failed to submit final result.';

      setToast({ message, type: 'error' });
    } finally {
      setSubmittingResult(false);
    }
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPdf = async () => {
    try {
      setDownloadingPdf(true);

      const doc = new jsPDF();
      const generatedAt = new Date().toLocaleString();

      doc.setFontSize(18);
      doc.text('Faculty Review Results', 14, 18);
      doc.setFontSize(10);
      doc.text(`Generated: ${generatedAt}`, 14, 26);

      let yPosition = 36;
      doc.setFontSize(11);
      doc.text('Name', 14, yPosition);
      doc.text('Ranking', 100, yPosition);
      doc.text('Score', 130, yPosition);
      doc.text('Department', 155, yPosition);
      yPosition += 6;
      doc.line(14, yPosition, 196, yPosition);
      yPosition += 8;

      facultyData.forEach((faculty) => {
        if (yPosition > 275) {
          doc.addPage();
          yPosition = 20;
        }

        doc.text(faculty.name, 14, yPosition, { maxWidth: 80 });
        doc.text(String(faculty.ranking), 100, yPosition);
        doc.text(faculty.points, 130, yPosition);
        doc.text(faculty.department, 155, yPosition, { maxWidth: 40 });
        yPosition += 10;
      });

      doc.save(`faculty-review-${new Date().toISOString().slice(0, 10)}.pdf`);
      setToast({ message: 'PDF downloaded successfully.', type: 'success' });
    } catch (pdfError) {
      console.error('Failed to generate PDF:', pdfError);
      setToast({ message: 'Failed to generate PDF.', type: 'error' });
    } finally {
      setDownloadingPdf(false);
    }
  };

  const escapeCsvValue = (value: string | number) => {
    const normalizedValue = String(value ?? '');
    return `"${normalizedValue.replace(/"/g, '""')}"`;
  };

  const handleDownloadCsv = async () => {
    try {
      setDownloadingCsv(true);

      const headers = ['name', 'ranking', 'score', 'department'];
      const rows = facultyData.map((faculty) =>
        [
          escapeCsvValue(faculty.name),
          escapeCsvValue(faculty.ranking),
          escapeCsvValue(faculty.points),
          escapeCsvValue(faculty.department),
        ].join(',')
      );

      const csv = [headers.join(','), ...rows].join('\n');
      downloadBlob(
        new Blob([csv], { type: 'text/csv;charset=utf-8;' }),
        `faculty-review-${new Date().toISOString().slice(0, 10)}.csv`
      );

      setToast({ message: 'CSV downloaded successfully.', type: 'success' });
    } catch (csvError) {
      console.error('Failed to generate CSV:', csvError);
      setToast({ message: 'Failed to generate CSV.', type: 'error' });
    } finally {
      setDownloadingCsv(false);
    }
  };

  const handleViewPDF = (faculty: Faculty) => {
    if (faculty.documentUrl) {
      window.open(faculty.documentUrl, '_blank');
      return;
    }

    setToast({ message: 'PDF document not available.', type: 'error' });
  };

  const handleReviewCompleted = async (facultyId: string) => {
    const previousFacultyData = facultyData;

    try {
      setReviewingFacultyId(facultyId);

      setFacultyData((currentFaculty) =>
        currentFaculty.map((faculty) =>
          faculty.id === facultyId ? { ...faculty, status: 'Reviewed' } : faculty
        )
      );

      const response = await apiService.markReviewComplete(facultyId);

      if (response.error) {
        throw new Error(response.error);
      }

      if (selectedFaculty?.id === facultyId) {
        setSelectedFaculty((currentFaculty) =>
          currentFaculty ? { ...currentFaculty, status: 'Reviewed' } : currentFaculty
        );
      }

      setToast({ message: 'Review marked as completed.', type: 'success' });
    } catch (reviewError) {
      console.error('Failed to mark review as completed:', reviewError);
      setFacultyData(previousFacultyData);
      setToast({ message: 'Failed to mark review as completed.', type: 'error' });
    } finally {
      setReviewingFacultyId(null);
    }
  };

  const hideToast = () => {
    setToast(null);
  };

  const uniqueDepartments = ['All', ...Array.from(new Set(facultyData.map((faculty) => faculty.department)))];

  const filteredFaculty = facultyData.filter((faculty) => {
    const matchesSearch =
      faculty.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faculty.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment =
      selectedDepartment === 'All' || faculty.department === selectedDepartment;

    return matchesSearch && matchesDepartment;
  });

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center flex-col gap-4">
        <Loader2 className="animate-spin text-emerald-600" size={40} />
        <p className="text-sm font-semibold text-slate-500 animate-pulse">
          Loading active cycle and faculty data...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow"
          >
            <div className="flex-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                {stat.label}
              </p>
              <h4 className="text-3xl font-black text-slate-800 mb-1">{stat.value}</h4>
              <p className="text-[10px] text-slate-500 font-medium">{stat.sub}</p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl">{stat.icon}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowSubmitModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20"
          >
            <Send size={16} />
            Submit Final Result
          </button>
          <button
            onClick={handleDownloadPdf}
            disabled={downloadingPdf}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-xl hover:bg-red-700 transition-all disabled:opacity-50"
          >
            {downloadingPdf ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
            Download PDF
          </button>
          <button
            onClick={handleDownloadCsv}
            disabled={downloadingCsv}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700 transition-all disabled:opacity-50"
          >
            {downloadingCsv ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            Download CSV
          </button>
        </div>
      </div>

      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-8 pb-4">
          <h3 className="text-2xl font-black text-slate-800 mb-1">Faculty List</h3>
          <p className="text-sm text-slate-500 font-medium mb-8">
            View and manage faculty information and submissions
          </p>

          <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search faculty by name or department..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
              />
            </div>

            <div className="relative">
              <select
                value={selectedDepartment}
                onChange={(event) => setSelectedDepartment(event.target.value)}
                className="appearance-none flex items-center gap-3 pl-6 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
              >
                {uniqueDepartments.map((department) => (
                  <option key={department} value={department}>
                    {department === 'All' ? 'All Departments' : department}
                  </option>
                ))}
              </select>
              <Filter
                size={16}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="border-y border-slate-100 bg-slate-50/50">
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Ranking
                </th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Faculty
                </th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Positions (Current / Applied)
                </th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Department
                </th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Total Points
                </th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Status
                </th>
                <th
                  className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center"
                  colSpan={2}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredFaculty.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-8 py-12 text-center text-sm font-medium text-slate-500">
                    No faculty applications found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredFaculty.map((faculty) => (
                  <tr key={faculty.application_id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-8 py-5 text-sm font-bold text-slate-400">#{faculty.ranking}</td>
                    <td className="px-8 py-5 text-[11px] font-black text-slate-700 tracking-tight">
                      {faculty.name}
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col gap-1">
                        <span className="text-[11px] font-medium text-slate-400">
                          <span className="font-semibold text-slate-500">Current:</span>{' '}
                          {faculty.currentPosition}
                        </span>
                        <span className="text-[11px] font-medium text-emerald-600">
                          <span className="font-semibold text-emerald-700">Applying:</span>{' '}
                          {faculty.appliedPosition}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-[11px] font-bold text-slate-500">{faculty.department}</td>
                    <td className="px-8 py-5 text-[11px] font-bold text-slate-500">{faculty.points}</td>
                    <td className="px-8 py-5">
                      <span
                        className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter border ${
                          faculty.status === 'Reviewed'
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                            : faculty.status === 'Under Review'
                              ? 'bg-amber-50 text-amber-600 border-amber-100'
                              : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}
                      >
                        {faculty.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-5">
                      <div className="flex justify-center">
                        <button
                          onClick={() => openModal(faculty)}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                          title="View Details"
                        >
                          <Eye size={20} />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-5">
                      <div className="flex gap-1 justify-center">
                        <button
                          onClick={() => handleViewPDF(faculty)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="View PDF"
                        >
                          <File size={18} />
                        </button>
                        {faculty.status !== 'Reviewed' ? (
                          <button
                            onClick={() => handleReviewCompleted(faculty.id)}
                            disabled={reviewingFacultyId === faculty.id}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all disabled:opacity-50"
                            title="Mark as Reviewed"
                          >
                            {reviewingFacultyId === faculty.id ? (
                              <Loader2 size={18} className="animate-spin" />
                            ) : (
                              <CheckCircle size={18} />
                            )}
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {isModalOpen && selectedFaculty ? (
        <FacultyDetailModal
          faculty={selectedFaculty}
          onClose={() => setIsModalOpen(false)}
          onStatusUpdate={handleReviewCompleted}
        />
      ) : null}

      <ConfirmationModal
        isOpen={showSubmitModal}
        title="Submit Final Result"
        message="Are you sure you want to submit the final result?"
        confirmText="Submit"
        onConfirm={handleSubmitFinalResult}
        onCancel={() => setShowSubmitModal(false)}
        loading={submittingResult}
        type="warning"
      />

      {toast ? <Toast message={toast.message} type={toast.type} onClose={hideToast} /> : null}
    </div>
  );
};

export default FacultyReviewPage;
