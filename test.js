var test = require('tape');
var tapeworm = require('tape-worm');
var Audiosource = require('./distribution/index');

tapeworm.infect(test);

test('Instantiation tests', function(t) {
  t.plan(6);

  var a = new Audiosource({
    src: 'http://davejustice.com/assets/themes/twitter/chains.mp3',
    onLoad: function() {
      t.ok(true, 'onLoad called');
      t.ok(a.buffer.sampleRate, 'should have buffer');
    }
  });

  t.equal(a.playing, false, 'playing prop should be false on initialization');
  t.ok(a.analyser.fftSize, 'should have analyser');
  t.equal(a.gainNode.gain.value, 0.5, 'should have gainNode, and default to 0.5');

  a.volume = 0.75;

  t.equal(a.gainNode.gain.value, 0.75, 'setting volume should update gainNode value');
});

