import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { NgChartsModule } from 'ng2-charts';

import { AnalyticsDashboardComponent } from './analytics-dashboard/analytics-dashboard.component';
import { InterviewAnalyticsComponent } from './interview-analytics/interview-analytics.component';
import { SessionAnalyticsComponent } from './session-analytics/session-analytics.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: AnalyticsDashboardComponent },
  { path: 'interview/:id', component: InterviewAnalyticsComponent },
  { path: 'session/:id', component: SessionAnalyticsComponent }
];

@NgModule({
  declarations: [
    AnalyticsDashboardComponent,
    InterviewAnalyticsComponent,
    SessionAnalyticsComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule,
    NgChartsModule
  ]
})
export class AnalyticsModule { } 