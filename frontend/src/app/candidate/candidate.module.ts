import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { InterviewSessionComponent } from './interview-session/interview-session.component';

const routes: Routes = [
  { path: 'session/:token', component: InterviewSessionComponent },
  { path: '', redirectTo: '/auth/login', pathMatch: 'full' }
];

@NgModule({
  declarations: [
    InterviewSessionComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes)
  ]
})
export class CandidateModule { } 