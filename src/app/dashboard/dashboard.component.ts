import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import {
  MatDatepicker,
  MatDatepickerInputEvent,
} from '@angular/material/datepicker';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { AddDailyExpenseComponent } from '../add-daily-expense/add-daily-expense.component';
import * as moment from 'moment';
import { AddMonthlyExpenseComponent } from '../add-monthly-expense/add-monthly-expense.component';
import { DashboardService } from './dashboard.service';
import { SnackbarService } from '../services/snackbar.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ),
    ]),
  ],
})
export class DashboardComponent implements OnInit, AfterViewInit {
  timeFilter: string = 'daily';
  budget: number = 10000;
  expenses: number = 0;
  date: Date = new Date();
  month: Date = new Date();
  columnsToDisplay = ['Time', 'Total Value'];
  columnsToDisplayMonthly = ['Date', 'Total Value'];
  columnDataMap: columnDataMapType = { Time: 'time', 'Total Value': 'value' };
  monthlyColumnDataMap: monthlyColumnDataMapType = {
    Date: 'time',
    'Total Value': 'value',
  };
  dataSource = new MatTableDataSource(ELEMENT_DATA);
  columnsToDisplayWithExpand = [...this.columnsToDisplay, 'expand'];
  columnsToDisplayMonthlyWithExpand = [
    ...this.columnsToDisplayMonthly,
    'expand',
  ];
  expandedElement!: ExpensesData | null;
  value: number = 0;
  comment: string = '';
  expType: string = '';
  email = 'shubham16394@gmail.com';
  user = {
    firstName: 'Shubham',
    lastName: 'Tiwari'
  }

  constructor(
    public dialog: MatDialog,
    private router: Router,
    private dashboardService: DashboardService,
    private snackbarService: SnackbarService
  ) {}

  ngOnInit() {
    this.getAllExpData(this.timeFilter);
  }

  ngAfterViewInit(): void {}

  getAllExpData(timeFilter: string) {
    const date =
      timeFilter === 'daily'
        ? this.date
        : timeFilter === 'monthly'
        ? this.month
        : new Date();
    this.dashboardService
      .getAllExpenses(this.email, date.toISOString(), this.timeFilter)
      .subscribe({
        next: (res: any) => {
          if (!res?.status) {
            this.snackbarService.openSnackBar('Something went wrong!');
          } else {
            const data = res?.data;
            console.log('getAllExpenses data', data);
            this.prepareData(data, timeFilter);
          }
        },
        error: (err: any) => {
          this.snackbarService.openSnackBar('Something went wrong!');
        },
      });
  }

  prepareData(data: any, timeFilter: string) {
    const formattedData = [];
    let uniqHrs = data.map((e: any) => {
      let hr: any;
      if (timeFilter === 'daily') {
        const hrVal = new Date(e?.createdAt).getHours();
        hr = new Date(e?.createdAt).setHours(hrVal, 0, 0, 0);
      } else if (timeFilter === 'monthly') {
        hr = new Date(e?.createdAt).setHours(0, 0, 0, 0);
      }
      return new Date(hr).toISOString();
    });
    uniqHrs = new Set(uniqHrs);
    console.log(uniqHrs);
    for (let h of uniqHrs) {
      console.log('h', h);
      const filterData = data
        .filter((e1: any) => {
          let hrVal: any;
          if (timeFilter === 'daily') {
            hrVal = new Date(e1?.createdAt).getHours();
          } else if (timeFilter === 'monthly') {
            hrVal = 0;
          }
          return (
            new Date(
              new Date(e1?.createdAt).setHours(hrVal, 0, 0, 0)
            ).toISOString() == h
          );
        })
        .map((e: any) => {
          return {
            type: e?.type,
            expValue: e?.value,
            expTime: e?.createdAt,
            comment: e?.comment,
            _id: e?._id,
            createdBy: e?.createdBy,
          };
        });
      console.log('filterData', filterData);
      const totalValue = filterData.reduce((acc: any, curr: any) => {
        return acc + curr?.expValue;
      }, 0);
      formattedData.push({
        time: h,
        value: totalValue,
        expenses: this.sortData(filterData, 'expTime'),
      });
    }
    console.log('formattedData', formattedData);
    this.dataSource.data = this.sortData(formattedData, 'time');
    this.expSoFar();
  }

  sortData(data: any, time: string) {
    return data.sort((a: any, b: any) => {
      return new Date(a?.[time]).getTime() - new Date(b?.[time]).getTime();
    });
  }

