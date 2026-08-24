// Buradaki tablo, demoda kurduğumuz rol/yetki mantığının gerçek karşılığı.
// Kimin bütçe/tahsilat gördüğü, kimin hangi sekmeye erişebildiği SADECE burada tanımlı.
// Arayüzde değil, API tarafında (sunucuda) kontrol edildiği için gerçekten güvenli.

export type RoleKey = 'YONETICI' | 'TASARIM' | 'URETIM' | 'MONTAJ' | 'MUHASEBE';

export const ROLE_CONFIG: Record<
  RoleKey,
  { label: string; tabs: string[]; showCost: boolean; showPayment: boolean; canApprove: boolean }
> = {
  YONETICI: { label: 'Yönetici', tabs: ['planlama', 'kapasite', 'uretim', 'saha'], showCost: true, showPayment: true, canApprove: true },
  TASARIM: { label: 'Tasarım', tabs: ['planlama'], showCost: false, showPayment: false, canApprove: true },
  URETIM: { label: 'Üretim', tabs: ['uretim'], showCost: false, showPayment: false, canApprove: false },
  MONTAJ: { label: 'Montaj (Saha)', tabs: ['saha'], showCost: false, showPayment: false, canApprove: false },
  MUHASEBE: { label: 'Muhasebe', tabs: ['planlama'], showCost: true, showPayment: true, canApprove: false },
};

export function roleCanSeeTab(role: RoleKey, tab: string) {
  return ROLE_CONFIG[role].tabs.includes(tab);
}
