class Gloom
	
	constructor: ->
		@fretnote = new FretNote(21, 0)
		@fretboard = new FretBoard("#fretboard", @fretnote)
		@tablature = new Tablature("#svg")
		@technical = new TechnicalNotes(@fretnote)

		@player = MIDI.Player
		@player.addListener (data) =>
			NOTE_OFF = 128
			NOTE_ON = 144
			{technical, message} = data
			if message is NOTE_ON
				@fretboard.press(technical)
			else if message is NOTE_OFF
				if technical? # technical could be undefined when hitting pause
					@fretboard.release(technical)
		@player.setAnimation (data) =>
			{now, end} = data
			if now >= end # Stop at the end to reinit cursor
				setTimeout @_stop_player, 1000
			@tablature.update(now * 1000)  # Convert to ms
			@onprogress?(
				current: now
				total: end
			)

	_stop_player: ->
		window.player.stop()

	initMidi: (instrument, callback) ->
		MIDI.loadPlugin({instrument: instrument, onsuccess: ->
			if instrument == "acoustic_guitar_steel"
				MIDI.programChange(0, 25)
			else if instrument == "acoustic_guitar_nylon"
				MIDI.programChange(0, 24)
			# mute channel 10, which is reserved for percussion instruments only.
			# the channel index is off by one
			MIDI.channels[9].mute = true
			callback?()
		})
	
	loadMidiFile: (midiFile, callback) ->
		@player.BPM = 90
		# @technical.init "tuxguitar_light.xml", =>
		@technical.init "./songs/notes.Crying_in_the_rain.xml", =>
			@player.loadFile midiFile, =>
				@tablature.setMidiData(@player.data, callback)

	start: =>
		@player.start()
		@playing = true

	resume: =>
		@player.currentTime += 1e-6 # bugfix for MIDI.js
		@player.resume()
		@playing = true

	stop: =>
		@player.stop()
		@fretboard.release_all()
		@playing = false

	pause: =>
		@player.pause()
		@playing = false

	getEndTime: =>
		@player.endTime

	setCurrentTime: (currentTime) =>
		@player.pause()
		@player.currentTime = currentTime
		@player.resume() if @playing

	setProgress: (progress) =>
		currentTime = @player.endTime * progress
		@setCurrentTime(currentTime)

	setProgressFrom: (delta) =>
		@fretboard.release_all()
		currentTime = @player.currentTime + delta
		@setCurrentTime(currentTime)

	on: (eventName, callback) ->
		@["on#{eventName}"] = callback

# exports to global
@Gloom = Gloom
