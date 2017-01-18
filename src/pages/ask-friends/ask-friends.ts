import { Component } from '@angular/core';
import { NavController,ViewController,NavParams } from 'ionic-angular';
import { HttpProvider } from '../../providers/http-provider/http-provider';


/*
  Generated class for the InviteFriendsPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/

@Component({
    selector: 'ask-friends',
    templateUrl: 'ask-friends.html',
})
export class AskFriends {
  
    
    friends: any= [];
    filteredFriends: any =[];
    viewFriends: any = [];
    
    friendsList:any = [];
   
  constructor(public nav: NavController,public http: HttpProvider,public viewCtrl: ViewController,public navP: NavParams) {
    
    this.friendsList = this.navP.get("friendsList");
    
    this.getFriends();
    
  }
  
  onInput(searchbar: any){
      console.log(searchbar.target.value);
      
      if(searchbar.target.value == ""){
          this.viewFriends = this.filteredFriends;
          return
      }
      
      this.viewFriends = this.filteredFriends.filter((v)=>{
          
          if(v.firstname.toLowerCase().indexOf(searchbar.target.value.toLowerCase()) > -1){
              return true;
          }else{
              return false;
          }
          
      });
      
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
              console.log(this.friendsList);
              
              if(data){
                  this.friends=data;
                  if(this.friendsList.length > 0){
                      
                      let filterList = [];
                      
                      for(let f of this.friendsList){
                          filterList.push(f.id);
                      }
                      
                      console.log(filterList);
                      
                    this.filteredFriends = this.friends.filter((v)=>{
                        
                            if(filterList.indexOf(v.id) == -1 ){
                                return true;
                            }else{
                                return false;
                            }
                          
                    });
                  
                  }else{
                      this.filteredFriends= this.friends;
                  }
                  this.viewFriends = this.filteredFriends;
              }else{
                  this.friends=[];
                  this.filteredFriends=[];
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
  
  addFriend(friend: any){
      
      this.close(friend);
        
  }
  
  
  close(friend: any = undefined){
    this.viewCtrl.dismiss(friend);
  }
  
}
