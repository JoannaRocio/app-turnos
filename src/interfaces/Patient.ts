export interface Patient {
    id: number;
    patientName: string;
    appointmentDate: string;
    reason: string;
    dni: number;
    attended: boolean;
    socialSecurity: string;
    plan: string;
    phone: string;
    notes: string;
}