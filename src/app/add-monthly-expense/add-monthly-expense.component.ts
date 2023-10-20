import { Component, Inject } from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-add-monthly-expense',
  templateUrl: './add-monthly-expense.component.html',
  styleUrls: ['./add-monthly-expense.component.scss']
})
export class AddMonthlyExpenseComponent {

  expType: string = '';
  constructor(public dialogRef: MatDialogRef<AddMonthlyExpenseComponent>, @Inject(MAT_DIALOG_DATA) public data: DialogData) {
    this.expType = data?.expType;
  }

  expensesType: Expenses[] = [
    {value: 'housing', viewValue: 'Housing'},
    {value: 'grocery', viewValue: 'Grocery'},
    {value: 'dine-out', viewValue: 'Dine out'},
    {value: 'transportation', viewValue: 'Transportation'},
    {value: 'child-care', viewValue: 'Child Care'},
    {value: 'pet-care', viewValue: 'Pet Care'},
    {value: 'health', viewValue: 'Health'},
    {value: 'debt-payments', viewValue: 'Debt Payments'},
    {value: 'entertainment', viewValue: 'Entertainment'},
    {value: 'cellphone-wifi', viewValue: ' Cellphone & Wifi'},
    {value: 'membership-subscriptions', viewValue: 'Membership & Subscriptions'},
    {value: 'travel', viewValue: 'Travel'},
  ];


  onNoClick(): void {
    this.dialogRef.close();
  }

  addMonthlyExpense(data: DialogData): void {
    console.log('data', data, this.expType)
  }

}

interface Expenses {
  value: string;
  viewValue: string;
}

export interface DialogData {
  value: number;
  comment: string;
  date: Date;
  expType: string;
}