export interface Brand {
  name: string;
  shortName: string;
  appName: string;
  supportEmail: string;
  /** Хост домена сторфронта (без протокола) — используется в SEO-preview, mailto-плейсхолдерах */
  storefrontHost: string;
}

export const brand: Brand = {
  name: 'SVOYA ESTHETICA',
  shortName: 'SVOYA',
  appName: 'SVOYA ESTHETICA Admin',
  supportEmail: 'malinichev_s@mail.ru',
  storefrontHost: 'svoyaesthetica.shop',
};

export function getBrandInitials(name: string = brand.shortName): string {
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}
