import VideoService from './video-service';

export default class CanvasService {
  idElementCanvas = '';
  drawComplete = false;
  canvasParams = {};
  urlImgs = [];
  currentImageIndex = 0;
  triggerVideo = false;
  videoUrl = '';
  processCanvas = null;
  videoService = null;
  recordingId = false;
  canvasElement = null;
  enable3D = false;
  constructor() {
    this.urlImgs = [];
    this.recordingId = '';
    this.intervalID = 0;
    this.currentListener = '';
    this.videoService = new VideoService();
    this.videoService.clearRecorder();
  }
  getActiveType() {
    if (typeof this.canvas3d !== 'undefined' && this.canvas3d != null) {
      return "3d";
    }

    if (this.canvasElement != null) {
      return "2d";
    }

    return "";
  }
  is3DInitialized() {
    return typeof this.canvas3d !== 'undefined' && this.canvas3d != null;
  }
  is3DEnabled() {
    return (
      this.enable3D === true &&
      typeof this.canvas3d !== 'undefined' &&
      this.canvas3d != null
    );
  }
  destroy3D() {
    this.canvas3d = null;
  }
  clearRecorder() {
    if (this.videoService) {
      this.videoService.clearRecorder();
    }
  }
  getCanvasElement() {
    return document.getElementById(this.idElementCanvas);
  }
  toggleAutoRotate() {
    if (this.is3DEnabled()) {
      this.canvas3d.toggleAutoRotate();
    }
    return true;
  }
  toggleZoomIn() {
    if (this.is3DEnabled()) {
      return this.canvas3d.toggleZoomIn();
    }
    return true;
  }
  toggleVideo(f, id) {
    this.videoService.idElementCanvas = this.idElementCanvas;
    if (this.is3DEnabled()) {
      return this.canvas3d.toggleRecorder(f, id);
    }

    if (this.isRecorderActive()) {
      this.recordingId = '';
      // stop
      if (this.urlImgs.length > 0) {
        this.createVideoFromImgs(20, false);
      }
    } else {
      // start
      this.urlImgs = [];
      this.initRecord(f, id);
    }
    return true;
  }
  initRecord(f, id) {
    // start
    this.recordingId = id;
    this.videoService.currentListener = `videoReady${id}`;
    this.videoService.setVideoListener(f, id);
  }
  toggleRecorder(f, id) {
    this.videoService.idElementCanvas = this.idElementCanvas;
    if (this.isRecorderActive()) {
      // stop
      this.recordingId = '';
      this.videoService.snapShot(true);
    } else {
      // start
      this.recordingId = id;
      this.videoService.currentListener = `videoReady${id}`;
      this.videoService.setVideoListener(f, id);
      this.videoService.startNewRecorder();
    }
    return true;
  }
  setVideoListener(f, id) {
    if (this.is3DEnabled()) {
      return this.canvas3d.videoService.setVideoListener(f, id);
    }
    return this.videoService.setVideoListener(f, id);
  }
  isRecorderActive() {
    if (this.is3DEnabled()) {
      return this.canvas3d.recordingId;
    }
    return this.recordingId != '';
  }
  snapShot(triggerVideo) {
    if (this.is3DEnabled()) {
      return this.canvas3d.videoService.snapShot(triggerVideo);
    }
    return this.videoService.snapShot(triggerVideo);
  }
  createVideoFromImgs(fps, reverse) {
    if (this.urlImgs.length == 0) {
      return false;
    }
    this.videoService.idElementCanvas = this.idElementCanvas;
    this.stopVideoFromImgs();
    this.currentImageIndex = reverse === true ? this.urlImgs.length - 1 : 0;
    const ms = (1 / fps) * 1000;

    //this.videoService.sendRecordingEvent();
    this.intervalID = setInterval(() => {
      this.createVideoFrame(reverse, this.urlImgs);
    }, ms); // 90 ms => 60 000 / 90 =
    return true;
  }
  createVideoFrame(reverse, urlImgs) {
    if (urlImgs && urlImgs.length > 0) {
      if (this.videoService.setCurrentRecorder() === false) {
        this.stopVideoFromImgs();
        return false;
      }

      //this.downloadImgUrl("img-"+this.currentImageIndex, this.urlImgs[this.currentImageIndex], "jpg")

      if (!this.drawFromImgUrl(this.currentImageIndex)) {
        return false;
      }

      if (
        (reverse === true && this.currentImageIndex === 0) ||
        (reverse === false && this.currentImageIndex >= urlImgs.length - 1)
      ) {
        // end video
        this.videoService.snapShot(true);
        this.stopVideoFromImgs();


        return false;
      }

      if (reverse === true) {
        this.currentImageIndex--;
      } else {
        this.currentImageIndex++;
      }
      // continue
      return true;
    }

    // end
    this.stopVideoFromImgs();
    return false;
  }
  stopVideoFromImgs() {
    if (this.intervalID > 0) {
      clearInterval(this.intervalID);
      this.intervalID = 0;
    }
  }
}
