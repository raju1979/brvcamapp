import { Component, ViewChild, ElementRef, NgZone } from '@angular/core';
import { NavController, NavParams, normalizeURL } from 'ionic-angular';

import { File } from '@ionic-native/file';
import { MediaCapture, MediaFile, CaptureError, CaptureImageOptions } from '@ionic-native/media-capture';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { FTP } from '@ionic-native/ftp';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';

import { VideoEditor } from '@ionic-native/video-editor';
import { Platform } from 'ionic-angular/platform/platform';

declare var cordova: any;
declare var window: any;
declare var VideoEditorOptions: any;

@Component({
  selector: 'page-list',
  templateUrl: 'list.html'
})
export class ListPage {

  @ViewChild('myvideo') myVide: ElementRef;

  ftpUser: string = "rajesh@hybridappwala.com";
  ftpServer: string = "ftp.hybridappwala.com";
  ftpPass: string = '2180450a@';
  ftpPort: number = 21;
  ftpConnected: boolean = false;

  // limit capture operation to 3 video clips
  options = { limit: 1, duration: 5 };
  videoUrl: string = '';
  fs: string;

  totalCompressed: number = 0;
  maximumCompressed: number = 100;
  compressedFileUrl: string = '';

  fileTransfer: FileTransferObject;

  videoFileoptions: FileUploadOptions = {
    fileKey: 'ionicfile',
    fileName: 'ionicfile',
    chunkedMode: false,
    mimeType: "video/mp4",
    headers: {}
  }


  constructor(private mediaCapture: MediaCapture, private _file: File, private _camera: Camera, private videoEditor: VideoEditor, private _platform: Platform, private zone: NgZone, private fTP: FTP, private transfer: FileTransfer, private file: File) {
    if (this._platform.is('mobile')) {
      this.fs = cordova.file.externalRootDirectory;

      this.fileTransfer = this.transfer.create();
      console.log(this.fs);
    }
  };

  ionViewDidLoad() {
    // let graphInterval = setInterval(() => {
    //   this.totalCompressed++;
    //   if(this.totalCompressed == 100){
    //     clearInterval(graphInterval)
    //   }
    // },100)
    if (this._platform.is('mobile')) {
      this.fTP.connect(this.ftpServer, this.ftpUser, this.ftpPass)
        .then((res: any) => {
          console.log('connected to ftp');
          this.ftpConnected = true;
        })
        .catch((error: any) => console.error(error));
    }
  }

  videoFromCamera() {
    this.totalCompressed = 0;

    this.mediaCapture.captureVideo(this.options)
      .then(
      (data: MediaFile[]) => {
        let tempUrl = data[0].fullPath;
        this.videoUrl = normalizeURL(tempUrl);
        console.log(this.videoUrl)
        this.compressVideo(this.videoUrl);
      },
      (err: CaptureError) => console.error(err)
      );

  }

  VideoFromGallery() {
    this.totalCompressed = 0;
    let video = this.myVide.nativeElement;
    var options: CameraOptions = {
      sourceType: 2,
      mediaType: 1
    };

    this._camera.getPicture(options).then((data) => {
      console.log(data);
      video.src = data;
      video.play();
      let correctUrl = "file://" + data;
      this.compressVideo(correctUrl);
    })
  };//

  compressVideo(correctUrl) {

    this.videoEditor.transcodeVideo({
      fileUri: correctUrl,
      outputFileName: `output${Date.now()}.mp4`,
      outputFileType: VideoEditorOptions.OutputFileType.MPEG4,
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
        this.fTP.upload(this.compressedFileUrl, 'dd.mp4').finally(() => {
          console.log('done')
        })

      })
      .catch((error: any) => console.log('video transcode error', error));

  }

  uploadVideo() {
    let options: any = {};
    options.fileKey = "fileUpload";
    options.fileName = this.compressedFileUrl.substr(this.compressedFileUrl.lastIndexOf('/') + 1);
    options.mimeType = "image/jpeg";
    options.httpMethod = "POST";
    options.chunkedMode = false;
    console.log('uploading' + this.compressedFileUrl)
    // Upload a file:
    this.fileTransfer.upload(this.compressedFileUrl, "https://hybridappwala.com/rajesh/upload.php", options)
      .then((data) => {
        console.log(data);
        console.log('success upload')
      })
      .catch((err) => {
        console.log(err)
      });
    // let localFileName = this.compressedFileUrl;
    // // First of all, connect to ftp server address without protocol prefix. e.g. "192.168.1.1:21", "ftp.xfally.github.io" (default port 21 will be used if not set).
    // window.cordova.plugin.ftp.connect(this.ftpServer, this.ftpUser, this.ftpPass, function(ok) {
    //   console.info("ftp: connect ok=" + ok);

    //   // You can do any ftp actions from now on...
    //       window.cordova.plugin.ftp.upload(localFileName, '/rajesh/aa.mp4', function(percent) {
    //           if (percent == 1) {
    //               console.info("ftp: upload finish");
    //           } else {
    //               console.debug("ftp: upload percent=" + percent * 100 + "%");
    //           }
    //       }, function(error) {
    //           console.error("ftp: upload error=" + error);
    //       });

    //   }, function(error) {
    //       console.error("ftp: connect error=" + error);
    //   });

  }


}
