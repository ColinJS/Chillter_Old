import { Component } from '@angular/core';
import { NavController, NavParams, ViewController, ModalController } from 'ionic-angular';
import { ChillUtils } from "../chill-utils/chill-utils";
import { ChillerDetails } from "../chiller-details/chiller-details";
import { AskFriends } from '../ask-friends/ask-friends';
import { HttpProvider } from '../../providers/http-provider/http-provider';
/*
  Generated class for the ChillDetailPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  templateUrl: 'chill-detail.html',
})
export class ChillDetail{
  
    sendPos: string="translateX(-100%)";
    backPos: string="translateX(100%)";
    sendVal: number=-100;
    backVal: number=100;
    sendOpa: string="0.0";
    backOpa: string="0.0";

    swiping: boolean=false;

    mine: boolean = false;
    event: any;
    name: string;
    comment: string;
    
    logo: string;
    banner: string;
    
    eventDate: Date;
    soonDate: Date;
    
    day: string;
    hours: string;
    min: string;
    
    geo: string;
    geoSpec: string;
    
    firstName: string;
    lastName: string;
    friends: any[] = [];
    allFriends: any[] = [];
  
  constructor(public mod:ModalController, public nav: NavController,public viewCtrl: ViewController, public http: HttpProvider, public navParams: NavParams) {
    
    this.getEventDetail();
    
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
  
  getEventDetail(){
    
    //re-store the local token
      let token = localStorage.getItem("_token");
      let id = localStorage.getItem("_id");
      
      let eventId = this.navParams.get("eventId");
      
      //send the request to the server DataBase 
      this.http.content("application/json")
      this.http.token(token)
      
      this.http.get("/chillers/"+id+"/events/"+eventId,[]).subscribe(
          data => {
              console.log(data);
              if(data){
                  this.event=data;
                  this.name=data.name;
                  this.comment=data.comment;
                  this.allFriends = data.chillers;
                  this.logo = data.logo;
                  this.banner = data.banner;
                  this.geo = data.place
                  this.geoSpec = data.address
                  this.eventDate = new Date(data.date)
                  this.formatDate();
                  this.getNames();
                  if(data.chillerid == id){
                      this.mine = true
                  }else{
                      this.mine = false
                  }
              }else{
                  this.event=[];
              }
          },
          res => {
              console.log(res.status)
              if(res.status != 200){
              }
          }
      )
    
  }
  
  getNames(){
      this.friends = [];
      let id = localStorage.getItem("_id");
      let i=0
      for(let f of this.allFriends){
          if(f.id  == this.event.chillerid){
              this.firstName = f.firstname
              this.lastName = f.lastname
          }
          if(id != f.id){
             this.friends.push(f)
          }
          i++
      }
  }
  
  swipeEvent(evt){
      console.log(evt)
      if(evt.deltaX < -25){
          this.close()
      }
  }
  
  addFriends(friendId: string){
      //re-store the local token
      let token = localStorage.getItem("_token");
      let id = localStorage.getItem("_id");
      
      let eventId = this.navParams.get("eventId");
      
      //send the request to the server DataBase 
      this.http.content("application/json")
      this.http.token(token)
      
      this.http.post("/chillers/"+id+"/events/"+eventId+"/guest/"+friendId,{},[]).subscribe(
          data => {
              console.log(data);
          },
          res => {
              console.log(res.status)
              if(res.status != 200){
              }
          }
      )
  }
  
  deleteFriend(friendId: string){
      //re-store the local token
      let token = localStorage.getItem("_token");
      let id = localStorage.getItem("_id");
      
      let eventId = this.navParams.get("eventId");
      
      //send the request to the server DataBase 
      this.http.content("application/json")
      this.http.token(token)
      
      this.http.delete("/chillers/"+id+"/events/"+eventId+"/guest/"+friendId,[]).subscribe(
          data => {
              console.log(data);
          },
          res => {
              console.log(res.status)
              if(res.status != 200){
              }
          }
      )
      let ind
      for(let i=0;i<this.allFriends.length;i++){
          if(this.allFriends[i].id == friendId){
              ind = i
          }
      }
      this.allFriends.splice(ind,1);
      this.getNames()
  }
  
  showFriends(){
      
      let modal = this.mod.create(AskFriends,{"friendsList":this.friends})
      
      modal.onDidDismiss((data)=>{
         if(data){
         this.addFriends(data.id);
         this.allFriends.push(data);
         this.getNames()
        }
     });
      
      modal.present();
  }
  
  showChillerDetails(friendId: string){
      
        let modal = this.mod.create(ChillerDetails,{"friendId":friendId});
        
        modal.present()
  }
  
  
  
  showUtils(init: number){
      
      let eventId = this.navParams.get("eventId");
      
      let modal = this.mod.create(ChillUtils,{"init":init,"eventId":eventId,"friends":this.allFriends,"newMode":false});
      
      modal.present()
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
          this.close()
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

  close(){
      this.viewCtrl.dismiss();
  }
  
}
