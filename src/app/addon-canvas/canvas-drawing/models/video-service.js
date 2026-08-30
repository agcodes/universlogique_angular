export default class VideoService {
  stream = null;
  chunks = [];
  mediaRecorder = null;
  currentImageIndex = 0;
  currentListener = '';
  constructor() {
    this.eventVideoReadyTarget = new EventTarget();
  }
  clearRecorder() {
    if (this.mediaRecorder) {
      this.mediaRecorder.stop();
    }
    this.mediaRecorder = null;
    this.chunks = [];
    this.triggerVideo = false;
    this.videoUrl = '';
    this.currentListener = '';
    this.currentImageIndex = 0;
    this.eventVideoReadyTarget = new EventTarget();
    this.revokeUrl();
  }
  triggerVideoEvent(data) {
    if (this.currentListener) {
      this.eventVideoReadyTarget.dispatchEvent(
        new CustomEvent(this.currentListener, {
          detail: data,
        }),
      );
    }
  }
  sendRecordingEvent() {}
  setVideoListener(f, id) {
    this.currentListener = `videoReady${id}`;
    this.eventVideoReadyTarget.addEventListener(this.currentListener, f);
  }
  snapShot(triggerVideo) {
    if (this.mediaRecorder) {
      if (triggerVideo === true) {
        this.triggerVideo = true;
      }
      this.mediaRecorder.requestData();
      return true;
    }
    return false;
  }
  getCanvasElement() {
    return document.getElementById(this.idElementCanvas);
  }
  setCurrentRecorder() {
    if (this.mediaRecorder === null) {
      return this.startNewRecorder();
    }
    return true;
  }
  startNewRecorder() {
    try {
      if (this.mediaRecorder) {
        this.mediaRecorder.stop();
        this.mediaRecorder = null;
        this.triggerVideo = false;
        this.chunks = [];
      }

      const stream = this.getCanvasElement().captureStream();
      if (typeof stream == "undefined" || stream == null) {
        return false;
      }

      this.triggerVideoEvent({
        videoUrl: '',
        info: '...',
      });

      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm',
        videoBitsPerSecond: 100000000, // Set desired bitrate (e.g., 10 Mbps)
      });

      if (typeof this.mediaRecorder == "undefined" || this.mediaRecorder == null) {
        return false;
      }

      this.mediaRecorder.ondataavailable = (event) => {
        if (this.mediaRecorder && event.data.size > 0) {
          this.triggerVideoEvent({
            videoUrl: '',
            info: '...',
          });

          this.chunks.push(event.data);
          if (this.triggerVideo === true) {
            this.createVideo(this.idElementCanvas);
          }
        }
      };

      this.mediaRecorder.start();

      return this.mediaRecorder !== null;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
  createVideo() {
    this.videoUrl = '';
    if (this.chunks.length > 0) {
      // create video from snapshots
      const blob = new Blob(this.chunks, {
        type: 'video/webm',
      });

      if (blob) {
        this.videoUrl = URL.createObjectURL(blob);

        // clear
        this.chunks = [];

        if (this.mediaRecorder) {
          // stop and free
          this.mediaRecorder.stop();
          this.mediaRecorder = null;
        }

        if (this.videoUrl) {
          this.triggerVideoEvent({
            videoUrl: this.videoUrl,
            info: 'ready',
          });
        }
      }
    }
  }
  loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load script ${src}`));
      document.head.appendChild(script);
    });
  }
  revokeUrl() {
    if (this.videoUrl) {
      URL.revokeObjectURL(this.videoUrl);
    }
  }
}
