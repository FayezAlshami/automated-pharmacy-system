import {
  Building2,
  ClipboardList,
  LayoutDashboard,
  PackageSearch,
  Pill,
  Shapes,
  UserRoundPlus,
  Users,
} from 'lucide-react'

export const adminNavigation = [
  { label: { ar: 'لوحة التحكم', en: 'Dashboard' }, href: '/app/dashboard', icon: LayoutDashboard },
  { label: { ar: 'الأدوية', en: 'Drugs' }, href: '/app/drugs', icon: Pill },
  { label: { ar: 'التصنيفات', en: 'Categories' }, href: '/app/categories', icon: Shapes },
  { label: { ar: 'الشركات', en: 'Companies' }, href: '/app/companies', icon: Building2 },
  { label: { ar: 'الطلبات', en: 'Orders' }, href: '/app/orders', icon: ClipboardList },
  { label: { ar: 'طلبات الأطباء', en: 'Doctor Requests' }, href: '/app/doctor-requests', icon: UserRoundPlus },
  { label: { ar: 'المستخدمون', en: 'Users' }, href: '/app/users', icon: Users },
  { label: { ar: 'المرضى', en: 'Patients' }, href: '/app/patients', icon: PackageSearch },
]
