export interface Patient {
  id?: number;
  fullName: string;
  documentType: string;
  documentNumber: string;
  healthInsuranceId: number;
  insurancePlanId: number;
  healthInsuranceName: string;
  insurancePlanName: string;
  phone: string;
  email: string;
  registrationDate: string | null;
  lastVisitDate: string | null;
  note: string;
  state: string;
}
