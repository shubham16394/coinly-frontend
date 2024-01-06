import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormGroup } from '@angular/forms';
import { environment } from 'src/environments/environment';

@Injectable()
export class LoginService {
  url = environment.serverURL;
  constructor(private http: HttpClient) {}

  login(form: FormGroup) {
    return this.http.post(this.url + '/user/login', form.value);
  }

  logout() {
    return this.http.get(this.url + '/user/logout');
  }

  getUserDetails(email: string) {
    return this.http.get(this.url + '/user/' + email + '/getuserdetails');
  }

  setUserInLocalStorage(data: any) {
    localStorage.setItem('email', data?.email);
    localStorage.setItem('firstName', data?.firstName);
    localStorage.setItem('lastName', data?.lastName);
  }

  getUserFromLocalStorage() {
    return {
      email: localStorage.getItem('email'),
      firstName: localStorage.getItem('firstName'),
      lastName: localStorage.getItem('lastName'),
    };
  }

  unsetUserInLocalStorage() {
    localStorage.removeItem('email');
    localStorage.removeItem('firstName');
    localStorage.removeItem('lastName');
  }

  isLoggedIn() {
    if(this.getUserFromLocalStorage()?.email){
        return true;
    }
    return false;
  }
}
