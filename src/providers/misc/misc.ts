import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {Platform, AlertController} from 'ionic-angular';
import { Network } from '@ionic-native/network';

/*
  Generated class for the MiscProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class MiscProvider {

  constructor(public http: HttpClient, private _platform:Platform,private _network:Network, private _alertCtrl:AlertController) {
    console.log('Hello MiscProvider Provider');
  }

  getImageFromAssets(img):string{
    let assetImg = '';

    if(this._platform.is('mobile')){
      assetImg = `assets/imgs/${img}`
    }else{
      assetImg = `../../assets/imgs/${img}`;
    }
    
    // console.log(assetImg)
    return assetImg;
  };//

  getLoadingimg() {
    if (this._platform.is('core')) {
      return "../assets/imgs/loading.svg";
    } else if (this._platform.is('android')) {
      return "assets/imgs/loading.svg";
    } else {
      return "assets/imgs/loading.svg";
    }
  }; //

  getNoInternetErorMessage():string{
    let noInternetErrorMessage = "Please check your Internet connection and try again";

    return noInternetErrorMessage;
  }

  getNetworkStatus(){
    return this._network.type;
  }

  showNoNetworkErrorAlert() {
    let noNetworkText = this.getNoInternetErorMessage();

    let alert = this._alertCtrl.create(
        {
          title: 'Connection Error', 
          subTitle: noNetworkText, 
          enableBackdropDismiss: false, 
          buttons: ['Ok']
        }
    );
    alert.present();
  };//

  //
  showUnknownError(errorCode?:string) {

    let alert = this
      ._alertCtrl
      .create({
        title: 'Error',
        subTitle: `Please restart the application and try again ${errorCode}`,
        enableBackdropDismiss: false,
        buttons: ['Ok']
      });
    alert.present();

  } //end showUnknownError

}
