// student-quiz-page.ts
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
  @ViewChild('confirmationModal') confirmationModal: any;
  @ViewChild('resultModal') resultModal: any;

  quizId: string = '';
  quiz: any;
  questions: any[] = [];
  timeLeft: number = 0;
  timerDisplay: string = '00:00:00';
  interval: any;
  quizForm: FormGroup;
  score: number = 0;
  private modalRef: NgbModalRef | undefined;

  // Pagination
  pageSize = 5;
  currentPage = 0;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    public router: Router,
    private modalService: NgbModal
  ) {
    // Initialize with an empty structure to avoid errors before data loads
    this.quizForm = new FormGroup({
      answers: new FormArray([])
    });
  }

  ngOnInit(): void {
    this.quizId = this.route.snapshot.paramMap.get('id') || '';
    if (this.quizId) {
      this.http.get<any>(`http://localhost:4000/quizzes/${this.quizId}`).subscribe(data => {
        this.quiz = data;
        this.questions = data.questions || [];
        // Ensure duration is a number, default to 0 if not provided
        this.timeLeft = (Number(this.quiz.duration) || 0) * 60;

        // Clear previous form controls if any (e.g., navigating back and forth)
        const answersArray = this.quizForm.get('answers') as FormArray;
        while (answersArray.length) {
            answersArray.removeAt(0);
        }

        // Add new form controls for the loaded questions
        this.questions.forEach(() => {
          answersArray.push(new FormGroup({
            selectedAnswer: new FormControl(null) // Use null or '' as default
          }));
        });

        // Check if there are questions before starting timer
        if (this.questions.length > 0 && this.timeLeft > 0) {
             this.startTimer();
        } else if (this.timeLeft <= 0) {
            this.timerDisplay = '00:00:00';
            console.warn("Quiz duration is zero or invalid. Timer not started.");
        }

      }, error => {
        console.error("Failed to load quiz data", error);
        alert("Error loading quiz. Please go back and try again.");
        this.router.navigate(['/student-dashboard']); // Navigate back on error
      });
    } else {
      console.error("No Quiz ID provided in route.");
      alert("Error: Quiz ID is missing.");
      this.router.navigate(['/student-dashboard']); // Navigate back if no ID
    }
  }

  ngOnDestroy(): void {
    clearInterval(this.interval); // Clear timer when component is destroyed
    if (this.modalRef) { // Close any open modals
      this.modalRef.close();
    }
  }

  startTimer() {
    this.updateDisplay(); // Initial display
    this.interval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
        this.updateDisplay();
      } else {
        clearInterval(this.interval);
        this.timerDisplay = '00:00:00';
        alert("Time's up! Submitting your quiz.");
        this.submitQuiz(); // Auto-submit when time runs out
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

  // Getter for easier access in template (optional)
  get answers(): FormArray {
    return this.quizForm.get('answers') as FormArray;
  }

  onAnswerChange(index: number, selectedOption: string): void {
    // No explicit action needed here anymore if using formControlName correctly,
    // but you could add logging or validation if required.
    // console.log(`Question ${index + 1} answer changed to: ${selectedOption}`);
  }

  // --- Pagination ---
  get totalPages(): number {
     if (!this.questions || this.questions.length === 0) return 0;
     return Math.ceil(this.questions.length / this.pageSize);
  }

  // Returns the questions for the current page
  get pagedQuestions(): any[] {
     if (!this.questions || this.questions.length === 0) return [];
    const start = this.currentPage * this.pageSize;
    return this.questions.slice(start, start + this.pageSize);
  }

  // Gets the starting index for the current page (e.g., 0, 5, 10)
  get currentPageStartIndex(): number {
    return this.currentPage * this.pageSize;
  }

  nextPage() {
    if (!this.isLastPage()) {
      this.currentPage++;
    }
  }

  prevPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
    }
  }

  // Checks if the current page is the last one
  isLastPage(): boolean {
    return this.currentPage >= this.totalPages - 1;
  }

  // Determine if pagination controls should be shown
  showPaginationButtons(): boolean {
    return this.totalPages > 1;
  }
  // --- End Pagination ---


  onSubmit() {
    // Ask for confirmation only if the timer hasn't run out
    if (this.timeLeft > 0) {
      this.openConfirmationModal();
    } else {
      // If time is up, submit directly (already alerted user in timer logic)
      this.submitQuiz();
    }
  }

  openConfirmationModal() {
    // Ensure modalService is available
    if (!this.modalService) {
        console.error("Modal service is not available.");
        // Fallback to browser confirm if needed, though less ideal
        if (confirm("Are you sure you want to submit?")) {
            this.submitQuiz();
        }
        return;
    }
    // Close previous modal if any exists
     if (this.modalRef) {
        this.modalRef.close();
    }

    this.modalRef = this.modalService.open(this.confirmationModal, {
      ariaLabelledBy: 'modal-title', // Use a relevant ID from your modal template if available
      backdrop: 'static', // Prevent closing by clicking outside
      keyboard: false // Prevent closing with Esc key
    });

    this.modalRef.result.then(
        (result) => { // On modal close ('yes' button)
            if (result === 'yes') {
                this.submitQuiz();
            }
             this.modalRef = undefined; // Reset modal ref
        },
        (reason) => { // On modal dismiss (e.g., 'no' button, clicking 'x')
            console.log('Submission cancelled');
             this.modalRef = undefined; // Reset modal ref
        }
     );
  }

  submitQuiz() {
    clearInterval(this.interval); // Stop the timer permanently

    // Get the raw values from the FormArray
    const formAnswers = this.answers.value; // This gives an array like [{selectedAnswer: 'Option A'}, {selectedAnswer: 'Option C'}, ...]

    // Calculate score
    this.score = this.questions.reduce((acc, question, index) => {
      const selectedAnswer = formAnswers[index]?.selectedAnswer; // Get the selected answer for this question index
      const correctAnswer = question.options[question.correctOptionIndex]; // Assumes correctOptionIndex points to the correct option string in the options array

      // console.log(`Q${index+1}: Selected: ${selectedAnswer}, Correct: ${correctAnswer}`); // Debugging

      if (selectedAnswer && selectedAnswer === correctAnswer) {
        // Award points - use question.points if available, otherwise default to 1
        return acc + (question.points || 1);
      }
      return acc; // No points if incorrect or not answered
    }, 0);

    // --- Update User Data ---
    const userStr = localStorage.getItem('user');
    if (userStr && this.quiz) { // Ensure quiz data is loaded
      const user = JSON.parse(userStr);
      const today = new Date().toISOString().split('T')[0]; // Format as YYYY-MM-DD

      const completedExam = {
        examName: this.quiz.title,
        score: this.score,
        totalScore: this.questions.reduce((sum, q) => sum + (q.points || 1), 0), // Calculate total possible score
        date: today,
        quizId: this.quiz.id // Store quizId for reference
      };

      // Fetch the LATEST student data before updating
      this.http.get<any[]>(`http://localhost:3000/users?email=${user.email}`).subscribe(users => {
        if (users && users.length > 0) {
            const student = users[0];

            // *** CORRECTED LOGIC HERE ***
            // 1. Remove from enrolledCourses (match by quizId or examName)
            const updatedEnrolledCourses = (student.enrolledCourses || []).filter(
                (course: any) => course.quizId !== this.quiz.id && course.examName !== this.quiz.title // Check both just in case
            );

            // 2. Add to completedCourses
            //    Handle multiple attempts: If allowMultipleAttempts is true, just add.
            //    If false, filter out previous attempts first.
            let updatedCompletedCourses = [...(student.completedCourses || [])];
            if (!this.quiz.allowMultipleAttempts) {
                 updatedCompletedCourses = updatedCompletedCourses.filter(
                     (course: any) => course.quizId !== this.quiz.id && course.examName !== this.quiz.title
                 );
            }
             updatedCompletedCourses.push(completedExam);


            // Prepare the final updated student object
            const updatedStudent = {
              ...student,
              enrolledCourses: updatedEnrolledCourses, // Use the filtered enrolled list
              completedCourses: updatedCompletedCourses // Use the updated completed list
            };

            // Send the update to the server
            this.http.put(`http://localhost:3000/users/${student.id}`, updatedStudent).subscribe(() => {
              // Update local storage with the new state
              localStorage.setItem('user', JSON.stringify(updatedStudent));
              console.log('User data updated successfully on server and localStorage.');
              // Open the result modal AFTER successful update
              this.openResultModal();
            }, error => {
                console.error("Failed to update user data on server:", error);
                alert("Failed to save your quiz results. Please try again or contact support.");
                // Optionally re-enable submit button or provide retry mechanism
            });
        } else {
            console.error("Could not find user on server to update results.");
            alert("Error saving results: User not found.");
        }
      }, error => {
          console.error("Failed to fetch user data before updating results:", error);
          alert("Error saving results: Could not verify user data.");
      });

    } else {
      console.error("User not logged in or quiz data missing. Cannot save results.");
      // Maybe redirect to login or dashboard
      alert("Cannot save results. Please log in and try again.");
      this.router.navigate(['/login']);
    }
  }

  openResultModal() {
     // Close previous modal if any exists
     if (this.modalRef) {
        this.modalRef.close();
    }
    this.modalRef = this.modalService.open(this.resultModal, {
      ariaLabelledBy: 'modal-result-title', // Use a relevant ID from your modal template
      backdrop: 'static',
      keyboard: false
    });

     // Handle modal close/dismiss (optional: could be handled by button inside modal)
      this.modalRef.result.then(
        (result) => {
             console.log("Result modal closed with:", result);
             this.modalRef = undefined;
             // Optionally navigate from here if not handled by the modal button
             // this.router.navigate(['/student-dashboard']);
        },
        (reason) => {
             console.log("Result modal dismissed with:", reason);
             this.modalRef = undefined;
             // Navigate even if dismissed?
             this.router.navigate(['/student-dashboard']);
        }
     );
  }
}



