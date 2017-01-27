import { Component, ViewChild } from '@angular/core';
import { NavController, List, ModalController, AlertController, Events } from 'ionic-angular';
import { HttpProvider } from '../../providers/http-provider/http-provider';
import { ChillDetail } from '../chill-detail/chill-detail';
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
  
  constructor(public notif: Events, public al: AlertController, public mod: ModalController, public nav: NavController, public http: HttpProvider) {
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
  
  
  participate(ind: number,eventId: any){
    
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
          }
      );
      this.notif.publish("notif:update");
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
      
      modal.present(modal)
  }
}

