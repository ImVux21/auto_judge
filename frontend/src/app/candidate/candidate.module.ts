import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InterviewSessionComponent } from './interview-session/interview-session.component';
import { SessionListComponent } from './session-list/session-list.component';
import { SessionStartComponent } from './session-start/session-start.component';
import { SessionCompleteComponent } from './session-complete/session-complete.component';
import { SharedModule } from '../shared/shared.module';

const routes: Routes = [
  { path: 'sessions', component: SessionListComponent },
  { path: 'session/:token/start', component: SessionStartComponent },
  { path: 'session/:token', component: InterviewSessionComponent },
  { path: 'session/:token/complete', component: SessionCompleteComponent },
  { path: '', redirectTo: 'sessions', pathMatch: 'full' }
];

@NgModule({
  declarations: [
    InterviewSessionComponent,
    SessionListComponent,
    SessionStartComponent,
    SessionCompleteComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    SharedModule,
    FormsModule
  ]
})
export class CandidateModule { } 