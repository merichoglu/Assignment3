import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {ApiService} from '../../service/api.service';
import {User} from '../../model/user';
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss']
})
export class UserFormComponent implements OnInit {
  userForm: FormGroup;
  isEditMode: boolean = false;
  username: string;
  usernameExists: boolean = false;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['username']) {
        this.isEditMode = true;
        this.username = params['username'];
        this.apiService.getUser(this.username).subscribe(user => {
          this.userForm.patchValue(user);
          this.userForm.get('username').disable(); // Disable username field in edit mode
        });
      }
    });

    this.userForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      name: ['', Validators.required],
      surname: ['', Validators.required],
      birthdate: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      gender: ['', Validators.required],
      location: ['', Validators.required],
      isAdmin: [false]
    });
  }

  onSubmit() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    if (this.isEditMode) {
      if (window.confirm('Are you sure you want to update this user?')) {
        const user: User = this.userForm.getRawValue();
        this.apiService.updateUser(this.username, user).subscribe(
          () => {
            this.snackBar.open('User updated successfully', 'Close', {duration: 3000});
            this.router.navigate(['/admin']);
          },
          error => {
            console.error('Error updating user', error);
            if (error.status === 409) {
              this.usernameExists = true;
            }
          }
        );
      }
    } else {
      const user: User = this.userForm.getRawValue();
      this.apiService.addUser(user).subscribe(
        () => {
          this.snackBar.open('User added successfully', 'Close', {duration: 3000});
          this.router.navigate(['/admin']);
        },
        error => {
          console.error('Error adding user', error);
          if (error.status === 409) {
            this.usernameExists = true;
          }
        }
      );
    }
  }
}
