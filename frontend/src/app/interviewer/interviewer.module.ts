import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { DashboardComponent } from './dashboard/dashboard.component';
import { CreateInterviewComponent } from './create-interview/create-interview.component';
import { InterviewListComponent } from './interview-list/interview-list.component';
import { InterviewDetailComponent } from './interview-detail/interview-detail.component';
import { SharedModule } from '../shared/shared.module';

const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent },
  { path: 'interviews', component: InterviewListComponent },
  { path: 'interviews/create', component: CreateInterviewComponent },
  { path: 'interviews/:id', component: InterviewDetailComponent },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
];

@NgModule({
  declarations: [
    DashboardComponent,
    CreateInterviewComponent,
    InterviewListComponent,
    InterviewDetailComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    SharedModule
  ]
})
export class InterviewerModule { } 