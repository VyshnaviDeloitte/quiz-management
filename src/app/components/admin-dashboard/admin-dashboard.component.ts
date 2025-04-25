import { Component, OnInit, inject } from '@angular/core';
import { AdminQuizTableComponent } from '../admin-quiz-table/admin-quiz-table.component';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    AdminQuizTableComponent,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css',
})
export class AdminDashboardComponent implements OnInit {
  //  Username extracted from localStorage
  username: string = '';
  runningEvents:number=0;
  completionRate: number = 0;
  examFinishes: number = 0; 
  attempted:number=0;
  notattempted:number=0;
  pieChartLabels = ['Attempted', 'In Progress', 'Not Attempted', 'Awaiting'];
  pieChartData = [30, 15, 35, 20];

  route = inject(Router);

  createExam() {
    this.route.navigateByUrl('/create-exam');
  }

  quizzes: any[] = [];

  quizForm: FormGroup;

  constructor(private fb: FormBuilder, private http: HttpClient , private router:Router) {
    this.quizForm = this.fb.group({
      title: ['', Validators.required],
      category: ['', Validators.required],
      duration: ['', Validators.required],
      difficulty: ['', Validators.required],
      allowMultipleAttempts: [false],
      shuffleQuestions: [false],
      questions: this.fb.array([]),
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      attachedFile: [''],
      enrolled: 0,
    });
  }

  ngOnInit(): void {
    //  Extract username from localStorage
    const storedUsername = localStorage.getItem('username');
    this.username = storedUsername || 'Admin';

    
  
    this.username = storedUsername || 'Admin';

    this.http.get<any[]>('http://localhost:4000/quizzes').subscribe((data) => {
      this.quizzes = data;

      // Step 2: Filter active quizzes
      const today = new Date();

      this.runningEvents = data.filter(quiz => {
        const endDate = new Date(quiz.endDate);
        return endDate > today;
      }).length;
    });

    // Fetch users data and calculate completion rate
     // Fetch users data and calculate completion rate
     this.http.get<any[]>('http://localhost:3000/users').subscribe((users) => {
      let totalCompletionRate = 0;
      let totalExamsFinished = 0;

      // Iterate over each user to calculate their completion rate and exam finishes
      users.forEach(user => {
        const completedCoursesCount = user.completedCourses?.length || 0; // Completed courses count
        const enrolledCoursesCount = user.enrolledCourses?.length || 0; // Enrolled courses count
        
        if(completedCoursesCount!=0)
        {
           this.attempted++;
        }
        if(enrolledCoursesCount!=0)
        {
          this.notattempted++;
        }
        // Calculate completion rate for this user
        if (completedCoursesCount + enrolledCoursesCount > 0) {
          const completionRateForUser = completedCoursesCount / (completedCoursesCount + enrolledCoursesCount);
          totalCompletionRate += completionRateForUser;
        }

        // Sum up completed courses for total exam finishes
        totalExamsFinished += completedCoursesCount;
      });

        // Store total completion rate as the overall completion rate
      this.completionRate = totalCompletionRate;
      
      // Store total exams finished as the total number of exam finishes
      this.examFinishes = totalExamsFinished;
    });
  }
  

  onFileSelect(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.quizForm.patchValue({
        attachedFile: file.name,
      });
    }
  }

  getFormControl(control: AbstractControl | null): FormControl {
    return control as FormControl;
  }

  get questions() {
    return this.quizForm.get('questions') as FormArray;
  }

  getOptions(qIndex: number) {
    return this.questions.at(qIndex).get('options') as FormArray;
  }

  addQuestion() {
    const questionGroup = this.fb.group({
      text: ['', Validators.required],
      AdminName:['',Validators.required],
      explanation: [''],
      points: ['', Validators.required],
      feedbackCorrect: [''],
      feedbackIncorrect: [''],
      shuffleOptions: [false],
      correctOptionIndex: [0],
      options: this.fb.array([
        this.fb.control('', Validators.required),
        this.fb.control('', Validators.required),
      ]),
    });
    this.questions.push(questionGroup)
  }

  addOption(qIndex: number) {
    this.getOptions(qIndex).push(this.fb.control('', Validators.required));
  }

  removeOption(qIndex: number, oIndex: number) {
    const options = this.getOptions(qIndex);
    if (options.length > 2) {
      options.removeAt(oIndex);
    }
  }

  submitQuiz() {
    alert('quiz submitted');
    if (this.quizForm.valid) {
      this.http
        .post('http://localhost:4000/quizzes', this.quizForm.value)
        .subscribe(() => {
          alert('Quiz created successfully!');
          this.quizForm.reset();
          this.questions.clear();
          document.getElementById('closeModalBtn')?.click();
        });
    }
    else 
    {
      alert('invalid');
    }
  }

  viewResults(quiz: any) {
    console.log('Viewing results for quiz:', quiz.title);
    alert(`Results would open for quiz: ${quiz.title}`);
  }

  navigateToAdminDashboard()
  {
    this.router.navigate(['/admin-dashboard']);
  }

  navigateToUserDetails()
  {
      this.router.navigate(['/rst']);
  }

  
  signOut()
  {
    alert('user-signing off');
    this.router.navigate(['login']);
    localStorage.removeItem('user');

  }



}