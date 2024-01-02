import { Component, OnInit } from '@angular/core';
import {
  AbstractControlOptions,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { LoginService } from './login.service';
import { SnackbarService } from '../services/snackbar.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  errorsCount: boolean = true;

  constructor(
    private fb: FormBuilder,
    private loginService: LoginService,
    private snackbarService: SnackbarService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loginForm = this.fb.group(
      {
        email: new FormControl('', {
          validators: [Validators.email, Validators.required],
        }),
        password: ['', [Validators.required]],
      },
      {
        updateOn: 'blur',
        validators: [this.enableLogin],
      } as AbstractControlOptions
    );
  }

  login() {
    console.log(this.loginForm.value);
    this.loginService.login(this.loginForm).subscribe({
      next: (res: any) => {
        console.log('Login response', res);
        if(res?.status) {
          this.router.navigate(['/dashboard'], { replaceUrl: true });
        }
        else {
          this.snackbarService.openSnackBar(res?.message)
        }
      },
      error: (err: any) => {
        console.log('err login', err)
        this.snackbarService.openSnackBar(err?.error?.message);
      },
    });
  }

  enableLogin = (group: FormGroup): ValidationErrors | null => {
    let errors = 0;
    Object.keys(group.controls).forEach((control) => {
      if (group.controls[control]?.errors) {
        errors += 1;
      }
    });
    if (errors === 0) {
      this.errorsCount = false;
      group?.setErrors({ noErrors: true });
    } else if (errors !== 0) {
      this.errorsCount = true;
      group?.setErrors({ noErrors: false });
    }
    return !this.errorsCount ? { noErrors: true } : { noErrors: false };
  };
}
