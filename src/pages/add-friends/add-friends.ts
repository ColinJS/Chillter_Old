import { Component } from '@angular/core';
import { NavController,ViewController } from 'ionic-angular';
import { HttpProvider } from '../../providers/http-provider/http-provider';

/*
  Generated class for the AddFriendsPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  templateUrl: 'add-friends.html',
})
export class AddFriends{
  
    friends: any= [];
    
  constructor(public nav: NavController,public http: HttpProvider,public viewCtrl: ViewController) {

  }
  
  onInput(searchbar: any){
      console.log(searchbar.target.value);
      
      if(searchbar.target.value == ""){
          this.friends=[];
          return
      }
      
       //re-store the local token
      let token = localStorage.getItem("_token");
      let id = localStorage.getItem("_id");
      
      //send the request to the server DataBase 
      this.http.content("application/json")
      this.http.token(token)
      
      let options = [{"name":"name","value":searchbar.target.value},{"name":"id","value":id}]
      
      this.http.get("/chillers",options).subscribe(
          data => {
              console.log(data);
              if(data){
                  this.friends=data;
              }else{
                  this.friends=[];
              }
              this.friends=this.friends.filter((v)=>{
                  if(v.id == id){
                      return false;
                  }else{
                      return true;
                  }
              });
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
  
  addFriend(friendId: any){
      
      //re-store the local token
      let token = localStorage.getItem("_token");
      let id = localStorage.getItem("_id");
      
      this.http.content("application/json")
      this.http.token(token)
      
      this.http.post("/chillers/"+id+"/friends/"+friendId,"",[]).subscribe(
          data => {
              if(data){
                  this.close();
              }
          }
      )
      
  }
  
  close(){
    this.viewCtrl.dismiss();
  }
}
