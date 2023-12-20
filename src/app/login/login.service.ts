import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormGroup } from '@angular/forms';

@Injectable()
export class LoginService {
    url = "http://localhost:3000/coinly/user/login"
    constructor(public http: HttpClient){}


    login(form: FormGroup) {
        return this.http.post(this.url, form.value);
    }
}