import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { ApiService } from './api.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  signupForm: FormGroup;
  users: any[] = [];

  constructor(private fb: FormBuilder, private apiService: ApiService) {
    this.signupForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(5), this.noNumbersValidator]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      password: ['', [Validators.required, Validators.minLength(8), this.passwordValidator]],
      confirmPassword: ['', [Validators.required]]
    }, { validator: this.matchPasswords('password', 'confirmPassword') });
  }

  ngOnInit() {
    this.loadUsers();
  }

  noNumbersValidator(control: AbstractControl): { [key: string]: any } | null {
    const hasNumber = /\d/.test(control.value);
    return hasNumber ? { 'hasNumber': true } : null;
  }

  passwordValidator(control: AbstractControl): { [key: string]: any } | null {
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(control.value);
    const isValidLength = control.value.length >= 8;
    return !hasSymbol || !isValidLength ? { 'invalidPassword': true } : null;
  }

  matchPasswords(password: string, confirmPassword: string) {
    return (group: AbstractControl) => {
      const passwordInput = group.get(password);
      const confirmPasswordInput = group.get(confirmPassword);
      if (passwordInput && confirmPasswordInput && passwordInput.value !== confirmPasswordInput.value) {
        return { 'passwordMismatch': true };
      }
      return null;
    };
  }

  onSubmit() {
    if (this.signupForm.valid) {
      this.apiService.createUser(this.signupForm.value).subscribe(
        response => {
          alert('User registered successfully');
          this.loadUsers(); // Refresh the list of users
          this.signupForm.reset(); // Optionally, reset the form
        },
        error => {
          alert('Error registering user');
          console.error('Error registering user', error);
        }
      );
    }
  }

  loadUsers() {
    this.apiService.getUsers().subscribe(
      data => {
        this.users = data;
      },
      error => {
        console.error('Error loading users', error);
      }
    );
  }
}
