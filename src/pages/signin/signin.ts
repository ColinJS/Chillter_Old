import { Component, ViewChild } from '@angular/core';
import { NavController, App } from 'ionic-angular';
import { HttpProvider } from '../../providers/http-provider/http-provider';
import { ImgLoader } from '../../components/img-loader/img-loader';
import { TabsPage } from '../tabs/tabs';

/*
  SignIn page:
  Simple Form sign-in page
*/

@Component({
    selector: "signin",
    templateUrl: 'signin.html'
})

export class SignIn {

  @ViewChild(ImgLoader) loader: any;
  
  firstname: string;
  lastname: string;
  sex: string = "0";
  password: string;
  phone: string;
  email: string;
  confirm: string;
  
  constructor(public http: HttpProvider, public app: App, public nav: NavController) {

  }
  
  //Sign-Up request to the server
  signUp(){
    
     //set-up the header
      this.http.header.set("Content-Type","application/json")
      
      //body request
      let body = {
          "info":{
              "firstname":this.firstname,
              "lastname":this.lastname,
              "sex":this.sex, // not yet in the form
              "phone":this.phone,
              "email":this.email,
              "language":"fr", // todo: automatic country detection
              "currency":"euro", // todo: automatic currencey detection
              "pass":this.password
          }
      }
      
      //request
      this.http.post("/chillers",body,[]).subscribe(
        data => {
            if(data){
                console.log(data);
                this.logIn()
            } 
        }
      );
    
  }
  
  logIn(){
      
      //header set-up
      this.http.header.set("Content-Type","application/json")
      
      //url's parameters
      let options = [{"name":"email","value":this.email},{"name":"pass","value":this.password}]
      
      //request
      this.http.get('/chillers/auth',options).subscribe(
          data => {
              if(data){
                  if(data.statut){
                      
                      console.log(data)
                      localStorage.setItem("_token",data.info.token);
                      localStorage.setItem("_id",data.info.id)
                      console.log(this.loader.file)
                      
                      if(this.loader){
                         let params = {"name":"crop","value":JSON.stringify(this.loader.getCropInfo())};
                         console.log(params);
                         this.http.sendPicture("/chillers/"+data.info.id+"/photos",this.loader.file,data.info.token,[params]).then(
                         data =>{
                             this.nav.setRoot(TabsPage);
                         });
                      }else{
                          this.nav.setRoot(TabsPage);
                      }
                      
                  }
              }
          },
          err => this.http.logError(err)
      )
  }
  
  
}
