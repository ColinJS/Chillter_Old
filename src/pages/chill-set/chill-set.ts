import { Component,ViewChild } from '@angular/core';
import { NavController,App,Events, AlertController, ToastController } from 'ionic-angular';
import { HttpProvider } from '../../providers/http-provider/http-provider';
import { ImgLoader } from '../../components/img-loader/img-loader';

/*
  Generated class for the ChillSetPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  templateUrl: 'chill-set.html',
})
export class ChillSet {
  
  activeChange: boolean = true;
  
  @ViewChild(ImgLoader) loader: any;
  
  picture: string = "";
  pictChange: boolean = false;
  
  firstname: string = "";
  lastname: string = "";
  phoneIni: string = "";
  phone: string = "";
  emailIni:string = "";
  email: string = "";
  
  haveChange: boolean = false;
  
  constructor(public toastCtrl: ToastController,public alertCtrl: AlertController,public notif:Events, public http: HttpProvider,public nav: NavController,public app: App) {
      
      this.getChillerInfo();
      
  }
  
  change(){
      
        if(this.phone){
            if(this.phone != this.phoneIni){
                this.haveChange = true
            }
        }
        if(this.email){
            if(this.email != this.emailIni){
                this.haveChange = true
            }
        }
    }
  
  getChillerInfo(){
      
      //re-store the local token
      let token = localStorage.getItem("_token");
      let id = localStorage.getItem("_id");
      
      //send the request to the server DataBase 
      this.http.content("application/json")
      this.http.token(token)
      
      this.http.get("/chillers/"+id,[]).subscribe(
          data => {
              console.log(data);
              if(data){
                  this.firstname = data.firstname
                  this.lastname = data.lastname
                  this.phoneIni = data.phone
                  this.phone = data.phone
                  this.emailIni = data.email
                  this.email = data.email
                  this.picture = data.picture
              }
          },
          res => {
              console.log(res.status)
              if(res.status != 200){
                  console.log("fuck");
              }
          }
      )
      
  }
  
  sendPicture(){
      
    let token = localStorage.getItem("_token");
    let id = localStorage.getItem("_id");
    
    if(this.loader){
        let params = {"name":"crop","value":JSON.stringify(this.loader.getCropInfo())};
        this.http.sendPicture("/chillers/"+id+"/photos",this.loader.file,token,[params])
        .then(
          (data: any) =>{
          this.picture = data.url;
          this.pictChange = false;
          console.log("Picture was send ...");
        },(data)=>{
          this.picture = data.url;
          this.pictChange = false;
        }).catch((error: any) => {
            this.pictChange = false;
        }); 
    }
  }
  
  cancelPicture(){
    this.loader.drawPreview(this.picture);
    setTimeout(()=>{
      this.pictChange = false;
    },1);
  }
  
  changeInfo(){
      
      let body:any = {"info":{}};
      if(this.phone && this.phone != ""){
          body.info.phone = this.phone;
      }
      if(this.email && this.email != ""){
          body.info.email = this.email;
      }
      
      this.phoneIni = this.phone;
      this.emailIni = this.email;
      
      console.log(body);
      
      //re-store the local token
      let token = localStorage.getItem("_token");
      let id = localStorage.getItem("_id");
      
      //send the request to the server DataBase 
      this.http.content("application/json")
      this.http.token(token)
      
      this.http.put("/chillers/"+id,body,[]).subscribe(
          data => {
          },
          res => {
              console.log(res.status)
              if(res.status != 200){
                  console.log("fuck");
              }
          }
      )
      this.haveChange = false;
      
  }
  
  cancelInfo(){
      this.phone = this.phoneIni;
      this.email = this.emailIni;
      this.haveChange = false;
  }
  
  sendPasswordRequest(oldPass: string,newPass: string){
      
      let body:any = {"info":{}};
      body.info.oldPassword = oldPass;
      body.info.newPassword = newPass;
      
      console.log(body);
      
      //re-store the local token
      let token = localStorage.getItem("_token");
      let id = localStorage.getItem("_id");
      
      //send the request to the server DataBase 
      this.http.content("application/json")
      this.http.token(token)
      
      this.http.put("/chillers/passwords/"+id,body,[]).subscribe(
          data => {
              console.log(data)
              if(data === false){
                  this.passwordError()
              }
          },
          res => {
              console.log(res.status)
              if(res.status != 200){
                  this.passwordError()
                  console.log("fuck");
              }
          }
      )
  }
  
  changePassword(){
      let prompt = this.alertCtrl.create({
      title: 'Change password',
      inputs: [
        {
          name: 'oldPass',
          placeholder: 'Old password',
          type: 'password'
        },
        {
          name: 'newPass',
          placeholder: 'New password',
          type: 'password'
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Save',
          handler: data => {
            console.log('Saved clicked');
            this.sendPasswordRequest(data.oldPass,data.newPass)
          }
        }
      ]
    });
    prompt.present();
  }
  
  passwordError() {
    let toast = this.toastCtrl.create({
      message: 'Impossible to change password ...',
      duration: 1500,
      position: "top",
      cssClass: "toast-alert",
      dismissOnPageChange: true
    });
    toast.present();
  }
  
  loadChange(evt){
    this.pictChange = true;
    console.log(evt.value);
  }
  
  logout(){
      
      console.log("LogOut ...")
      
      localStorage.removeItem("_token")
      localStorage.removeItem("_id")
      this.notif.publish("nav:login");
  }
}