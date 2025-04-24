import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-student-completed',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-completed.component.html',
  styleUrl: './student-completed.component.css'
})
export class StudentCompletedComponent {

  quizzes: any[] = [];
  active: number = 0;
  enrolledCount: number = 0;
  completedCount: number = 0;
  username: string = '';  // username extracted from email

   constructor(private http: HttpClient, private router:Router) {}
  
    ngOnInit(): void {
      this.http.get<any[]>('http://localhost:4000/quizzes').subscribe(data => {
        this.quizzes = data;
  
        const today = new Date();
        this.active = this.quizzes.filter(q => {
          const endDate = q.endDate ? new Date(q.endDate) : null;
          return endDate && endDate > today;
        }).length;
      });
  
      //  Load user from localStorage and extract stats and username
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
  
        // Extract username before '@gmail.com'
        this.username = user.email.split('@')[0];
  
        this.http.get<any[]>(`http://localhost:3000/users?email=${user.email}`).subscribe(users => {
          const student = users[0];
          this.enrolledCount = (student.enrolledCourses || []).length;
          this.completedCount = (student.completedCourses || []).length;
        });
      }
    }
  
    navigateTo(type: 'active' | 'enrolled' | 'completed') {
      const routeMap: Record<string, string> = {
        active: '/student-dashboard',
        enrolled: '/student/enrolled',
        completed: '/student/completed'
      };
    
      this.router.navigate([routeMap[type]]);
    }
    
}
