export type RoleKey = 'YONETICI' | 'TASARIM' | 'URETIM' | 'MONTAJ' | 'MUHASEBE';

export const ROLE_KEYS: RoleKey[] = ['YONETICI', 'TASARIM', 'URETIM', 'MONTAJ', 'MUHASEBE'];

export const ROLE_LABELS: Record<RoleKey, string> = {
  YONETICI: 'Yönetici',
  TASARIM: 'Tasarım',
  URETIM: 'Üretim',
  MONTAJ: 'Montaj (Saha)',
  MUHASEBE: 'Muhasebe',
};

export function isRole(v: unknown): v is RoleKey {
  return typeof v === 'string' && (ROLE_KEYS as string[]).includes(v);
}
