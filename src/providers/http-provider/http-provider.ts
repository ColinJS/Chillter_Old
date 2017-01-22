import { Injectable } from '@angular/core';
import { Http,Headers } from '@angular/http';
import { Transfer } from 'ionic-native';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';

/*
  Generated class for the HttpProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/

@Injectable()
export class HttpProvider {

  api: string = "http://www.chillter.com/api/v0.1";
    header: Headers = new Headers()

  constructor(public http: Http) {
    this.header.append("Content-Type","application/json");
    this.header.append("X-Token","");
    
  }
  
  //change le content type
  content(cont: string){
    this.header.set("Content-Type",cont);
  }
  
  //change token
  token(tok: string){
      this.header.set("X-Token",tok);
  }

  //transform parameters list in string for the url
  resolveParam(paramList: any){
    let paramString = "";
    
    for(let i=0;i < paramList.length;i++){
      let comma = "";
      if(i==0){
        comma = "?";
      }else{
        comma = "&";
      }
      paramString += comma+paramList[i].name+"="+paramList[i].value;
    }
    
    return paramString;
    
  }
  
  //post request
  post(url: string,body: any,paramList: any){
    let paramString = this.resolveParam(paramList);
    return this.http.post(this.api+url+paramString,JSON.stringify(body),{headers: this.header}).map(res => res.json());
  }
  //get request
  get(url:string,paramList: any){
    let paramString = this.resolveParam(paramList);
    return this.http.get(this.api+url+paramString,{headers: this.header}).map(res => res.json());
  }
  //put request
  put(url: string,body: any,paramList: any){
    let paramString = this.resolveParam(paramList);
    return this.http.put(this.api+url+paramString,JSON.stringify(body),{headers: this.header}).map(res => res.json());
  }
  //delete request
  delete(url:string, paramList:any){
    let paramString = this.resolveParam(paramList);
    return this.http.delete(this.api+url+paramString,{headers: this.header}).map(res => res.json());
    }
    
  sendPicture(url:string ,file: any,token:any ,params: any) {
      
        console.log("File to send: "+file);

        let fileExtension = file.substr(file.lastIndexOf('.')+1);
        let firstDirectory = file.substr(0,file.indexOf('/'));

        console.log("Extension => "+fileExtension+" , Directory => "+firstDirectory);

        file = fileExtension == "svg" || firstDirectory == "images" ? "" : file ;

        
        if(file == ""){
          return this.post(url,{},params).toPromise();
        }else{
          let ft = new Transfer();
          let paramString = this.resolveParam(params);
          
          let options = {
              fileKey:"photo",
              headers: {'X-Token':token},
              chunkedMode:false,
              multipartMode:true
          };
          
          let uri = encodeURI(this.api+url+paramString);

          return ft.upload(file,uri,options, false);
        }
    }

  logError(err){
    console.log(err);
    return err;
  }
}

