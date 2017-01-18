import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';

import { ChillterApp } from './app.component';
import { AddExpense } from '../pages/add-expense/add-expense';
import { AskFriends } from '../pages/ask-friends/ask-friends';
import { AddFriends } from '../pages/add-friends/add-friends';
import { ChillBox } from '../pages/chill-box/chill-box';
import { ChillDetail } from '../pages/chill-detail/chill-detail';
import { ChillList } from '../pages/chill-list/chill-list';
import { ChillSet } from '../pages/chill-set/chill-set';
import { ChillUtils } from '../pages/chill-utils/chill-utils';
import { ChillerDetails } from '../pages/chiller-details/chiller-details';
import { EditChills } from '../pages/edit-chills/edit-chills';
import { FriendList } from '../pages/friend-list/friend-list';
import { Home } from '../pages/home/home';
import { LogIn } from '../pages/login/login';
import { ResolveExpenses } from '../pages/resolve-expenses/resolve-expenses';
import { SignIn } from '../pages/signin/signin';
import { TabsPage } from '../pages/tabs/tabs';

import { ImgLoader } from '../components/img-loader/img-loader';
import { StatusImg } from '../pipes/statusImg'
import { ToNow } from '../pipes/toNow'

import { HttpProvider } from '../providers/http-provider/http-provider'
import { Storage } from '@ionic/storage';

@NgModule({
  declarations: [
    ChillterApp,
    AddExpense,
    AddFriends,
    AskFriends,
    ChillBox,
    ChillDetail,
    ChillList,
    ChillSet,
    ChillUtils,
    ChillerDetails,
    EditChills,
    FriendList,
    Home,
    LogIn,
    SignIn,
    ResolveExpenses,
    TabsPage,
    ImgLoader,
    StatusImg,
    ToNow
  ],
  imports: [
    IonicModule.forRoot(ChillterApp,{
    mode: "ios",
    tabbarPlacement: "bottom",
    pageTansition: "ios"
  })
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    ChillterApp,
    AddExpense,
    AddFriends,
    AskFriends,
    ChillBox,
    ChillDetail,
    ChillList,
    ChillSet,
    ChillUtils,
    ChillerDetails,
    EditChills,
    FriendList,
    Home,
    LogIn,
    SignIn,
    ResolveExpenses,
    TabsPage
  ],
  providers: [
    HttpProvider,
    //Storage,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
    ]
})
export class AppModule {}
