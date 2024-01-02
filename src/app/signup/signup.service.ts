import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { FormGroup } from '@angular/forms';
import { environment } from 'src/environments/environment';

@Injectable()
export class SignupService {
    url = environment.serverURL;
    constructor(private http: HttpClient){}

    signup(form: FormGroup)  {
        return this.http.post(this.url+'/user/signup', form.value)
    }    
}