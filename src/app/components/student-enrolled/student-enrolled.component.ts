// student-enrolled.component.ts
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core'; // Added OnInit
import { Router } from '@angular/router';

@Component({
  selector: 'app-student-enrolled',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-enrolled.component.html',
  styleUrls: ['./student-enrolled.component.css'] // Corrected styleUrl to styleUrls
})
export class StudentEnrolledComponent implements OnInit { // Implemented OnInit

  quizzes: any[] = [];
  enrolledCourses: any[] = [];
  active: number = 0; // Consider if 'active' count is needed here or just passed from dashboard state
  enrolledCount: number = 0;
  completedCount: number = 0;
  username: string = '';
  currentUser: any = null; // Store user data

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void { // Use ngOnInit for initialization logic
    this.loadQuizzes(); // Load general quiz data (for durations etc.)
    this.loadUserData(); // Load specific user data


    this.http.get<any[]>('http://localhost:4000/quizzes').subscribe(data => {
      this.quizzes = data;

      const today = new Date();
      this.active = this.quizzes.filter(q => {
        const endDate = q.endDate ? new Date(q.endDate) : null;
        return endDate && endDate > today;
      }).length;
    });
  }

  loadQuizzes() {
    this.http.get<any[]>('http://localhost:4000/quizzes').subscribe(data => {
      this.quizzes = data;
      // If active count depends on quizzes, calculate here or after user data loads
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

  loadUserData() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const userFromStorage = JSON.parse(userStr);
      this.username = userFromStorage.email.split('@')[0];

      // Fetch latest data from server
      this.http.get<any[]>(`http://localhost:3000/users?email=${userFromStorage.email}`).subscribe(users => {
        if (users && users.length > 0) {
            this.currentUser = users[0];
            localStorage.setItem('user', JSON.stringify(this.currentUser)); // Update local storage

            // *** CORRECTED LINE HERE ***
            this.enrolledCourses = this.currentUser.enrolledCourses || [];

            // Update counts based on fetched data
            this.completedCount = (this.currentUser.completedCourses || []).length;
            this.enrolledCount = this.enrolledCourses.length; // Use the length of the correctly assigned array

            // Fetch active count if needed (logic might depend on quizzes and user completion status)
            // this.calculateActiveQuizzes(); // Example if needed
        } else {
            console.error("User not found on server.");
            this.router.navigate(['/login']);
        }
      }, error => {
         console.error("Failed to fetch user data", error);
         // Handle error, maybe redirect
      });
    } else {
        this.router.navigate(['/login']); // Redirect if no user in local storage
    }
  }

  getDuration(examName: string): string {
    const quiz = this.quizzes.find(q => q.title.toLowerCase() === examName.toLowerCase());
    // Assuming duration is stored in minutes
    return quiz ? `${quiz.duration} Min` : 'N/A'; // Added 'Min' unit
  }

  // This method should ideally use the quizId stored during enrollment
  onStart(enrolledCourse: any) {
      // Preferred way: use quizId if stored during enrollment
     
      if (enrolledCourse.quizId) {
          alert('id');
          console.log(`Starting quiz with ID: ${enrolledCourse.quizId}`);
          // Maybe add checks from student-dashboard startQuiz if needed (like multiple attempts)
          this.router.navigate([`/quiz-page/${enrolledCourse.quizId}`]);
      } else {
          // Fallback: find quiz by name (less reliable if names aren't unique)
          console.warn("Quiz ID not found on enrolled course object, attempting lookup by name.");
          const matchedQuiz = this.quizzes.find(q => q.title.toLowerCase() === enrolledCourse.toLowerCase());
          if (matchedQuiz) {
               console.log(`Starting quiz (found by name) with ID: ${matchedQuiz.id}`);
              this.router.navigate([`/quiz-page/${matchedQuiz.id}`]);
          } else {
              console.error('Quiz ID not found for exam:', enrolledCourse.examName);
              alert('Could not find the quiz details. Please contact support.');
          }
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





