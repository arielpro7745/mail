export type Area = 14 | 45;

/* ---------- חלוקה רגילה ---------- */
export interface Street {
  id: string;
  name: string;
  area: Area;
  isBig: boolean;
  lastDelivered: string;
}

/* ---------- בניינים ‑↠‑ דיירים ---------- */
export interface Resident {
  id: string;
  fullName: string;
  apartment: string;
  phone?: string;
  familyPhones?: string[];
  allowMailbox?: boolean;
  allowDoor?: boolean;
}

export interface Building {
  id: string;
  streetId: string;
  number: number;
  entrance?: string;
  code?: string;
  residents: Resident[];
}
