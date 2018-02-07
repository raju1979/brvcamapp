import { Component, ViewChild, ElementRef, NgZone } from '@angular/core';
import { NavController,MenuController, NavParams, normalizeURL } from 'ionic-angular';

import { File } from '@ionic-native/file';
import { MediaCapture, MediaFile, CaptureError, CaptureImageOptions } from '@ionic-native/media-capture';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { FTP } from '@ionic-native/ftp';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';
import { AndroidPermissions } from '@ionic-native/android-permissions';

import { VideoEditor } from '@ionic-native/video-editor';
import { Platform } from 'ionic-angular/platform/platform';

import { MiscProvider } from '../../providers/misc/misc';

import firebase from 'firebase';
import { VideoPlayerPage } from '../video-player/video-player';

declare var cordova: any;
declare var window: any;
declare var VideoEditorOptions: any;



@Component({
  selector: 'page-main',
  templateUrl: 'main.html',
})
export class MainPage {

  showSecondaryButtonBar:boolean = false;
  capturedVideoFileName:string;

  // limit capture operation to 3 video clips
  options = { limit: 1, duration: 15 };
  videoUrl: string = '';
  fs: string;

  totalCompressed: number = 0;
  maximumCompressed: number = 100;
  compressedFileUrl: string = '';

  fileTransfer: FileTransferObject;

  uploadProgress:number = 0;
  uploadSuccefull:boolean = false;
  downloadUrl:string;

  videoBaseUrl:string;
  videoBaseStr:string;

  downloadedPercentage:number = 0;

  videoFileoptions: FileUploadOptions = {
    fileKey: 'ionicfile',
    fileName: 'ionicfile',
    chunkedMode: false,
    mimeType: "video/mp4",
    headers: {}
  }

  constructor(public navCtrl: NavController, public navParams: NavParams, private _miscProvider:MiscProvider,private mediaCapture: MediaCapture, private _file: File, private _camera: Camera, private videoEditor: VideoEditor, private _platform: Platform, private zone: NgZone,  private transfer: FileTransfer, private file: File,private _menuCtrl:MenuController,private androidPermissions: AndroidPermissions) {

    this._platform.ready().then((readySource) => {
      console.log('Platform ready from', readySource);
      if (this._platform.is('mobile')) {
        this.fs = cordova.file.externalRootDirectory;
  
        this.fileTransfer = this.transfer.create();
        console.log(this.fs);

        this.fileTransfer =  this.transfer.create();
        if (this._platform.is("android")) {
          this.videoBaseUrl = this.fs +  "/brvapp/";
        } else if (this._platform.is("ios")) {
          let baseStr: string = this.fs;
          baseStr = baseStr.replace("file://", '');
          this.videoBaseUrl = baseStr +  "/brvapp/";
        }

      }
      // Platform now ready, execute any required native code
    });

    

  }

