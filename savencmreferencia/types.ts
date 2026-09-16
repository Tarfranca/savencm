export type ScreenType = 
  | 'nova-operacao' 
  | 'processando' 
  | 'resultado' 
  | 'buscar-ncms' 
  | 'revisar' 
  | 'perfil-fiscal';

export interface RecentOperation {
  id: string;
  document: string;
  category: string;
  ncm: string;
  economy: string;
  date: string;
  status: 'Homologado' | 'Em revisão' | 'Risco';
}

export interface PendingAlert {
  id: string;
  title: string;
  badge: string;
  badgeType: 'benefit' | 'risk' | 'tax';
  description: string;
}

export interface TaxItem {
  id: string;
  itemNumber: string;
  description: string;
  partNumber: string;
  ncm: string;
  weight: string;
  quantity: string;
  fobUsd: number;
  fobBrl: number;
  iiRate: number;
  iiIsEx?: boolean;
  ipiRate: number;
  pisRate: number;
  cofinsRate: number;
  icmsRate: number;
  effectiveTaxRate: number;
  status: 'Validado' | 'Revisar';
  
  // Expanded detailed attributes
  diDescription?: string;
  legalFramework?: string;
  neshGrounds?: string;
  cositReport?: string;
  rgiRules?: string;
  
  // Calculated tax values (in BRL)
  cifBrl?: number;
  iiAmount?: number;
  ipiAmount?: number;
  pisAmount?: number;
  cofinsAmount?: number;
  icmsGrossUpBase?: number;
  icmsAmount?: number;
  totalImportTax?: number;

  auditHash?: string;
  riskLevel?: 'Baixo' | 'Médio' | 'Alto';
  alertNote?: string;
}

export interface ComparativeItem {
  id: string;
  itemNumber: string;
  title: string;
  quantityStr: string;
  previousNcm: string;
  previousTaxes: string;
  previousTotalRate: string;
  rateDifference: string;
  newNcm: string;
  newTaxes: string;
  newTotalRate: string;
  technicalDescription: string;
  yearlySavings: string;
}

export interface NcmSearchResult {
  code: string;
  shortDescription: string;
  chapter: string;
  chapterCode: string;
  iiRate: string;
  ipiRate: string;
  pisRate: string;
  cofinsRate: string;
  icmsRate: string;
  effectiveRate: string;
  exTarifario: string;
  exTarifarioType?: 'BK' | 'BIT' | 'Não';
  technicalDescription: string;
  neshNote: string;
  legalAct: string;
  subitemTec: string;
  exTarifarioDetails?: string;
}

export interface FiscalProfile {
  regime: 'real' | 'presumido' | 'simples';
  customsState: string;
  modal: string;
  specialRegimes: string[];
  currency: string;
  alerts: {
    exTarifario: boolean;
    antidumping: boolean;
    cosit: boolean;
    exchangeVariation: boolean;
    drawbackExpiry: boolean;
  };
}
