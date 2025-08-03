import { Files } from './Files';

export interface ClinicalHistoryEntry {
  id: number;
  patientFullName: string;
  professionalFullName: string;
  dateTime: string;
  description: string;
  procedureIds: number[];
  procedureNames: string[];
  files: Files[];
}
