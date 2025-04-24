import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-student-enrolled',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-enrolled.component.html',
  styleUrl: './student-enrolled.component.css'
})
export class StudentEnrolledComponent {

  
  quizzes: any[] = [];
  enrolledCourses: any[] = [];
  active: number = 0;
  enrolledCount: number = 0;
  completedCount: number = 0;
  username: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.loadQuizzes();
    this.loadUserData();
      

    this.http.get<any[]>('http://localhost:4000/quizzes').subscribe(data => {
      this.quizzes = data;

      const today = new Date();
      this.active = this.quizzes.filter(q => {
        const endDate = q.endDate ? new Date(q.endDate) : null;
        return endDate && endDate > today;
      }).length;
    });
  }

  loadQuizzes() {
    this.http.get<any[]>('http://localhost:4000/quizzes').subscribe(data => {
      this.quizzes = data;
    });
  }

  loadUserData() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      this.username = user.email.split('@')[0];

      this.http.get<any[]>(`http://localhost:3000/users?email=${user.email}`).subscribe(users => {
        const student = users[0];
        this.enrolledCourses = student.completedCourses || [];
        this.completedCount = (student.completedCourses || []).length;
        this.enrolledCount = (student.enrolledCourses || []).length;
      });
    }
  }

  getDuration(examName: string): string {
    const quiz = this.quizzes.find(q => q.title.toLowerCase() === examName.toLowerCase());
    return quiz ? quiz.duration.toString() : 'N/A';
  }

  onStart(examName: string) {
    const matchedQuiz = this.quizzes.find(q => q.title.toLowerCase() === examName.toLowerCase());
    if (matchedQuiz) {
      this.router.navigate([`/quiz-page/${matchedQuiz.id}`]);
    } else {
      console.error('Quiz ID not found for exam:', examName);
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