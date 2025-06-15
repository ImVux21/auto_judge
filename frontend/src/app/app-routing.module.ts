import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "./shared/guards/auth.guard";
import { RoleGuard } from "./shared/guards/role.guard";
import { ProfileComponent } from "./profile/profile.component";

const routes: Routes = [
  {
    path: "",
    redirectTo: "/auth/login",
    pathMatch: "full",
  },
  {
    path: "auth",
    loadChildren: () => import("./auth/auth.module").then((m) => m.AuthModule),
  },
  {
    path: "interviewer",
    loadChildren: () =>
      import("./interviewer/interviewer.module").then(
        (m) => m.InterviewerModule
      ),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ["ROLE_INTERVIEWER", "ROLE_ADMIN"] },
  },
  {
    path: "candidate",
    loadChildren: () =>
      import("./candidate/candidate.module").then((m) => m.CandidateModule),
    canActivate: [AuthGuard],
    data: { roles: ["ROLE_CANDIDATE", "ROLE_INTERVIEWER", "ROLE_ADMIN"] },
  },
  {
    path: "analytics",
    loadChildren: () =>
      import("./analytics/analytics.module").then((m) => m.AnalyticsModule),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ["ROLE_INTERVIEWER", "ROLE_ADMIN"] },
  },
  {
    path: "profile",
    component: ProfileComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "**",
    redirectTo: "/auth/login",
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
