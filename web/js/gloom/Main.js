// Generated by CoffeeScript 2.0.0-alpha1
(function() {
  $(document).on('ready', function() {
    var instrument, midiFile;
    midiFile = "./songs/Crying_in_the_rain.mid";
    instrument = "acoustic_guitar_nylon";
    window.app = new Gloom();
    app.fretboard.init(function() {
      return app.initMidi(instrument, function() {
        return app.loadMidiFile(midiFile, function() {
          window.player = new PlayerWidget('#player');
          player.on('pause', app.pause);
          player.on('resume', app.resume);
          player.on('stop', app.stop);
          player.on('play', app.start);
          player.on('progress', app.setProgress);
          app.tablature.on('clicktab', app.setProgressFrom);
          player.init();
          app.on('progress', player.displayProgress);
          return $("#loader-wrapper").hide();
        });
      });
    });
    $('#search-button').click(function() {
      if (app.player.playing) {
        player.pause();
      }
      return $('#search-container').show(100);
    });
    return $('#close-search').click(function() {
      return $('#search-container').hide(100);
    });
  });

}).call(this);
