import React from 'react';
import {
  Home,
  BookOpen,
  Timer,
  CheckSquare,
  Calendar,
  Target,
  FolderHeart,
  User,
  Settings,
  Bell,
  Clock,
  Plus,
  Edit3,
  Trash2,
  Check,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Menu,
  X,
  Sparkles,
  BarChart3,
  GraduationCap,
  Layers,
  Palette,
  Flame,
  Trophy,
  Scale,
  Search,
  AlertTriangle,
  HelpCircle,
  LucideProps,
} from 'lucide-react';

export type IconName =
  | 'home'
  | 'subjects'
  | 'study'
  | 'tasks'
  | 'exams'
  | 'goals'
  | 'portfolio'
  | 'profile'
  | 'settings'
  | 'notification'
  | 'calendar'
  | 'timer'
  | 'clock'
  | 'add'
  | 'plus'
  | 'edit'
  | 'delete'
  | 'trash'
  | 'check'
  | 'checkCircle'
  | 'arrow'
  | 'arrowRight'
  | 'arrowLeft'
  | 'chevronRight'
  | 'chevronLeft'
  | 'chevronDown'
  | 'chevronUp'
  | 'menu'
  | 'close'
  | 'sparkles'
  | 'analytics'
  | 'graduation'
  | 'layers'
  | 'palette'
  | 'flame'
  | 'trophy'
  | 'scale'
  | 'search'
  | 'alert'
  | 'help';

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;

export interface AppIconProps extends Omit<LucideProps, 'size'> {
  name: IconName;
  size?: IconSize;
  className?: string;
  title?: string;
}

const sizeMap: Record<'xs' | 'sm' | 'md' | 'lg' | 'xl', number> = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
};

// Central mapping of all icons in the system
const iconComponentMap: Record<IconName, React.ComponentType<LucideProps>> = {
  home: Home,
  subjects: BookOpen,
  study: Timer,
  tasks: CheckSquare,
  exams: Calendar,
  goals: Target,
  portfolio: FolderHeart,
  profile: User,
  settings: Settings,
  notification: Bell,
  calendar: Calendar,
  timer: Timer,
  clock: Clock,
  add: Plus,
  plus: Plus,
  edit: Edit3,
  delete: Trash2,
  trash: Trash2,
  check: Check,
  checkCircle: CheckCircle2,
  arrow: ArrowRight,
  arrowRight: ArrowRight,
  arrowLeft: ArrowLeft,
  chevronRight: ChevronRight,
  chevronLeft: ChevronLeft,
  chevronDown: ChevronDown,
  chevronUp: ChevronUp,
  menu: Menu,
  close: X,
  sparkles: Sparkles,
  analytics: BarChart3,
  graduation: GraduationCap,
  layers: Layers,
  palette: Palette,
  flame: Flame,
  trophy: Trophy,
  scale: Scale,
  search: Search,
  alert: AlertTriangle,
  help: HelpCircle,
};

/**
 * AppIcon - Centralized, reliable icon component for MyGrade.
 * Guarantees consistent sizing, stroke width, and zero layout shift.
 */
export const AppIcon: React.FC<AppIconProps> = ({
  name,
  size = 'md',
  className = '',
  strokeWidth = 2,
  title,
  ...rest
}) => {
  const pixelSize = typeof size === 'number' ? size : sizeMap[size] || 20;
  const Component = iconComponentMap[name] || Sparkles;

  return (
    <Component
      size={pixelSize}
      strokeWidth={strokeWidth}
      className={`shrink-0 inline-block align-middle transition-transform ${className}`}
      aria-hidden={!title}
      aria-label={title}
      {...rest}
    />
  );
};

// Strongly typed Icon namespace matching user hierarchy:
// Icon.Home, Icon.Subjects, Icon.Study, Icon.Tasks, etc.
const createIconWrapper = (name: IconName) => {
  const WrappedIcon: React.FC<Omit<AppIconProps, 'name'>> = (props) => (
    <AppIcon name={name} {...props} />
  );
  WrappedIcon.displayName = `Icon.${name.charAt(0).toUpperCase() + name.slice(1)}`;
  return WrappedIcon;
};

export const Icon = {
  Home: createIconWrapper('home'),
  Subjects: createIconWrapper('subjects'),
  Study: createIconWrapper('study'),
  Tasks: createIconWrapper('tasks'),
  Exams: createIconWrapper('exams'),
  Goals: createIconWrapper('goals'),
  Portfolio: createIconWrapper('portfolio'),
  Profile: createIconWrapper('profile'),
  Settings: createIconWrapper('settings'),
  Notification: createIconWrapper('notification'),
  Calendar: createIconWrapper('calendar'),
  Timer: createIconWrapper('timer'),
  Clock: createIconWrapper('clock'),
  Add: createIconWrapper('add'),
  Edit: createIconWrapper('edit'),
  Delete: createIconWrapper('delete'),
  Check: createIconWrapper('check'),
  Arrow: createIconWrapper('arrow'),
  Menu: createIconWrapper('menu'),
  Close: createIconWrapper('close'),
  Sparkles: createIconWrapper('sparkles'),
  Analytics: createIconWrapper('analytics'),
  Graduation: createIconWrapper('graduation'),
  Layers: createIconWrapper('layers'),
  Palette: createIconWrapper('palette'),
  Flame: createIconWrapper('flame'),
  Trophy: createIconWrapper('trophy'),
  Scale: createIconWrapper('scale'),
  Search: createIconWrapper('search'),
  Alert: createIconWrapper('alert'),
};
