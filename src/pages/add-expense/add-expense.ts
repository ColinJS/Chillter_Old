import { Component } from '@angular/core';
import { NavController, ViewController, NavParams, } from 'ionic-angular';
import { HttpProvider } from '../../providers/http-provider/http-provider';

/*
  Generated class for the AddExpensePage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector:"add-expense",
  templateUrl: 'add-expense.html',
})
export class AddExpense {
  
  friends: any[]=[];
  inheritersList: any[]=[];
  
  price: string;
  expense: string;
  
  constructor(public http: HttpProvider, public nav: NavController, public navParams: NavParams, public viewCtrl: ViewController) {
    
    this.friends = this.navParams.get("friends");
    for(let i=0;i < this.friends.length; i++){
      this.inheritersList.push(false);
    }
  }
  
  toggleInheriters(ind: number){
    this.inheritersList[ind] = !this.inheritersList[ind];
  }
  
  close(){
      this.viewCtrl.dismiss();
  }
  
  add(){
     if((!this.expense || this.expense == "") && (!this.price || this.price == "")){
        return false;
    }
    
    
    let evtId = this.navParams.get("eventId");
    
    //re-store the local token
      let token = localStorage.getItem("_token");
      let id = localStorage.getItem("_id");
      
      //send the request to the server DataBase 
      this.http.content("application/json")
      this.http.token(token)
      
      let inheriters: any[]=[];
      
      for(let i=0; i < this.friends.length; i++){
        if(this.inheritersList[i]){
          inheriters.push(this.friends[i].id);
        }
      }
     
      let body={
        expenses:[{
          "element":this.expense,
          "price":this.price,
          "inheriters":inheriters
        }]
      }
       
      this.http.post("/chillers/"+id+"/events/"+evtId+"/expenses", body ,[]).subscribe(
          data => {
              console.log(data);
              if(data){
                  this.close();
              }else{
              }
          },
          res => {
              console.log(res.status)
              if(res.status != 200){
                  console.log("fuck");
              }
          });
  }
}
