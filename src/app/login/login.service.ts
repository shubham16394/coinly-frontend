import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormGroup } from '@angular/forms';
import { environment } from 'src/environments/environment';

@Injectable()
export class LoginService {
    url = environment.serverURL;
    constructor(private http: HttpClient){}

    login(form: FormGroup) {
        return this.http.post(this.url+'/user/login', form.value);
    }

    logout() {
        return this.http.get(this.url+'/user/logout');
    }

    getUserDetails(email: string) {
        return this.http.get(this.url+'/user/'+email+'/getuserdetails');
    }
}