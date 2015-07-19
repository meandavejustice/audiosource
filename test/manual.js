/*
 * Currently all testing for this module is done manually.
 *
 * In order to open the testing page run:
 * beefy test/manual.js
 *
 * */

var AudioContext = require('audiocontext');
var AudioSource = require('../index');
var FFT = require('audio-fft');

var play = document.createElement('button');
var pause = document.createElement('button');
var stop = document.createElement('button');
var skip = document.createElement('button');
var remove = document.createElement('button');
var fftCanvas = document.createElement('canvas');
fftCanvas.width = 300;
fftCanvas.height = 300;

play.innerText = 'play';
pause.innerText = 'pause';
stop.innerText = 'stop';
skip.innerText = 'skip';
remove.innerText = 'remove';

var context = new AudioContext();
var gain = context.createGain();
var fft = new FFT(context, {
  canvas: fftCanvas
});

var src = new AudioSource({
  context: context,
  onConnect: onConnect,
  url: 'test/real.mp3' // this will fail unless you put an audio file in this dir
});

function onConnect(src) {
  src.connect(fft.input);
  fft.connect(context.destination);
}

src.load(null, function(err, source) {
  console.log(source.buffer.duration);
  play.addEventListener('click', function() {
    src.play();
  });

  skip.addEventListener('click', function() {
    src.skip(2);
  });

  pause.addEventListener('click', function() {
    src.pause();
  });

  stop.addEventListener('click', function() {
    src.stop();
  });

  remove.addEventListener('click', function() {
    src.remove();
  });

  [play, skip, pause, stop, remove, fftCanvas].forEach(function(el) {document.body.appendChild(el)});
});