  addExpenseToData(data: any, timeFilter: string, edit: boolean, del: boolean) {
    const dataSourceData = this.dataSource.data;
    console.log('dataSourceData', dataSourceData);
    let hr: number;
    if (timeFilter === 'daily') {
      const hrVal = new Date(data?.createdAt).getHours();
      hr = new Date(data?.createdAt).setHours(hrVal, 0, 0, 0);
    } else {
      hr = new Date(data?.createdAt).setHours(0, 0, 0, 0);
    }
    let actDataIndex = dataSourceData.findIndex((e: any) => {
      return new Date(hr).toISOString() == e?.time;
    });
    console.log('actDataIndex', actDataIndex, dataSourceData[actDataIndex]);
    if (actDataIndex < 0) {
      dataSourceData.push({
        time: new Date(hr).toISOString(),
        value: 0,
        expenses: [],
      });
      actDataIndex = dataSourceData.length - 1;
    }
    const expData = {
      type: data?.type,
      expValue: data?.value,
      expTime: data?.createdAt,
      comment: data?.comment,
      _id: data?._id,
      createdBy: data?.createdBy,
    };
    if (edit) {
      const index = _.findIndex(dataSourceData[actDataIndex]?.expenses, {
        _id: data?._id,
      });
      if (index !== -1) {
        dataSourceData[actDataIndex].value -=
          dataSourceData[actDataIndex]?.expenses[index]?.expValue;
        dataSourceData[actDataIndex].expenses[index] = expData;
      }
      this.snackbarService.openSnackBar(
        'Edited expense successfully'
      );  
    } else if (del) {
      const index = _.findIndex(dataSourceData[actDataIndex]?.expenses, {
        _id: data?._id,
      });
      if (
        dataSourceData.length === 1 &&
        dataSourceData[actDataIndex]?.expenses.length === 1
      ) {
        dataSourceData.pop();
      } else {
        if (index !== -1) {
          dataSourceData[actDataIndex].value -=
            dataSourceData[actDataIndex]?.expenses[index]?.expValue;
          dataSourceData[actDataIndex].expenses.splice(index, 1);
        }
      }
      this.snackbarService.openSnackBar(
        'Deleted expense successfully'
      );  
    } else {
      dataSourceData[actDataIndex]?.expenses.push(expData);
      this.snackbarService.openSnackBar(
        'Added expense successfully'
      );  
    }
    if (!del) {
      dataSourceData[actDataIndex].value += data?.value;
    }
    console.log('dataSourceData updated', dataSourceData);
    this.dataSource.data = dataSourceData;
    this.expSoFar();
  }

  expSoFar() {
    const data = this.dataSource.data;
    this.expenses = data.reduce((acc: any, curr: any) => {
      return acc + curr?.value;
    }, 0);
  }

  timeFilterChange(time: string) {
    if (time === 'daily') {
      this.timeFilter = 'daily';
    } else if (time === 'monthly') {
      this.timeFilter = 'monthly';
    }
    this.getAllExpData(this.timeFilter);
  }

  changeDate(event: MatDatepickerInputEvent<Date>) {
    console.log('changeDate', this.date, event.value);
    this.getAllExpData(this.timeFilter);
  }

  setMonthAndYear(
    normalizedMonthAndYear: moment.Moment,
    datepicker: MatDatepicker<moment.Moment>
  ) {
    this.month = new Date(normalizedMonthAndYear.toISOString());
    console.log(datepicker, normalizedMonthAndYear, this.month);
    datepicker.close();
    this.getAllExpData(this.timeFilter);
  }

  editDaily(element: any) {
    console.log('edit element', element);
    const { _id, createdBy, expValue, expTime, ...elemData } = element;
    elemData.date = expTime;
    elemData.value = expValue;
    console.log('elemData', elemData, _id, createdBy);
    const data = {
      value: element.expValue,
      comment: element.comment,
      date: element.expTime,
      type: element.type,
    };
    const dialogRef = this.dialog.open(AddDailyExpenseComponent, {
      data,
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.value = 0;
      this.comment = '';
      console.log('The edit daily dialog was closed', result, data);

      if (!_.isEqual(elemData, result)) {
        const diff: any = this.findValueDifference(result, elemData);
        console.log('diff', diff);
        if (!diff?.date) {
          this.dashboardService
            .editExpense(element?._id, { updateData: diff })
            .subscribe((res: any) => {
              console.log('edit daily res', res);
              if (res?.data) {
                this.addExpenseToData(res?.data, this.timeFilter, true, false);
              } else {
                console.log('Edit Daily Response is empty');
                this.snackbarService.openSnackBar(
                  'Error occurred in editing expense'
                );
              }
            });
        }
      } else {
        console.log('same');
        this.snackbarService.openSnackBar('No value is updated');
      }
    });
  }

  findValueDifference(obj1: any, obj2: any) {
    const commonKeys = _.intersection(_.keys(obj1), _.keys(obj2));

    const valueDifference = _.pickBy(obj1, (value: any, key: any) => {
      return commonKeys.includes(key) && !_.isEqual(value, obj2[key]);
    });
    return valueDifference;
  }

  deleteDaily(element: any) {
    console.log('delete daily element', element);
    this.dashboardService.deleteExpense(element?._id).subscribe((res: any) => {
      console.log('delete daily res', res);
      if (res?.data?.value) {
        this.addExpenseToData(res?.data?.value, this.timeFilter, false, true);
      } else {
        console.log('Delete Daily Response is empty');
        this.snackbarService.openSnackBar('Error occurred in deleting expense');
      }
    });
  }

