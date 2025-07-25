export interface Schedule {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

export interface Professional {
  professionalId: number;
  professionalName: string;
  documentType: string;
  documentNumber: string;
  phone: string;
  specialties: string;
  schedules: Schedule[];
  professionalState: string;
}
