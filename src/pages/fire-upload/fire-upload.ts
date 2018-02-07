import { Component, ViewChild, ElementRef, NgZone } from '@angular/core';
import { NavController, NavParams, normalizeURL } from 'ionic-angular';

import { File } from '@ionic-native/file';
import { MediaCapture, MediaFile, CaptureError, CaptureImageOptions } from '@ionic-native/media-capture';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { FTP } from '@ionic-native/ftp';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';

import { VideoEditor } from '@ionic-native/video-editor';
import { Platform } from 'ionic-angular/platform/platform';
import { FileChooser } from '@ionic-native/file-chooser';

import firebase from 'firebase';

declare var cordova: any;
declare var window: any;
declare var VideoEditorOptions: any;

@Component({
  selector: 'fire-upload',
  templateUrl: 'fire-upload.html'
})
export class FireUploadPage {

  @ViewChild('myvideo') myVide: ElementRef;

  uploadProgress:number = 0;
  uploadSuccefull:boolean = false;
  downloadUrl:string;

  fs:any;
  videoBaseUrl:string;
  fileTransfer:any;

  downloadedPercentage:number = 0;

  constructor(private mediaCapture: MediaCapture, private _file: File, private _camera: Camera, private videoEditor: VideoEditor, private _platform: Platform, private zone: NgZone, private fTP: FTP, private transfer: FileTransfer, private file: File, private _fileChooser: FileChooser) {

    if (this._platform.is('ios')) {
      this.fs = cordova.file.documentsDirectory;
    }
    else if (this._platform.is('android')) {
      this.fs = cordova.file.externalRootDirectory;
    }

  };

  ionViewDidLoad() {

    if (this._platform.is("mobile")) {
      this.fileTransfer =  this.transfer.create();
      if (this._platform.is("android")) {
        this.videoBaseUrl = this.fs +  "/brvapp/";
      } else if (this._platform.is("ios")) {
        let baseStr: string = this.fs;
        baseStr = baseStr.replace("file://", '');
        this.videoBaseUrl = baseStr +  "/brvapp/";
      }

    }

  };//

  videoFromCamera() {


  }

  // VideoFromGallery(){
  //   this._fileChooser.open()
  //     .then((uri) => {
  //       console.log(uri)
  //       this.file.resolveLocalFilesystemUrl(uri)
  //         .then((newUrl) => {
  //           console.log(newUrl);
  //           let dirPath = newUrl.nativeURL;
  //           let dirPathSegments = dirPath.split('/');
  //           dirPathSegments.pop();
  //           dirPath = dirPathSegments.join('/');

  //           this._file.readAsArrayBuffer(dirPath,newUrl.name)
  //             .then(async (buffer) => {
  //               await this.upload(buffer,newUrl.name);
  //             })

  //         })
  //     })
  // };//

  VideoFromGallery() {

    var options: CameraOptions = {
      sourceType: 2,
      mediaType: 1
    };

    this._camera.getPicture(options).then((data) => {
      console.log(data);
      // video.src = data;
      // video.play();
      let correctUrl = "file://" + data;
      let dirPath = correctUrl;
      let dirPathSegments = dirPath.split('/');
      let fileName = dirPathSegments.pop();
      dirPath = dirPathSegments.join('/');
      console.log(dirPath, fileName);
      this._file.readAsArrayBuffer(dirPath, fileName)
        .then(async (buffer) => {
          await this.upload(buffer,fileName);
        })
    })
  };//

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


  }

  compressVideo(correctUrl) {


  }

  downloadVideo() {

    let url = this.downloadUrl;

    this.fileTransfer.download(url, this.videoBaseUrl + "/" + 'vv.mp4').then((entry: any) => {
        console.log('success' + entry.toURL());
        let tempVideoUrl = entry.toURL();
        let baseStr = tempVideoUrl.replace("file://",'');
        let video = this.myVide.nativeElement;
        video.src = baseStr;
        video.play();
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

  }


}
