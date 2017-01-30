import { Component, ViewChild } from '@angular/core';
import { NavController, List, ModalController, AlertController, Events, ToastController } from 'ionic-angular';
import { HttpProvider } from '../../providers/http-provider/http-provider';
import { ChillDetail } from '../chill-detail/chill-detail';
import {Calendar} from 'ionic-native';
/*
  Generated class for the ChillBoxPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'chill-box',
  templateUrl: 'chill-box.html',
})
export class ChillBox {
  
  myId: string;
  
  events: any[] = [];
  viewEvents: any[] = [];
  searchWord: string="";
  
  filterSelected: any[] = [true,true,true,true];
  yesPath: string = "images/status-yes-thin.svg";
  maybePath: string = "images/status-maybe-thin.svg";
  noPath: string = "images/status-no-thin.svg";
  
  offset: number = (new Date()).getTimezoneOffset()*-60000
  
  @ViewChild(List) list: List
  
  constructor(public toastCtrl: ToastController, public notif: Events, public al: AlertController, public mod: ModalController, public nav: NavController, public http: HttpProvider) {
      this.getEvents();
      this.myId = localStorage.getItem("_id");
      this.notif.subscribe("notif:events",()=>{
            this.getEvents();
        })
  }
  
  ionViewDidEnter(){
      this.getEvents();
  }
  
  inputChange(evt){
      console.log("Filter word change ...")
      this.searchWord = evt.target.value;
      this.filterEvents();
  }
  
  filterEvents(){
      
      this.viewEvents = this.events;
    
      this.viewEvents = this.events.filter((v)=>{
      
      if(v.info.name.toLowerCase().indexOf(this.searchWord.toLowerCase()) > -1 || this.searchWord == ""){
        return this.filterSelected[parseInt(v.status)];
      }else{
        return false;
      }
      
    });
  }
  
  toggleFilter(ind: number){
    this.filterSelected[ind] = !this.filterSelected[ind];
    this.changeFilter()
    
  }
  
  activeFilter(ind: number){
    this.filterSelected = [false,false,false,true];
    this.filterSelected[ind] = true;
    this.changeFilter()
  }
  
  changeFilter(){
    if(this.filterSelected[0]){
      this.noPath = "images/status-no-thin.svg";
    }else{
      this.noPath = "images/filter-no.svg";
    }
    
    if(this.filterSelected[1]){
      this.yesPath = "images/status-yes-thin.svg";
    }else{
      this.yesPath = "images/filter-yes.svg";
    }
    
    if(this.filterSelected[2]){
      this.maybePath = "images/status-maybe-thin.svg";
    }else{
      this.maybePath = "images/filter-maybe.svg";
    }
    
    this.filterEvents();
  }
  
  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  participate(ind: number,eventId: any){
      let currentEvent
      this.events.forEach((evt)=>{
          if(evt.info.id == eventId){
            currentEvent = evt;
          }
      })

      let startDate = new Date(currentEvent.date);
      startDate = new Date(startDate.getTime());

      let title = this.capitalizeFirstLetter(currentEvent.info.name);
      let notes = this.capitalizeFirstLetter(currentEvent.info.chiller)+" invite you to a "+this.capitalizeFirstLetter(currentEvent.info.name);

      let calendarOptions = Calendar.getCalendarOptions()
      calendarOptions.firstReminderMinutes = 60

     //re-store the local token
      let token = localStorage.getItem("_token");
      let id = localStorage.getItem("_id");
      
      //send the request to the server DataBase 
      this.http.content("application/json")
      this.http.token(token)
    
      this.http.put("/chillers/"+id+"/events/"+eventId+"/participate",{"statut":ind},[]).subscribe(
        data => {
          if(data){
            for(let i=0;i<this.events.length;i++){
              if(this.events[i].info.id == eventId){
                this.events[i].status = ind;
              }
            }
            
            this.filterEvents();
          }
          this.list.closeSlidingItems();
        },
        res =>{
              console.log(res.status)
              if(res.status != 200){
                  console.log("fuck");
              }
          },
          ()=>{
            this.notif.publish("notif:update");
          }
      );

      console.log(title+": "+notes+" a "+startDate);
      if(ind == 0 || ind == 2){
          let tmpEvent = Calendar.findEvent(title,"",notes,startDate,startDate).then((data)=>{
            if(data.length > 0){
              Calendar.deleteEvent(title,"",notes,startDate,startDate).then((d)=>{
                this.showToast("The event was removed from your calendar");
                console.log("The event was removed from your calendar");
              });
            }
          })
      }else if(ind == 1){
          Calendar.createEventWithOptions(title,"",notes,startDate,startDate,calendarOptions).then((d)=>{
            this.showToast("The event was added to your calendar");
            console.log("The event was added to your calendar");
          });
      }

  }
  
  getEvents(ref: any=false){
    
     //re-store the local token
      let token = localStorage.getItem("_token");
      let id = localStorage.getItem("_id");
      
      //send the request to the server DataBase 
      this.http.content("application/json")
      this.http.token(token)
      
      this.http.get("/chillers/"+id+"/events",[]).subscribe(
          data => {
            
              console.log(data);
              if(data){
                  this.events=data.filter((d)=>{
                    let now = new Date();
                    let tmpDate = new Date(d.date);
                    
                    if(isNaN(tmpDate.getTime())){
                      return false;
                    }
                    let time = tmpDate.getTime() - now.getTime();
                    
                    if(time > 0){
                      return true;
                    }else{
                      return false;
                    }
                  });
                  
                  this.events.forEach((index)=>{
                    let now = new Date()
                    let nowPlusOne = new Date(now.getFullYear(),now.getMonth(),now.getDate(),24)
                    let d = new Date(index.date)

                    if(d<nowPlusOne){
                      index.soon = "today"
                    }else{
                      index.soon = "later"
                    }
                  })

                  console.log("event list: ")
                  console.log(this.events)
                  
                  this.filterEvents();
                  
              }else{
                  this.events=[];
              }
              if(ref){
                ref.complete();
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
  
  deleteEvent(eventId: string){
      
      //re-store the local token
      let token = localStorage.getItem("_token");
      let id = localStorage.getItem("_id");
      
      //send the request to the server DataBase 
      this.http.content("application/json")
      this.http.token(token)
    
      this.http.delete("/chillers/"+id+"/events/"+eventId,[]).subscribe(
        data => {
          console.log(data);
        },
        res =>{
              console.log(res.status)
              if(res.status != 200){
                  console.log("fuck");
              }
          }
      );
      
      this.getEvents();
      this.notif.publish("notif:update");
  }
  
  doRefresh(refresher){
    this.getEvents(refresher);
  }

  showToast(message: string){
    let toast = this.toastCtrl.create({
      message: message,
      duration: 3000,
      position: 'top'
    });

    toast.present();
  }
  
  showDeleteAlert(eventId: string){
    
    let confirm = this.al.create({
    title: 'Delete Chill',
    message: 'Do you really want to delete this chill ?',
    buttons: [
        {
        text: 'Delete',
        handler: () => {
            this.deleteEvent(eventId);
        }
        }
    ]
    });
    
    confirm.present();
  }
  
  showDetailEvent(eventId: string){
      let modal = this.mod.create(ChillDetail,{"eventId":eventId});
      modal.onDidDismiss((info)=>{
        if(info){
          switch(info.accept){
            case "accept":
              this.participate(1,eventId);
              break;
            case "refuse":
              this.participate(0,eventId)
              break;
          }
        }
      })
      modal.present(modal)
  }
}

