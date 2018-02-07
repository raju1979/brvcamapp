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
import {AngularFireStorage,AngularFireUploadTask} from 'angularfire2/storage';
import { Observable } from 'rxjs/Observable';

declare var cordova: any;
declare var window: any;
declare var VideoEditorOptions: any;


@Component({
  selector: 'page-fire-upload2',
  templateUrl: 'fire-upload2.html',
})
export class FireUpload2Page {

  task:AngularFireUploadTask;
  percentage:Observable<number>
  downloadUrl:Observable<string>;

  snapshot:any;

  constructor(private mediaCapture: MediaCapture, private _file: File, private _camera: Camera, private videoEditor: VideoEditor, private _platform: Platform, private zone: NgZone, private fTP: FTP, private transfer: FileTransfer, private file: File, private _fileChooser: FileChooser,private _storage:AngularFireStorage) {

  };

  ionViewDidLoad() {

    if (this._platform.is('mobile')) {

    }
  }

  videoFromCamera() {


  }


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

    movieRef.put(blob)
      .then((d) => {
        console.log('done')
        console.log(d);
      })
      .catch((err) => {
        console.log(err)
      })
  }

  compressVideo(correctUrl) {


  }

  uploadVideo() {

  }

  startUpload(file){
    const path = `mp4/vid_${new Date().getTime()}`;
    const customMeataData = { type: "video/mp4" };

    this.task = this._storage.upload(path,file);

    this.percentage = this.task.percentageChanges();
    this.snapshot = this.task.snapshotChanges();

    this.downloadUrl = this.task.downloadURL()


  }

  isActive(snapshot:any){
    return snapshot.state === 'running' && (snapshot.bytesTransferred < snapshot.totalBytes);
  }

}
