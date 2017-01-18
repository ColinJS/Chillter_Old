import { Component } from '@angular/core';
import {HttpProvider} from '../../providers/http-provider/http-provider';
import { NavController,ModalController,AlertController,Events } from 'ionic-angular';
import {AddFriends} from "../add-friends/add-friends";
import {ChillerDetails} from "../chiller-details/chiller-details";

/*
  Generated class for the FriendListPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  templateUrl: 'friend-list.html',
})
export class FriendList {

    searchWord: string;
    pendingFriends: any= [];
    friends: any = [];
    unsortFriends: any = [];

  constructor(public notif:Events, public al: AlertController, public nav: NavController,public http: HttpProvider,public mod: ModalController) {
    this.getFriends();
    this.getPendingFriends();
    this.notif.subscribe("notif:friends",()=>{
        this.getFriends();
        this.getPendingFriends();
    })
  }
  
  ionViewDidEnter(){
      this.getFriends();
      this.getPendingFriends();
  }
  
  doRefresh(refresher){
      this.getFriends();
      this.getPendingFriends(refresher);
  }
  
  getFriends(){
      
       //re-store the local token
      let token = localStorage.getItem("_token");
      let id = localStorage.getItem("_id");
      
      //send the request to the server DataBase 
      this.http.content("application/json")
      this.http.token(token)
      
      this.http.get("/chillers/"+id+"/friends",[]).subscribe(
          data => {
              console.log(data);
              if(data){
                  this.friends=data;
                  this.unsortFriends=data;
              }else{
                  this.friends=[];
              }
          },
          res => {
              console.log(res.status)
              if(res.status != 200){
                  console.log("fuck");
              }
          },
          () => console.log("erreur")
      )
      
  }
  
  getPendingFriends(ref: any=false){
      
       //re-store the local token
      let token = localStorage.getItem("_token");
      let id = localStorage.getItem("_id");
      
      //send the request to the server DataBase 
      this.http.content("application/json")
      this.http.token(token)
      
      this.http.get("/chillers/"+id+"/friends",[{"name":"pending","value":"yes"}]).subscribe(
          data => {
              console.log(data);
              if(data){
                  this.pendingFriends=data;
              }else{
                  this.pendingFriends=[];
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
          },
          () => console.log("erreur")
      )
      
  }
  
  acceptFriend(friendId: string){
      
      //re-store the local token
      let token = localStorage.getItem("_token");
      let id = localStorage.getItem("_id");
      
      //send the request to the server DataBase 
      this.http.content("application/json")
      this.http.token(token)
      
      this.http.put("/chillers/"+id+"/friends/"+friendId,"",[]).subscribe(
          data => {
              console.log(data);
              this.getPendingFriends()
              this.getFriends()
              this.filterFriends()
          },
          res => {
              console.log(res.status)
              if(res.status != 200){
                  console.log("fuck");
              }
          },
          () => console.log("erreur")
      )
      this.notif.publish("notif:update");
  }
  
  showDeleteAlert(friendId: string){
      
    let confirm = this.al.create({
    title: 'Delete friend',
    message: 'Do you want to delete or delete and block this friend ?',
    buttons: [
        {
        text: 'Delete and Block',
        handler: () => {
            this.blockFriend(friendId);
        }
        },
        {
        text: 'Delete',
        handler: () => {
            this.deleteFriend(friendId);
        }
        }
    ]
    });
    
    confirm.present();
      
  }
  
  
  deleteFriend(friendId: string){
      
      //re-store the local token
      let token = localStorage.getItem("_token");
      let id = localStorage.getItem("_id");
      
      //send the request to the server DataBase 
      this.http.content("application/json")
      this.http.token(token)
      
      this.http.delete("/chillers/"+id+"/friends/"+friendId,[]).subscribe(
          data => {
              console.log(data);
              this.getPendingFriends()
              this.getFriends()
              this.filterFriends()
          },
          res => {
              console.log(res.status)
              if(res.status != 200){
                  console.log("fuck");
              }
          },
          () => console.log("erreur")
      )
      this.notif.publish("notif:update");
  }
  
  blockFriend(friendId: string){
      
      //re-store the local token
      let token = localStorage.getItem("_token");
      let id = localStorage.getItem("_id");
      
      //send the request to the server DataBase 
      this.http.content("application/json")
      this.http.token(token)
      
      this.http.post("/chillers/"+id+"/friends/"+friendId+"/block","",[]).subscribe(
          data => {
              console.log(data);
              this.getPendingFriends()
              this.getFriends()
              this.filterFriends()
          },
          res => {
              console.log(res.status)
              if(res.status != 200){
                  console.log("fuck");
              }
          },
          () => console.log("erreur")
      )
      
  }
  
  inputChange(evt){
      this.searchWord = evt.target.value;
      this.filterFriends();
  }
  
  filterFriends(){
      
      this.friends = this.unsortFriends.filter((v)=>{
          
          if(v.firstname.toLowerCase().indexOf(this.searchWord.toLowerCase()) > -1){
              return true;
          }else{
              return false;
          }
          
      });
      
  }
  
  showChillerDetails(friendId: string){
      
        let modal = this.mod.create(ChillerDetails,{"friendId":friendId});
        
        modal.present()
  }
  
  addFriends(): void{
      
      let listModal = this.mod.create(AddFriends);
      listModal.present();
      
  }
}