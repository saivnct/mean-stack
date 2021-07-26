import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Subject } from "rxjs";
import { AuthData } from "./auth-data.model";

import { environment } from "../../environments/environment";

const BACKEND_URL = environment.apiUrl + "/user";

@Injectable({providedIn: "root"})
export class AuthService {
  private userId: string;
  private jwtToken: string;
  private isAuthenticated = false;
  private authStatusListener = new Subject<boolean>();

  private tokenTimer: any;

  constructor(private http:HttpClient, private router: Router){}

  createUser(email: string, password: string){
    const authData: AuthData = {
      email: email,
      password: password
    }
    return this.http.post(BACKEND_URL+"/signup", authData)
      .subscribe(response => {
        console.log(response);
        this.router.navigate(['/']);
      }, error => {
        this.authStatusListener.next(false);
      });
  }

  login(email: string, password: string){
    const authData: AuthData = {
      email: email,
      password: password
    }
    this.http.post<{
      message: string,
      token: string,
      expiresIn: number,
      userId: string
    }>(BACKEND_URL+"/login", authData)
      .subscribe(response => {
        console.log(response);
        this.jwtToken = response.token;

        if (this.jwtToken){
          this.userId = response.userId;

          const expiresInDuration = response.expiresIn;
          this.startAuthTimer(expiresInDuration);

          this.isAuthenticated = true;
          this.authStatusListener.next(true);

          const now = new Date();
          const expirationDate = new Date(now.getTime() + expiresInDuration * 1000);
          this.saveAuthData(this.userId, this.jwtToken, expirationDate);
          console.log("expirationDate",expirationDate);

          this.router.navigate(['/']);
        }

      }, error => {
        this.authStatusListener.next(false);
      })
  }

  getUsrId(){
    return this.userId;
  }

  getJWTToken(){
    return this.jwtToken;
  }

  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }

  getIsAuthenticated(){
    return this.isAuthenticated;
  }

  logOut(){
    this.isAuthenticated = false;
    this.jwtToken = null;
    this.userId = null;
    this.authStatusListener.next(false);
    clearTimeout(this.tokenTimer);
    this.clearAuthData();
    this.router.navigate(['/']);
  }

  autoAuthUser(){
    const authoInfo  = this.getAuthData();
    // console.log(authoInfo);
    if (!authoInfo) {return;}


    const now = new Date();
    const expiresIn = authoInfo.expirationDate.getTime() - now.getTime();
    if (expiresIn > 0){
      this.userId = authoInfo.userId;
      this.jwtToken = authoInfo.token;
      this.isAuthenticated = true;

      this.startAuthTimer(expiresIn/1000);

      this.authStatusListener.next(true);
    }
  }

  private startAuthTimer(duration: number){
    console.log("auth service - startAuthTimer:",duration);
    if (this.tokenTimer){
      console.log("auth service - clearTimeout");
      clearTimeout(this.tokenTimer);
    }

    this.tokenTimer = setTimeout(() => {
      console.log("auth service - on setTimeout");
      this.logOut();
    }, duration * 1000);  //milisecond
  }

  private saveAuthData(userId:string, token: string, expirationDate: Date){
    console.log("auth service - saveAuthData");

    localStorage.setItem("userId",userId);
    localStorage.setItem("token",token);
    localStorage.setItem("expirationDate",expirationDate.toISOString());
  }

  private clearAuthData(){
    console.log("auth service - clearAuthData");

    localStorage.removeItem("userId");
    localStorage.removeItem("token");
    localStorage.removeItem("expirationDate");
  }

  private getAuthData(){
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");
    const expirationDate = localStorage.getItem("expirationDate");
    if (!token || !expirationDate){
      return;
    }

    return {
      userId: userId,
      token: token,
      expirationDate: new Date(expirationDate)
    }
  }

}
