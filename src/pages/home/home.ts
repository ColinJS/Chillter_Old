import { Component } from '@angular/core';
import { NavController,ModalController,Events } from 'ionic-angular';
import { Vibration,Keyboard } from 'ionic-native';

import { HttpProvider } from '../../providers/http-provider/http-provider';

import {ChillList} from '../chill-list/chill-list';
import {EditChills} from '../edit-chills/edit-chills';
import { Push, PushToken } from '@ionic/cloud-angular';

@Component({
    selector:"home",
    templateUrl: 'home.html',
})
export class Home {
  
  isTapping: boolean = false;

  token: any = localStorage.getItem("_token");
  id: any = localStorage.getItem("_id");
  
  deleting: boolean =false;
  slides: any[] =[];
  idList: any[] =[];
  deleteMode: boolean = false; 
  
  constructor( public push: Push,public notif: Events,public http: HttpProvider,public nav: NavController,public modal: ModalController) {
    
      //test this information and pop the log if doesn't exist
      if(this.token==null){
          this.notif.publish("nav:login");
      }else{
          this.getHome()
      }
    
  }

  registerPush(){

        this.push.register().then((t: PushToken) => {
            this.http.post("/chillers/"+this.id+"/notification/token",{"sender_id":t},[]).subscribe(
                (data)=>{
                    console.log(data);
                },
                (err)=>{

                },
                ()=>{}
            );
            return this.push.saveToken(t);
        }).then((t: PushToken) => {
            console.log('Token saved:', t.token);
        });

        this.push.rx.notification()
        .subscribe((msg) => {
            this.notif.publish("notif:update");
        });
        
  }
  //take the home chills (logo of event) from the dataBase
  getHome(){
      //re-store the local token
      this.token = localStorage.getItem("_token");
      this.id = localStorage.getItem("_id");
      
      //re-test the token... in case of server token change between connexion
      if(this.token==null){
          this.notif.publish("nav:login");
      }
      
      //send the request to the server DataBase 
        this.http.content("application/json")
        this.http.token(this.token)
        
        this.http.get("/chillers/"+this.id+"/home",[]).subscribe(
            data => {
                console.log(data);
                if(data){
                    this.changeSlides(data)
                }
                this.notif.publish("notif:update");
                this.registerPush()
            },
            res => {
                console.log(res.status)
                if(res.status != 200){
                    this.logout();
                }
            },
            () => this.http.logError("nothing")
        )
      
  }
  
  //update the "sliders" list with the data that server return
  changeSlides(home: any){

      //the constent "Add" logo 
      let chillPlus = {
          "info":{
              "logo":"plus",
              "name":"plus"
          },
          "link":{
              "plus":true
          }
      }
      
      //little piece of code that group the logos by 12 in "sliders"
      //(12 by page)
      /*
      sliders = [
          [logo,logo...*12],
          ...
      ]
      */
      
      let pageCount = 0;
      let chillCount = 0;
      let sortHome = [chillPlus];
      
      this.slides = [[]];
      this.idList = [];
   
      for(let h in home){
          sortHome[parseInt(home[h].pos)] = home[h];
          this.idList.push(home[h].link.chills);
      }
      
      for(let i = 0; i < sortHome.length; i++){
          
          if(chillCount >11){
              chillCount = 0;
              pageCount++;
              this.slides[pageCount] = [];
          }
          
          this.slides[pageCount][chillCount] = sortHome[i];
          chillCount++
      }
      
  }
  
