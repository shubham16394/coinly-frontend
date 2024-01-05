import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppNavComponent } from './app-nav/app-nav.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { SignupModule } from './signup/signup.module';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormsModule} from '@angular/forms';
import { LoginModule } from './login/login.module';
import { RouterModule } from '@angular/router';
import { DashboardModule } from './dashboard/dashboard.module';
import {MatNativeDateModule} from '@angular/material/core';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { AddDailyExpenseComponent } from './add-daily-expense/add-daily-expense.component';
import {MatDialogModule} from '@angular/material/dialog';
import { AddMonthlyExpenseComponent } from './add-monthly-expense/add-monthly-expense.component';
import {MatSelectModule} from '@angular/material/select';
import { BudgetModule } from './budget/budget.module';
import { AddBudgetComponent } from './add-budget/add-budget.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SharedService } from './services/shared.service';

@NgModule({
  declarations: [
    AppComponent,
    AppNavComponent,
    AddDailyExpenseComponent,
    AddMonthlyExpenseComponent,
    AddBudgetComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    RouterModule,
    LoginModule,
    SignupModule,
    DashboardModule,
    MatNativeDateModule,
    MatDatepickerModule,
    MatDialogModule,
    MatSelectModule,
    BudgetModule
  ],
  providers: [MatSnackBar, SharedService],
  bootstrap: [AppComponent]
})
export class AppModule { }
