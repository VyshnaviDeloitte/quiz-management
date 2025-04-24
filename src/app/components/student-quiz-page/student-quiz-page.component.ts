import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, FormArray } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-student-quiz-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './student-quiz-page.component.html',
  styleUrls: ['./student-quiz-page.component.css'],
  providers: [NgbModal]
})
export class StudentQuizPageComponent implements OnInit, OnDestroy {
  @ViewChild('confirmationModal') confirmationModal: any; // Modal reference for confirmation
  @ViewChild('resultModal') resultModal: any; // Modal reference for result

  quizId: string = '';
  quiz: any;
  questions: any[] = [];
  timeLeft: number = 0;
  timerDisplay: string = '00:00:00';
  interval: any;
  quizForm: FormGroup;
  score: number = 0;
  private modalRef: NgbModalRef | undefined;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    public router: Router,
    private modalService: NgbModal
  ) {
    this.quizForm = new FormGroup({
      answers: new FormArray([]) // Initialize an empty FormArray
    });
  }

  ngOnInit(): void {
    this.quizId = this.route.snapshot.paramMap.get('id') || '';
    if (this.quizId) {
      this.http.get<any>(`http://localhost:4000/quizzes/${this.quizId}`).subscribe(data => {
        this.quiz = data;
        this.questions = data.questions || [];
        this.timeLeft = this.quiz.duration * 60;

        const formGroups = this.questions.map(() => new FormGroup({
          selectedAnswer: new FormControl(null) // Initialize each FormGroup with selectedAnswer
        }));

        this.quizForm = new FormGroup({
          answers: new FormArray(formGroups) // Populate the FormArray
        });

        this.startTimer();
      });
    }
  }

  get answers(): FormArray {
    return this.quizForm.get('answers') as FormArray;
  }

  ngOnDestroy(): void {
    clearInterval(this.interval);
    if (this.modalRef) {
      this.modalRef.close();
    }
  }

  startTimer() {
    this.updateDisplay();
    this.interval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
        this.updateDisplay();
      } else {
        clearInterval(this.interval);
        this.submitQuiz();
      }
    }, 1000);
  }

  updateDisplay() {
    const hrs = Math.floor(this.timeLeft / 3600);
    const mins = Math.floor((this.timeLeft % 3600) / 60);
    const secs = this.timeLeft % 60;
    this.timerDisplay = `${this.pad(hrs)}:${this.pad(mins)}:${this.pad(secs)}`;
  }

  pad(val: number): string {
    return val < 10 ? '0' + val : val.toString();
  }

  onAnswerChange(index: number, selectedOption: string): void {
    const control = (this.quizForm.get('answers') as FormArray).at(index);
    control.get('selectedAnswer')?.setValue(selectedOption);
  }

  // Method to handle Submit button click
  onSubmit() {
    if (this.timeLeft > 0) {
      this.openConfirmationModal();
    } else {
      this.submitQuiz();
    }
  }

  // Show the confirmation modal
  openConfirmationModal() {
    const modalRef = this.modalService.open(this.confirmationModal, {
      ariaLabelledBy: 'modal-title',
      backdrop: 'static',
      keyboard: false
    });

    modalRef.result.then((result) => {
      if (result === 'yes') {
        this.submitQuiz();
      } else {
        modalRef.close();
      }
    });
  }

  submitQuiz() {
    clearInterval(this.interval);

    const selectedAnswers = (this.quizForm.get('answers') as FormArray).controls.map(
      ctrl => ctrl.get('selectedAnswer')?.value
    );

    this.score = this.questions.reduce((acc, question, index) => {
      const selected = selectedAnswers[index];
      const correct = question.options[question.correctOptionIndex];

      return selected === correct ? acc + (question.points || 1) : acc;
    }, 0);

    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      const today = new Date().toISOString().split('T')[0];
      const completedExam = {
        examName: this.quiz.title,
        score: this.score,
        date: today
      };

      this.http.get<any[]>(`http://localhost:3000/users?email=${user.email}`).subscribe(users => {
        const student = users[0];
        const updatedStudent = {
          ...student,
          completedCourses: [...(student.completedCourses || []), completedExam]
        };

        this.http.put(`http://localhost:3000/users/${student.id}`, updatedStudent).subscribe(() => {
          localStorage.setItem('user', JSON.stringify(updatedStudent));
          this.openResultModal(); // Open result modal upon successful submission
        });
      });
    }
  }

  openResultModal() {
    const modalRef = this.modalService.open(this.resultModal, {
      ariaLabelledBy: 'modal-title',
      backdrop: 'static',
      keyboard: false
    });
  }
}
