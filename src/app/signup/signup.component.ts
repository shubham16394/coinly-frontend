import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
  ValidationErrors,
  AbstractControlOptions,
} from '@angular/forms';
import { Router } from '@angular/router';
import { SignupService } from './signup.service';
import { SnackbarService } from '../services/snackbar.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})
export class SignupComponent implements OnInit {
  signupForm!: FormGroup;
  errorsCount: boolean = true;

  constructor(private fb: FormBuilder, private signupService: SignupService, private snackbarService: SnackbarService, private router: Router) {}

  ngOnInit() {
    this.signupForm = this.fb.group(
      {
        firstName: ['', [Validators.required]],
        lastName: new FormControl('', { validators: [Validators.required] }),
        email: new FormControl('', {
          validators: [Validators.required, Validators.email],
        }),
        password: [
          '',
          [
            Validators.required,
            Validators.pattern(
              /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*#?&^_-]).{8,}/
            ),
          ],
        ],
        confirmPassword: ['', [Validators.required]],
      },
      {
        updateOn: 'blur',
        validators: [this.checkPassoword, this.enableSignup],
      } as AbstractControlOptions
    );
  }

  signUp() {
    console.log(this.signupForm.value);
    this.signupService.signup(this.signupForm)
    .subscribe({next: (res: any) => {
      if(res?.status) {
        setTimeout(() => {
          this.router.navigate([''], {replaceUrl: true});
        }, 1500);
        this.snackbarService.openSnackBar(res?.message);
      }
      else {
        this.snackbarService.openSnackBar(res?.message);
      }
    }, error: (err: any) => {
      console.log('signup err', err?.error?.message)
      this.snackbarService.openSnackBar(err?.error?.message);
    }})
  }

  checkPassoword = (group: FormGroup): ValidationErrors | null => {
    let pass = group.get('password')?.value;
    let confirmPass = group.get('confirmPassword')?.value;
    if (pass !== confirmPass) {
      group.get('confirmPassword')?.setErrors({ notMatched: true });
      return { notMatched: true };
    } else {
      return null;
    }
  };

  enableSignup = (group: FormGroup): ValidationErrors | null => {
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
