class FretNote
	constructor: (@nb_frets=21, @capodaster=0) ->
		@strings = [
			string_e=
				note: 64  # The first MIDI note (open string)
				num: 1    # Sting number
				notes: [] # All note on string
			string_B=
				note: 59
				num: 2
				notes: []
			string_G=
				note: 55
				num: 3
				notes: []
			string_D=
				note: 50
				num: 4
				notes: []
			string_A=
				note: 45
				num: 5
				notes: []
			string_E=
				note: 40
				num: 6
				notes: []
		]
		for string in @strings
			for fret_nb in [0..@nb_frets]
				string.notes.push string.note + fret_nb
		# console.log @string

	noteToFret: (note) ->
		# DEPRECATED: Note will read in MusicXML file
		for fret_nb in [@capodaster..@nb_frets]
			for string in @strings
				if note == string.notes[fret_nb]
					return {string: string.num, fret: fret_nb}

	technicalNote: (technical) ->
		# get a technical note (string, fret) and return the Midi note correspondiong
		string = technical.string
		fret = technical.fret
		return @strings[string-1].notes[fret]

@FretNote = FretNote
