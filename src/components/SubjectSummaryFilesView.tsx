import React, { useState, useMemo, useRef } from 'react';
import {
  FileText,
  Image as ImageIcon,
  BookOpen,
  Eye,
  Download,
  Trash2,
  Edit2,
  Calendar,
  Timer,
  Search,
  Plus,
  X,
  Upload,
  Clock,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Layers,
  ArrowUpDown,
  Filter,
  File,
  RotateCcw,
} from 'lucide-react';
import { useGrade } from '../context/GradeContext';
import { Subject, SubjectSummaryFile, SummaryFileType } from '../types';
import {
  formatFileSize,
  formatSummaryThaiDate,
  getFileTypeLabel,
  validateSummaryFile,
  triggerFileDownload,
  getBlobCache,
  MAX_SUMMARY_FILE_SIZE_BYTES,
} from '../utils/summaryStorage';
import { getSubjectColor } from '../utils/colorUtils';

interface SubjectSummaryFilesViewProps {
  subject: Subject;
  onNavigateToStudy?: () => void;
  onBackToOverview?: () => void;
}

type FilterType = 'all' | SummaryFileType;
type SortType = 'newest' | 'oldest' | 'nameAsc' | 'nameDesc' | 'sizeDesc' | 'sizeAsc';

export const SubjectSummaryFilesView: React.FC<SubjectSummaryFilesViewProps> = ({
  subject,
  onNavigateToStudy,
  onBackToOverview,
}) => {
  const {
    userProfile,
    getSubjectSummaryFiles,
    uploadSummaryFile,
    updateSummaryFile,
    deleteSummaryFile,
    refreshSummaryFiles,
    startStudyForSubject,
    addPersonalEvent,
  } = useGrade();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('newest');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingFile, setEditingFile] = useState<SubjectSummaryFile | null>(null);
  const [deletingFile, setDeletingFile] = useState<SubjectSummaryFile | null>(null);
  const [previewFile, setPreviewFile] = useState<SubjectSummaryFile | null>(null);
  const [readingPlanFile, setReadingPlanFile] = useState<SubjectSummaryFile | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  // Get current files for this subject
  const allSubjectFiles = useMemo(() => {
    return getSubjectSummaryFiles(subject.id);
  }, [getSubjectSummaryFiles, subject.id]);

  // Filter & Search & Sort
  const processedFiles = useMemo(() => {
    let result = [...allSubjectFiles];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (f) =>
          f.fileName.toLowerCase().includes(q) ||
          f.originalFileName.toLowerCase().includes(q) ||
          (f.description && f.description.toLowerCase().includes(q)) ||
          getFileTypeLabel(f.fileType).toLowerCase().includes(q)
      );
    }

    // Filter by type
    if (selectedFilter !== 'all') {
      result = result.filter((f) => f.fileType === selectedFilter);
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === 'nameAsc') {
        return a.fileName.localeCompare(b.fileName, 'th');
      }
      if (sortBy === 'nameDesc') {
        return b.fileName.localeCompare(a.fileName, 'th');
      }
      if (sortBy === 'sizeDesc') {
        return b.fileSize - a.fileSize;
      }
      if (sortBy === 'sizeAsc') {
        return a.fileSize - b.fileSize;
      }
      return 0;
    });

    return result;
  }, [allSubjectFiles, searchQuery, selectedFilter, sortBy]);

  // File type helper for colors and icons
  const getFileVisual = (fileType: SummaryFileType) => {
    switch (fileType) {
      case 'pdf':
        return {
          icon: <BookOpen className="w-5 h-5 text-rose-600" />,
          bgColor: 'bg-rose-50 border-rose-200/80 text-rose-700',
          badgeBg: 'bg-rose-100/80 text-rose-700 border-rose-200',
          label: 'PDF',
        };
      case 'image':
        return {
          icon: <ImageIcon className="w-5 h-5 text-emerald-600" />,
          bgColor: 'bg-emerald-50 border-emerald-200/80 text-emerald-700',
          badgeBg: 'bg-emerald-100/80 text-emerald-700 border-emerald-200',
          label: 'รูปภาพ',
        };
      case 'doc':
        return {
          icon: <FileText className="w-5 h-5 text-blue-600" />,
          bgColor: 'bg-blue-50 border-blue-200/80 text-blue-700',
          badgeBg: 'bg-blue-100/80 text-blue-700 border-blue-200',
          label: 'Word',
        };
      case 'ppt':
        return {
          icon: <Layers className="w-5 h-5 text-amber-600" />,
          bgColor: 'bg-amber-50 border-amber-200/80 text-amber-700',
          badgeBg: 'bg-amber-100/80 text-amber-700 border-amber-200',
          label: 'PowerPoint',
        };
      case 'xls':
        return {
          icon: <FileText className="w-5 h-5 text-teal-600" />,
          bgColor: 'bg-teal-50 border-teal-200/80 text-teal-700',
          badgeBg: 'bg-teal-100/80 text-teal-700 border-teal-200',
          label: 'Excel',
        };
      case 'txt':
        return {
          icon: <FileText className="w-5 h-5 text-purple-600" />,
          bgColor: 'bg-purple-50 border-purple-200/80 text-purple-700',
          badgeBg: 'bg-purple-100/80 text-purple-700 border-purple-200',
          label: 'ข้อความ TXT',
        };
      default:
        return {
          icon: <File className="w-5 h-5 text-slate-600" />,
          bgColor: 'bg-slate-50 border-slate-200 text-slate-700',
          badgeBg: 'bg-slate-100 text-slate-700 border-slate-200',
          label: 'เอกสาร',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce-in max-w-md bg-white/95 backdrop-blur-md border border-pink-200 text-slate-800 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-pink-500 shrink-0" />
          <span className="text-xs sm:text-sm font-bold">{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-auto text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Header Card */}
      <div className="glass-card rounded-3xl p-5 sm:p-6 border border-white/80 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="w-9 h-9 rounded-2xl bg-pink-100/80 text-pink-700 flex items-center justify-center shadow-2xs border border-pink-200/60">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                📚 ไฟล์สรุป "{subject.name}"
              </h3>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full glass-secondary text-slate-700 border border-white/60">
                รหัส {subject.code}
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-pink-50 text-pink-700 border border-pink-200/80">
                {allSubjectFiles.length} ไฟล์
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              คลังเก็บไฟล์สรุป เอกสารประกอบการเรียน ชีทติว และสไลด์แยกตามรายวิชานี้โดยเฉพาะ
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2.5 app-theme-btn text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>＋ เพิ่มไฟล์สรุป</span>
            </button>
          </div>
        </div>

        {/* Search, Filter & Sort Controls */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔎 ค้นหาไฟล์สรุป..."
              className="w-full pl-9.5 pr-8 py-2 bg-white/80 border border-slate-200/80 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:bg-white transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort Dropdown & Quick Stats */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 glass-secondary px-3 py-1.5 rounded-xl border border-white/60 text-xs font-semibold text-slate-600">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
              <span>เรียงตาม:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortType)}
                className="bg-transparent text-slate-800 font-bold focus:outline-none cursor-pointer"
              >
                <option value="newest">🕒 ล่าสุด</option>
                <option value="oldest">⏳ เก่าสุด</option>
                <option value="nameAsc">🔤 ชื่อ ก-ฮ / A-Z</option>
                <option value="nameDesc">🔤 ชื่อ ฮ-ก / Z-A</option>
                <option value="sizeDesc">📦 ขนาด (ใหญ่สุด)</option>
                <option value="sizeAsc">📦 ขนาด (เล็กสุด)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-1.5 pt-3 overflow-x-auto scrollbar-none flex-wrap">
          {[
            { id: 'all', label: 'ทั้งหมด', count: allSubjectFiles.length },
            {
              id: 'pdf',
              label: 'PDF',
              count: allSubjectFiles.filter((f) => f.fileType === 'pdf').length,
            },
            {
              id: 'image',
              label: 'รูปภาพ',
              count: allSubjectFiles.filter((f) => f.fileType === 'image').length,
            },
            {
              id: 'doc',
              label: 'Word',
              count: allSubjectFiles.filter((f) => f.fileType === 'doc').length,
            },
            {
              id: 'ppt',
              label: 'PowerPoint',
              count: allSubjectFiles.filter((f) => f.fileType === 'ppt').length,
            },
            {
              id: 'xls',
              label: 'Excel',
              count: allSubjectFiles.filter((f) => f.fileType === 'xls').length,
            },
            {
              id: 'txt',
              label: 'ข้อความ TXT',
              count: allSubjectFiles.filter((f) => f.fileType === 'txt').length,
            },
          ].map((flt) => {
            const isActive = selectedFilter === flt.id;
            return (
              <button
                key={flt.id}
                type="button"
                onClick={() => setSelectedFilter(flt.id as FilterType)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'app-theme-btn text-white shadow-2xs'
                    : 'glass-secondary text-slate-600 hover:text-slate-900 border border-white/60 hover:bg-white/90'
                }`}
              >
                <span>{flt.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-200/70 text-slate-600'
                  }`}
                >
                  {flt.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* File Cards Grid */}
      {processedFiles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {processedFiles.map((file) => {
            const visual = getFileVisual(file.fileType);
            return (
              <div
                key={file.id}
                className="glass-card rounded-3xl p-5 border border-white/80 shadow-md hover:shadow-lg transition-all duration-300 flex flex-col justify-between group space-y-4"
              >
                {/* File Header Info */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center border shadow-2xs shrink-0 ${visual.bgColor}`}
                      >
                        {visual.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${visual.badgeBg}`}
                          >
                            {visual.label}
                          </span>
                          <span className="text-[10px] font-medium text-slate-500">
                            {formatFileSize(file.fileSize)}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {formatSummaryThaiDate(file.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Action buttons (Edit / Delete) */}
                    <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => setEditingFile(file)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                        title="แก้ไขข้อมูลไฟล์"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingFile(file)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="ลบไฟล์นี้"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h4
                      className="text-base font-bold text-slate-900 leading-snug line-clamp-2 hover:line-clamp-none transition-all cursor-pointer"
                      onClick={() => setPreviewFile(file)}
                      title={file.fileName}
                    >
                      {file.fileName}
                    </h4>
                    {file.originalFileName !== file.fileName && (
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        📎 {file.originalFileName}
                      </p>
                    )}
                    {file.description && (
                      <p className="text-xs text-slate-600 mt-2 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100 line-clamp-3 leading-relaxed">
                        {file.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Primary Card Actions */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="grid grid-cols-2 gap-2">
                    {/* Preview button */}
                    <button
                      type="button"
                      onClick={() => setPreviewFile(file)}
                      className="py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow-2xs border border-indigo-100"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>เปิดดู</span>
                    </button>

                    {/* Download button */}
                    <button
                      type="button"
                      onClick={() => {
                        triggerFileDownload(file, userProfile.id);
                        showToast(`กำลังเริ่มดาวน์โหลด "${file.originalFileName}"`);
                      }}
                      className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow-2xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>ดาวน์โหลด</span>
                    </button>
                  </div>

                  {/* Secondary Quick Connections: [ 📖 อ่านไฟล์นี้ ] & [ 📅 เพิ่มลงแผนการอ่าน ] */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewFile(file);
                        startStudyForSubject(subject.id, file.fileName);
                        showToast(`เริ่มอ่าน "${file.fileName}" แล้ว! เปิดตัวจับเวลาอ่านหนังสือได้เลย`);
                      }}
                      className="py-1.5 px-2.5 rounded-xl bg-pink-50/80 hover:bg-pink-100 text-pink-700 border border-pink-200/80 text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                      title="เปิดอ่านและเริ่มบันทึกเวลาเรียน"
                    >
                      <Timer className="w-3 h-3 text-pink-500" />
                      <span>อ่าน + จับเวลา</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setReadingPlanFile(file)}
                      className="py-1.5 px-2.5 rounded-xl bg-amber-50/80 hover:bg-amber-100 text-amber-800 border border-amber-200/80 text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                      title="นัดหมายวันที่ต้องอ่านไฟล์นี้ในปฏิทิน"
                    >
                      <Calendar className="w-3 h-3 text-amber-600" />
                      <span>เพิ่มลงแผนอ่าน</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="glass-card rounded-3xl p-10 sm:p-14 text-center border border-white/80 shadow-md space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-pink-50 text-pink-500 flex items-center justify-center mx-auto shadow-sm border border-pink-100">
            <BookOpen className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h4 className="text-lg font-black text-slate-800">
              {searchQuery || selectedFilter !== 'all'
                ? 'ไม่พบไฟล์สรุปที่ตรงกับเงื่อนไข'
                : 'ยังไม่มีไฟล์สรุปสำหรับวิชานี้'}
            </h4>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              {searchQuery || selectedFilter !== 'all'
                ? 'ลองพิมพ์คำค้นหาใหม่ หรือคลิกปุ่มด้านล่างเพื่อล้างตัวกรอง'
                : 'เพิ่มไฟล์สรุปเพื่อเก็บเอกสารไว้ในที่เดียวได้เลย ✨'}
            </p>
          </div>

          <div className="pt-2">
            {searchQuery || selectedFilter !== 'all' ? (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedFilter('all');
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                ล้างการค้นหาและตัวกรอง
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="px-5 py-2.5 app-theme-btn text-white rounded-xl text-xs font-bold shadow-md transition-all inline-flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>＋ เพิ่มไฟล์สรุป</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 1: ADD SUMMARY FILE
      ========================================================================= */}
      {isAddModalOpen && (
        <AddSummaryFileModal
          subject={subject}
          existingFiles={allSubjectFiles}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={(newFile) => {
            setIsAddModalOpen(false);
            showToast(`เพิ่มไฟล์สรุป "${newFile.fileName}" แล้ว ✨`);
          }}
        />
      )}

      {/* =========================================================================
          MODAL 2: EDIT SUMMARY FILE
      ========================================================================= */}
      {editingFile && (
        <EditSummaryFileModal
          file={editingFile}
          onClose={() => setEditingFile(null)}
          onSuccess={(updated) => {
            setEditingFile(null);
            showToast(`อัปเดตข้อมูลไฟล์ "${updated.fileName}" แล้ว ✨`);
          }}
        />
      )}

      {/* =========================================================================
          MODAL 3: DELETE CONFIRMATION
      ========================================================================= */}
      {deletingFile && (
        <DeleteSummaryFileModal
          file={deletingFile}
          onClose={() => setDeletingFile(null)}
          onConfirm={async () => {
            const fileName = deletingFile.fileName;
            await deleteSummaryFile(deletingFile.id);
            setDeletingFile(null);
            showToast(`ลบไฟล์สรุป "${fileName}" เรียบร้อยแล้ว`);
          }}
        />
      )}

      {/* =========================================================================
          MODAL 4: PREVIEW VIEWER (PDF, Image, Text, Non-previewable fallback)
      ========================================================================= */}
      {previewFile && (
        <SummaryFilePreviewModal
          file={previewFile}
          subject={subject}
          onClose={() => setPreviewFile(null)}
          onStartStudyTimer={() => {
            startStudyForSubject(subject.id, previewFile.fileName);
            showToast(`เริ่มจับเวลาอ่านหนังสือวิชา ${subject.name} เรียบร้อย ⏱️`);
            if (onNavigateToStudy) onNavigateToStudy();
          }}
        />
      )}

      {/* =========================================================================
          MODAL 5: ADD TO READING PLAN (Calendar / Study Session)
      ========================================================================= */}
      {readingPlanFile && (
        <AddToReadingPlanModal
          file={readingPlanFile}
          subject={subject}
          onClose={() => setReadingPlanFile(null)}
          onSuccess={(eventName) => {
            setReadingPlanFile(null);
            showToast(`เพิ่ม "${eventName}" ลงในแผนการอ่านของปฏิทินเรียบร้อย 📅✨`);
          }}
        />
      )}
    </div>
  );
};

// ============================================================================
// SUB-COMPONENT: ADD SUMMARY FILE MODAL
// ============================================================================
interface AddSummaryFileModalProps {
  subject: Subject;
  existingFiles: SubjectSummaryFile[];
  onClose: () => void;
  onSuccess: (file: SubjectSummaryFile) => void;
}

const AddSummaryFileModal: React.FC<AddSummaryFileModalProps> = ({
  subject,
  existingFiles,
  onClose,
  onSuccess,
}) => {
  const { uploadSummaryFile } = useGrade();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [allowDuplicateBypass, setAllowDuplicateBypass] = useState(false);

  const handleFileSelect = (file: File) => {
    setErrorMessage(null);
    setDuplicateWarning(null);
    setAllowDuplicateBypass(false);

    const val = validateSummaryFile(file);
    if (!val.ok) {
      setErrorMessage(val.error || 'ไฟล์ไม่ถูกต้อง');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);

    // Auto-prefill display name if empty
    if (!fileName.trim()) {
      const ext = file.name.split('.').pop() || '';
      const baseName = file.name.replace(`.${ext}`, '');
      setFileName(baseName || file.name);
    }

    // Check for duplicate in this subject
    const isDuplicate = existingFiles.some(
      (f) =>
        f.originalFileName.toLowerCase() === file.name.toLowerCase() ||
        f.fileName.toLowerCase() === file.name.toLowerCase()
    );
    if (isDuplicate) {
      setDuplicateWarning(
        `มีไฟล์ชื่อ "${file.name}" อยู่ในวิชานี้แล้ว ต้องการเพิ่มเป็นไฟล์ใหม่ หรือ ยกเลิก?`
      );
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMessage('กรุณาเลือกไฟล์ที่ต้องการบันทึก');
      return;
    }

    // Check duplicate name again if user edited fileName
    if (
      !allowDuplicateBypass &&
      existingFiles.some(
        (f) =>
          f.fileName.toLowerCase() === fileName.trim().toLowerCase() ||
          f.originalFileName.toLowerCase() === selectedFile.name.toLowerCase()
      )
    ) {
      setDuplicateWarning(
        `มีไฟล์ชื่อนี้อยู่ในวิชานี้แล้ว ต้องการเพิ่มเป็นไฟล์ใหม่ หรือ ยกเลิก?`
      );
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);
    setErrorMessage(null);

    try {
      const created = await uploadSummaryFile(
        selectedFile,
        subject.id,
        fileName.trim() || selectedFile.name,
        description.trim(),
        (pct) => setUploadProgress(pct)
      );
      onSuccess(created);
    } catch (err: any) {
      console.error('Upload failure:', err);
      setErrorMessage(err?.message || 'ไม่สามารถอัปโหลดไฟล์ได้ กรุณาลองใหม่อีกครั้ง');
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="glass-card bg-white/95 rounded-3xl w-full max-w-lg border border-white/90 shadow-2xl p-6 sm:p-7 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base">＋ เพิ่มไฟล์สรุปวิชา</h3>
              <p className="text-xs text-slate-500">วิชา {subject.name}</p>
            </div>
          </div>
          <button
            type="button"
            disabled={isUploading}
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Duplicate Warning Dialog / Banner */}
        {duplicateWarning && (
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl space-y-2">
            <div className="flex items-start gap-2 text-xs text-amber-800 font-bold">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <span>{duplicateWarning}</span>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setDuplicateWarning(null);
                  setAllowDuplicateBypass(true);
                }}
                className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                เพิ่มเป็นไฟล์ใหม่
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Locked Subject Display */}
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">
              วิชา (กำหนดให้อัตโนมัติ)
            </label>
            <div className="w-full px-3.5 py-2.5 bg-slate-100/80 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>
                {subject.name} ({subject.code})
              </span>
              <span className="text-[10px] text-slate-400 font-normal">
                หน้ารายวิชาปัจจุบัน
              </span>
            </div>
          </div>

          {/* File Picker / Drag & Drop Area */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              เลือกไฟล์สรุป <span className="text-rose-500">*</span>
            </label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
              accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.rtf,.md,image/*"
              className="hidden"
            />

            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-4 sm:p-5 text-center cursor-pointer transition-all ${
                selectedFile
                  ? 'border-pink-300 bg-pink-50/40'
                  : 'border-slate-200 hover:border-pink-300 bg-slate-50/50 hover:bg-pink-50/20'
              }`}
            >
              {selectedFile ? (
                <div className="space-y-1">
                  <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-slate-800 truncate max-w-xs mx-auto">
                    {selectedFile.name}
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium">
                    ขนาด {formatFileSize(selectedFile.size)} • คลิกเพื่อเปลี่ยนไฟล์
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
                    <Upload className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-bold text-slate-700">
                    📎 ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์
                  </p>
                  <p className="text-[10px] text-slate-400">
                    รองรับ PDF, Word, PowerPoint, Excel, TXT และรูปภาพ (ขนาดสูงสุด 25 MB)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Custom Display Name */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              ชื่อไฟล์ / ชื่อสรุป
            </label>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="เช่น สรุปบทที่ 1 เซต, สรุปสูตรเคมีอินทรีย์"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-pink-300 focus:outline-none shadow-2xs"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              *ถ้าไม่ระบุ จะใช้ชื่อไฟล์ต้นฉบับเป็นค่าเริ่มต้น
            </p>
          </div>

          {/* Description (Optional) */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              รายละเอียดเพิ่มเติม (ไม่บังคับ)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="บันทึกหัวข้อสำคัญ หรือสิ่งที่ควรทบทวนก่อนสอบ..."
              className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-pink-300 focus:outline-none shadow-2xs resize-none"
            />
          </div>

          {/* Upload Progress Bar */}
          {isUploading && (
            <div className="space-y-1.5 p-3 bg-pink-50 rounded-2xl border border-pink-100">
              <div className="flex justify-between text-xs text-pink-700 font-bold">
                <span>กำลังอัปโหลดไฟล์...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 bg-pink-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-pink-600 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              disabled={isUploading}
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 text-xs font-bold transition-colors cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isUploading || !selectedFile}
              className="px-5 py-2.5 app-theme-btn text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer active:scale-95"
            >
              {isUploading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>กำลังบันทึก...</span>
                </>
              ) : (
                <span>บันทึกไฟล์</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============================================================================
// SUB-COMPONENT: EDIT SUMMARY FILE MODAL
// ============================================================================
interface EditSummaryFileModalProps {
  file: SubjectSummaryFile;
  onClose: () => void;
  onSuccess: (updated: SubjectSummaryFile) => void;
}

const EditSummaryFileModal: React.FC<EditSummaryFileModalProps> = ({
  file,
  onClose,
  onSuccess,
}) => {
  const { updateSummaryFile } = useGrade();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fileName, setFileName] = useState(file.fileName);
  const [description, setDescription] = useState(file.description || '');
  const [replacementFile, setReplacementFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleReplacementSelect = (f: File) => {
    const val = validateSummaryFile(f);
    if (!val.ok) {
      setErrorMessage(val.error || 'ไฟล์ไม่ถูกต้อง');
      setReplacementFile(null);
      return;
    }
    setReplacementFile(f);
    setErrorMessage(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName.trim()) {
      setErrorMessage('กรุณาระบุชื่อไฟล์สรุป');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      const updated = await updateSummaryFile(file.id, {
        fileName: fileName.trim(),
        description: description.trim(),
        replacementFile: replacementFile || undefined,
      });
      onSuccess(updated);
    } catch (err: any) {
      setErrorMessage(err?.message || 'ไม่สามารถอัปเดตข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="glass-card bg-white/95 rounded-3xl w-full max-w-md border border-white/90 shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <Edit2 className="w-4 h-4" />
            </div>
            <h3 className="font-black text-slate-900 text-base">แก้ไขข้อมูลไฟล์สรุป</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              ชื่อไฟล์สรุปที่แสดง <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-pink-300 focus:outline-none shadow-2xs"
            />
            <p className="text-[11px] text-slate-400 mt-1 truncate">
              ไฟล์ต้นฉบับ: {file.originalFileName} ({formatFileSize(file.fileSize)})
            </p>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              รายละเอียดเพิ่มเติม
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="รายละเอียด สรุปเนื้อหาสำคัญ..."
              className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-pink-300 focus:outline-none shadow-2xs resize-none"
            />
          </div>

          {/* Optional file replacement */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">ต้องการเปลี่ยนไฟล์?</span>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-pink-600 hover:text-pink-700 font-bold underline cursor-pointer"
              >
                {replacementFile ? 'เลือกไฟล์ใหม่' : 'เปลี่ยนไฟล์'}
              </button>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleReplacementSelect(e.target.files[0]);
                }
              }}
              className="hidden"
            />
            {replacementFile && (
              <div className="p-2 bg-white rounded-xl border border-pink-200 text-xs text-slate-700 flex items-center justify-between">
                <span className="truncate max-w-[200px] font-bold">
                  {replacementFile.name}
                </span>
                <span className="text-[10px] text-slate-400">
                  {formatFileSize(replacementFile.size)}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              disabled={isSaving}
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 text-xs font-bold cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 app-theme-btn text-white rounded-xl text-xs font-bold shadow-md cursor-pointer active:scale-95"
            >
              {isSaving ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============================================================================
// SUB-COMPONENT: DELETE CONFIRMATION MODAL
// ============================================================================
interface DeleteSummaryFileModalProps {
  file: SubjectSummaryFile;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

const DeleteSummaryFileModal: React.FC<DeleteSummaryFileModalProps> = ({
  file,
  onClose,
  onConfirm,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="glass-card bg-white/95 rounded-3xl w-full max-w-sm border border-white/90 shadow-2xl p-6 space-y-4 text-center">
        <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <Trash2 className="w-6 h-6" />
        </div>

        <div className="space-y-1">
          <h3 className="text-base font-black text-slate-900">
            ต้องการลบไฟล์นี้ใช่หรือไม่?
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            ไฟล์จะถูกนำออกจากคลังสรุปของวิชานี้อย่างถาวร
          </p>
        </div>

        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-left space-y-0.5">
          <p className="text-xs font-bold text-slate-800 truncate">{file.fileName}</p>
          <p className="text-[11px] text-slate-400">
            {file.originalFileName} • {formatFileSize(file.fileSize)}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2.5 pt-2">
          <button
            type="button"
            disabled={isDeleting}
            onClick={onClose}
            className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={handleDelete}
            className="py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer active:scale-95"
          >
            {isDeleting ? 'กำลังลบ...' : 'ลบไฟล์'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// SUB-COMPONENT: PREVIEW VIEWER MODAL
// ============================================================================
interface SummaryFilePreviewModalProps {
  file: SubjectSummaryFile;
  subject: Subject;
  onClose: () => void;
  onStartStudyTimer: () => void;
}

const SummaryFilePreviewModal: React.FC<SummaryFilePreviewModalProps> = ({
  file,
  subject,
  onClose,
  onStartStudyTimer,
}) => {
  const { userProfile } = useGrade();
  const [textContent, setTextContent] = useState<string | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(true);

  // Load preview data from cache or server
  React.useEffect(() => {
    let isMounted = true;
    setIsLoadingPreview(true);

    const load = async () => {
      try {
        // Try IndexedDB blob first for offline instant access
        const cachedBlob = await getBlobCache(file.id);
        if (cachedBlob && isMounted) {
          const url = URL.createObjectURL(cachedBlob);
          setBlobUrl(url);

          if (file.fileType === 'txt') {
            const text = await cachedBlob.text();
            if (isMounted) setTextContent(text);
          }
          setIsLoadingPreview(false);
          return;
        }

        // Otherwise use server endpoint
        const serverUrl = `/api/summaries/view?id=${encodeURIComponent(file.id)}&userId=${encodeURIComponent(userProfile.id)}`;
        if (file.fileType === 'txt') {
          const res = await fetch(serverUrl);
          if (res.ok) {
            const text = await res.text();
            if (isMounted) setTextContent(text);
          }
        }
        if (isMounted) {
          setBlobUrl(serverUrl);
          setIsLoadingPreview(false);
        }
      } catch (err) {
        console.warn('Error loading preview:', err);
        if (isMounted) setIsLoadingPreview(false);
      }
    };

    load();

    return () => {
      isMounted = false;
      if (blobUrl && blobUrl.startsWith('blob:')) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [file.id, file.fileType, userProfile.id]);

  const viewUrl =
    blobUrl ||
    `/api/summaries/view?id=${encodeURIComponent(file.id)}&userId=${encodeURIComponent(userProfile.id)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="glass-card bg-white rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col border border-white/90 shadow-2xl overflow-hidden">
        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between gap-3 bg-white/80">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-100 text-pink-700">
                วิชา {subject.name}
              </span>
              <span className="text-[10px] font-semibold text-slate-500">
                {getFileTypeLabel(file.fileType)} • {formatFileSize(file.fileSize)}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 truncate mt-0.5">
              {file.fileName}
            </h3>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Quick Timer action */}
            <button
              type="button"
              onClick={onStartStudyTimer}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-700 text-xs font-bold border border-pink-200 transition-all cursor-pointer active:scale-95"
              title="เริ่มจับเวลาอ่านหนังสือวิชานี้"
            >
              <Timer className="w-3.5 h-3.5 text-pink-600" />
              <span>จับเวลาอ่าน ⏱️</span>
            </button>

            {/* Download button */}
            <button
              type="button"
              onClick={() => triggerFileDownload(file, userProfile.id)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              title="ดาวน์โหลดไฟล์"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Open in new window */}
            <a
              href={viewUrl}
              target="_blank"
              rel="noreferrer"
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
              title="เปิดดูในแท็บใหม่"
            >
              <ExternalLink className="w-4 h-4" />
            </a>

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body: Viewer Content */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 bg-slate-50/70 flex items-center justify-center min-h-[350px]">
          {isLoadingPreview ? (
            <div className="text-center space-y-2">
              <div className="w-8 h-8 border-3 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-500 font-bold">กำลังโหลดเอกสาร...</p>
            </div>
          ) : file.fileType === 'pdf' ? (
            /* PDF Viewer */
            <div className="w-full h-[70vh] rounded-2xl overflow-hidden shadow-sm border border-slate-200 bg-white">
              <iframe
                src={`${viewUrl}#toolbar=1&navpanes=0`}
                title={file.fileName}
                className="w-full h-full border-none"
              />
            </div>
          ) : file.fileType === 'image' ? (
            /* Image Viewer */
            <div className="max-h-[70vh] flex items-center justify-center p-2">
              <img
                src={viewUrl}
                alt={file.fileName}
                referrerPolicy="no-referrer"
                className="max-h-[68vh] max-w-full rounded-2xl object-contain shadow-md border border-slate-200 bg-white"
              />
            </div>
          ) : file.fileType === 'txt' ? (
            /* Text File Viewer */
            <div className="w-full max-h-[70vh] overflow-auto p-5 bg-white rounded-2xl border border-slate-200 font-mono text-xs text-slate-800 whitespace-pre-wrap leading-relaxed shadow-sm">
              {textContent || 'ไม่มีเนื้อหาข้อความ'}
            </div>
          ) : (
            /* Non-previewable (Word, PPT, Excel, etc.) Fallback Card */
            <div className="glass-card bg-white p-8 rounded-3xl max-w-md text-center space-y-4 border border-slate-200 shadow-lg">
              <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-2xs">
                <FileText className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-slate-900">
                  ไฟล์เอกสาร {getFileTypeLabel(file.fileType)}
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  ไฟล์ประเภทนี้ไม่สามารถแสดงตัวอย่างบนเบราว์เซอร์ได้โดยตรง
                  คุณสามารถดาวน์โหลดเพื่อเปิดด้วยโปรแกรมเฉพาะได้
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl text-left border border-slate-100 text-xs">
                <p className="font-bold text-slate-800 truncate">{file.originalFileName}</p>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  ขนาด: {formatFileSize(file.fileSize)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => triggerFileDownload(file, userProfile.id)}
                className="w-full py-3 px-4 app-theme-btn text-white rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>ดาวน์โหลดไฟล์ ({formatFileSize(file.fileSize)})</span>
              </button>
            </div>
          )}
        </div>

        {/* Modal Bottom Bar with Description */}
        {file.description && (
          <div className="p-3.5 bg-slate-100/70 border-t border-slate-200 text-xs text-slate-600">
            <span className="font-bold text-slate-700">บันทึกช่วยจำ: </span>
            {file.description}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// SUB-COMPONENT: ADD TO READING PLAN MODAL
// ============================================================================
interface AddToReadingPlanModalProps {
  file: SubjectSummaryFile;
  subject: Subject;
  onClose: () => void;
  onSuccess: (eventName: string) => void;
}

const AddToReadingPlanModal: React.FC<AddToReadingPlanModalProps> = ({
  file,
  subject,
  onClose,
  onSuccess,
}) => {
  const { addPersonalEvent } = useGrade();

  const [title, setTitle] = useState(`อ่านสรุป ${file.fileName}`);
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [startTime, setStartTime] = useState('19:00');
  const [endTime, setEndTime] = useState('20:00');
  const [details, setDetails] = useState(`อ้างอิงไฟล์สรุป: ${file.fileName} (${subject.name})`);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    addPersonalEvent({
      title: title.trim(),
      date,
      startTime: startTime || undefined,
      endTime: endTime || undefined,
      details: details.trim() || undefined,
      category: 'study',
    });

    onSuccess(title.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="glass-card bg-white/95 rounded-3xl w-full max-w-md border border-white/90 shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base">📅 เพิ่มลงแผนการอ่าน</h3>
              <p className="text-[11px] text-slate-500">วิชา {subject.name}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              หัวข้อการอ่าน <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-pink-300 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              วันที่ต้องการอ่าน <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-pink-300 focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">เวลาเริ่ม</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-pink-300 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">เวลาสิ้นสุด</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-pink-300 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              บันทึก / โน้ต
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={2}
              className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-pink-300 focus:outline-none resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 text-xs font-bold"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 app-theme-btn text-white rounded-xl text-xs font-bold shadow-md active:scale-95"
            >
              บันทึกลงปฏิทิน
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
