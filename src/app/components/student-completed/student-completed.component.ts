import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-student-completed',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-completed.component.html',
  styleUrls: ['./student-completed.component.css']
})
export class StudentCompletedComponent implements OnInit {

  quizzes: any[] = [];
  completedCourses: any[] = [];
  active: number = 0;
  enrolledCount: number = 0;
  completedCount: number = 0;
  username: string = '';
  score: number = 0;
  questions: any[] = [];
 

  @ViewChild('resultModal') resultModal!: TemplateRef<any>; // Reference to the modal template

  constructor(private http: HttpClient, public router: Router, private modalService: NgbModal) {}

  ngOnInit(): void {
    this.loadQuizzes();
    this.loadUserData();
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
        this.completedCourses = student.completedCourses || [];
        this.completedCount = this.completedCourses.length;

        // Calculate enrolled count if needed
        this.enrolledCount = (student.enrolledCourses || []).length;
      });
    }
  }

  getDuration(examName: string): string {
    const quiz = this.quizzes.find(q => q.title.toLowerCase() === examName.toLowerCase());
    return quiz ? quiz.duration.toString() : 'N/A';
  }

  openModal(course: any) {
    const quiz = this.quizzes.find(q => q.title.toLowerCase() === course.examName.toLowerCase());
    if (quiz) {
      this.score = course.score;
      this.questions = quiz.questions;
      this.modalService.open(this.resultModal);
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