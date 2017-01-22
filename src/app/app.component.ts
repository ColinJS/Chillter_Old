import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar, Splashscreen, ScreenOrientation } from 'ionic-native';
import { TabsPage } from '../pages/tabs/tabs';
import { LogIn } from '../pages/login/login';
import { Keyboard } from 'ionic-native';

@Component({
  templateUrl: 'app.html',
})

export class ChillterApp {
  rootPage: any = LogIn;

  constructor(platform: Platform) {
    
    let token = localStorage.getItem("_token");
    let id = localStorage.getItem("_id");

    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      // TestFairy.begin("f19649910e4277942e0b30324951a914cfa2ffd1");
      StatusBar.styleDefault();
      if(token){
        console.log("Home");
        this.rootPage = TabsPage;
      }else{
        console.log("Login");
        this.rootPage = LogIn;
      }
      Splashscreen.hide();
      //StatusBar.hide()
      ScreenOrientation.lockOrientation('portrait-primary');
      Keyboard.hideKeyboardAccessoryBar(false);
      Keyboard.disableScroll(true)
    });
  }
}
