import { Injectable, Pipe } from '@angular/core';

/*
  Generated class for the StatusImg pipe.

  See https://angular.io/docs/ts/latest/guide/pipes.html for more info on
  Angular 2 Pipes.
*/
@Pipe({
  name: 'statusImg'
})
@Injectable()
export class StatusImg {
  /*
    Takes a value and makes it lowercase.
   */
  transform(value: any="", args: any[]=[]) {

    value = value.toString()
    
    let imgPath: string = "";
    
    if(value == "0"){
      imgPath="images/status-no-thin.svg";
    }else if(value == "1"){
      imgPath="images/status-yes-thin.svg";
    }else if(value == "2"){
      imgPath="images/status-maybe-thin.svg";
    }else if(value == "3"){
      imgPath="images/status-wait.svg";
    }
    
    return imgPath;
  }
}
