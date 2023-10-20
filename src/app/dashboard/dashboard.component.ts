import { Component, OnInit, AfterViewInit  } from '@angular/core';
import { Router } from '@angular/router';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {MatDatepicker, MatDatepickerInputEvent} from '@angular/material/datepicker';
import {MatTableDataSource} from '@angular/material/table';
import {MatDialog} from '@angular/material/dialog';
import { AddDailyExpenseComponent } from '../add-daily-expense/add-daily-expense.component';
import * as moment from 'moment';
import { AddMonthlyExpenseComponent } from '../add-monthly-expense/add-monthly-expense.component';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})

export class DashboardComponent implements OnInit, AfterViewInit  {

  timeFilter: string = 'daily';
  budget: number = 10000;
  expenses: number = 5000;
  date: Date = new Date();
  month: Date = new Date();
  columnsToDisplay = ['Time', 'Total Value'];
  columnDataMap: columnDataMapType = {'Time': 'time', 'Total Value': 'value'};
  dataSource = new MatTableDataSource(ELEMENT_DATA);
  columnsToDisplayWithExpand = [...this.columnsToDisplay, 'expand'];
  expandedElement!: ExpensesData | null;
  value!: number;
  comment!: string;

  constructor(public dialog: MatDialog, private router: Router) {}


  ngOnInit() {}

  ngAfterViewInit(): void {
    
  }

  timeFilterChange(time: string) {
    if(time === 'daily'){
      this.timeFilter = 'daily';
    }
    else if(time === 'monthly'){
      this.timeFilter = 'monthly';
    }
  }

  changeDate(event: MatDatepickerInputEvent<Date>) {
    console.log(this.date, event.value)
  }

  setMonthAndYear(normalizedMonthAndYear: moment.Moment, datepicker: MatDatepicker<moment.Moment>){
    this.month = new Date(normalizedMonthAndYear.toISOString())
    console.log(datepicker, normalizedMonthAndYear, this.month)
    datepicker.close();
  }

  editDaily(element: any){
    console.log('edit element', element)
    const dialogRef = this.dialog.open(AddDailyExpenseComponent, {
      data: {value: element.expValue, comment: element.comment, date: element.expTime, expType: element.expType},
    });

    dialogRef.afterClosed().subscribe(result => {
      this.value = 0;
      this.comment = '';
      console.log('The daily dialog was closed', result);
    });
  }

  deleteDaily(element: any){
    console.log('delete element', element)
  }

  editMonthly(element: any, time: Date) {
    console.log('edit monthly', element)
    const dialogRef = this.dialog.open(AddMonthlyExpenseComponent, {
      data: {value: element.expValue, comment: element.comment, date: time, expType: element.expType},
    });

    dialogRef.afterClosed().subscribe(result => {
      this.value = 0;
      this.comment = '';
      console.log('The monthly dialog was closed', this.value, this.comment, result);

    });
  }

  deleteMonthly(element: any) {

  }

  openAddDailyExpenseDialog(): void {
    const dialogRef = this.dialog.open(AddDailyExpenseComponent, {
      data: {value: this.value, comment: this.comment, date: this.date},
    });

    dialogRef.afterClosed().subscribe(result => {
      this.value = 0;
      this.comment = '';
      console.log('The daily dialog was closed', result);
    });
  }

  openAddMonthlyExpenseDialog(time: Date): void {
    const dialogRef = this.dialog.open(AddMonthlyExpenseComponent, {
      data: {value: this.value, comment: this.comment, date: time},
    });

    dialogRef.afterClosed().subscribe(result => {
      this.value = 0;
      this.comment = '';
      console.log('The monthly dialog was closed', this.value, this.comment, result);

    });
  }

  gotoBudget(){
    console.log('budget route')
    this.router.navigate(['budget'])
  }


}

type columnDataMapType = {
  [key: string]: 'type' | 'value' | 'time',
  'Time': 'time',
  'Total Value':  'value'
}


export interface ExpensesData {
  time: Date,
  value: number;
  expenses: {expType: string, expValue: number, expTime: Date, comment: string}[]
}

const ELEMENT_DATA: ExpensesData[] = [
  {
    time: new Date(),
    value: 1.0079,
    expenses: [{
      expType: 'grocery',
      expValue: 1000,
      expTime: new Date(),
      comment: "test"
    },
    {
      expType: 'Vehicle',
      expValue: 1000,
      expTime: new Date(),
      comment: "test"
    }
  ]
  },
  {
    time: new Date(),
    value: 4.0026,
    expenses: [{
      expType: 'grocery',
      expValue: 1000,
      expTime: new Date(),
      comment: "test"
    }]

  },
  {
    time: new Date(),
    value: 6.941,
    expenses: [{
      expType: 'grocery',
      expValue: 1000,
      expTime: new Date(),
      comment: "test"
    }]

  },
  {
    time: new Date(),
    value: 9.0122,
    expenses: [{
      expType: 'grocery',
      expValue: 1000,
      expTime: new Date(),
      comment: "test"
    }]

  },
  {
    time: new Date(),
    value: 10.811,
    expenses: [{
      expType: 'grocery',
      expValue: 1000,
      expTime: new Date(),
      comment: "test"
    }]

  },
  {
    time: new Date(),
    value: 12.0107,
    expenses: [{
      expType: 'grocery',
      expValue: 1000,
      expTime: new Date(),
      comment: "test"
    }]

  },
  {
    time: new Date(),
    value: 14.0067,
    expenses: [{
      expType: 'grocery',
      expValue: 1000,
      expTime: new Date(),
      comment: "test"
    }]

  },
  {
    time: new Date(),
    value: 15.9994,
    expenses: [{
      expType: 'grocery',
      expValue: 1000,
      expTime: new Date(),
      comment: "test"
    }]

  },
  {
    time: new Date(),
    value: 18.9984,
    expenses: [{
      expType: 'grocery',
      expValue: 1000,
      expTime: new Date(),
      comment: "test"
    }]

  },
  {
    time: new Date(),
    value: 20.1797,
    expenses: [{
      expType: 'grocery',
      expValue: 1000,
      expTime: new Date(),
      comment: "test"
    }]
  },
];
