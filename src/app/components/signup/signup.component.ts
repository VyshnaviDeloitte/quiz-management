import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule , Validators } from '@angular/forms';
import { Router } from '@angular/router';


@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule,FormsModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {
   
   signUpForm:FormGroup=new FormGroup(
      {
           email:new FormControl('',[Validators.required,Validators.email]),
           password:new FormControl('',[Validators.required,Validators.minLength(5)]),
           checkbox:new FormControl('',[Validators.required])
      }
    );
    constructor(private http:HttpClient,private router:Router)
    {

    }
    onSubmit()
    {

         //checking if user already exists '
         const { email, password } = this.signUpForm.value;
         this.http.get<any[]>(`http://localhost:3000/users?email=${email}&password=${password}`).subscribe(users => {
          if (users.length) {
            alert('User Already Exists , Try Logging In!');
          } 
        });
         const formData=this.signUpForm.value;
         //initially adding user as student
         const newUser={...formData,role:'student'};
       
         this.http.post('http://localhost:3000/users',newUser).subscribe(()=>{
                alert('Signup Successful!');
                this.router.navigate(['/login']);
         });
    }
}

