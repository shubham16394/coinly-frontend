import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { of } from 'rxjs';

@Injectable()
export class BudgetService {
    url = environment.serverURL;
    constructor(private http: HttpClient) {}

    addBudget(email: string | null, date: string, type: string, reqBody: object) {
        if(email) {
            return this.http.post(`${this.url}/budget/${email}/${date}/${type}/add`, reqBody);
        }
        return of();
    }

    getBudget(email: string | null, date: string, type: string) {
        if(email) {
            return this.http.get(`${this.url}/budget/${email}/${date}/${type}/get`);
        }
        return of();
    }

    updateBudget(bId: string, reqBody: object) {
        return this.http.put(`${this.url}/budget/${bId}/update`, reqBody);
    }

    deleteBudget(bId: string) {
        return this.http.delete(`${this.url}/budget/${bId}/delete`);
    }
}