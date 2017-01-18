import { Component } from '@angular/core';
import { NavController, Events } from 'ionic-angular';
import { HttpProvider } from '../../providers/http-provider/http-provider';
import {Home} from '../home/home';
import {LogIn} from '../login/login';
import {FriendList} from '../friend-list/friend-list';
import {ChillBox} from '../chill-box/chill-box';
import {ChillSet} from '../chill-set/chill-set';


/*
  Generated class for the TabsPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  templateUrl: 'tabs.html',
})
export class TabsPage {

  tab1Root: any = Home;
  tab2Root: any = ChillBox;
  tab3Root: any = FriendList;
  tab4Root: any = ChillSet;
    
  eventBadge: number = null;
  friendBadge: number = null;
  timer: any;
  
  constructor(public navCtrl: NavController,public http: HttpProvider,public notif: Events) {
    //this.getNotification()
    //this.autoNotif()
  }
  
  ionViewLoaded(){
    this.getNotification();
    setInterval(
      ()=>{
        this.getNotification();
      },60000);
      this.notif.subscribe("notif:update",()=>{
        this.getNotification();
      });
      this.notif.subscribe("nav:login",()=>{
        this.backToLogin();
      })
  }
  
  autoNotif(){
    this.getNotification()
    this.timer = setTimeout(this.autoNotif(),600000);
  }
  
  getNotification(){
    //re-store the local token
      let token = localStorage.getItem("_token");
      let id = localStorage.getItem("_id");
      
      //send the request to the server DataBase 
      this.http.content("application/json")
      this.http.token(token)
      
      this.http.get("/chillers/"+id+"/notif",[]).subscribe(
          data => {
              console.log(data);
              if(data){
                if(data.events>0){
                  this.eventBadge = data.events;
                  this.notif.publish("notif:events");
                }else{
                  this.eventBadge = null;
                }
                
                if(data.friends>0){
                  this.friendBadge = data.friends;
                  this.notif.publish("notif:friends");
                }else{
                  this.friendBadge = null;
                }
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
  
  backToLogin(){
    this.navCtrl.popToRoot();
    this.navCtrl.setRoot(LogIn);
  }

}
