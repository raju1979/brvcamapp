import { Component,ViewChild, ElementRef } from '@angular/core';
import {  NavController, NavParams } from 'ionic-angular';

@Component({
  selector: 'page-video-player',
  templateUrl: 'video-player.html',
})
export class VideoPlayerPage {

  @ViewChild('myvideo') myVide: ElementRef;
  videoUrl:string;

  constructor(public navCtrl: NavController, public navParams: NavParams) {

    this.videoUrl = this.navParams.get('videoUrl');
    console.log(this.videoUrl);

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad VideoPlayerPage');
    let video = this.myVide.nativeElement;
    video.src = this.videoUrl;
    video.play();
  }

}