  ionViewDidLoad() {
    if (this._platform.is("mobile")) {
      this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE)
      .then(
        (result) => {
          console.log('Has permission?',result.hasPermission)
          if(!result.hasPermission){
            this.androidPermissions.requestPermissions([this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE,this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE]);
          }
        },(err) => {
          this.androidPermissions.requestPermissions([this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE,this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE]);
        }
      )
    }
  };//

  ionViewWillEnter(){
    this._menuCtrl.enable(false);
  }

  videoFromCamera() {
    this.totalCompressed = 0;

    this.mediaCapture.captureVideo(this.options)
      .then(
      (data: MediaFile[]) => {
        console.log(data);
        let tempUrl = data[0].fullPath;
        this.videoUrl = tempUrl;
        console.log('video path:::',this.videoUrl);
        let dirPathSegments = this.videoUrl.split('/');
        this.capturedVideoFileName = dirPathSegments.pop();
        // this.videoUrl = this.videoUrl.replace("file://",'');
        console.log(this.videoUrl,this.capturedVideoFileName);
        // this.compressVideo(this.videoUrl);
      },
      (err: CaptureError) => console.error(err)
      );

  };//

  VideoFromGallery() {
    this.totalCompressed = 0;
    // let video = this.myVide.nativeElement;
    var options: CameraOptions = {
      sourceType: 2,
      mediaType: 1
    };

    this._camera.getPicture(options).then((data) => {
      this.videoUrl = "file://" + data;
      let dirPathSegments = this.videoUrl.split('/');
      this.capturedVideoFileName = dirPathSegments.pop();
      console.log(this.videoUrl,this.capturedVideoFileName);
      // this.compressVideo(correctUrl);
    },(err) => {
      console.error(err)
    })
  };//

  compressVideo(correctUrl) {

    if (this._platform.is('mobile')) {
      let networkName = this._miscProvider.getNetworkStatus();
      if (networkName == 'none') {
        this._miscProvider.showNoNetworkErrorAlert()
      } else {
        this.videoEditor.transcodeVideo({
          fileUri: correctUrl,
          outputFileName: `output_${Date.now()}`,
          outputFileType: VideoEditorOptions.OutputFileType.MPEG4,
          videoBitrate: 10000000,
          progress: (info: number) => {
            console.log(info);
            this.zone.run(() => {
              this.totalCompressed = Math.ceil(info * 100);
              console.log(this.totalCompressed);
            })        
          }
        })
          .then((fileUri: string) => {
    
            this.totalCompressed = 100;
            this.compressedFileUrl = "file://" + fileUri;
            console.log('video transcode success', fileUri, this.compressedFileUrl);
    
            let dirPath = this.compressedFileUrl;
            let dirPathSegments = dirPath.split('/');
            let fileName = dirPathSegments.pop();
            dirPath = dirPathSegments.join('/');
            console.log(dirPath, fileName)
            this._file.readAsArrayBuffer(dirPath, fileName)
            .then(async (buffer) => {
              console.log(buffer)
              await this.upload(buffer,fileName);
            })
    
          })
          .catch((error: any) => console.log('video transcode error', error));
      }//end if else network
    }

    

  }

  async upload(buffer, name) {
    let blob = new Blob([buffer], { type: "video/mp4" });

    let storage = firebase.storage();

    // Create a root reference
    var storageRef = firebase.storage().ref();

    // Create a reference to 'mountains.jpg'
    var movieRef = storageRef.child('mp4/' + name);

    var uploadTask = movieRef.put(blob);

    uploadTask.then((d) => {
        console.log('done')
        console.log(d);
      })
      .catch((err) => {
        console.log(err)
      });

      // Register three observers:
      // 1. 'state_changed' observer, called any time the state changes
      // 2. Error observer, called on failure
      // 3. Completion observer, called on successful completion
      uploadTask.on('state_changed', (snapshot:any) => {
        // Observe state change events such as progress, pause, and resume
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        this.zone.run(() => {
          this.uploadProgress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Upload is ' + this.uploadProgress + '% done');
        });
        
        switch (snapshot.state) {
          case firebase.storage.TaskState.PAUSED: // or 'paused'
            console.log('Upload is paused');
            break;
          case firebase.storage.TaskState.RUNNING: // or 'running'
            console.log('Upload is running');
            break;
        }
      }, function(error) {
        // Handle unsuccessful uploads
      }, () => {
        // Handle successful uploads on complete
        // For instance, get the download URL: https://firebasestorage.googleapis.com/...
        this.zone.run(() => {
          this.uploadSuccefull = true;
          this.downloadUrl = uploadTask.snapshot.downloadURL;
          console.log(this.downloadUrl)
        });
        
      });


  };//

  downloadVideo() {

    let url = this.downloadUrl;

    this.fileTransfer.download(url, this.videoBaseUrl + "/" + 'vv.mp4').then((entry: any) => {
        console.log('success' + entry.toURL());
        let tempVideoUrl = entry.toURL();
        this.videoBaseStr = tempVideoUrl.replace("file://",'');
        console.log(this.videoBaseStr);
        // let video = this.myVide.nativeElement;
        // video.src = baseStr;
        // video.play();
      }, (error: any) => {
        // handle error
        console.log(error);
      });

      this.fileTransfer.onProgress((progressEvent: any) => {
        console.log((progressEvent.loaded / progressEvent.total) * 100);
        this.zone.run(() => {
          this.downloadedPercentage = (progressEvent.loaded / progressEvent.total) * 100;
          this.downloadedPercentage = parseFloat(this.downloadedPercentage.toFixed(1));
          // if (this.progress >= 100) {
          //   this.viewCtrl.dismiss();
          //   console.log("file Downloaded")
          // }
        });
      });//end this.fileTransfer

  };//

  playVideo(){
    this.navCtrl.push(VideoPlayerPage,{videoUrl:this.videoBaseStr})
  }

  getImageFromAssets(url){
    return this._miscProvider.getImageFromAssets(url);
  }

  toggleSecondaryButtonBar(){
    this.showSecondaryButtonBar = !this.showSecondaryButtonBar;
  }

  mailLink(){
    window.open(`mailto:test@example.com?subject=video download link&body=${this.downloadUrl}`);

  }

}
