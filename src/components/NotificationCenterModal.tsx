import React, { useState } from 'react';
import {
  Bell,
  X,
  Clock,
  Calendar,
  AlertTriangle,
  Target,
  Sparkles,
  FolderHeart,
  CheckCheck,
  ArrowRight,
} from 'lucide-react';
import { useGrade } from '../context/GradeContext';
import { AppNotification } from '../types';
import { NavTab } from './Navbar';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: NavTab) => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
}) => {
  const {
    notifications,
    unreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  } = useGrade();

  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  if (!isOpen) return null;

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    return true;
  });

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'task_due':
        return <Clock className="w-4 h-4 text-amber-500" />;
      case 'exam_near':
        return <Calendar className="w-4 h-4 text-rose-500" />;
      case 'score_missing':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'grade_target':
        return <Target className="w-4 h-4 text-pink-500" />;
      case 'portfolio_pending':
        return <FolderHeart className="w-4 h-4 text-purple-500" />;
      case 'future_checklist':
        return <Sparkles className="w-4 h-4 text-indigo-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-indigo-500" />;
    }
  };

  const handleItemClick = (n: AppNotification) => {
    markNotificationAsRead(n.id);
    if (n.actionTab) {
      onNavigateTab(n.actionTab as NavTab);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 border border-pink-100 shadow-2xl relative my-auto max-h-[88vh] flex flex-col text-left">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-1.5">
                <span>ศูนย์แจ้งเตือน</span>
                {unreadNotificationCount > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500 text-white font-extrabold">
                    ใหม่ {unreadNotificationCount}
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">
                การแจ้งเตือนงานใกล้ส่ง ตารางสอบ และความคืบหน้าเป้าหมาย
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter bar & Mark all read */}
        <div className="flex items-center justify-between py-2.5">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                filter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              ทั้งหมด ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                filter === 'unread'
                  ? 'bg-pink-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              ยังไม่ได้อ่าน ({unreadNotificationCount})
            </button>
          </div>

          {unreadNotificationCount > 0 && (
            <button
              type="button"
              onClick={markAllNotificationsAsRead}
              className="text-[11px] text-pink-600 hover:text-pink-800 font-bold flex items-center gap-1 cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>อ่านทั้งหมดแล้ว</span>
            </button>
          )}
        </div>

        {/* List of Notifications */}
        <div className="overflow-y-auto pr-1 flex-1 space-y-2 py-1">
          {filteredNotifications.map((n) => (
            <div
              key={n.id}
              onClick={() => handleItemClick(n)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                n.read
                  ? 'bg-slate-50/60 border-slate-100 opacity-75 hover:opacity-100'
                  : 'bg-pink-50/40 border-pink-200/90 shadow-2xs hover:border-pink-300'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white shadow-2xs flex items-center justify-center shrink-0 mt-0.5">
                  {getIcon(n.type)}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-slate-900">{n.title}</span>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-pink-500 shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed font-medium">
                    {n.message}
                  </p>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {n.date}
                  </span>
                </div>
              </div>

              <div className="shrink-0 text-slate-400 hover:text-pink-600 pt-1">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          ))}

          {filteredNotifications.length === 0 && (
            <div className="text-center py-12 text-slate-400 text-xs font-medium">
              ไม่มีการแจ้งเตือนในขณะนี้ ยอดเยี่ยมมาก! 🌸
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