  //add a chill to the sliders list and to the server
  addChill(chill: any){
      
      //little piece of code to add logo to the two dimensionnal array sliders
      
      let lgt = this.slides.length
      let inLgt = this.slides[lgt-1].length
      
      if(inLgt > 12){
          lgt++;
          inLgt = 1;
          this.slides.push([chill]);
      }else{
          inLgt++;
          this.slides[lgt-1].push(chill);
      }
      
      //send of request to the server to add the chill
      this.http.content("application/json");
      this.http.token(this.token);
      
      let body={
          "insert":[
              {
                  "chillid":chill.info.id,
                  "type":"chill",
                  "pos":(((lgt-1)*12)+(inLgt-1))
              }
          ]
      }
      
      this.http.put("/chillers/"+this.id+"/home",body,[]).subscribe(
          data => {
              if(data){
                  console.log(data);
              }
          },
          err => this.http.logError(err),
          ()=>{
              //reset the "sliders" with real data to make sure there's no difference between localStorage and server
              this.getHome();
          }
      )
      
      
  }
  
  //delete a chill from the list and update the server
  deleteChill(chill: any){
      
      if(this.deleting){return}
      this.deleting = true
      // again little piece of code to delete the chill from the two-dimensionnal array sliders
      
      let moveArray = [];
      let tmpMoved = [];
      
      for(let i = 0 ; i < this.slides.length ; i++){
          
          for(let j=0; j < this.slides[i].length; j++){
              if(this.slides[i][j])
              {
                  
                let tmpChill = this.slides[i][j]
                
                if(parseInt(tmpChill.pos) < parseInt(chill.pos)){
                    tmpMoved.push(tmpChill)
                }else if(parseInt(tmpChill.pos) == parseInt(chill.pos)){
                    
                }else if(parseInt(tmpChill.pos) > parseInt(chill.pos)){
                    tmpChill.pos = (parseInt(tmpChill.pos)-1)
                    tmpMoved.push(tmpChill)
                    moveArray.push({
                        "type":tmpChill.info.type,
                        "chillid":tmpChill.info.id,
                        "pos":(parseInt(tmpChill.pos))
                    });
                }
              }
          }
      }
      
      //update the sliders array without waiting for the server response
      //this.changeSlides(tmpMoved)
      
      //send it to the server
      //body request
      let body={
          "delete":[
              {
                  "type":chill.info.type,
                  "chillid":chill.info.id
              }
          ],
          "move":moveArray
      }
      
      //request headers
      this.http.content("application/json");
      this.http.token(this.token);
      
      //request
      this.http.put("/chillers/"+this.id+"/home",body,[]).subscribe(
          data => {
              if(data){
                  console.log(data);
                  
              }
              this.deleting = false;
          },
          err => {
              this.http.logError(err)
              this.deleting = false;
          },
          ()=>{
              //reset the "sliders" with real data to make sure there's no difference between localStorage and server
              this.getHome();
          }
      )

      this.deleteMode = false;
  }
  
  //little function that redirects to function "deleteChill" if "clicker" is normal chill
  // and to "showList"" if it's the "Add" chill
  //on "click"
  tapDistrib(clicker: any){
      this.isTapping = true;
      if(clicker.link.plus){
          this.deleteMode = false;
          this.showList();
      }else{
          if(this.deleteMode){
            this.deleteChill(clicker);
            this.deleteMode = false;
        }else{
            this.showEditChills(clicker);
        }
      }

  }
  
  pressDistrib(clicker: any){
      if(this.isTapping){return false}
      if(clicker.link.plus){
          this.deleteMode = false;
          return;
      }else{
          Vibration.vibrate(100);
          this.deleteMode = !this.deleteMode;
      }
  }
  
  showEditChills(chill: any){
      let modal = this.modal.create(EditChills,{chill:chill});
      modal.onDidDismiss(()=>{
          Keyboard.close()
          this.isTapping = false
      });
      modal.present()
  }
  
  //Push Pop-Up modal: "ChillList" => List of all chills on the server
  showList(){
      
      let listmodal = this.modal.create(ChillList,{idList:this.idList});
      
      listmodal.onDidDismiss((data) =>{
          
          if(data){
              console.log("ok")
              this.addChill(data); 
          }
          this.isTapping = false
      });
      
      listmodal.present();
  }
  
  logout(){
      
      console.log("LogOut ...")
     
      localStorage.removeItem("_token")
      localStorage.removeItem("_id")
      this.notif.publish("nav:login");
  }
  
}
