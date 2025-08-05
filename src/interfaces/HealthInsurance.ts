export interface Plan {
  id: number;
  name: string;
  healthInsuranceId: number;
}

export interface HealthInsurance {
  id: number;
  name: string;
  contactEmail: string;
  phone: string;
  note: string;
  isActive: boolean;
  plans: Plan[];
}

export type NewHealthInsurance = Omit<HealthInsurance, 'id' | 'isActive' | 'plans'>;
