import { Files } from "./Files";
import { Patient } from "./Patient";

export interface ClinicalHistoryEntry {
    id: number;
    date: string;
    patient: Patient;
    description: string;
    dateTime: string;
    professionalFullName: string;
    professionalId: number;
    reason: string;
    state: string;
    files: Files[];
}