import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../service/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.scss']
})
export class AddUserComponent {
  userForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router
  ) {
    this.userForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      name: ['', Validators.required],
      surname: ['', Validators.required],
      birthdate: ['', Validators.required],
      gender: ['Male', Validators.required],
      location: ['', Validators.required],
      isAdmin: [false]
    });
  }

  onSubmit() {
    console.log('Submit button clicked');
    console.log('Form Valid:', this.userForm.valid);
    console.log('Form Value:', this.userForm.value);

    if (this.userForm.valid) {
      this.apiService.addUser(this.userForm.value).subscribe(
        response => {
          console.log('User added successfully', response);
          this.router.navigate(['/admin']);
        },
        error => {
          console.error('Error adding user', error);
        }
      );
    } else {
      console.log(this.userForm);
      console.warn('Form is invalid');
    }
  }
}
