import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, RouterOutlet, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'] // Corrected styleUrl to styleUrls
})
export class LoginComponent {
    
  loginForm: FormGroup = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(5)]),
    // checkbox:new FormControl('',[Validators.required])
  });

  constructor(private http: HttpClient, private router: Router) { }

  onSubmit() {
    debugger;
    const { email, password } = this.loginForm.value;
   

    this.http.get<any[]>(`http://localhost:3000/users?email=${email}&password=${password}`).subscribe(users => {
      if (users.length) {
        const user = users[0];
         // Extract username before '@gmail.com'
    const username = user.email.split('@')[0];
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('username', username);
        if (user.role === 'admin') {
          this.router.navigate(['/admin-dashboard']);
        } else {
          this.router.navigate(['/student-dashboard']);
        }
      } else {
        alert('Invalid credentials');
      }
    });
  }

  navigateToSignUp()
  {
    this.router.navigate(['/signup']);
  }

 
}
