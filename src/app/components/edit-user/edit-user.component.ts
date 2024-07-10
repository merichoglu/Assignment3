import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../service/api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '../../model/user';

@Component({
  selector: 'app-edit-user',
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.scss']
})
export class EditUserComponent implements OnInit {
  editUserForm: FormGroup;
  username: string;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.editUserForm = this.fb.group({
      name: ['', Validators.required],
      surname: ['', Validators.required],
      birthdate: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      gender: ['', Validators.required],
      location: ['', Validators.required],
      isAdmin: [false, Validators.required]
    });

    this.username = this.route.snapshot.paramMap.get('username') || '';
  }

  ngOnInit(): void {
    this.apiService.getUser(this.username).subscribe(user => {
      this.editUserForm.patchValue(user);
    });
  }

  onSubmit() {
    if (this.editUserForm.valid) {
      this.apiService.updateUser(this.username, this.editUserForm.value).subscribe(
        () => {
          this.router.navigate(['/admin']);
        },
        error => {
          console.error('Error updating user:', error);
        }
      );
    }
  }
}
