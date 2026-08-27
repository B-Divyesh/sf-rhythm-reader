const SLUG = 'rhythm-reader';
const LICENSE_KEY = `sb_license:${SLUG}`;
const VERDICT_KEY = `sb_license_verdict:${SLUG}`;
const API_BASE = import.meta.env.VITE_BILLING_BASE ?? 'https://api.sociobot.in';

interface Verdict { valid: boolean; checkedAt: number }

export function checkoutUrl(): string { return `${API_BASE}/api/v1/products/${SLUG}/checkout`; }

export function captureReturnedLicense(): void {
  const url = new URL(location.href);
  const token = url.searchParams.get('license');
  if (!token) return;
  localStorage.setItem(LICENSE_KEY, token);
  localStorage.setItem(VERDICT_KEY, JSON.stringify({ valid: true, checkedAt: 0 }));
  url.searchParams.delete('license');
  history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
}

export function storeLicense(token: string): void {
  localStorage.setItem(LICENSE_KEY, token.trim());
  localStorage.removeItem(VERDICT_KEY);
}

export function hasOptimisticUnlock(): boolean {
  if (!localStorage.getItem(LICENSE_KEY)) return false;
  try { return (JSON.parse(localStorage.getItem(VERDICT_KEY) ?? '{}') as Partial<Verdict>).valid !== false; }
  catch { return true; }
}

export async function verifyLicense(force = false): Promise<boolean | null> {
  const token = localStorage.getItem(LICENSE_KEY);
  if (!token) return false;
  try {
    const cached = JSON.parse(localStorage.getItem(VERDICT_KEY) ?? '{}') as Partial<Verdict>;
    if (!force && cached.checkedAt && Date.now() - cached.checkedAt < 86_400_000) return cached.valid ?? false;
  } catch { /* verify malformed cache */ }
  try {
    const response = await fetch(`${API_BASE}/api/v1/products/${SLUG}/verify?license=${encodeURIComponent(token)}`);
    if (!response.ok) return null;
    const data = await response.json() as { valid: boolean };
    localStorage.setItem(VERDICT_KEY, JSON.stringify({ valid: data.valid, checkedAt: Date.now() }));
    return data.valid;
  } catch { return null; }
}
