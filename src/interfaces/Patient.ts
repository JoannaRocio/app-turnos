export interface Patient {
  id: number;
  fullName: string;
  documentType: string;
  documentNumber: string;
  healthInsurance: string;
  insurancePlan: string;
  phone: string;
  registrationDate: string | null;
  lastVisitDate: string | null;
  note: string;
  state: string;
}
