import { Component } from '@angular/core';
import { NavController, ViewController, NavParams, ModalController, AlertController } from 'ionic-angular';
import {HttpProvider} from '../../providers/http-provider/http-provider';
import {ChillerDetails} from "../chiller-details/chiller-details";
import {AddExpense} from "../add-expense/add-expense";
import {ResolveExpenses} from "../resolve-expenses/resolve-expenses";
/*
  Generated class for the ChillUtilsPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  templateUrl: 'chill-utils.html',
})
export class ChillUtils {
  
  title: string = "Covoit";
  slidesOptions: any;
  
  cars: any[];
  
  seats: string = "";
  addCarBool: boolean = true;
  
  
  list: any[]=[];
  
  element: string = "";
  
  showExpsList: any[]=[];
  expsList: any[];
  exps: any[];
  expensesPage: boolean=false;
  
  expense: string ="";
  price: string = "";
  
  newMode: boolean = false;
  creator: any;
  utilsObj: any;
  
  constructor(public alertCtrl: AlertController, public mod: ModalController, public http:HttpProvider, public nav: NavController, public viewCtrl:ViewController, public navParams: NavParams) {
    
    let initialSlide = 0;
    
    if(this.navParams.get("init")){
      initialSlide = this.navParams.get("init");
    }
    if(this.navParams.get("newMode")){
      this.newMode = this.navParams.get("newMode");
    }
    
    if(this.newMode && this.navParams.get("utils")){
        this.utilsObj = this.navParams.get("utils");
        this.cars = this.utilsObj.cars;
        this.list = this.utilsObj.list;
    }
    
    if(this.newMode && this.navParams.get("creator")){
        this.creator = this.navParams.get("creator");
    }
    
    this.slidesOptions = {
      initialSlide:initialSlide,
      pager:false
    }
    
    
    this.changeSlide({activeIndex:initialSlide});
  }
  
  
  changeSlide(evt){
    
    let slideId = evt.activeIndex
    
    switch (slideId){
      case 0:
        this.title = "Transport";
        this.expensesPage=false;
        if(!this.newMode){
            this.getCar();
        }
        break;
      case 1:
        this.title = "List";
        this.expensesPage=false;
        if(!this.newMode){
            this.getList();
        }
        break;
      case 2:
        this.title = "Expenses";
        this.expensesPage=true;
        if(!this.newMode){
            this.getExps();
        }
        break;
    }
  }
  
  getCar(){
      
      
    let evtId = this.navParams.get("eventId");
    
    //re-store the local token
      let token = localStorage.getItem("_token");
      let id = localStorage.getItem("_id");
      
      //send the request to the server DataBase 
      this.http.content("application/json")
      this.http.token(token)
      
      
      this.http.get("/chillers/"+id+"/events/"+evtId+"/cars",[]).subscribe(
          data => {
              console.log(data);
              if(data){
                this.addCarBool = true;
                this.cars = data
                for(let c in this.cars)
                {
                  
                  for(let p in this.cars[c].passengers){
                    
                    if(this.cars[c].passengers[p].id === this.cars[c].driver){
                      this.cars[c].driver = this.cars[c].passengers[p];
                      this.cars[c].passengers.splice(p,1);
                    }
                  }
                  
                  if(this.cars[c].driver.id === id){
                    this.cars[c].mine = true;
                    this.addCarBool = false;
                  }
                  
                  for(let p of this.cars[c].passengers){
                      if(p.id === id){
                           this.addCarBool = false;
                      }
                  }
                  
                }
                
                for(let c in this.cars){
                  if((this.cars[c].passengers.length < (parseInt(this.cars[c].seats)-1)) && this.addCarBool){
                    this.cars[c].passengers.push({id:"add",picture:"images/chill-plus.svg"})
                  }
                }
                console.log(this.cars)
              }else{
                this.addCarBool = true;
                this.cars = [];
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
  
  getList(){
    let evtId = this.navParams.get("eventId");
    
    //re-store the local token
      let token = localStorage.getItem("_token");
      let id = localStorage.getItem("_id");
      
      //send the request to the server DataBase 
      this.http.content("application/json")
      this.http.token(token)
      
      this.http.get("/chillers/"+id+"/events/"+evtId+"/elements",[]).subscribe(
          data => {
              console.log(data);
              if(data){
                  this.list = data;
              }else{
                this.list = [];
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
  
  getExps(){
    let evtId = this.navParams.get("eventId");
    
    //re-store the local token
      let token = localStorage.getItem("_token");
      let id = localStorage.getItem("_id");
      
      //send the request to the server DataBase 
      this.http.content("application/json")
      this.http.token(token)
      
      this.http.get("/chillers/"+id+"/events/"+evtId+"/expenses",[]).subscribe(
          data => {
              console.log(data);
              if(data){
                  this.showExpsList = [];
                  this.expsList=data;
                  
                  let tmpList: any[]=[];
                  
                  for(let e of data){
                      
                      let toDo = true;
                      
                      for(let i in tmpList){
                          if(e.payer.id == tmpList[i].payer.id){
                              let tmpExp = {
                                  "id":e.id,
                                  "element":e.element,
                                  "price":e.price,
                                  "inheriters":e.inheriters
                              }
                              tmpList[i].expenses.push(tmpExp);
                              toDo = false;
                          }
                      }
                      
                      if(toDo){
                          let tmpExp = {
                              "payer":e.payer,
                              "expenses":[{
                                  "id":e.id,
                                  "element":e.element,
                                  "price":e.price,
                                  "inheriters":e.inheriters
                              }]
                          }
                          
                          tmpList.push(tmpExp);
                      }
                  }
                  
                  for(let i in tmpList){
                      let tmpSum: number = 0.0;
                      for(let p of tmpList[i].expenses){
                          tmpSum += parseFloat(p.price);
                      }
                      tmpList[i].sum = tmpSum;
                      this.showExpsList.push(false);
                  }
                  
                  this.exps = tmpList;
                  console.log(this.exps);
              }else{
                this.showExpsList = [];
                this.expsList = [];
                this.exps = [];
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
  
  addCar(seats: number){
    
    if(!seats){
        return false;
    }
    
    if(this.newMode){
        console.log(this.creator);
        this.addCarBool = false;
        this.cars = [{
            "mine":true,
            "seats":seats,
            "driver": {"id":this.creator.id,"firstname":this.creator.firstname,"picture":this.creator.picture},
            "passengers":[]
        }];
        this.utilsObj.cars = this.cars;
        return
    }
    
    let evtId = this.navParams.get("eventId");
    
    //re-store the local token
      let token = localStorage.getItem("_token");
      let id = localStorage.getItem("_id");
      
      //send the request to the server DataBase 
      this.http.content("application/json")
      this.http.token(token)
      
      
     
      let body={
        cars:{
          seats:seats
        }
      }
       
      this.http.post("/chillers/"+id+"/events/"+evtId+"/cars", body ,[]).subscribe(
          data => {
              console.log(data);
              if(data){
                  this.getCar();
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
  
  deleteCar(carId: any){
    
    if(this.newMode){
        this.addCarBool = true;
        this.cars = [];
        return
    }
    
    let evtId = this.navParams.get("eventId");
    
    //re-store the local token
      let token = localStorage.getItem("_token");
      let id = localStorage.getItem("_id");
      
      //send the request to the server DataBase 
      this.http.content("application/json")
      this.http.token(token)
      
      console.log("carId :"+carId+" evtId :"+evtId+" chillerId :"+ id);
      
      this.http.delete("/chillers/"+id+"/events/"+evtId+"/cars/"+carId,[]).subscribe(
          data => {
              console.log(data);
              if(data){
                  this.getCar();
              }else{
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
  
  passengersTap(passId: any,carId: any){
    
    let id = localStorage.getItem("_id");
    
    if(passId == "add"){
      this.addPassenger(carId);
    }else if(passId == id){
      this.deletePassenger(carId);
    }else{
      this.showChillerDetails(passId);
    }
    
    
  }
  
  addPassenger(carId: any){
    let evtId = this.navParams.get("eventId");
    
    //re-store the local token
      let token = localStorage.getItem("_token");
      let id = localStorage.getItem("_id");
      
      //send the request to the server DataBase 
      this.http.content("application/json")
      this.http.token(token)
      
      console.log("carId :"+carId+" evtId :"+evtId+" chillerId :"+ id);
      
      this.http.post("/chillers/"+id+"/events/"+evtId+"/cars/"+carId+"/passenger",{},[]).subscribe(
          data => {
              console.log(data);
              if(data){
                  this.getCar();
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
  
  deletePassenger(carId){
    let evtId = this.navParams.get("eventId");
    
    //re-store the local token
      let token = localStorage.getItem("_token");
      let id = localStorage.getItem("_id");
      
      //send the request to the server DataBase 
      this.http.content("application/json")
      this.http.token(token)
      
      console.log("carId :"+carId+" evtId :"+evtId+" chillerId :"+ id);
      
      this.http.delete("/chillers/"+id+"/events/"+evtId+"/cars/"+carId+"/passenger",[]).subscribe(
          data => {
              console.log(data);
              if(data){
                  this.getCar();
              }else{
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
  
  addElement(element: string){
      
    if(!element){
        return false;
    }
    
    if(this.newMode){
        let elemId = this.list.length;
        this.list.push({
            "id":elemId,
            "content":element,
        });
        this.utilsObj.list = this.list;
        return
    }
    
    let evtId = this.navParams.get("eventId");
    
    //re-store the local token
    let token = localStorage.getItem("_token");
    let id = localStorage.getItem("_id");
      
      //send the request to the server DataBase 
    this.http.content("application/json")
    this.http.token(token)
      
      
     
      let body={
        "elements":[
            element
        ]
      }
       
      this.http.post("/chillers/"+id+"/events/"+evtId+"/elements", body ,[]).subscribe(
          data => {
              console.log(data);
              if(data){
                  this.getList();
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
  
  deleteElement(elemId){
      
      if(this.newMode){
        this.list = this.list.filter((v)=>{
            if(v.id == elemId){
                return false
            }else{
                return true
            }
        })
    }
    
    let evtId = this.navParams.get("eventId");
    
    //re-store the local token
      let token = localStorage.getItem("_token");
      let id = localStorage.getItem("_id");
      
      //send the request to the server DataBase 
      this.http.content("application/json")
      this.http.token(token)
      
      this.http.delete("/chillers/"+id+"/events/"+evtId+"/elements/"+elemId,[]).subscribe(
          data => {
              console.log(data);
              if(data){
                  this.getList();
              }else{
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
  
  elementTap(elemId: string, firstName: string){
      if(this.newMode){
          return;
      }
      if(firstName == null){
          this.takeElement(elemId);
      }else{
          this.leaveElement(elemId);
      }
      
  }
  
  takeElement(elemId: string){
      let evtId = this.navParams.get("eventId");
    
    //re-store the local token
      let token = localStorage.getItem("_token");
      let id = localStorage.getItem("_id");
      
      //send the request to the server DataBase 
      this.http.content("application/json")
      this.http.token(token)
      
      this.http.put("/chillers/"+id+"/events/"+evtId+"/elements/"+elemId+"/take",{},[]).subscribe(
          data => {
              console.log(data);
              if(data){
                  this.getList();
              }else{
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
  
  leaveElement(elemId: string){
      let evtId = this.navParams.get("eventId");
    
    //re-store the local token
      let token = localStorage.getItem("_token");
      let id = localStorage.getItem("_id");
      
      //send the request to the server DataBase 
      this.http.content("application/json")
      this.http.token(token)
      
      this.http.put("/chillers/"+id+"/events/"+evtId+"/elements/"+elemId+"/leave",{},[]).subscribe(
          data => {
              console.log(data);
              if(data){
                  this.getList();
              }else{
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
  
  toggleExpsDetails(ind: number){
      this.showExpsList[ind] = !this.showExpsList[ind]
  }
  
  showChillerDetails(friendId: string){
      
        let modal = this.mod.create(ChillerDetails,{"friendId":friendId});
        
        modal.present(modal)
  }
  
  resolve(){
      
      if(this.newMode){
          return;
      }
      
      let modal = this.mod.create(ResolveExpenses,{"expenses":this.expsList});
      
      modal.present(modal)
      
  }

  addElementPrompt(){
      let prompt = this.alertCtrl.create({
      title: 'Add an element',
      inputs: [
        {
          name: 'Element',
          placeholder: 'Element',
          type: 'text'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Add',
          handler: data => {
            this.addElement(data.Element)
          }
        }
      ]
    });
    prompt.present();
  }

  addCarPrompt(){
      let prompt = this.alertCtrl.create({
      title: 'Add a car',
      inputs: [
        {
          name: 'Seats',
          placeholder: 'Seats',
          type: 'number'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Add',
          handler: data => {
            this.addCar(data.Seats)
          }
        }
      ]
    });
    prompt.present();
  }

    addExpensePrompt(){
        let friends = this.navParams.get("friends");

        let prompt = this.alertCtrl.create();

        prompt.setTitle('Add an expense');

        prompt.addInput({
            name: 'Element',
            placeholder: 'Element',
            type: 'text'
        });

        prompt.addInput({
            name: 'Price',
            placeholder: 'Price',
            type: 'number'
        });

        prompt.addButton({
            text: 'Cancel',
            handler: data => {
                console.log('Cancel clicked');
            }
            });

        prompt.addButton({
            text: 'Add',
            handler: data => {
                this.addFriendsToExpensePrompt(data.Element,data.Price)
            }
            });

        prompt.present();
  }

      addFriendsToExpensePrompt(element: string, price: string){
        let friends = this.navParams.get("friends");

        let prompt = this.alertCtrl.create();
        prompt.setTitle('Add an expense');

        for(let i=0; i<friends.length; i++){
            prompt.addInput({
                type: 'checkbox',
                label: (friends[i].firstname+" "+friends[i].lastname),
                value: ("value"+i.toString()),
                checked: false
            });
        }

        prompt.addButton({
            text: 'Cancel',
            handler: data => {
                console.log('Cancel clicked');
            }
            });

        prompt.addButton({
            text: 'Add',
            handler: data => {
                let inheritersList = []
                for(let i=0; i<friends.length; i++){
                    if(data.indexOf("value"+i.toString()) > -1){
                        inheritersList.push(friends[i]);
                    }
                }
                this.addExpense(element,price,inheritersList)
                
            }
            });

        prompt.present();
  }

  addExpense(element: string, price: string, friends: any[]){
     if(element == "" || price == ""){
        return false;
    }
    
    let evtId = this.navParams.get("eventId");

    //re-store the local token
      let token = localStorage.getItem("_token");
      let id = localStorage.getItem("_id");
      
      //send the request to the server DataBase 
      this.http.content("application/json")
      this.http.token(token)
     
      let body={
        expenses:[{
          "element":element,
          "price":price,
          "inheriters":friends
        }]
      }
       
      this.http.post("/chillers/"+id+"/events/"+evtId+"/expenses", body ,[]).subscribe(
          data => {
              console.log(data);
              if(data){
                  this.getExps();
              }
          },
          res => {
              console.log(res.status)
              if(res.status != 200){
                  console.log("fuck");
              }
          });
  }

   close(){
    this.viewCtrl.dismiss(this.utilsObj);
  }
}
