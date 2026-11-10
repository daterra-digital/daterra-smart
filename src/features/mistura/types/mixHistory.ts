export interface MixHistoryRecord {
  id?: number;
  userId?: string;
  date: string;
  title?: string;
  selected_formulation_ids: string[];
  tank_capacity_l?: number;
  water_initial_l?: number;
  water_final_l?: number;
  notes?: string;
}
