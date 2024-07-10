import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {ApiService} from '../../service/api.service';
import {User} from '../../model/user';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss']
})
export class UserFormComponent implements OnInit {
  userForm: FormGroup;
  isEditMode: boolean = false;
  username: string;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.userForm = this.fb.group({
      username: [{ value: '', disabled: this.isEditMode }, Validators.required],
      password: ['', Validators.required],
      name: ['', Validators.required],
      surname: ['', Validators.required],
      birthdate: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      gender: ['', Validators.required],
      location: ['', Validators.required],
      isAdmin: [false]
    });

    this.route.params.subscribe(params => {
      if (params['username']) {
        this.isEditMode = true;
        this.username = params['username'];
        this.apiService.getUser(this.username).subscribe(user => {
          this.userForm.patchValue(user);
        });
      }
    });
  }

  onSubmit() {
    if (this.userForm.invalid) {
      return;
    }

    const user: User = this.userForm.getRawValue();
    if (this.isEditMode) {
      this.apiService.updateUser(this.username, user).subscribe(
        () => this.router.navigate(['/admin']),
        error => console.error('Error updating user', error)
      );
    } else {
      this.apiService.addUser(user).subscribe(
        () => this.router.navigate(['/admin']),
        error => console.error('Error adding user', error)
      );
    }
  }
}
