import { HttpErrorResponse, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { Injectable } from '@angular/core';
import { MatDialog } from "@angular/material";
import { ErrorComponent } from "./error/error.component";


@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(private dialog: MatDialog){};

  intercept(req: HttpRequest<any>, next: HttpHandler){
    //next.handle(req) return a observable of respone stream, we use pipe provided by rxjs to add operator on that stream

    return next.handle(req).pipe(
      //catchError is operator that allow handle error of stream
      catchError((error: HttpErrorResponse) => {
        console.log(error);
        let message = "An unknown error occurred!";
        if (error.error.message){
          message = error.error.message;
        }
        this.dialog.open(ErrorComponent,{
          data: {message: message}
        });
        //we have to return an observable
        return throwError(error);
      })
    );
  }
}
