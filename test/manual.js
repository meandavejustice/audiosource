/*
 * Currently all testing for this module is done manually.
 *
 * In order to open the testing page run:
 * beefy test/manual.js -- -t babelify
 *
 * */

import AudioContext from 'audiocontext';
import AudioSource from '../es6/index.js';

var play = document.createElement('button');
var pause = document.createElement('button');
var stop = document.createElement('button');
var skip = document.createElement('button');
var remove = document.createElement('button');

play.innerText = 'play';
pause.innerText = 'pause';
stop.innerText = 'stop';
skip.innerText = 'skip';
remove.innerText = 'remove';

let context = new AudioContext();

let src = new AudioSource({
  context: context,
  url: 'test/real.mp3' // this will fail unless you put an audio file in this dir
});

src.on('time', function(time) {console.log(time)});

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

  [play, skip, pause, stop, remove].forEach(el => {document.body.appendChild(el)});
});
