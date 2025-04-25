import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-quiz-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-quiz-table.component.html',
  styleUrl: './admin-quiz-table.component.css'
})
export class AdminQuizTableComponent {
  quizzes: any[] = [];

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.http.get<any[]>('http://localhost:4000/quizzes').subscribe(data => {
      this.quizzes = data;
    });
  }

  viewResults(quiz: any): void {
    const encodedTitle = encodeURIComponent(quiz.title);
    this.router.navigate(['/view-results', encodedTitle]);
  }
}

