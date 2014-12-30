# AudioSource

[![NPM](https://nodei.co/npm/audiosource.png?downloads=true)](https://npmjs.org/package/audiosource)

A simple utility to manage audio buffers.

The api for this is still rapidly changing as I make adjustments to [meta-staseis](https://github.com/meandavejustice/metastaseis) and [sequencer](https://github.com/meandavejustice/sequencer)

More complete documentation will be added once the api stabilizes.

takes an audio context, url, gainNode, and an array of [ffts](https://github.com/meandavejustice/audio-fft)

Handy methods include:
* getBuffer
* getSource
* disconnect
* play
* loadSilent
* stop
* decode
