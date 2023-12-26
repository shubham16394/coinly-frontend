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


}