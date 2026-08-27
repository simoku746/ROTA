export type RoleKey = 'YONETICI' | 'TASARIM' | 'URETIM' | 'MONTAJ' | 'MUHASEBE';

export const ROLE_CONFIG: Record<
  RoleKey,
  { label: string; tabs: string[]; showCost: boolean; showPayment: boolean; canApprove: boolean }
> = {
  YONETICI: { label: 'Yönetici', tabs: ['kisiler', 'planlama', 'kapasite', 'uretim', 'saha'], showCost: true, showPayment: true, canApprove: true },
  TASARIM: { label: 'Tasarım', tabs: ['planlama'], showCost: false, showPayment: false, canApprove: true },
  URETIM: { label: 'Üretim', tabs: ['uretim'], showCost: false, showPayment: false, canApprove: false },
  MONTAJ: { label: 'Montaj (Saha)', tabs: ['saha'], showCost: false, showPayment: false, canApprove: false },
  MUHASEBE: { label: 'Muhasebe', tabs: ['kisiler', 'planlama'], showCost: true, showPayment: true, canApprove: false },
};

export function roleCanSeeTab(role: RoleKey, tab: string) {
  return ROLE_CONFIG[role].tabs.includes(tab);
}

export const TAB_LABELS: Record<string, string> = {
  kisiler: 'Kişiler',
  planlama: 'Görev Yönetimi',
  kapasite: 'Kapasite',
  uretim: 'Üretim Programı',
  saha: 'Saha (Montaj)',
};
export const TAB_ICONS: Record<string, string> = {
  kisiler: '👥',
  planlama: '📋',
  kapasite: '📊',
  uretim: '🏭',
  saha: '🚐',
};
export const TAB_COLORS: Record<string, string> = {
  kisiler: '#E4F0FF',
  planlama: '#EFE9FE',
  kapasite: '#E4FBEE',
  uretim: '#FFEBE8',
  saha: '#F0F0F5',
};
