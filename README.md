# AudioSource

[![NPM](https://nodei.co/npm/audiosource.png?downloads=true)](https://npmjs.org/package/audiosource)

A simple utility to manage audio buffers.

## Usage

Initialize:

``` javascript
var AudioSource = require('audiosource');
var context = new AudioContext();
var FFT = require('audio-fft');
var ffts = [new FFT(...), new FFT(...)];

var src = new AudioSource({
  context: context, // this is just a standard web audio context REQUIRED
  url: 'path/to/audiofile.ogg', // OPTIONAL if you want to set your own webaudiobufferobject
  gainNode: context.createGain() // OPTIONAL
  nodes: ffts // OPTIONAL, must pass gainNode if using this option.
  buffer: webaudiobufferobject //OPTIONAL
});
```

*note* "ffts" refers to [this](https://github.com/meandavejustice/audio-fft)x

Load Audio:

``` javascript
var AudioSource = require('audiosource');
var context = new AudioContext();
var src = new AudioSource({
  context: context,
  url: 'path/to/audiofile.ogg'
});

src.load(null, function(err, src) { // optionally takes a url and callback
  if (err) console.error('ya goofed... ', err);
  src.play();
});
```
Playback:

``` javascript

src.load(null, function(err, src) {
  if (err) console.error('ya goofed... ', err);

  src.play(); // takes an optional time offset and starts playback

  src.pause(); // pause playback

  src.stop(); // stop playback

  src.seek(-5.2); // takes positive or negative float. Seeks in track.

  src.skip(10.13); // skips ahead OPTIONAL float argument DEFAULTS to 5 seconds.

  src.back(10.13); // skips behind OPTIONAL float argument DEFAULTS to -5 seconds.
});
```

Insight:

``` javascript

src.load(null, function(err, src) {
  if (err) console.error('ya goofed... ', err);

  src.play();

  src.time();

/*

returns Time object. Example:

{
  current: 2.048,
  remaining: 3.01975,
  percent: "40.41%",
  total: 5.06775
}

*/

});
```
AudioSource is also an [EventEmitter](https://iojs.org/api/events.html#events_class_events_eventemitter)

Available Events:
* play
* pause
* load
* stop
* pause
* skip
* back
* remove
* time

``` javascript

let src = new AudioSource({url: 'goth-easter_littlestar.mp3', context: context});
src.on('load', function(obj) {
  window.alert(JSON.stringify(obj));
})
src.load();
```

All events (with exception to error) emit the time object.

#LICENSE

The MIT License (MIT)

Copyright (c) 2015 Dave Justice

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
