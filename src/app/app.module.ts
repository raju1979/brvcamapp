import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http'; 
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { ListPage } from '../pages/list/list';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { File } from '@ionic-native/file';
import { Camera } from '@ionic-native/camera';
import { MediaCapture, MediaFile, CaptureError, CaptureImageOptions } from '@ionic-native/media-capture';
import { VideoEditor } from '@ionic-native/video-editor';
import { FTP } from '@ionic-native/ftp';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';
import { Network } from '@ionic-native/network';

import {RoundProgressModule, RoundProgressConfig} from 'angular-svg-round-progressbar';
import { FireUploadPage } from '../pages/fire-upload/fire-upload';
import { FileChooser } from '@ionic-native/file-chooser';
import { AndroidPermissions } from '@ionic-native/android-permissions';

import {AngularFireStorage,AngularFireUploadTask} from 'angularfire2/storage';
import firebase from 'firebase';
import { FireUpload2Page } from '../pages/fire-upload2/fire-upload2';
import { MainPage } from '../pages/main/main';
import { MiscProvider } from '../providers/misc/misc';
import { VideoPlayerPage } from '../pages/video-player/video-player';

let config = {
  apiKey: "AIzaSyDQ5Y1Fxs6GOhYwJck8swWNT5kZqS3sHEA",
  authDomain: "teststorage-759da.firebaseapp.com",
  databaseURL: "https://teststorage-759da.firebaseio.com",
  projectId: "teststorage-759da",
  storageBucket: "teststorage-759da.appspot.com",
  messagingSenderId: "605319449187"
};
firebase.initializeApp(config);

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    ListPage,
    FireUploadPage,
    FireUpload2Page,
    MainPage,
    VideoPlayerPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    RoundProgressModule,
    HttpClientModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    ListPage,
    FireUploadPage,
    FireUpload2Page,
    MainPage,
    VideoPlayerPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    Camera,MediaCapture,File,VideoEditor,FTP,FileTransfer,FileChooser,Network,AndroidPermissions,
    AngularFireStorage,
    MiscProvider
  ]
})
export class AppModule {}
