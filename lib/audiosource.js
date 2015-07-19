var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');
var raf = require('raf');
var xhr = require('xhr');

inherits(AudioSource, EventEmitter);

function AudioSource(opts) {
  EventEmitter.call(this);
  if (!opts.context) throw new Error('You must pass an audio context to use this module');
  this.context = opts.context;
  this.url = opts.url ? opts.url : undefined;
  this.buffer = undefined;
  this.startOffset = 0;
  this.autoplay = opts.autoplay || false;
  this._init = true; // switch for initial play
  this.onConnect = opts.onConnect || false;
}

AudioSource.prototype.load = function(url, cb) {
  if (typeof url === 'function') cb = url;
  else if (url) this.url = url;

  if (!this.url) throw new Error('You must pass a url or have instantiated the class with the url option to call "AudioSource.load"');
  if (this._events['load'] && !cb) console.warn('No callback passed to Load method, nor listener set up for "load" event.');
  this._req(cb);
};

AudioSource.prototype._setup = function() {
  this.disconnect();
  this.source = this.context.createBufferSource();
  this.source.buffer = this.buffer;

  if (this.onConnect) {
    this.onConnect(this);
  } else this.source.connect(this.context.destination);
};

AudioSource.prototype.disconnect = function() {if (this.source) this.source.disconnect(this.context.destination);};

AudioSource.prototype.connect = function(node) {
  if (this.source) this.source.connect(node);
  else console.warn('source not loaded, cannot connect yet');
};

AudioSource.prototype._req = function(cb) {
  this._mycb = cb;
  xhr({
    uri: this.url,
    responseType: 'arraybuffer'
  }, function(err, resp, body) {
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
};

AudioSource.prototype._fail = function(err) {
  /*
   * This error handling needs improvement, for sure.
   * */
  if (this.listeners['error'].length) this.emit('error', err);
  else if (this._mycb) this._mycb(new Error(err));
  else throw new Error('No error handling?: ', err);
};

AudioSource.prototype.play = function(offset) {
  this.lastPlay = this.context.currentTime;
  if (!offset) offset = this.startOffset;
  else this.startOffset = offset;

  if (!this._init) this._stop();
  else this._init = false;

  this._setup(this.buffer); // get a fresh buffer
  this.source.start(0, offset);
  this.playing = true;
  if (this.interval) this.interval = raf.cancel(this.interval);
  this.interval = raf(this._broadcastTime.bind(this));
  this.emit('play', this.time());
};

AudioSource.prototype._stop = function() {
  this.source.stop(this.context.currentTime);
  this.playing = false;
  this.interval = raf.cancel(this.interval);
};

AudioSource.prototype.stop = function() {
  this.startOffset = 0;
  this.lastPlay = 0;
  this.emit('stop', this.time());
  this._stop();
};

AudioSource.prototype.seek = function(time) {
  if (time) this.skip(time);
  else this.back(time);
};

AudioSource.prototype.skip = function(time) {
  if (!time) time = 5;
  this.lastPlay = this.lastPlay + time;
  this.pause();
  this.emit('skip', this.time(), time);
};

AudioSource.prototype.back = function(time) {
  if (!time) time = -5;
  this.lastPlay = this.lastPlay + time;
  this.pause();
  this.emit('back', this.time(), time);
};

AudioSource.prototype.pause = function() {
  this._stop();
  this.startOffset += this.context.currentTime - this.lastPlay;
  this.emit('pause', this.time());
};

AudioSource.prototype.remove = function() {
  this.disconnect();
  this.emit('remove', this.time());
  this.removeAllListeners();
};

AudioSource.prototype.time = function() {
  var cur = this.context.currentTime - this.lastPlay + this.startOffset;
  return {
    current: cur,
    remaining: this.buffer.duration - cur,
    percent: (cur / this.buffer.duration * 100).toFixed(2) + '%',
    total: this.buffer.duration
  };
};

AudioSource.prototype._broadcastTime = function() {
  var time = this.time();
  if (time.current > time.total) this.stop();
  else {
    this.emit('time', time);
    this.interval = raf(this._broadcastTime.bind(this));
  }
};

module.exports = AudioSource;
