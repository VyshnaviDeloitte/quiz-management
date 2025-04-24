import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

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

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<any[]>('http://localhost:3000/quizzes').subscribe(data => {
      this.quizzes = data;
      const today = new Date();

      // Count active quizzes
      this.active = this.quizzes.filter(q => {
        const endDate = q.endDate ? new Date(q.endDate) : null;
        return endDate && endDate > today;
      }).length;
    });
  }

  enrollInQuiz(quiz: any) {
    const updatedQuiz = {
      ...quiz,
      enrolled: (quiz.enrolled || 0) + 1
    };

    this.http.put(`http://localhost:3000/quizzes/${quiz.id}`, updatedQuiz).subscribe(updated => {
      quiz.enrolled = updatedQuiz.enrolled;
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