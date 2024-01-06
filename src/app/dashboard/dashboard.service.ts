import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { of } from 'rxjs';

@Injectable()
export class DashboardService {
    url = environment.serverURL;
    constructor(private http: HttpClient) {}

    getUserDetails(email: string | null) {
        if(email) {
            return this.http.get(this.url+'/user/'+email+'/getuserdetails');
        }
        return of();
    }

    addExpense(email: string | null, date: string, expBody: object) {
        if(email) {
            return this.http.post(`${this.url}/expense/${email}/${date}/addexpense`, expBody);
        }
        return of();
    }

    getAllExpenses(email: string | null, date: string, dateType: string) {
        if(email) {
            return this.http.get(`${this.url}/expense/${email}/${date}/${dateType}/getexpdata`);
        }
        return of();
    }

    editExpense(expId: string, expBody: object) {
        return this.http.put(`${this.url}/expense/${expId}/editexp`, expBody);
    }

    deleteExpense(expId: string) {
        return this.http.delete(`${this.url}/expense/${expId}/deleteexp`);
    }

    getExpCatData(email: string | null, date: string, dateType: string) {
        if(email) {
            return this.http.get(`${this.url}/expense/${email}/${date}/${dateType}/getexpcatdata`);
        }
        return of();
    }

}