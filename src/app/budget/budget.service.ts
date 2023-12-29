import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable()
export class BudgetService {
    url = environment.serverURL;
    constructor(private http: HttpClient) {}

    addBudget(email: string, date: string, type: string, reqBody: object) {
        return this.http.post(`${this.url}/budget/${email}/${date}/${type}/add`, reqBody);
    }

    getBudget(email: string, date: string, type: string) {
        return this.http.get(`${this.url}/budget/${email}/${date}/${type}/get`);
    }

    updateBudget(bId: string, reqBody: object) {
        return this.http.put(`${this.url}/budget/${bId}/update`, reqBody);
    }

    deleteBudget(bId: string) {
        return this.http.delete(`${this.url}/budget/${bId}/delete`);
    }
}