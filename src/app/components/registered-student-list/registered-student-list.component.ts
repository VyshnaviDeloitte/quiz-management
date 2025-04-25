import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';

@Component({
  selector: 'app-registered-student-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './registered-student-list.component.html',
  styleUrl: './registered-student-list.component.css'
})
export class RegisteredStudentListComponent {
  students: string[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<any[]>('http://localhost:3000/users').subscribe(users => {
      this.students = users
        .filter(user =>
          (user.enrolledCourses && user.enrolledCourses.length > 0) ||
          (user.completedCourses && user.completedCourses.length > 0)
        )
        .map(user => user.email.split('@')[0]); // Extract name before '@'
    });
  }

  
}
