const xhr = require('xhr');

module.exports = class Audiosource {
  constructor(options) {
    this.srcUrl = options.src;

    this.providedContext = Boolean(options.context);
    this.context = options.context || new AudioContext();
    this.source = this.context.createBufferSource();
    this.gainNode = this.context.createGain();
    this.gainNode.gain.value = options.volume || 0.5;
    this.analyser = this.context.createAnalyser();

    this.playing = false;
    this.secondsAtLastPause = 0;
    this.diffSecondsAtLastPause = 0;
    this.contextTimeAtLastPlay = 0;

    if (options.onLoad) this.load(options.onLoad);
  }

  get src() {
    return this.srcUrl;
  }

  set src(src) {
    this.srcUrl = src;
    this.load();
  }

  get buffer() {
    return this.audioBuffer;
  }

  set buffer(buffer) {
    this.source.buffer = this.audioBuffer = buffer;
  }

  get currentTime() {
    if (this.playing) {
      return this.context.currentTime - this.contextTimeAtLastPlay + this.secondsAtLastPause;
    } else return this.secondsAtLastPause;
  }

  set currentTime(t) {
    if (this.playing) this.play(t);
    else this.secondsAtLastPause = t;
  }

  get volume() {
    return this.gainNode.gain.value;
  }

  set volume(v) {
    this.gainNode.gain.value = v;
  }

  get duration() {
    return this.audioBuffer ? this.audioBuffer.duration : 0;
  }

  _createFreshBufferSource() {
    this.source = this.context.createBufferSource();
    this.source.buffer = this.audioBuffer;
  }

  _connectGraph() {
    this.source.connect(this.analyser);
    this.source.connect(this.gainNode);
    this.gainNode.connect(this.context.destination);
  }

  load(cb) {
    xhr({
      uri: this.srcUrl,
      responseType: 'arraybuffer'
    }, (err, resp, body) => {
      this.context.decodeAudioData(body, (buffer) => {
        this.audioBuffer = buffer;
        this.loaded = true;
        if (this.autoplay) this.play();
        if (cb) cb();
      });
    });
  }

  play(seconds) {
    if (this.playing) this.pause();
    this.contextTimeAtLastPlay = this.context.currentTime;
    this._createFreshBufferSource();
    this._connectGraph();

    if (seconds) {
      this.secondsAtLastPause = seconds;
      // TODO: I think that is 0
      this.diffSecondsAtLastPause = this.context.currentTime - this.contextTimeAtLastPlay;
    }
    this.source.start(0, this.secondsAtLastPause);
    this.playing = true;
  }

  pause() {
    if (this.playing) this.source.stop(this.context.currentTime);
    this.diffSecondsAtLastPause = this.context.currentTime - this.contextTimeAtLastPlay;
    this.secondsAtLastPause = this.currentTime;
    this.playing = false;
  }

  remove() {
    this.pause();
    if (this.providedContext) this.context.close();
    this.source.disconnect(this.analyser);
    this.source.disconnect(this.gainNode);
    this.gainNode.disconnect();
    // clean up
    this.contextTimeAtLastPlay = 0;
    this.secondsAtLastPause = 0;
    this.diffSecondsAtLastPause = 0;
  }

  /*
   * AnalyserNode convenience methods
   */
  getByteFrequencyData(data) {
    return this.analyser.getByteFrequencyData(data);
  }

  getByteTimeDomainData(data) {
    return this.analyser.getByteTimeDomainData(data);
  }

  getFloatFrequencyData(data) {
    return this.analyser.getFloatFrequencyData(data);
  }

  getFloatTimeDomainData(data) {
    return this.analyser.getFloatTimeDomainData(data);
  }
}
