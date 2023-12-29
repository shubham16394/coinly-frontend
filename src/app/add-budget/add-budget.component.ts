import { Component, Inject } from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-add-budget',
  templateUrl: './add-budget.component.html',
  styleUrls: ['./add-budget.component.scss']
})
export class AddBudgetComponent {

  constructor(public dialogRef: MatDialogRef<AddBudgetComponent>, @Inject(MAT_DIALOG_DATA) public data: DialogData) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  addBudget(data: DialogData) {
    return data;
  }

}


export interface DialogData {
  value: number;
  name: string;
  date: Date;
  type: string;
}