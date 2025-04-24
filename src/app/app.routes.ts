import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { StudentDashboardComponent } from './components/student-dashboard/student-dashboard.component';
import { authGuard } from './services/auth.guard';
import { AdminCreateExamComponent } from './components/admin-create-exam/admin-create-exam.component';
import { StudentEnrolledComponent } from './components/student-enrolled/student-enrolled.component';
import { StudentCompletedComponent } from './components/student-completed/student-completed.component';
import { StudentQuizPageComponent } from './components/student-quiz-page/student-quiz-page.component';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'signup', component: SignupComponent },
    { path: 'admin-dashboard', component: AdminDashboardComponent,canActivate:[authGuard]},
    { path: 'student-dashboard', component: StudentDashboardComponent,canActivate:[authGuard] },
    { path: 'create-exam', component: AdminCreateExamComponent,canActivate:[authGuard] },
    { path: 'student/enrolled', component: StudentEnrolledComponent,canActivate:[authGuard] },
    { path: 'student/completed', component:StudentCompletedComponent,canActivate:[authGuard] },
    { path: 'create-exam', component: StudentCompletedComponent,canActivate:[authGuard] },
    { path: 'quiz-page/:id', component: StudentQuizPageComponent,canActivate:[authGuard] },
  


];