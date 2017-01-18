import { Component } from '@angular/core';
import { NavController,App,ViewController,NavParams,ModalController,ToastController } from 'ionic-angular';
import {ImgLoader} from '../../components/img-loader/img-loader';
import { HttpProvider } from '../../providers/http-provider/http-provider';
import { DatePicker } from 'ionic-native';
import {ViewChildren,ViewChild} from '@angular/core';
import {AskFriends} from '../ask-friends/ask-friends';
import {ChillUtils} from "../chill-utils/chill-utils";

/*
  Generated class for the EditChillsPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  templateUrl: 'edit-chills.html', 
})
export class EditChills{

    sendPos: string="translateX(-100%)";
    backPos: string="translateX(100%)";
    sendVal: number=-100;
    backVal: number=100;
    sendOpa: string="0.0";
    backOpa: string="0.0";
    
    swiping: boolean=false;
    
    creator: any;
    
    logo: string ="";
    banner: string ="";
    
    cars: number=0;
    elements: any = [];
    expenses: any = [];
    parentChill:any;
    
    @ViewChild("leftPan") leftPan:any;
    @ViewChild("rightPan") rightPan:any;
    
    @ViewChildren(ImgLoader) imgPicker: any; //_results[0] => background; _results[1] => logo
    
    name: string = "";
    geo: string = "";
    geoSpec: string="";
    
    day: string = "";
    hours: string = "";
    min: string = "";
    soon: string = "";
    
    eventDate: Date = new Date();
    soonDate: Date = new Date();
    
    comment: string = "";
    firstName: string = "";
    lastName: string = "";
    
    friends: any = [];
    utils: any={"cars":[],"list":[]};

    swipeToastDone: boolean=false;

  constructor(public toastCtrl: ToastController, public mod: ModalController, public navCtrl: NavController,public viewCtrl: ViewController, public navParams: NavParams,public http: HttpProvider,public app: App) {
      
    this.formatDate()
    
    this.getChill();
    this.getChillerInfo();
    
  }

  formatDate(){
      
    let dayName = ["Sunday","Monday","Thuesday","Wednesday","Thursday","Friday","Saturday"];
    
    this.soonDate = new Date(this.eventDate.getTime())
    
    this.day = dayName[this.eventDate.getDay()]+" "+(this.eventDate.getDate()).toString();
    this.hours=(this.eventDate.getHours()).toString();
    if(this.hours.length == 1){
        this.hours = "0"+this.hours
      }
    this.min = (this.eventDate.getMinutes()).toString();
    if(this.min.length == 1){
        this.min = "0"+this.min
     }
  }
  
  getChill(){
      
      let tmpId = this.navParams.get("chill").link.chills
      
      this.http.content("application/json");
      
      this.http.get("/chills/"+tmpId,[]).subscribe(
          (data) => {
              if(data){
                  this.parentChill = data;
                  this.name = data.name;
                  this.logo = ("http://www.chillter.com/api/images/chill-"+data.logo+".svg");
                  this.banner = ("images/banner-"+data.category+".jpg");
              }
          },
          err => this.http.logError(err)
      )
      
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
                  this.creator = data;
                  this.firstName = data.firstname
                  this.lastName = data.lastname
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
  
  deleteFriend(id: any){
      this.friends = this.friends.filter((v)=>{
          if(v.id!=id){
              return true;
          }else{
              return false;
          }
      });
  }
  
  sendInvitation(){
      console.log("ok");
      
      this.animateTo("send",0)
      
      let token = localStorage.getItem("_token");
      let id = localStorage.getItem("_id");
      
      let chillersId:any = []
      
      for(let f of this.friends){
          chillersId.push(f.id);
      }
      
      console.log(chillersId);
      
      let body = {
          event:{
              category:this.parentChill.category,
              logo:this.parentChill.logo,
              name:this.name,
              color:this.parentChill.color,
              banner:this.parentChill.banner,
              chillerId:id,
              place:this.geo,
              address:this.geoSpec,
              date:("@"+ (Math.round((this.eventDate.getTime())/1000)).toString()),
              comment:this.comment,
              status:1,
          },
          chillers:chillersId
      }
      
      if(this.cars > 0){
          body["cars"] = this.cars
      }
      if(this.elements.length > 0){
          body["elements"] = this.elements
      }
      if(this.expenses > 0){
          body["expenses"] = this.expenses
      }
      
      console.log("send request");
      console.log(body);
      
      this.http.post("/chillers/"+id+"/events",body,[]).subscribe(
          data => {
              console.log(data);
              this.sendChillPict(data);
          },
          res => {
              console.log(res.status)
              if(res.status != 200){
                  console.log("fuck");
              }
          }
      )
      
  }
  
  sendChillPict(cId){
    let token = localStorage.getItem("_token");
    let id = localStorage.getItem("_id");
    let loader = this.imgPicker._results[1]
    if(loader){
        
        let setting = {"name":"crop","value":JSON.stringify(loader.getCropInfo())};
        let chillType = {"name":"chill","value":this.parentChill.logo};
        
        this.http.sendPicture("/chillers/"+id+"/events/"+cId+"/chillpicts",loader.file,token,[chillType,setting]).then(
        data =>{
            console.log(data);
            console.log("Picture was send ...");
            this.sendBanner(cId);
        },
        (err)=>{
            console.log(err);
            this.sendBanner(cId);
        });
    }
  }
  
  sendBanner(cId){
    let token = localStorage.getItem("_token");
    let id = localStorage.getItem("_id");
    let loader = this.imgPicker._results[0]
    if(loader){
        
        let setting = {"name":"crop","value":JSON.stringify(loader.getCropInfo())};
        let chillType = {"name":"cat","value":this.parentChill.category};
        
        this.http.sendPicture("/chillers/"+id+"/events/"+cId+"/banners",loader.file,token,[chillType,setting]).then(
        data =>{
            console.log(data);
            console.log("Picture was send ...");
            this.close(false);
        },
        (err)=>{
            console.log(err);
            this.close(false);
        });
    }
  }
  
  swipeEvent(evt: any): void{
      
      this.swiping = true;
      console.log(evt);
      if(evt.deltaX > 25){
          this.sendInvitation()
      }else if(evt.deltaX < -25){
          this.close()
      }
  }
  
  test(){
      console.log("backOpa =>"+this.backOpa);
      console.log("sendOpa =>"+this.sendOpa);
      console.log("sendVal =>"+this.sendVal);
      console.log("backVal =>"+this.backVal);
  }
  
  panEvent(evt: any){
      
      let offset = 3
      
      if(evt.additionalEvent == "panright" && this.backVal == 100){
          this.sendVal += offset ;
          this.sendVal = (this.sendVal > 0) ? 0 : this.sendVal;
      }else if(evt.additionalEvent == "panleft" && this.sendVal == -100){
          this.backVal -= offset ;
          this.backVal = (this.backVal < 0) ? 0 : this.backVal;
      }else if(evt.additionalEvent == "panright"){
          this.backVal += offset ;
          this.backVal = (this.backVal > 100) ? 100 : this.backVal
      }else if(evt.additionalEvent == "panleft"){
          this.sendVal -= offset ;
          this.sendVal = (this.sendVal < -100) ? -100 : this.sendVal
      }
      
      if(evt.isFinal && this.sendVal < -30 && this.sendVal != -100){
          if(!this.swiping){this.animateTo("send",-100)}
      }else if(evt.isFinal && this.sendVal >= -30 && this.sendVal != -100){
          this.sendInvitation()
      }
      
      if(evt.isFinal && this.backVal > 30 && this.backVal != 100){
          if(!this.swiping){this.animateTo("back",100)}
      }else if(evt.isFinal && this.backVal <= 30 && this.backVal != 100){
          this.close()
      }
      
      
      this.sendOpa = (100+this.sendVal)/100+""
      this.backOpa = (100-this.backVal)/100+""
      this.sendPos = "translateX("+this.sendVal+"%)";
      this.backPos = "translateX("+this.backVal+"%)";

  }
  
  animateTo(obj: any,val: number){
      
      
      let baseVal = (obj=="send")?this.sendVal:this.backVal;
      
      let delta = Math.abs(baseVal) - Math.abs(val);
      let timing = 600 * (delta/100)
      let num = Math.abs(Math.round(timing/delta))
      let dist = delta / num
      let i=0
      
      console.log("between : "+this.sendVal+" and "+val)
      console.log("every : "+num)
      console.log("for each : "+dist)
      
      let myInterval = setInterval(()=>{
          i++
          if(obj=="send"){
            this.sendVal += Math.round(dist);
            this.sendOpa = (100+this.sendVal)/100+""
            this.sendPos = "translateX("+this.sendVal+"%)";
          }else{
            this.backVal -= Math.round(dist);
            this.backOpa = (100-this.backVal)/100+""
            this.backPos = "translateX("+this.backVal+"%)";
          }
          if(i>=num){
              if(obj=="send"){
                 this.sendVal = val;
                 this.sendOpa = (100+this.sendVal)/100+""
                 this.sendPos = "translateX("+this.sendVal+"%)"; 
              }else{
                 this.backVal = val;
                 this.backOpa = (100-this.backVal)/100+""
                 this.backPos = "translateX("+this.backVal+"%)"; 
              }
              
              clearInterval(myInterval)
          }
      },num)
      
      console.log("end");
  }
  
  showUtils(init: number){
      
      let modal = this.mod.create(ChillUtils,{"init":init,"utils":this.utils,"creator":this.creator,"newMode":true});
      
      modal.onDidDismiss((back)=>{
          this.utils = back;
          if(back.cars.length > 0){
              this.cars = back.cars[0].seats
          }
          
          if(back.list.length > 0){
              this.elements = []
              for(let e of back.list){
                  this.elements.push(e.content);
              }
          }
      })
      
      modal.present()
  }
  
  showFriends(){
      
      let modal = this.mod.create(AskFriends,{"friendsList":this.friends})
      
      modal.onDidDismiss((data)=>{
         if(data){
         this.friends.push(data);
         if(this.name != "" && this.geo != "" && !this.swipeToastDone){
             this.presentSwipeToast();
             this.swipeToastDone = false;
         }
        }
     });
      
      modal.present();
  }
  
  
  showDatePicker(){
     
    DatePicker.show({
        date: this.eventDate,
        mode: 'datetime',
        okText:"OK",
        cancelText:"Cancel"
    }).then(
        date =>{ 
            this.eventDate = date;
            this.formatDate();
        },
        err => console.log("Error occurred while getting date:", err)
    );
     
  }

  presentSwipeToast() {
  let toast = this.toastCtrl.create({
    message: 'Swipe to send your Chill',
    duration: 3000,
    position: 'top'
  });

  toast.present();
}
  
  
  close(anim: boolean=true){
      
    if(anim){
        this.animateTo("back",0);
    }
    setTimeout(()=>{
        this.viewCtrl.dismiss();
    }, 400);
    
    
  }

  
}
