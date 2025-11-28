export type View = 'dashboard' | 'matrix' | 'suggestions' | 'alerts' | 'reports' | 'inventory' | 'purchasing' | 'catalog';

export type ComplianceStatus = 'Validado' | 'En Revisión' | 'No Conforme';
export type RiskLevel = 'Bajo' | 'Medio' | 'Alto';

export interface Material {
  sku: string;
  description: string;
  stock: number;
  location: string;
  complianceStatus: ComplianceStatus;
  riskLevel: RiskLevel;
}

export interface Suggestion {
    id: number;
    originalSku: string;
    substituteSku: string;
    justification: string;
    status: 'Pendiente de Validación en Sphera' | 'Aprobado' | 'Rechazado';
    submittedBy: string;
}


export interface Substitute extends Material {
  compatibility: number;
  justification: string;
}

export interface SubstitutionResult {
  original: Material;
  substitutes: Substitute[];
}

export interface Alert {
  id: string;
  type: 'OBSOLESCENCE' | 'OVERSTOCK' | 'LOW_STOCK';
  severity: 'high' | 'medium' | 'low';
  materialSku: string;
  message: string;
  timestamp: string;
}

export interface Kpi {
  label: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease';
}

export interface InventoryData {
    name: string;
    value: number;
    // FIX: Add index signature to make the type compatible with the recharts Pie component.
    // Recharts adds its own properties to the data objects, which requires an indexable type to prevent TypeScript errors.
    [key: string]: any;
}

export interface ConsolidationSuggestion {
  fromSku: string;
  toSku: string;
  location: string;
  justification: string;
}

export interface PurchaseRequest {
  sku: string;
  description: string;
}