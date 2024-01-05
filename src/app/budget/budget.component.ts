import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import {
  MatDatepicker,
  MatDatepickerInputEvent,
} from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { AddBudgetComponent } from '../add-budget/add-budget.component';
import { BudgetService } from './budget.service';
import { SnackbarService } from '../services/snackbar.service';
import * as moment from 'moment';
import { MatTableDataSource } from '@angular/material/table';
import * as _ from 'lodash';

@Component({
  selector: 'app-budget',
  templateUrl: './budget.component.html',
  styleUrls: ['./budget.component.scss'],
})
export class BudgetComponent implements OnInit {
  month: Date = new Date(new Date(new Date().setHours(0, 0, 0, 0)).setDate(1));
  displayedColumns: string[] = ['position', 'name', 'value', 'actions'];
  dataSource = new MatTableDataSource(ELEMENT_DATA1);
  expenseDataSource = new MatTableDataSource(ELEMENT_DATA2);
  savingsDataSource = new MatTableDataSource(ELEMENT_DATA3);
  income: number = 0;
  expense: number = 0;
  saving: number = 0;
  name: string = '';
  value: number = 0;
  incomeFlag = false;
  budgetFlag = false;
  savingFlag = false;
  email = 'shubham16394@gmail.com';

  constructor(
    public dialog: MatDialog,
    private budgetService: BudgetService,
    private snackbarService: SnackbarService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getAllBudgetData();
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  getAllBudgetData() {
    this.dataSource.data = [];
    this.expenseDataSource.data = [];
    this.savingsDataSource.data = [];

    const incomeObservable = this.budgetService.getBudget(
      this.email,
      this.month.toISOString(),
      'income'
    );
    const expenseObservable = this.budgetService.getBudget(
      this.email,
      this.month.toISOString(),
      'expense'
    );
    const savingObservable = this.budgetService.getBudget(
      this.email,
      this.month.toISOString(),
      'saving'
    );
    forkJoin([incomeObservable, expenseObservable, savingObservable]).subscribe(
      {
        next: ([incomeData, expenseData, savingData]) => {
          // Process the results
          const income = incomeData as respose;
          const expense = expenseData as respose;
          const saving = savingData as respose;
          console.log('Income data:', incomeData);
          console.log('Expense data:', expenseData);
          console.log('Saving data:', savingData);
          if (income && income?.data && Object.keys(income?.data).length) {
            this.prepareData(income?.data, 'income');
          } else {
            this.dataSource.data = [];
          }
          if (expense && expense?.data && Object.keys(expense?.data).length) {
            this.prepareData(expense?.data, 'expense');
          } else {
            this.expenseDataSource.data = [];
          }
          if (saving && saving?.data && Object.keys(saving?.data).length) {
            this.prepareData(saving?.data, 'saving');
          } else {
            this.savingsDataSource.data = [];
          }
          this.setFlags();
        },
        error: (error) => {
          // Handle error
          console.error('Error in getting budget data:', error);
          this.snackbarService.openSnackBar('Something went wrong!');
        },
      }
    );
  }

  prepareData(data: any, type: type) {
    for (let d of data) {
      this.addData(d, type);
    }
  }

  unsetFlags() {
    this.budgetFlag = false;
    this.incomeFlag = false;
    this.savingFlag = false;
  }

  setFlags() {
    this.budgetFlag = true;
    this.incomeFlag = true;
    this.savingFlag = true;
  }

  changeDate(event: MatDatepickerInputEvent<Date>) {
    console.log(this.month, event.value);
  }

  setMonthAndYear(
    normalizedMonthAndYear: moment.Moment,
    datepicker: MatDatepicker<moment.Moment>
  ) {
    this.unsetFlags();
    this.month = new Date(normalizedMonthAndYear.toISOString());
    console.log(datepicker, normalizedMonthAndYear, this.month);
    datepicker.close();
    this.getAllBudgetData();
  }

  addData(data: any, type: type) {
    if (type === 'income') {
      const dataSourceData = this.dataSource?.data;
      const obj = {
        name: data?.name,
        value: data?.value,
        _id: data?._id,
        date: data?.createdAt,
        position: dataSourceData.length + 1,
      };
      dataSourceData.push(obj);
      this.dataSource.data = this.sortData(dataSourceData);
      this.totalValue(type);
    } else if (type === 'expense') {
      const expenseDataSourceData = this.expenseDataSource?.data;
      const obj = {
        name: data?.name,
        value: data?.value,
        _id: data?._id,
        date: data?.createdAt,
        position: expenseDataSourceData.length + 1,
      };
      expenseDataSourceData.push(obj);
      this.expenseDataSource.data = this.sortData(expenseDataSourceData);
      this.totalValue(type);
    } else if (type === 'saving') {
      const savingsDataSourceData = this.savingsDataSource?.data;
      const obj = {
        name: data?.name,
        value: data?.value,
        _id: data?._id,
        date: data?.createdAt,
        position: savingsDataSourceData.length + 1,
      };
      savingsDataSourceData.push(obj);
      this.savingsDataSource.data = this.sortData(savingsDataSourceData);
      this.totalValue(type);
    }
  }

  editData(data: any, type: type) {
    if (type === 'income') {
      const dataSourceData = this.dataSource?.data;
      const index = dataSourceData.findIndex((e: any) => {
        return e?._id === data?._id;
      });
      if (index !== -1) {
        dataSourceData[index].name = data?.name;
        dataSourceData[index].value = data?.value;
        this.dataSource.data = this.sortData(dataSourceData);
        this.totalValue(type);
      }
    } else if (type === 'expense') {
      const dataSourceData = this.expenseDataSource?.data;
      const index = dataSourceData.findIndex((e: any) => {
        return e?._id === data?._id;
      });
      if (index !== -1) {
        dataSourceData[index].name = data?.name;
        dataSourceData[index].value = data?.value;
        this.expenseDataSource.data = this.sortData(dataSourceData);
        this.totalValue(type);
      }
    } else if (type === 'saving') {
      const dataSourceData = this.savingsDataSource?.data;
      const index = dataSourceData.findIndex((e: any) => {
        return e?._id === data?._id;
      });
      if (index !== -1) {
        dataSourceData[index].name = data?.name;
        dataSourceData[index].value = data?.value;
        this.savingsDataSource.data = this.sortData(dataSourceData);
        this.totalValue(type);
      }
    }
  }

  deleteData(data: any, type: type) {
    if (type === 'income') {
      const dataSourceData = this.dataSource?.data;
      const index = dataSourceData.findIndex((e: any) => {
        return e?._id === data?._id;
      });
      if (index !== -1) {
        dataSourceData.splice(index, 1);
        this.dataSource.data = this.sortData(dataSourceData);
        this.totalValue(type);
      }
    } else if (type === 'expense') {
      const dataSourceData = this.expenseDataSource?.data;
      const index = dataSourceData.findIndex((e: any) => {
        return e?._id === data?._id;
      });
      if (index !== -1) {
        dataSourceData.splice(index, 1);
        this.expenseDataSource.data = this.sortData(dataSourceData);
        this.totalValue(type);
      }
    } else if (type === 'saving') {
      const dataSourceData = this.savingsDataSource?.data;
      const index = dataSourceData.findIndex((e: any) => {
        return e?._id === data?._id;
      });
      if (index !== -1) {
        dataSourceData.splice(index, 1);
        this.savingsDataSource.data = this.sortData(dataSourceData);
        this.totalValue(type);
      }
    }
  }

  sortData(data: any) {
    return data.sort((a: any, b: any) => {
      return new Date(a?.position).getTime() - new Date(b?.position).getTime();
    });
  }

  totalValue(type: type) {
    if (type === 'income') {
      const data = this.dataSource.data;
      this.income = data.reduce((acc: any, curr: any) => {
        return acc + curr?.value;
      }, 0);
    } else if (type === 'expense') {
      const data = this.expenseDataSource.data;
      this.expense = data.reduce((acc: any, curr: any) => {
        return acc + curr?.value;
      }, 0);
    } else if (type === 'saving') {
      const data = this.savingsDataSource.data;
      this.saving = data.reduce((acc: any, curr: any) => {
        return acc + curr?.value;
      }, 0);
    }
  }

  add(type: type) {
    const dialogRef = this.dialog.open(AddBudgetComponent, {
      data: {
        name: this.name,
        value: this.value,
        date: this.month,
        type,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.name && result?.value && result?.date) {
        this.budgetService
          .addBudget(this.email, this.month.toISOString(), type, {
            budgetData: { name: result?.name, value: result?.value },
          })
          .subscribe({
            next: (res: any) => {
              console.log('add res', res);
              if (res?.data && res?.status) {
                this.addData(res?.data, type);
              } else {
                this.snackbarService.openSnackBar(
                  `Error occurred while adding ${type}`
                );
              }
            },
            error: (err: any) => {
              console.log('Err in adding', err);
              this.snackbarService.openSnackBar(
                `Error occurred while adding ${type}`
              );
            },
          });
      } else {
        console.log('add parameters not found');
        this.snackbarService.openSnackBar(
          `Name and Value are mandatroy ${type}`
        );
      }
    });
  }

  edit(element: any, type: type) {
    const dialogRef = this.dialog.open(AddBudgetComponent, {
      data: {
        name: element?.name,
        value: element?.value,
        date: element?.date,
        type,
      },
    });
    console.log('edit element', element);
    dialogRef.afterClosed().subscribe((result) => {
      console.log('edit res', result);
      const diff: any = this.findValueDifference(result, element);
      console.log('diff', diff);
      if (diff) {
        this.budgetService
          .updateBudget(element?._id, { updateBudgetData: diff })
          .subscribe({
            next: (res: any) => {
              if (res?.data) {
                this.editData(res?.data, type);
              } else {
                this.snackbarService.openSnackBar(
                  `Error occurred while editing ${type}`
                );
              }
            },
            error: (err: any) => {
              console.log('Err in editing', err);
              this.snackbarService.openSnackBar(
                `Something went wrong while editing ${type}`
              );
            },
          });
      } else {
        console.log('Nothing to edit');
        this.snackbarService.openSnackBar(
          `No value updated while editing ${type}`
        );
      }
    });
  }

  delete(element: any, type: type) {
    if (element?._id) {
      this.budgetService.deleteBudget(element?._id).subscribe({
        next: (res: any) => {
          if (res?.data?.value) {
            console.log('delete res', res);
            this.deleteData(res?.data?.value, type);
          } else {
            console.log('Empty delete response');
            this.snackbarService.openSnackBar(
              `Error occurred while deleting ${type}`
            );
          }
        },
        error: (err: any) => {
          this.snackbarService.openSnackBar(
            `Something went wrong while deleting ${type}`
          );
        },
      });
    } else {
      console.log('Not able to delete');
      this.snackbarService.openSnackBar(
        `Error occurred while deleting ${type}`
      );
    }
  }

  findValueDifference(obj1: any, obj2: any) {
    const commonKeys = _.intersection(_.keys(obj1), _.keys(obj2));

    const valueDifference = _.pickBy(obj1, (value: any, key: any) => {
      return commonKeys.includes(key) && !_.isEqual(value, obj2[key]);
    });
    return valueDifference;
  }
}

export interface BudgetElement {
  name: string;
  position?: number;
  value: number;
  _id?: string;
  actions?: string;
}

export type type = 'income' | 'expense' | 'saving';
export type respose = {
  data: {};
  message: string;
  status: boolean;
};

const ELEMENT_DATA1: BudgetElement[] = [];
const ELEMENT_DATA2: BudgetElement[] = [];
const ELEMENT_DATA3: BudgetElement[] = [];
