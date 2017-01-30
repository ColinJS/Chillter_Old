import { Component } from '@angular/core';
import { NavController,NavParams,ViewController,ModalController } from 'ionic-angular';
import { HttpProvider } from '../../providers/http-provider/http-provider';
import { ChillDetail } from '../chill-detail/chill-detail';
import { ChillList } from '../chill-list/chill-list';
import { EditChills } from '../edit-chills/edit-chills';
/*
  Generated class for the ChillerDetailsPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
    selector:"chiller-details",
  templateUrl: 'chiller-details.html',
})
export class ChillerDetails {
  
  info: any;
  firstName: string ="";
  lastName: string = "";
  picture: string = ""
  phone: string="";
  email: string="";
  
  events: any[] = [];
  comingEvents: any[] =[];
  historyEvents: any[] =[];
  
  constructor(public modal:ModalController, public nav: NavController, public navParams: NavParams,public http:HttpProvider,public viewCtrl: ViewController) {
    
    this.getChillerInfo();
    
  }
  
  getChillerInfo(){
    
    //re-store the local token
      let token = localStorage.getItem("_token");
      let id = localStorage.getItem("_id");
      
      let friendId = this.navParams.get("friendId");
      console.log(friendId);
      //send the request to the server DataBase 
      this.http.content("application/json")
      this.http.token(token)
      
      this.http.get("/chillers/"+id+"/friends/"+friendId,[]).subscribe(
          data => {
              console.log(data);
              if(data){
                  this.info = data
                  this.firstName = data.firstname
                  this.lastName = data.lastname
                  this.picture = data.picture
                  this.email = data.email
                  this.phone = data.phone
                  this.getEventsList(friendId)
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
  
  getEventsList(friendId){
    
    //re-store the local token
      let token = localStorage.getItem("_token");
      let id = localStorage.getItem("_id");
      
      //send the request to the server DataBase 
      this.http.content("application/json")
      this.http.token(token)
      
      this.http.get("/chillers/"+id+"/events",[{"name":"chiller","value":friendId}]).subscribe(
          data => {
              console.log(data);
              if(data){
                  this.events=data
                  this.sortEvents()
              }else{
                  this.events=[];
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
  
  sortEvents(){
    
    this.historyEvents = [];
    this.comingEvents = [];
    
    let now = new Date();
    
    for(let i=0;i<this.events.length;i++){
      
      let tmpDate = new Date(this.events[i].date);
      if(tmpDate.getTime() > (now.getTime()+now.getTimezoneOffset())){
        this.comingEvents.push(this.events[i]);
      }else{
        this.historyEvents.push(this.events[i]);
      }
      
    }
    this.historyEvents = this.historyEvents.reverse();
  }
  
  showDetailEvent(eventId: string){
      let modal = this.modal.create(ChillDetail,{"eventId":eventId});
      
      modal.present(modal)
  }

  sendAChill(){

      let modal = this.modal.create(ChillList);
      modal.onDidDismiss((chill)=>{
          if(chill){
                let chillObj = {"link":{"chills":chill.info.id}}
                let friendObj = {"id":this.navParams.get("friendId"),"firstname":this.firstName,"lastname":this.lastName,"picture":this.picture}

                let editModal = this.modal.create(EditChills,{"chill":chillObj,"friends":friendObj})
                editModal.present()
          }
      });
      modal.present()
  }
  
  swipeEvent(evt){
      if(evt.deltaX < -25){
          this.close()
      }
  }
  
  close(){
    this.viewCtrl.dismiss();
  }
  
}
