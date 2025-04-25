import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // Import ChangeDetectorRef
import { Router } from '@angular/router';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-dashboard.component.html',
  styleUrls: ['./student-dashboard.component.css']
})
export class StudentDashboardComponent implements OnInit {
  quizzes: any[] = [];
  active: number = 0;
  enrolledCount: number = 0;
  completedCount: number = 0;
  username: string = '';
  currentUser: any = null; // Store fetched user data securely

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef // Inject ChangeDetectorRef
    ) {}

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData(): void {
    // First, load the user data to establish the current user context
    this.loadUserDataAndCounts().then(() => {
      // After user data is confirmed loaded, load the quizzes
      this.loadQuizzes();
    }).catch(error => {
      console.error("Error loading initial user data:", error);
      // Handle critical error, maybe redirect to login
      this.router.navigate(['/login']);
    });
  }

  loadQuizzes(): void {
    this.http.get<any[]>('http://localhost:4000/quizzes').subscribe(data => {
      this.quizzes = data;
      this.calculateActiveQuizzes(); // Calculate active count after quizzes load
      this.cdr.detectChanges(); // Trigger change detection after quizzes load
    }, error => {
        console.error("Failed to load quizzes:", error);
        // Handle error appropriately
    });
  }

  // Make loadUserDataAndCounts return a Promise to ensure it completes before loading quizzes
  loadUserDataAndCounts(): Promise<void> {
    return new Promise((resolve, reject) => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const userFromStorage = JSON.parse(userStr);
            this.username = userFromStorage.email.split('@')[0];

            // Fetch the latest user data from the server
            this.http.get<any[]>(`http://localhost:3000/users?email=${userFromStorage.email}`).subscribe(users => {
            if (users && users.length > 0) {
                this.currentUser = users[0]; // Store the fetched user object
                // Update local storage with the latest data
                localStorage.setItem('user', JSON.stringify(this.currentUser));

                // Calculate counts based on fetched data
                this.enrolledCount = (this.currentUser.enrolledCourses || []).length;
                this.completedCount = (this.currentUser.completedCourses || []).length;

                this.cdr.detectChanges(); // Trigger change detection
                resolve(); // Resolve the promise successfully
            } else {
                console.error("User not found on server.");
                localStorage.removeItem('user'); // Clear invalid user data
                this.currentUser = null;
                this.cdr.detectChanges();
                reject("User not found"); // Reject the promise
            }
            }, error => {
                console.error("Failed to fetch user data", error);
                this.currentUser = null; // Clear user data on error
                this.cdr.detectChanges();
                reject(error); // Reject the promise on HTTP error
            });
        } else {
            // Handle scenario where user is not in local storage
            console.log("No user found in local storage.");
            this.currentUser = null;
            this.cdr.detectChanges();
            reject("User not in local storage"); // Reject the promise
        }
    });
  }



  navigateToStudentDashboard()
  {
    this.router.navigate(['/student-dashboard']);
  }

  navigateToUserDetails()
  {
      this.router.navigate(['/student-details']);
  }

  
  signOut()
  {
    alert('user-signing off');
    this.router.navigate(['login']);
    localStorage.removeItem('user');

  }



  calculateActiveQuizzes(): void {
      if (!this.quizzes || !this.currentUser) {
          this.active = 0;
          return; // Ensure data is available
      }
      const today = new Date();
      this.active = this.quizzes.filter(q => {
        const endDate = q.endDate ? new Date(q.endDate) : null;
        // Check if the quiz date is active
        const isActiveDate = endDate && endDate >= today; // Use >= to include today
        return isActiveDate;
      }).length;
      this.cdr.detectChanges(); // Update view
  }

  // --- Helper methods for button states ---

  isUserEnrolled(quiz: any): boolean {
    if (!this.currentUser || !this.currentUser.enrolledCourses) return false;
    return this.currentUser.enrolledCourses.some((course: any) =>
        (course.quizId === quiz.id || course.examName === quiz.title) // Match by ID (preferred) or name
    );
  }

  isUserCompleted(quiz: any): boolean {
    if (!this.currentUser || !this.currentUser.completedCourses) return false;
    return this.currentUser.completedCourses.some((course: any) =>
        (course.quizId === quiz.id || course.examName === quiz.title) // Match by ID (preferred) or name
    );
  }

  // Determines if the "Enroll" button should be enabled
  canEnroll(quiz: any): boolean {
    if (!this.currentUser) return false; // Cannot enroll if user data isn't loaded
    const isEnrolled = this.isUserEnrolled(quiz);
    const isCompleted = this.isUserCompleted(quiz);
    const allowsMultiple = quiz.allowMultipleAttempts === true; // Explicit check for true

    // Conditions to be able to enroll:
    // 1. Must NOT be currently enrolled.
    // 2. EITHER:
    //    a) Must NOT be completed.
    //    b) OR Must be completed BUT multiple attempts are allowed.
    return !isEnrolled && (!isCompleted || allowsMultiple);
  }

  // Determines if the "Start" button should be enabled
  canStart(quiz: any): boolean {
     if (!this.currentUser) return false; // Cannot start if user data isn't loaded
    const isEnrolled = this.isUserEnrolled(quiz);
    const isCompleted = this.isUserCompleted(quiz);
    const allowsMultiple = quiz.allowMultipleAttempts === true;

    // Conditions to be able to start:
    // 1. Must BE currently enrolled.
    // 2. EITHER:
    //    a) Must NOT be completed.
    //    b) OR Must be completed BUT multiple attempts are allowed.
    //       (Note: The quiz page itself might enforce the completion check again,
    //        but enabling Start here requires being enrolled).
     return isEnrolled && (!isCompleted || allowsMultiple);
  }

  // --- Action Methods ---

  navigateTo(type: 'enrolled' | 'completed' | 'active'): void {
     if (type === 'active') {
        // Optional: could force reload data if needed
        this.router.navigate(['/student-dashboard']);
     } else {
        this.router.navigate([`/student/${type}`]);
     }
  }

  enrollInQuiz(quiz: any): void {
    if (!this.currentUser) {
        alert("User data not loaded. Please refresh and try again.");
        return;
    }

    // Double-check eligibility using the canEnroll logic
    if (!this.canEnroll(quiz)) {
        const isEnrolled = this.isUserEnrolled(quiz);
        const isCompleted = this.isUserCompleted(quiz);
        if (isEnrolled) {
             alert(`You are already enrolled in ${quiz.title}. Click 'Start' to begin.`);
        } else if (isCompleted && !quiz.allowMultipleAttempts) {
             alert(`You have already completed ${quiz.title} and multiple attempts are not allowed.`);
        } else {
            alert(`You cannot enroll in ${quiz.title} at this time.`); // Generic fallback
        }
        return;
    }

    // Proceed with enrollment
    const enrolledCourse = {
      examName: quiz.title,
      date: new Date().toISOString().split('T')[0],
      quizId: quiz.id // Store quizId for reliable reference
    };

    // Update student data optimistically *before* API call for responsiveness
    const originalEnrolledCourses = [...(this.currentUser.enrolledCourses || [])];
    this.currentUser.enrolledCourses = [...originalEnrolledCourses, enrolledCourse];
    this.enrolledCount = this.currentUser.enrolledCourses.length;
    localStorage.setItem('user', JSON.stringify(this.currentUser));
    this.cdr.detectChanges(); // Update UI immediately

    // Prepare data for API
    const updatedStudentData = {
        ...this.currentUser, // Send the already updated user object
        // Ensure arrays are always present, even if empty
        enrolledCourses: this.currentUser.enrolledCourses,
        completedCourses: this.currentUser.completedCourses || []
    };


    // Update user on the backend
    this.http.put(`http://localhost:3000/users/${this.currentUser.id}`, updatedStudentData).subscribe(response => {
       console.log(`Enrollment successful for ${quiz.title}`);
       alert(`Enrolled in quiz: ${quiz.title}`);
       // Data already updated optimistically, backend confirms.
       // Optionally update quiz enrollment count here if needed (separate API call)
       // this.updateQuizEnrollmentCount(quiz, 1); // Example +1
    }, error => {
        console.error("Failed to update user enrollment on server", error);
        alert("Enrollment failed to save on server. Please try again.");
        // Revert optimistic update on failure
        this.currentUser.enrolledCourses = originalEnrolledCourses;
        this.enrolledCount = this.currentUser.enrolledCourses.length;
        localStorage.setItem('user', JSON.stringify(this.currentUser));
        this.cdr.detectChanges(); // Revert UI changes
    });
  }

  startQuiz(quiz: any): void {
    if (!this.currentUser) {
        alert("User data not loaded. Please refresh and try again.");
        return;
    }

    // Explicit check: MUST be enrolled to start
    if (!this.isUserEnrolled(quiz)) {
         alert(`You are not enrolled in ${quiz.title}. Please enroll first.`);
         return;
    }

     // Explicit check: Cannot start if completed and multiple attempts are not allowed
    if (this.isUserCompleted(quiz) && !quiz.allowMultipleAttempts) {
      alert(`You have already completed ${quiz.title}, and multiple attempts are not allowed.`);
      return;
    }

    // If all checks pass, navigate to the quiz page
    console.log(`Navigating to quiz page for quiz ID: ${quiz.id}`);
    this.router.navigate(['/quiz-page', quiz.id]);
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
