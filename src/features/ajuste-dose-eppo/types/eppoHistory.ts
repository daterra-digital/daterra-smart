export interface EppoHistoryRecord {
  id?: number;
  userId?: string;
  date: string;
  inputs: Record<string, any>;
  results: Record<string, any>;
}
