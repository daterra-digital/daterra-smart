// src/features/settings/branding/coBrandingFieldSpecs.ts
export interface BrandingColorFieldSpec {
  key: 'primaryColor' | 'secondaryColor' | 'textColor';
  labelKey: string;
  labelFallback: string;
  hintKey: string;
  hintFallback: string;
}

export interface BrandingCompanyFieldSpec {
  key: 'companyName' | 'address' | 'postalCode' | 'phone' | 'email' | 'website';
  labelKey: string;
  labelFallback: string;
  placeholderKey?: string;
  placeholderFallback: string;
  type?: 'text' | 'email';
  mono?: boolean;
}

export const BRANDING_COLOR_FIELDS: BrandingColorFieldSpec[] = [
  {
    key: 'primaryColor',
    labelKey: 'settings.branding.primaryColor',
    labelFallback: 'Cor Primária',
    hintKey: 'settings.branding.bannerBackground',
    hintFallback: 'Fundo do Banner'
  },
  {
    key: 'secondaryColor',
    labelKey: 'settings.branding.secondaryColor',
    labelFallback: 'Cor Secundária',
    hintKey: 'settings.branding.trimsAndSeal',
    hintFallback: 'Frisos e Selo'
  },
  {
    key: 'textColor',
    labelKey: 'settings.branding.textColor',
    labelFallback: 'Cor do Texto',
    hintKey: 'settings.branding.bannerText',
    hintFallback: 'Texto do Banner'
  }
];

export const BRANDING_COMPANY_FIELDS: BrandingCompanyFieldSpec[] = [
  {
    key: 'companyName',
    labelKey: 'settings.branding.companyName',
    labelFallback: 'Nome da Empresa',
    placeholderKey: 'settings.branding.companyNamePlaceholder',
    placeholderFallback: 'Ex: AgroTec Serviços Lda'
  },
  {
    key: 'address',
    labelKey: 'settings.branding.companyAddress',
    labelFallback: 'Morada',
    placeholderKey: 'settings.branding.companyAddressPlaceholder',
    placeholderFallback: 'Ex: Zona Industrial Lote 14'
  },
  {
    key: 'postalCode',
    labelKey: 'settings.branding.postalCodeCity',
    labelFallback: 'Código-Postal e Localidade',
    placeholderKey: 'settings.branding.postalCodePlaceholder',
    placeholderFallback: 'Ex: 2000-001 Santarém'
  },
  {
    key: 'phone',
    labelKey: 'settings.branding.contactPhone',
    labelFallback: 'Telefone de Contacto',
    placeholderFallback: 'Ex: +351 243 000 111',
    mono: true
  },
  {
    key: 'email',
    labelKey: 'settings.branding.institutionalEmail',
    labelFallback: 'E-mail Institucional',
    placeholderFallback: 'Ex: servicos@empresa.pt',
    type: 'email'
  },
  {
    key: 'website',
    labelKey: 'settings.branding.website',
    labelFallback: 'Website',
    placeholderFallback: 'Ex: www.empresa.pt'
  }
];
