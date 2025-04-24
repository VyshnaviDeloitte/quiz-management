import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-quiz-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-quiz-table.component.html',
  styleUrl: './admin-quiz-table.component.css'
})
export class AdminQuizTableComponent {

  quizzes: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<any[]>('http://localhost:4000/quizzes').subscribe(data => {
      this.quizzes = data;
    });
  }

  viewResults(quiz: any) {
    console.log('Viewing results for quiz:', quiz.title);
    alert(`Results would open for quiz: ${quiz.title}`);
    // You can later open a modal or route to a detail page
  }

}
