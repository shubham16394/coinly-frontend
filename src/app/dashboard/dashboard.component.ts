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
    this.getAllExpData(this.timeFilter);
  }

  getAllExpData(timeFilter: string) {
    this.dashboardService.getAllExpenses(this.email, this.date.toISOString(), this.timeFilter).subscribe((res: any) => {
      const data = res?.data;
      console.log('getAllExpenses data', data);
      this.prepareData(data, timeFilter);
    });
  }

  prepareData(data: any, timeFilter: string) {
    const formattedData = [];
    let uniqHrs = data.map((e: any) => { 
      let hr: any;
      if(timeFilter === 'daily') {
        const hrVal = new Date(e?.createdAt).getHours();
        hr = new Date(e?.createdAt).setHours(hrVal,0,0,0);
      }
      else if(timeFilter === 'monthly') {
        hr = new Date(e?.createdAt).setHours(0,0,0,0);
      }
      return new Date(hr).toISOString();
    });
    uniqHrs = new Set(uniqHrs);
    console.log(uniqHrs);
    for(let h of uniqHrs) {
      console.log('h', h)
      const filterData = data.filter((e1: any) => {
        let hrVal: any;
        if(timeFilter === 'daily') {
          hrVal = new Date(e1?.createdAt).getHours();
        }
        else if(timeFilter === 'monthly') {
          hrVal = 0;
        }
        return new Date(new Date(e1?.createdAt).setHours(hrVal,0,0,0)).toISOString() == h;
      })
      .map((e: any) => {
        return {type: e?.type, expValue: e?.value, expTime: e?.createdAt, comment: e?.comment, _id: e?._id, createdBy: e?.createdBy};
      });
      console.log('filterData', filterData);
      const totalValue = filterData.reduce((acc: any, curr: any) => { return acc + curr?.expValue; }, 0);
      console.log('totalValue', totalValue);
      formattedData.push({time: h, value: totalValue, expenses: this.sortData(filterData, 'expTime')});
    }
    console.log("formattedData", formattedData)
    this.dataSource.data = this.sortData(formattedData, 'time');
  }

  sortData(data: any, time: string) {
    return data.sort((a: any,b: any) => {return new Date(a?.[time]).getTime() - new Date(b?.[time]).getTime()});
  }

  addExpenseToData(data: any, timeFilter: string) {
    const dataSourceData = this.dataSource.data;
    console.log('dataSourceData', dataSourceData);
    let hr: number;
    if(timeFilter === 'daily') {
      const hrVal = new Date(data?.createdAt).getHours();
      hr = new Date(data?.createdAt).setHours(hrVal,0,0,0);
    }
    else {
      hr = new Date(data?.createdAt).setHours(0,0,0,0);
    }
    let actDataIndex = dataSourceData.findIndex((e: any) => {return new Date(hr).toISOString() == e?.time});
    console.log('actDataIndex', actDataIndex, dataSourceData[actDataIndex]);
    if(actDataIndex < 0) {
      dataSourceData.push({time: new Date(hr).toISOString(), value: 0, expenses: []});
      actDataIndex = dataSourceData.length - 1;
    }
    dataSourceData[actDataIndex]?.expenses.push({type: data?.type, expValue: data?.value, expTime: data?.createdAt, comment: data?.comment, _id: data?._id, createdBy: data?.createdBy});
    dataSourceData[actDataIndex].value +=  data?.value;
    console.log('dataSourceData updated', dataSourceData);
    this.dataSource.data = dataSourceData;
  }

  timeFilterChange(time: string) {
    if(time === 'daily'){
      this.timeFilter = 'daily';
    }
    else if(time === 'monthly'){
      this.timeFilter = 'monthly';
    }
    this.getAllExpData(this.timeFilter);
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
      if(result?.value && result?.type && result?.date){
        this.dashboardService.addExpense(this.email, this.date.toISOString(), result).subscribe((res: any) => {
          console.log('addexpense response', res);
          this.addExpenseToData(res?.data, this.timeFilter);
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
      console.log('The monthly dialog was closed', this.value, this.comment, result, this.date.toISOString());
      if(result?.value && result?.type && result?.date){
        this.dashboardService.addExpense(this.email, result?.date, result).subscribe((res: any) => {
          console.log('add monthly expense response', res);
          this.addExpenseToData(res?.data, this.timeFilter);
        });    
      }
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
  time: Date | string,
  value: number;
  expenses: {type: string, expValue: number, expTime: Date, comment: string, _id: string, createdBy: string}[]
}

const ELEMENT_DATA: ExpensesData[] = [];
