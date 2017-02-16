# AudioSource

[![NPM](https://nodei.co/npm/audiosource.png?downloads=true)](https://npmjs.org/package/audiosource)

A simple utility to manage audio playback.

The goal of AudioSource is to provide a simple interface to managing
playback of audio source nodes. This includes tracking playback times,
pause, resume, stop, and seeking. We also provide an analysernode and
make loading sounds more convenient.

## Usage

### Initialize:

``` javascript
const AudioSource = require('audiosource');
const waveform = require('gl-waveform');

const aa = new AudioSource({
  // Path/url to load audio from _REQUIRED_
  src: 'path/to/audiofile',

  // function to call when sound has been loaded initially _required_
  onInitialLoad: () => {aa.play()}

  // this is just a standard web audio context, we will create one if
  // not provided _optional_
  context: context,

  // webaudio buffer _optional_
  buffer: webaudiobufferobject,

  // volume, defaults to 0.5 _optional_
  volume: 0.75
});

```

### Attributes:

* `context`: AudioContext
* `source`: AudioBufferSourceNode
* `gainNode`: GainNode
* `analyser`: AnalyserNode
* `playing`: Boolean value
* `src`: path or url where sound was loaded from
* `buffer`: AudioBuffer
* `currentTime`: current playback time in seconds
* `volume`: value passed to gainNode
* `duration`: duration of loaded audio _read only_

### Methods:

* `play`: start playback
* `pause`: pause playback
* `load`: load new sound (accepts cb argument)
* `remove`: useful for cleaning up
* `getByteFrequencyData`: convenience method from analysernode 
* `getByteTimeDomainData`: convenience method from analysernode
* `getFloatFrequencyData`: convenience method from analysernode
* `getFloatTimeDomainData`: convenience method from analysernode


# LICENSE

The MIT License (MIT)

Copyright (c) 2017 Dave Justice

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
