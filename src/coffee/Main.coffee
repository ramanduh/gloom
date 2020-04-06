$(document)
    .on 'ready', ->

        #start app
        midiFile = "./songs/Crying_in_the_rain.mid"
        instrument = "acoustic_guitar_nylon"
        window.app = new Gloom()
        app.fretboard.init ->
            app.initMidi instrument, ->
                app.loadMidiFile midiFile, ->
                    window.player = new PlayerWidget('#player')
                    player.on('pause', app.pause)
                    player.on('resume', app.resume)
                    player.on('stop', app.stop)
                    player.on('play', app.start)
                    player.on('progress', app.setProgress)
                    app.tablature.on('clicktab', app.setProgressFrom)
                    player.stop()
                    player.play()
                    app.on('progress', player.displayProgress)
        # listener for search button
        $('#search-button').click ->
            if app.player.playing
                player.pause()
            $('#search-container').show(100)
        $('#close-search').click ->
            $('#search-container').hide(100)
