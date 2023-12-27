import { Component, OnInit, AfterViewInit  } from '@angular/core';
import { Router } from '@angular/router';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {MatDatepicker, MatDatepickerInputEvent} from '@angular/material/datepicker';
import {MatTableDataSource} from '@angular/material/table';
import {MatDialog} from '@angular/material/dialog';
import { AddDailyExpenseComponent } from '../add-daily-expense/add-daily-expense.component';
import * as moment from 'moment';
import { AddMonthlyExpenseComponent } from '../add-monthly-expense/add-monthly-expense.component';
import { DashboardService } from './dashboard.service';

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
  value: number = 0;
  comment: string = '';
  expType: string = '';
  email = 'shubham16394@gmail.com';

  constructor(public dialog: MatDialog, private router: Router, private dashboardService: DashboardService) {}


  ngOnInit() {
  }

  ngAfterViewInit(): void {
    this.getAllExpData();
  }

  getAllExpData() {
    this.dashboardService.getAllExpenses(this.email, this.date.toISOString(), this.timeFilter).subscribe((res: any) => {
      const data = res?.data;
      console.log('getAllExpenses data', data);
      this.prepareData(data);
    });
  }

  prepareData(data: any) {
    const formattedData = [];
    let uniqHrs = data.map((e: any) => { 
      let hr: string | number = new Date(e?.createdAt).getHours();
      const ampm = hr > 12 ? 'PM' : 'AM';
      hr = hr < 10 ? ('0' + hr) : hr;
      return hr + ':00 ' + ampm;
    });
    uniqHrs = new Set(uniqHrs);
    console.log(uniqHrs);
    for(let h of uniqHrs){
      const filterData = data.filter((e1: any) => {
        return new Date(e1?.createdAt).getHours() == Number(h.split(':')[0]);
      })
      .map((e: any) => {
        return {type: e?.type, expValue: e?.value, expTime: e?.createdAt, comment: e?.comment, _id: e?._id, createdBy: e?.createdBy};
      });
      console.log('filterData', filterData);
      const totalValue = filterData.reduce((acc: any, curr: any) => { return acc + curr?.expValue; }, 0);
      console.log('totalValue', totalValue);
      formattedData.push({time: h, value: totalValue, expenses: filterData});
    }
    console.log("formattedData", formattedData)
    this.dataSource.data = formattedData;
    
  }

  timeFilterChange(time: string) {
    if(time === 'daily'){
      this.timeFilter = 'daily';
    }
    else if(time === 'monthly'){
      this.timeFilter = 'monthly';
    }
    this.getAllExpData();
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
      data: {value: element.expValue, comment: element.comment, date: element.expTime, type: element.type},
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
      data: {value: element.expValue, comment: element.comment, date: time, type: element.type},
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
      data: {value: this.value, comment: this.comment, date: this.date, type: this.expType},
    });

    dialogRef.afterClosed().subscribe(result => {
      this.value = 0;
      this.comment = '';
      console.log('The daily dialog was closed', result);
      if(result?.value){
        this.dashboardService.addExpense(this.email, this.date.toISOString(), result).subscribe(res => {
          console.log('addexpense response', res);
        });  
      }
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
  expenses: {type: string, expValue: number, expTime: Date, comment: string, _id: string, createdBy: string}[]
}

const ELEMENT_DATA: ExpensesData[] = [
  {
    time: new Date(),
    value: 1.0079,
    expenses: [{
      type: 'grocery',
      expValue: 1000,
      expTime: new Date(),
      comment: "test",
      _id: '',
      createdBy: ''
    },
    {
      type: 'Vehicle',
      expValue: 1000,
      expTime: new Date(),
      comment: "test",
      _id: '',
      createdBy: ''
    }
  ]
  },
  {
    time: new Date(),
    value: 4.0026,
    expenses: [{
      type: 'grocery',
      expValue: 1000,
      expTime: new Date(),
      comment: "test",
      _id: '',
      createdBy: ''
    }]

  },
  {
    time: new Date(),
    value: 6.941,
    expenses: [{
      type: 'grocery',
      expValue: 1000,
      expTime: new Date(),
      comment: "test",
      _id: '',
      createdBy: ''
    }]

  },
  {
    time: new Date(),
    value: 9.0122,
    expenses: [{
      type: 'grocery',
      expValue: 1000,
      expTime: new Date(),
      comment: "test",
      _id: '',
      createdBy: ''
    }]

  },
  {
    time: new Date(),
    value: 10.811,
    expenses: [{
      type: 'grocery',
      expValue: 1000,
      expTime: new Date(),
      comment: "test",
      _id: '',
      createdBy: ''
    }]

  },
  {
    time: new Date(),
    value: 12.0107,
    expenses: [{
      type: 'grocery',
      expValue: 1000,
      expTime: new Date(),
      comment: "test",
      _id: '',
      createdBy: ''
    }]

  },
  {
    time: new Date(),
    value: 14.0067,
    expenses: [{
      type: 'grocery',
      expValue: 1000,
      expTime: new Date(),
      comment: "test",
      _id: '',
      createdBy: ''
    }]

  },
  {
    time: new Date(),
    value: 15.9994,
    expenses: [{
      type: 'grocery',
      expValue: 1000,
      expTime: new Date(),
      comment: "test",
      _id: '',
      createdBy: ''
    }]

  },
  {
    time: new Date(),
    value: 18.9984,
    expenses: [{
      type: 'grocery',
      expValue: 1000,
      expTime: new Date(),
      comment: "test",
      _id: '',
      createdBy: ''
    }]

  },
  {
    time: new Date(),
    value: 20.1797,
    expenses: [{
      type: 'grocery',
      expValue: 1000,
      expTime: new Date(),
      comment: "test",
      _id: '',
      createdBy: ''
    }]
  },
];
