import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SignupComponent } from './signup.component';
import {MatCardModule} from '@angular/material/card';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatDividerModule} from '@angular/material/divider';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';



@NgModule({
  declarations: [
    SignupComponent
  ],
  imports: [
    CommonModule,
    MatCardModule,
    MatListModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    ReactiveFormsModule,
    RouterModule
  ],
  exports: [
    SignupComponent
  ]
})
export class SignupModule { }
