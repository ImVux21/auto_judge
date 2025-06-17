export interface AnalyticsData {
  id: string;
  date: Date;
  type: string;
  value: number;
  metadata?: Record<string, any>;
}

export interface AnalyticsSummary {
  totalInterviews: number;
  completedInterviews: number;
  averageScore: number;
  passRate: number;
}
