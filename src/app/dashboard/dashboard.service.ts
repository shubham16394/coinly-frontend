import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable()
export class DashboardService {
    url = environment.serverURL;
    constructor(private http: HttpClient) {}

    getUserDetails(email: string) {
        return this.http.get(this.url+'/user/'+email+'/getuserdetails');
    }

    addExpense(email: string, date: string, expBody: object) {
        return this.http.post(`${this.url}/expense/${email}/${date}/addexpense`, expBody);
    }

    getAllExpenses(email: string, date: string, dateType: string) {
        return this.http.get(`${this.url}/expense/${email}/${date}/${dateType}/getexpdata`);
    }

    editExpense(expId: string, expBody: object) {
        return this.http.put(`${this.url}/expense/${expId}/editexp`, expBody);
    }

    deleteExpense(expId: string) {
        return this.http.delete(`${this.url}/expense/${expId}/deleteexp`);
    }

    getExpCatData(email: string, date: string, dateType: string) {
        return this.http.get(`${this.url}/expense/${email}/${date}/${dateType}/getexpcatdata`);
    }

}