  editMonthly(element: any, time: Date) {
    console.log('edit monthly', element);
    const { _id, createdBy, expValue, expTime, ...elemData } = element;
    elemData.date = expTime;
    elemData.value = expValue;
    console.log('elemData monthly', elemData, _id, createdBy);
    const data = {
      value: element.expValue,
      comment: element.comment,
      date: element.expTime,
      type: element.type,
    };
    const dialogRef = this.dialog.open(AddMonthlyExpenseComponent, {
      data,
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.value = 0;
      this.comment = '';
      console.log(
        'The edit monthly dialog was closed',
        this.value,
        this.comment,
        result
      );
      if (!_.isEqual(elemData, result)) {
        const diff: any = this.findValueDifference(result, elemData);
        console.log('diff', diff);
        if (!diff?.date) {
          this.dashboardService
            .editExpense(element?._id, { updateData: diff })
            .subscribe((res: any) => {
              console.log('edit monthly res', res);
              if (res?.data) {
                this.addExpenseToData(res?.data, this.timeFilter, true, false);
              } else {
                console.log('Edit Monthly Response is empty');
                this.snackbarService.openSnackBar(
                  'Error occurred in editing expense'
                );
              }
            });
        }
      } else {
        console.log('same monthly');
        this.snackbarService.openSnackBar('No value is updated');
      }
    });
  }

  deleteMonthly(element: any) {
    console.log('delete monthly element', element);
    this.dashboardService.deleteExpense(element?._id).subscribe((res: any) => {
      console.log('delete monthly res', res);
      if (res?.data?.value) {
        this.addExpenseToData(res?.data?.value, this.timeFilter, false, true);
      } else {
        console.log('Delete Monthly Response is empty');
        this.snackbarService.openSnackBar('Error occurred in deleting expense');
      }
    });
  }

  openAddDailyExpenseDialog(): void {
    const dialogRef = this.dialog.open(AddDailyExpenseComponent, {
      data: {
        value: this.value,
        comment: this.comment,
        date: this.date,
        type: this.expType,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.value = 0;
      this.comment = '';
      console.log('The daily dialog was closed', result);
      if (result?.value && result?.type && result?.date) {
        this.dashboardService
          .addExpense(this.email, this.date.toISOString(), result)
          .subscribe((res: any) => {
            console.log('addexpense response', res);
            if (res?.data && res?.status) {
              this.addExpenseToData(res?.data, this.timeFilter, false, false);
            } else {
              console.log('Add Daily Response is empty');
              this.snackbarService.openSnackBar(
                'Error occurred in adding expense'
              );
            }
          });
      }
      else {
        this.snackbarService.openSnackBar(
          'Please fill all the fields'
        );
      }
    });
  }

  openAddMonthlyExpenseDialog(time: Date): void {
    const dialogRef = this.dialog.open(AddMonthlyExpenseComponent, {
      data: { value: this.value, comment: this.comment, date: time },
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.value = 0;
      this.comment = '';
      console.log(
        'The monthly dialog was closed',
        this.value,
        this.comment,
        result,
        this.date.toISOString()
      );
      if (result?.value && result?.type && result?.date) {
        this.dashboardService
          .addExpense(this.email, result?.date, result)
          .subscribe((res: any) => {
            console.log('add monthly expense response', res);
            if (res?.data) {
              this.addExpenseToData(res?.data, this.timeFilter, false, false);
            } else {
              console.log('Add Monthly Response is empty');
              this.snackbarService.openSnackBar(
                'Error occurred in adding expense'
              );
            }
          });
      }
      else {
        this.snackbarService.openSnackBar(
          'Please fill all the fields'
        );
      }
    });
  }

  gotoBudget() {
    console.log('budget route');
    this.router.navigate(['budget']);
  }

  logout() {
    let timer = 5;
    let count = 4;
    const intervalId = setInterval(() => {
      timer--;
      count--;
      if(count > 0) {
        this.snackbarService.openSnackBar(`Your will be logged out in ${count} seconds`);
      }
      if (timer === 0) {
        clearInterval(intervalId);
      }
    }, 1000); 
    setTimeout(() => {
      this.router.navigate([''], {replaceUrl:true});
    }, 5000)
  }
}

type columnDataMapType = {
  [key: string]: 'type' | 'value' | 'time';
  Time: 'time';
  'Total Value': 'value';
};

type monthlyColumnDataMapType = {
  [key: string]: 'type' | 'value' | 'time';
  Date: 'time';
  'Total Value': 'value';
};

export interface ExpensesData {
  time: Date | string;
  value: number;
  expenses: {
    type: string;
    expValue: number;
    expTime: Date;
    comment: string;
    _id: string;
    createdBy: string;
  }[];
}

const ELEMENT_DATA: ExpensesData[] = [];
