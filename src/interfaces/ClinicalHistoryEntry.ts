import { Patient } from "./Patient";

export interface ClinicalHistoryEntry {
    id: number;
    patient: Patient;
    dateTime: string;
    professionalFullName: string;
    reason: string;
    state: string;
}