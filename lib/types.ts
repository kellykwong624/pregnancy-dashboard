export type PregnancyStatus = "trying" | "pregnant" | "loss" | "postpartum";

export type Pregnancy = {
  id: string;
  label: string;
  status: PregnancyStatus;
  lmp?: string;
  dueDate?: string;
  positiveTestDate?: string;
  endDate?: string;
  notes?: string;
};

export type Appointment = {
  id: string;
  pregnancyId: string;
  date: string;
  time?: string;
  provider?: string;
  type: string;
  location?: string;
  notes?: string;
  completed?: boolean;
};

export type Question = {
  id: string;
  pregnancyId: string;
  text: string;
  category: "appointment" | "symptoms" | "exercise" | "medications" | "testing" | "delivery" | "other";
  priority: "normal" | "important";
  answered?: boolean;
  answer?: string;
};

export type Cycle = {
  id: string;
  startDate: string;
  endDate?: string;
  ovulationDate?: string;
  positiveTestDate?: string;
  notes?: string;
};
