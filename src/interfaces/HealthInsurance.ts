export interface HealthInsurancePlan {
  id: number;
  name: string;
}

export interface HealthInsurance {
  id: number;
  name: string;
  contactEmail: string;
  phone: string;
  note: string;
  isActive: boolean;
  plans: HealthInsurancePlan[];
}
