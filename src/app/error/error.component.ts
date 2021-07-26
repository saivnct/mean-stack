import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material";

@Component({
  templateUrl: './error.component.html'
})
export class ErrorComponent{

  //@inject decorator allow inject with special TOKEN
  constructor(@Inject(MAT_DIALOG_DATA) public data: {message: string}){}

}
