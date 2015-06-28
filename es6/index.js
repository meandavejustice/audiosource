import EventEmitter from 'events';
import raf from 'raf';
import xhr from 'xhr';
import fs from 'fs';
import path from 'path';

export default class AudioSource extends EventEmitter {
  constructor(opts) {
    if (!opts.context) throw new Error('You must pass an audio context to use this module');
    super();
    this.context = opts.context;
    this.url = opts.url ? opts.url : undefined;
    this.nodes = opts.nodes ? opts.nodes : [];
    this.gainNode = opts.gainNode ? opts.gainNode : undefined;

    if (this.nodes.length && !this.gainNode) throw new Error('Must pass gainNode in options with node array');
    this.buffer = undefined;
    this._mycb = undefined;
    this.startOffset = 0;
    this._init = true; // switch for initial play
  }

  _toArrayBuffer(buffer) {
    var ab = new ArrayBuffer(buffer.length);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buffer.length; ++i) {
      view[i] = buffer[i];
    }
    return ab;
  }

  load(url, cb, isFile) {
    if (typeof url === 'function') cb = url;
    else if (url) this.url = url;

    if (!this.url) throw new Error('You must pass a url or have instantiated the class with the url option to call "AudioSource.load"');
    if (!this.listeners('load').length && !cb) console.warn('No callback passed to Load method, nor listener set up for "load" event.');
    this._req(cb);
  }

  read(filepath, cb) {
    if (typeof filepath == 'function') cb = filepath;
    else this.url = filepath;
    if (cb) this._mycb = cb;
    fs.readFile(path.resolve(filepath), function(err, buffer) {
     if (err) this._fail(err);
     this.context.decodeAudioData(this._toArrayBuffer(buffer), function(buffer) {
        this.buffer = buffer;
        this.emit('load', this.time());
        if (this._mycb) this._mycb(null, this);
      }.bind(this), this._fail.bind(this));
    }.bind(this))
  }

  disconnect() {
    if (this.source) this.source.disconnect(this.context.destination);
  }

  _setup(buffer) {
    this.disconnect();
    this.source = this.context.createBufferSource();
    this.source.buffer = this.buffer;

    if (this.gainNode) {
      /*
       * Really don't like having to do this everytime
       * we get a fresh buffer on playback, but it seems
       * that this is the only option until the web audio
       * spec is updated. :'(
       * */
      this.source.connect(this.gainNode);
      this.nodes.forEach(node => {
        this.gainNode.connect(node.input);
      });

      this.gainNode.connect(this.context.destination);

      // hook up analyser nodes
      this.nodes.forEach(node => {
        if (node.input.hasOwnProperty('fftSize')) node.connect(this.context.destination);
      });
    } else this.source.connect(this.context.destination);
  }

  _fail(err) {
    /*
     * This error handling needs improvement, for sure.
     * */
    if (this.listeners('error').length) this.emit('error', err);
    else if (this._mycb) this._mycb(new Error(err));
    else throw new Error('No error handling?: ', err);
  }

  _req(cb) {
    this._mycb = cb;
    xhr({
      uri: this.url,
      responseType: 'arraybuffer'
    }, (err, resp, body) => {
      if (err) {
        err = null;
        this.read(this.url, cb);
      }
      else {
        this.context.decodeAudioData(body, function(buffer) {
          this.buffer = buffer;
          this.emit('load', this.time());
          if (this._mycb) this._mycb(null, this);
        }.bind(this), this._fail.bind(this));
      }
    }.bind(this));
  }

  play(offset) {
    this.lastPlay = this.context.currentTime;
    if (!offset) offset = this.startOffset;

    if (!this._init) this._stop();
    else this._init = false;

    this._setup(this.buffer); // get a fresh buffer
    this.source.start(0, offset);
    this.playing = true;
    this.interval = raf(this._broadcastTime.bind(this));
    this.emit('play', this.time());
  }

  _stop() {
    this.source.stop(this.context.currentTime);
    this.playing = false;
    this.interval = raf.cancel(this.interval);
  }

  stop() {
    this.startOffset = 0;
    this.lastPlay = 0;
    this._stop();
    this.emit('stop', this.time());
  }

  seek(time) {
    if (time) skip(time);
    else back(time);
  }

  skip(time) {
    if (!time) time = 5;
    this.lastPlay = this.lastPlay + time;
    this.pause();
    this.emit('skip', this.time(), time);
  }

  back(time) {
    if (!time) time = -5;
    this.lastPlay = this.lastPlay + time;
    this.pause();
    this.emit('back', this.time(), time);
  }

  pause() {
    this._stop();
    this.startOffset += this.context.currentTime - this.lastPlay;
    this.emit('pause', this.time());
  }

  remove() {
    this.disconnect();
    this.emit('remove', this.time());
    this.removeAllListeners();
  }

  time() {
    let cur = this.context.currentTime - this.lastPlay + this.startOffset;
    return {
      current: cur,
      remaining: this.buffer.duration - cur,
      percent: (cur / this.buffer.duration * 100).toFixed(2) + '%',
      total: this.buffer.duration
    };
  }

  _broadcastTime() {
    let time = this.time();
    if (time.current > time.total) this.stop();
    else {
      this.emit('time', time);
      raf(this._broadcastTime.bind(this));
    }
  }
}
