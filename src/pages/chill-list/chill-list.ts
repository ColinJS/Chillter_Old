import { HttpProvider } from '../../providers/http-provider/http-provider';
import { Component } from '@angular/core';
import { NavController, ViewController, NavParams } from 'ionic-angular';

/*
  Generated class for the ChillListPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  templateUrl: 'chill-list.html',
})
export class ChillList {
    
    chills: any = [];
    
  constructor( public nav: NavController,public http: HttpProvider,public viewCtrl: ViewController,public navParams: NavParams) {
       
        this.getAllChills()
        
  }
  
  getAllChills(){
      
      this.http.content("application/json");
      
      this.http.get("/chills",[]).subscribe(
          (data) => {
              if(data){
                  this.addChills(data);
              }
          },
          err => this.http.logError(err)
      )
      
  }
  
  addChills(chills: any){
      
      this.chills = chills;
      let idList = this.navParams.get('idList');
      
      for(let c in this.chills){
          this.chills[c].chills = this.chills[c].chills.filter((v)=>{
                  for(let i in idList){
                      if(v.info.id==idList[i]){
                          return false;
                      }
                  }
                  return true;
                  
              });
      }
      
      this.chills = this.chills.filter((v)=>{
          if(v.chills.length == 0){
              return false
          }else{
              return true
          }
      })
      
  }
  
  close(chill: any=undefined) {
    this.viewCtrl.dismiss(chill);
  }
}