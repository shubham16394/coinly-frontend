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
import { BudgetService } from '../budget/budget.service';
import * as _ from 'lodash';
import { SharedService } from '../services/shared.service';
import { LoginService } from '../login/login.service';

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
  budget: number = 0;
  expenses: number = 0;
  previousExp: number = 0;
  expChange: number = 0;
  totalBudget: number = 0;
  days: number = 0;
  budgetFlag = false;
  expensesFlag = false;
  previousExpFlag = false;
  expChangeFlag = false;
  date: Date = new Date();
  month: Date = new Date(new Date(new Date().setDate(1)).setHours(0, 0, 0, 0));
  columnsToDisplay = ['Time', 'Total Value'];
  columnsToDisplayMonthly = ['Date', 'Total Value'];
  columnDataMap: columnDataMapType = { Time: 'time', 'Total Value': 'value' };
  monthlyColumnDataMap: monthlyColumnDataMapType = {
    Date: 'time',
    'Total Value': 'value',
  };
  dataSource = new MatTableDataSource(ELEMENT_DATA);
  graphData: any = [];
  columnsToDisplayWithExpand = [...this.columnsToDisplay, 'expand'];
  columnsToDisplayMonthlyWithExpand = [
    ...this.columnsToDisplayMonthly,
    'expand',
  ];
  expandedElement!: ExpensesData | null;
  value: number = 0;
  comment: string = '';
  expType: string = '';
  email: string | null = '';
  firstName: string | null = '';
  lastName: string | null = '';


  constructor(
    public dialog: MatDialog,
    private router: Router,
    private dashboardService: DashboardService,
    private snackbarService: SnackbarService,
    private budgetService: BudgetService,
    private sharedService: SharedService,
    private loginService: LoginService
  ) {
    !this.loginService.isLoggedIn() ? this.router.navigate([''], {replaceUrl: true}) : this.router.navigate(['/dashboard'], {replaceUrl: true});
  }

  async ngOnInit() {
    const {email, firstName, lastName} = this.loginService.getUserFromLocalStorage();
    this.email = email;
    this.firstName = firstName;
    this.lastName = lastName;
    this.initCall();
  }

  ngAfterViewInit(): void {}

  unsetFlags() {
    this.budgetFlag = false;
    this.expensesFlag = false;
    this.previousExpFlag = false;
    this.expChangeFlag = false;
  }

  getAllExpData(timeFilter: string, previous: boolean): Promise<void> {
    return new Promise((resolve) => {
      let date =
        timeFilter === 'daily'
          ? this.date
          : timeFilter === 'monthly'
          ? this.month
          : new Date();
      date =
        previous === false ? date : this.getPreviousDate(date, timeFilter, 1);
      this.dashboardService
        .getAllExpenses(this.email, date.toISOString(), this.timeFilter)
        .subscribe({
          next: async (res: any) => {
            if (!res?.status) {
              this.snackbarService.openSnackBar('Something went wrong!');
            } else {
              const data = res?.data;
              if (previous) {
                this.previousExp = await this.prepareData(
                  data,
                  timeFilter,
                  previous
                );
                this.previousExpFlag = true;
              } else if (!previous) {
                this.expenses = await this.prepareData(
                  data,
                  timeFilter,
                  previous
                );
                this.expensesFlag = true;
              }
            }
            resolve();
          },
          error: (err: any) => {
            console.log('Err in getting exp data', err);
            this.snackbarService.openSnackBar('Something went wrong!');
            resolve();
          },
        });
    });
  }

  getPreviousDate(date: Date, timeFilter: string, subtract: number) {
    const currentDate = date;
    const previousDate = new Date(currentDate);
    if (timeFilter === 'daily') {
      previousDate.setDate(currentDate.getDate() - subtract);
    } else if (timeFilter === 'monthly') {
      previousDate.setMonth(currentDate.getMonth() - subtract);
    }
    return previousDate;
  }

  percentChanges(): Promise<number> {
    return new Promise((resolve) => {
      let expChange = 0;
      const x = this.previousExp;
      const y = this.expenses;
      if (x === 0 && y !== 0) {
        expChange = -100;
      } else if (y === 0) {
        expChange = 0;
      } else {
        expChange = Number((((x - y) / x) * 100).toFixed(2));
      }
      resolve(expChange);
    });
  }

  getColor(percent: boolean) {
    if (percent) {
      return this.expChange < 0 ? '#f74c82' : '#0cc980';
    }
    return this.budget - this.expenses <= 0 ? '#f74c82' : '#0cc980';
  }

  getAbsExpChange() {
    return Math.abs(this.expChange);
  }

  capitalizeFirstLetter(str: string | null) {
    if(str) {
      str = str.toLowerCase();
      return str.charAt(0).toUpperCase() + str.slice(1);  
    }
    return '';
  }

  async prepareData(
    data: any,
    timeFilter: string,
    previous: boolean
  ): Promise<number> {
    return new Promise(async (resolve) => {
      const formattedData = [];
      let expenses = 0;
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
      for (let h of uniqHrs) {
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
        const totalValue = filterData.reduce((acc: any, curr: any) => {
          return acc + curr?.expValue;
        }, 0);
        formattedData.push({
          time: h,
          value: totalValue,
          expenses: this.sortData(filterData, 'expTime'),
        });
      }
      if (!previous) {
        this.sortData(formattedData, 'time');
        expenses = formattedData.reduce((acc: any, curr: any) => {
          return acc + curr?.value;
        }, 0);
        this.dataSource.data = formattedData;
        const { budget, totalBudget, days } = await this.getBudget();
        this.budget = budget;
        this.totalBudget = totalBudget;
        this.days = days;
        this.budgetFlag = true;
        this.prepareGraphData(formattedData);
      } else if (previous) {
        expenses = data.reduce((acc: any, curr: any) => {
          return acc + curr?.value;
        }, 0);
      }
      resolve(expenses);
    });
  }

  prepareGraphData(data: any) {
    const expData = data.map((e: any) => e?.expenses).flat();
    const catogery = expData.map((e: any) => {return e?.type});
    const uniqCat = new Set(catogery);
    const graphData = [];
    for(let cat of uniqCat){
      graphData.push({name: cat, y: expData.filter((e: any) => { return e?.type === cat }).reduce((acc: number, curr: any) => {return acc + curr?.expValue}, 0)});
    }
    this.graphData = graphData;
    
    this.sharedService.updateGraphData(this.formatGraphData(this.graphData));
  }

  formatGraphData(graphData: any) {
    const catgoreyMap: any = {
      'housing': 'Housing',
      'grocery': 'Grocery',
      'dine-out': 'Dine out',
      'transportation': 'Transportation',
      'health': 'Health',
      'debt-payments': 'Debt Payments',
      'entertainment': 'Entertainment',
      'cellphone-wifi': 'Cellphone & Wifi',
      'membership-subscriptions': 'Membership & Subscriptions',
      'travel': 'Travel',
      'child-care': 'Child Care',
      'pet-care': 'Pet Care',
      'other': 'Other'
  
    }
    return graphData.map((e: any) => { return {name: catgoreyMap[e?.name], y: e?.y}; });
  }

  sortData(data: any, time: string) {
    return data.sort((a: any, b: any) => {
      return new Date(a?.[time]).getTime() - new Date(b?.[time]).getTime();
    });
  }

  async addExpenseToData(
    data: any,
    timeFilter: string,
    edit: boolean,
    del: boolean
  ) {
    const dataSourceData = this.dataSource.data;
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
      this.snackbarService.openSnackBar('Edited expense successfully');
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
          if(dataSourceData[actDataIndex].expenses.length === 0) {
            dataSourceData.splice(actDataIndex, 1);
          }
        }
      }
      this.snackbarService.openSnackBar('Deleted expense successfully');
    } else {
      dataSourceData[actDataIndex]?.expenses.push(expData);
      this.snackbarService.openSnackBar('Added expense successfully');
    }
    if (!del) {
      dataSourceData[actDataIndex].value += data?.value;
    }
    this.dataSource.data = dataSourceData;
    this.prepareGraphData(dataSourceData);
    this.expSoFar();
    this.expChange = await this.percentChanges();
  }

  expSoFar() {
    const data = this.dataSource.data;
    this.expenses = data.reduce((acc: any, curr: any) => {
      return acc + curr?.value;
    }, 0);
    this.dataSource.data = data;
  }

  getBudget(): Promise<{budget: number, totalBudget: number, days: number}> {
    const days = this.getTotalDaysInMonth(this.date);
    return new Promise((resolve) => {
      this.budgetService
        .getBudget(
          this.email,
          this.timeFilter === 'daily'
            ? this.date.toISOString()
            : this.month.toISOString(),
          'expense'
        )
        .subscribe({
          next: (res: any) => {
            const data = res?.data;
            const totalBudget = data.reduce((acc: number, curr: any) => {
              return acc + curr?.value;
            }, 0);
            let budget = 0;
            if (this.timeFilter === 'monthly') {
              budget = totalBudget;
            } else if (this.timeFilter === 'daily') {
              budget = Math.floor(totalBudget / days);
            }
            resolve({budget, totalBudget, days});
          },
          error: (err: any) => {
            console.log('Err in getting expense budget', err);
            resolve({budget: 0, totalBudget: 0, days});
          },
        });
    });
  }

  getTotalDaysInMonth(date: Date) {
    const currentMonth = date.getMonth();
    const currentYear = date.getFullYear();
    const firstDayOfNextMonth = new Date(currentYear, currentMonth + 1, 1);
    const lastDayOfMonth = new Date((firstDayOfNextMonth as any) - 1);
    const endDate = new Date(lastDayOfMonth.setHours(23, 59, 59, 999));
    return endDate.getDate();
  }

  async timeFilterChange(time: string) {
    this.unsetFlags();
    if (time === 'daily') {
      this.timeFilter = 'daily';
    } else if (time === 'monthly') {
      this.timeFilter = 'monthly';
    }
    this.budget = 0;
    this.expChange = 0;
    this.expenses = 0;
    this.previousExp = 0;
    this.initCall();
  }

  async initCall() {
    await this.getAllExpData(this.timeFilter, false);
    await this.getAllExpData(this.timeFilter, true);
    this.expChange = await this.percentChanges();
    this.expChangeFlag = true;
  }

  async changeDate(event: MatDatepickerInputEvent<Date>) {
    this.unsetFlags();
    this.initCall();
  }

  async setMonthAndYear(
    normalizedMonthAndYear: moment.Moment,
    datepicker: MatDatepicker<moment.Moment>
  ) {
    this.unsetFlags();
    this.month = new Date(normalizedMonthAndYear.toISOString());
    datepicker.close();
    this.initCall();
  }

  editDaily(element: any) {
    const { _id, createdBy, expValue, expTime, ...elemData } = element;
    elemData.date = expTime;
    elemData.value = expValue;
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
      if (!_.isEqual(elemData, result)) {
        const diff: any = this.findValueDifference(result, elemData);
        if (!diff?.date) {
          this.dashboardService
            .editExpense(element?._id, { updateData: diff })
            .subscribe((res: any) => {
              if (res?.data) {
                this.addExpenseToData(res?.data, this.timeFilter, true, false);
              } else {
                this.snackbarService.openSnackBar(
                  'Error occurred in editing expense'
                );
              }
            });
        }
      } else {
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
    this.dashboardService.deleteExpense(element?._id).subscribe((res: any) => {
      if (res?.data?.value) {
        this.addExpenseToData(res?.data?.value, this.timeFilter, false, true);
      } else {
        this.snackbarService.openSnackBar('Error occurred in deleting expense');
      }
    });
  }

  editMonthly(element: any, time: Date) {
    const { _id, createdBy, expValue, expTime, ...elemData } = element;
    elemData.date = expTime;
    elemData.value = expValue;
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
      if (!_.isEqual(elemData, result)) {
        const diff: any = this.findValueDifference(result, elemData);
        if (!diff?.date) {
          this.dashboardService
            .editExpense(element?._id, { updateData: diff })
            .subscribe((res: any) => {
              if (res?.data) {
                this.addExpenseToData(res?.data, this.timeFilter, true, false);
              } else {
                this.snackbarService.openSnackBar(
                  'Error occurred in editing expense'
                );
              }
            });
        }
      } else {
        this.snackbarService.openSnackBar('No value is updated');
      }
    });
  }

  deleteMonthly(element: any) {
    this.dashboardService.deleteExpense(element?._id).subscribe((res: any) => {
      if (res?.data?.value) {
        this.addExpenseToData(res?.data?.value, this.timeFilter, false, true);
      } else {
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
      if (result?.value && result?.type && result?.date) {
        this.dashboardService
          .addExpense(this.email, this.date.toISOString(), result)
          .subscribe((res: any) => {
            if (res?.data && res?.status) {
              this.addExpenseToData(res?.data, this.timeFilter, false, false);
            } else {
              this.snackbarService.openSnackBar(
                'Error occurred in adding expense'
              );
            }
          });
      } else {
        this.snackbarService.openSnackBar('Please fill all the fields');
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
      if (result?.value && result?.type && result?.date) {
        this.dashboardService
          .addExpense(this.email, result?.date, result)
          .subscribe((res: any) => {
            if (res?.data) {
              this.addExpenseToData(res?.data, this.timeFilter, false, false);
            } else {
              this.snackbarService.openSnackBar(
                'Error occurred in adding expense'
              );
            }
          });
      } else {
        this.snackbarService.openSnackBar('Please fill all the fields');
      }
    });
  }

  gotoBudget() {
    this.router.navigate(['budget']);
  }

  logout() {
    this.loginService.unsetUserInLocalStorage();
    let timer = 5;
    let count = 4;
    const intervalId = setInterval(() => {
      timer--;
      count--;
      if (count > 0) {
        this.snackbarService.openSnackBar(
          `Your will be logged out in ${count} seconds`
        );
      }
      if (timer === 0) {
        clearInterval(intervalId);
      }
    }, 1000);
    setTimeout(() => {
      this.router.navigate([''], { replaceUrl: true });
    }, 5000);
  }

  getTagClass(exp: string) {
    const expClassMap: expType = {
      'housing': 'blue-tag',
      'grocery': 'purple-tag',
      'dine-out': 'green-tag',
      'transportation': 'gray-tag',
      'health': 'pink-tag',
      'debt-payments': 'light-blue-tag',
      'entertainment': 'red-tag',
      'cellphone-wifi': 'ceyon-tag',
      'membership-subscriptions': 'light-green-tag',
      'travel': 'orange-tag',
      'child-care': 'pale-yellow-tag',
      'pet-care': 'yellow-tag',
      'other': 'light-red-tag'
    }
    return expClassMap[exp];
  }

  getNewDailyBudget() {
    let newDailyBudget = 0;
    if(this.expenses !== 0 && (this.days - this.date.getDate()) !== 0) {
      newDailyBudget = Number(((this.budget - this.expenses) / (this.days - this.date.getDate())).toFixed(2));
    }
    return newDailyBudget !== 0 ? newDailyBudget : 0;
  }

  getAvgExpense() {
    let avgExpense = 0;
    let lastDays = 0;
    const data = this.dataSource.data;
    if(data && data.length) {
      avgExpense = Number((data.reduce((acc: number, curr: any) => {return acc + curr?.value}, 0) / this.date.getDate()).toFixed(2));  
    }
    if(avgExpense !== 0) {
      lastDays = Math.floor((this.budget / avgExpense));
    }
    return {avgExpense: (avgExpense !== 0 ? avgExpense : 0), lastDays: (lastDays !== 0 ? lastDays : 0), leftDays: (this.days - this.date.getDate())};
  }
}

type columnDataMapType = {
  [key: string]: 'type' | 'value' | 'time';
  Time: 'time';
  'Total Value': 'value';
};

type expType = {
  [key: string]: string;
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
