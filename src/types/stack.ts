export interface Action {
  id: string;
  text: string;
  completed: boolean;
  skipped: boolean;
  streak: number;
}

export interface Stack {
  id: string;
  title: string;
  isExpanded: boolean;
  actions: Action[];
  streak: number;
  scheduleType?: "daily" | "weekly" | "interval" | "biweekly" | "monthly" | "oneTime" | "none";
  scheduleDays?: string[];
  interval?: number;
  isSchedulable?: boolean;
  startDate?: string;
  isOneTime?: boolean;
  dayOfMonth?: number;
  user_id?: string;
  routine_id?: string | null;
  created_at?: string;
  updated_at?: string;
}
