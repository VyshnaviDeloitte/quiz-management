import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-dashboard.component.html',
  styleUrl: './student-dashboard.component.css'
})
export class StudentDashboardComponent implements OnInit {
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

  navigateTo(type: 'enrolled' | 'completed') {
    this.router.navigate([`/student/${type}`]);
  }

  
  enrollInQuiz(quiz: any) {
    const updatedQuiz = {
      ...quiz,
      enrolled: (quiz.enrolled || 0) + 1
    };

    this.http.put(`http://localhost:4000/quizzes/${quiz.id}`, updatedQuiz).subscribe(updated => {
      quiz.enrolled = updatedQuiz.enrolled;
    });

    const userStr = localStorage.getItem('user');
    if (!userStr) return;

    const user = JSON.parse(userStr);

    this.http.get<any[]>(`http://localhost:3000/users?email=${user.email}`).subscribe(users => {
      const student = users[0];

      const alreadyEnrolled = (student.enrolledCourses || []).some((c: any) => c.examName === quiz.title);
      if (alreadyEnrolled) {
        alert(`You are already enrolled in ${quiz.title}.`);
        return;
      }

      const enrolledCourse = {
        examName: quiz.title,
        date: new Date().toISOString().split('T')[0]
      };

      const updatedStudent = {
        ...student,
        enrolledCourses: [...(student.enrolledCourses || []), enrolledCourse]
      };

      this.http.put(`http://localhost:3000/users/${student.id}`, updatedStudent).subscribe(() => {
        localStorage.setItem('user', JSON.stringify(updatedStudent));
        this.enrolledCount++;
        alert(`Enrolled in quiz: ${quiz.title}`);
      });
    });
  }

  startQuiz(quiz: any) {
    const userStr = localStorage.getItem('user');
    if (!userStr) return;

    const user = JSON.parse(userStr);
    const today = new Date().toISOString().split('T')[0];

    const completedExam = {
      examName: quiz.title,
      score: 0,
      date: today
    };

    this.http.get<any[]>(`http://localhost:3000/users?email=${user.email}`).subscribe(users => {
      const student = users[0];

      const alreadyCompleted = (student.completedCourses || []).some((c: any) => c.examName === quiz.title);
      if (alreadyCompleted) {
        alert(`You already completed ${quiz.title}.`);
        return;
      }

      const updatedStudent = {
        ...student,
        completedCourses: [...(student.completedCourses || []), completedExam]
      };

      this.http.put(`http://localhost:3000/users/${student.id}`, updatedStudent).subscribe(() => {
        localStorage.setItem('user', JSON.stringify(updatedStudent));
        this.completedCount++;
        alert(`Quiz "${quiz.title}" started and added to completedCourses.`);
      });
    });
  }

  getDifficultyClass(difficulty: string): string {
    switch (difficulty?.toLowerCase()) {
      case 'high':
        return 'tag high';
      case 'medium':
        return 'tag medium';
      case 'easy':
      default:
        return 'tag easy';
    }
  }
}