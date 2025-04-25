import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
interface CompletedCourse {
  examName?: string;
  score?: number;
}

interface User {
  email?: string;
  completedCourses?: CompletedCourse[];
}


@Component({
  selector: 'app-view-rersults',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view-rersults.component.html',
  styleUrl: './view-rersults.component.css'
})
export class ViewRersultsComponent {

  examTitle: string = '';
  results: { studentName: string; score: number }[] = [];

  constructor(private http: HttpClient, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const title = params.get('examTitle');
      if (title) {
        this.examTitle = decodeURIComponent(title);
        this.fetchResults();
      }
    });
  }

  private fetchResults(): void {
    const normalizedExamTitle = this.examTitle.trim().toLowerCase();

    this.http.get<User[]>('http://localhost:3000/users').subscribe(users => {
      this.results = users
        .filter(user =>
          Array.isArray(user.completedCourses) &&
          user.completedCourses.some(course =>
            course.examName?.trim().toLowerCase() === normalizedExamTitle
          )
        )
        .map(user => {
          const relevantCourses = (user.completedCourses ?? []).filter(course =>
            course.examName?.trim().toLowerCase() === normalizedExamTitle
          );

          const totalScore = relevantCourses.reduce(
            (sum, course) => sum + (course.score ?? 0),
            0
          );

          return {
            studentName: user.email?.split('@')[0] ?? 'Unknown',
            score: totalScore
          };
        });
    });
  }


}
