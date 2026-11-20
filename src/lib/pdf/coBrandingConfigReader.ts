import { doc, getDoc } from 'firebase/firestore';
import {
  getStoredCoBrandingConfig,
  saveStoredCoBrandingConfig
} from '../../features/smart-debito/coBrandingStorage.ts';
import type { CoBrandingConfig } from '../../features/smart-debito/types.ts';
import { firestoreDb } from '../firebaseClient.ts';

export interface ResolvedCoBranding {
  enabled: boolean;
  companyName: string;
  address: string;
  postalCodeAndCity: string;
  phone: string;
  email: string;
  website: string;
  primaryHex: string;
  secondaryHex: string;
  textHex: string;
  logoDataUrl: string | null;
}

const DEFAULT_PRIMARY_HEX = '#114037';
const DEFAULT_SECONDARY_HEX = '#3CA64C';
const DEFAULT_TEXT_HEX = '#FFFFFF';
const HEX_COLOR_RE = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
const RASTER_DATA_URL_RE = /^data:image\/(?:png|jpeg|jpg);base64,[A-Za-z0-9+/=]+$/i;

function normalizeHex(raw: unknown, fallback: string): string {
  if (typeof raw !== 'string') return fallback;
  const trimmed = raw.trim();
  if (!HEX_COLOR_RE.test(trimmed)) return fallback;
  if (trimmed.length === 4) {
    return `#${trimmed[1]}${trimmed[1]}${trimmed[2]}${trimmed[2]}${trimmed[3]}${trimmed[3]}`.toUpperCase();
  }
  return trimmed.toUpperCase();
}

function normalizeText(raw: unknown): string {
  return typeof raw === 'string' ? raw.trim() : '';
}

function sanitizeLogoDataUrl(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  if (!trimmed || /^data:image\/svg\+xml/i.test(trimmed)) {
    return null;
  }
  return RASTER_DATA_URL_RE.test(trimmed) ? trimmed : null;
}

/**
 * Converte uma cor HEX (#RGB ou #RRGGBB) para canais normalizados [0..1] compatíveis com `pdf-lib`.
 */
export function hexToPdfRgb(hex: string): { r: number; g: number; b: number } {
  const safeHex = normalizeHex(hex, DEFAULT_PRIMARY_HEX).slice(1);
  const intVal = Number.parseInt(safeHex, 16);
  if (Number.isNaN(intVal)) {
    return { r: 17 / 255, g: 64 / 255, b: 55 / 255 };
  }
  return {
    r: ((intVal >> 16) & 255) / 255,
    g: ((intVal >> 8) & 255) / 255,
    b: (intVal & 255) / 255
  };
}

function mapConfigToResolved(raw?: Partial<CoBrandingConfig> | null): ResolvedCoBranding {
  const companyName = normalizeText(raw?.companyName);
  const logoDataUrl = sanitizeLogoDataUrl(raw?.logoUrl);
  const enabled = Boolean(raw?.isEnabled) && (companyName.length > 0 || logoDataUrl !== null);

  return {
    enabled,
    companyName,
    address: normalizeText(raw?.address),
    postalCodeAndCity: normalizeText(raw?.postalCode),
    phone: normalizeText(raw?.phone),
    email: normalizeText(raw?.email),
    website: normalizeText(raw?.website),
    primaryHex: normalizeHex(raw?.primaryColor, DEFAULT_PRIMARY_HEX),
    secondaryHex: normalizeHex(raw?.secondaryColor, DEFAULT_SECONDARY_HEX),
    textHex: normalizeHex(raw?.textColor, DEFAULT_TEXT_HEX),
    logoDataUrl
  };
}

function hasStoredLocalCoBranding(): boolean {
  if (typeof window === 'undefined' || !window.localStorage) return false;
  try {
    return Boolean(window.localStorage.getItem('daterra_cobranding_config'));
  } catch {
    return false;
  }
}

async function fetchRemoteCoBranding(userId: string): Promise<Partial<CoBrandingConfig> | null> {
  if (typeof window === 'undefined' || navigator?.onLine === false) return null;
  try {
    const snap = await Promise.race([
      getDoc(doc(firestoreDb, 'users', userId)),
      new Promise<null>((resolve) => {
        setTimeout(() => resolve(null), 1500);
      })
    ]);
    if (!snap || !snap.exists()) return null;
    const data = snap.data() as { co_branding?: Partial<CoBrandingConfig> } | undefined;
    if (!data?.co_branding) return null;
    saveStoredCoBrandingConfig({
      ...getStoredCoBrandingConfig(),
      ...data.co_branding
    });
    return data.co_branding;
  } catch {
    return null;
  }
}

/**
 * Lê e normaliza a configuração de Co-Branding do utilizador de forma offline-first.
 */
export async function resolveUserCoBranding(userId?: string | null): Promise<ResolvedCoBranding> {
  const localConfig = getStoredCoBrandingConfig();
  if (hasStoredLocalCoBranding() || !userId?.trim()) {
    return mapConfigToResolved(localConfig);
  }
  const remoteConfig = await fetchRemoteCoBranding(userId.trim());
  return mapConfigToResolved(remoteConfig ?? localConfig);
}
