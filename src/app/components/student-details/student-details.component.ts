import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-student-details',
  standalone: true,
  imports: [],
  templateUrl: './student-details.component.html',
  styleUrls: ['./student-details.component.css']
})
export class StudentDetailsComponent implements OnInit {
  userDetails: any;
  username: string | null = null; // Initialize username

  ngOnInit() {
    this.getUserDetails();
  }

  getUserDetails() {
    const userData = localStorage.getItem('user');
    if (userData) {
      this.userDetails = JSON.parse(userData);
      this.extractUsername(this.userDetails.email); // Extract username from email
    } else {
      this.userDetails = null; // Handle case where user data is not found
    }
  }

  extractUsername(email: string) {
    if (email) {
      this.username = email.split('@')[0]; // Get the part before '@'
    }
  }
}
