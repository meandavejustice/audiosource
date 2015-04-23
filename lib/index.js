'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _EventEmitter2 = require('events');

var _EventEmitter3 = _interopRequireWildcard(_EventEmitter2);

var _xhr = require('xhr');

var _xhr2 = _interopRequireWildcard(_xhr);

var AudioSource = (function (_EventEmitter) {
  function AudioSource(opts) {
    _classCallCheck(this, AudioSource);

    if (!opts.context) throw new Error('You must pass an audio context to use this module');
    _get(Object.getPrototypeOf(AudioSource.prototype), 'constructor', this).call(this);
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

  _inherits(AudioSource, _EventEmitter);

  _createClass(AudioSource, [{
    key: 'load',
    value: function load(url, cb) {
      if (typeof url === 'function') cb = url;else if (url) this.url = url;

      if (!this.url) throw new Error('You must pass a url or have instantiated the class with the url option to call "AudioSource.load"');
      if (!this.listeners('load').length && !cb) console.warn('No callback passed to Load method, nor listener set up for "load" event.');
      this._req(cb);
    }
  }, {
    key: 'disconnect',
    value: function disconnect() {
      if (this.source) this.source.disconnect(this.context.destination);
    }
  }, {
    key: '_setup',
    value: function _setup(buffer) {
      var _this = this;

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
        this.nodes.forEach(function (node) {
          _this.gainNode.connect(node.input);
        });

        this.gainNode.connect(this.context.destination);

        // hook up analyser nodes
        this.nodes.forEach(function (node) {
          if (node.hasOwnProperty('fftSize')) node.connect(context.destination);
        });
      } else this.source.connect(this.context.destination);
    }
  }, {
    key: '_fail',
    value: function _fail(err) {
      this.emit('error', err);
      if (this._mycb) this._mycb(err);
    }
  }, {
    key: '_req',
    value: function _req(cb) {
      var _this2 = this;

      this._mycb = cb;
      _xhr2['default']({
        uri: this.url,
        responseType: 'arraybuffer'
      }, (function (err, resp, body) {
        if (err) _this2._fail(err);
        _this2.context.decodeAudioData(body, (function (buffer) {
          this.buffer = buffer;
          this.emit('load', this.time());
          if (this._mycb) this._mycb(null, this);
        }).bind(_this2), _this2._fail.bind(_this2));
      }).bind(this));
    }
  }, {
    key: 'play',
    value: function play(offset) {
      this.lastPlay = this.context.currentTime;
      if (!offset) offset = this.startOffset;

      if (!this._init) this._stop();else this._init = false;

      this._setup(this.buffer); // get a fresh buffer
      this.source.start(0, offset);
      this.playing = true;
      this.interval = setInterval(this._broadcastTime.bind(this), 0);
      this.emit('play', this.time());
    }
  }, {
    key: '_stop',
    value: function _stop() {
      this.source.stop(this.context.currentTime);
      this.playing = false;
      this.interval = clearInterval(this.interval);
    }
  }, {
    key: 'stop',
    value: function stop() {
      this.startOffset = 0;
      this.lastPlay = 0;
      this._stop();
      this.emit('stop', this.time());
    }
  }, {
    key: 'seek',
    value: function seek(time) {
      if (time) skip(time);else back(time);
    }
  }, {
    key: 'skip',
    value: function skip(time) {
      if (!time) time = 5;
      this.lastPlay = this.lastPlay + time;
      this.pause();
      this.emit('skip', this.time(), time);
    }
  }, {
    key: 'back',
    value: function back(time) {
      if (!time) time = -5;
      this.lastPlay = this.lastPlay + time;
      this.pause();
      this.emit('back', this.time(), time);
    }
  }, {
    key: 'pause',
    value: function pause() {
      this._stop();
      this.startOffset += this.context.currentTime - this.lastPlay;
      this.emit('pause', this.time());
    }
  }, {
    key: 'remove',
    value: function remove() {
      this.disconnect();
      this.emit('remove', this.time());
      this.removeAllListeners();
    }
  }, {
    key: 'time',
    value: function time() {
      var cur = this.context.currentTime - this.lastPlay + this.startOffset;
      return {
        current: cur,
        remaining: this.buffer.duration - cur,
        percent: (cur / this.buffer.duration * 100).toFixed(2) + '%',
        total: this.buffer.duration
      };
    }
  }, {
    key: '_broadcastTime',
    value: function _broadcastTime() {
      var time = this.time();
      if (time.current > time.total) this.stop();else this.emit('time', time);
    }
  }]);

  return AudioSource;
})(_EventEmitter3['default']);

exports['default'] = AudioSource;
module.exports = exports['default'];