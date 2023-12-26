import { Component } from '@angular/core';
import {MatDatepicker, MatDatepickerInputEvent} from '@angular/material/datepicker';
import * as moment from 'moment';

@Component({
  selector: 'app-budget',
  templateUrl: './budget.component.html',
  styleUrls: ['./budget.component.scss']
})
export class BudgetComponent {

  month: Date = new Date();
  date: Date = new Date();
  displayedColumns: string[] = ['position', 'name', 'value', 'actions'];
  dataSource = ELEMENT_DATA;
  expenseDataSource = ELEMENT_DATA;
  savingsDataSource = ELEMENT_DATA;



  changeDate(event: MatDatepickerInputEvent<Date>) {
    console.log(this.date, event.value)
  }


  setMonthAndYear(normalizedMonthAndYear: moment.Moment, datepicker: MatDatepicker<moment.Moment>){
    this.month = new Date(normalizedMonthAndYear.toISOString())
    console.log(datepicker, normalizedMonthAndYear, this.month)
    datepicker.close();
  }  

  addIncome() {

  }

  addExpenseBudget() {

  }

  addSavings() {

  }

  editIncome(element: any){

  }

  deleteIncome(element: any) {

  }

}

export interface PeriodicElement {
  name: string;
  position: number;
  value: number;
  actions: string;
}

// const ELEMENT_DATA: PeriodicElement[] = [
//   {position: 1, name: 'Hydrogen', value: 1.0079, actions: 'H'},
//   {position: 2, name: 'Helium', value: 4.0026, actions: 'He'},
//   {position: 3, name: 'Lithium', value: 6.941, actions: 'Li'},
// ];

const ELEMENT_DATA = null;

