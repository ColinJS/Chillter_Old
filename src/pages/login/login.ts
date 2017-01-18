import { Component } from '@angular/core';
import { NavController,ViewController } from 'ionic-angular';

import {HttpProvider} from '../../providers/http-provider/http-provider';
import {TabsPage} from '../tabs/tabs';
import {SignIn} from '../signin/signin';
/*
  Generated class for the LoginPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'login',
  templateUrl: 'login.html',
})

export class LogIn {

  email: string;
  password: string;
  authAlert: boolean=false;

  constructor(public http: HttpProvider, public viewCtrl: ViewController,public nav: NavController) {

  }

  logIn(){
    
    // set up the header
    this.http.content("application/json");
    
    // url's parameters connexion
    let options = [{"name":"email","value":this.email},{"name":"pass","value":this.password}]
    
    // Request
    this.http.get('/chillers/auth',options).subscribe(
      data => {
        if(data){
          if(data.statut){
            localStorage.setItem("_token",data.info.token);
            localStorage.setItem("_id",data.info.id)
            this.close()
          }else{
            this.authAlert = true;
            setTimeout(()=>{
              this.authAlert = false;
            },3000);
          }
        }
      },
      err => this.http.logError(err)
    );
  }

  //Push SignIn page
  showSignUp(){
    this.nav.push(SignIn)
  }

  // Check for rootNav property
  close(){
    this.nav.setRoot(TabsPage)
  }

}
