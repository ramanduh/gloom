class FretBoard
	
	constructor: (container, @fretnote) ->
		@model = Snap(container)
		# init a tab of note element
		@note_elm=[]
		for string in [1..6]
			@note_elm[string] = []


	init: (callback) ->
		Snap.load "./img/fretboard.svg", (loadedFragment) =>
			for string in [1..6]
				for fret in [0..@fretnote.nb_frets]
					id_elem= "#f" + string + "-" + fret
					@note_elm[string][fret] = loadedFragment.select(id_elem)
			@model.append(loadedFragment)
		callback?()

	press: (note) ->
		{string, fret} = note
		@note_elm[string][fret].attr({
			stroke: '#000',
			display: ''
		})
		@note_elm[string][fret].animate({
			fill: '#FF9800',
		}, 300)

	release: (note) ->
		{string, fret} = note
		@note_elm[string][fret].attr({
			display: 'none',
			fill: 'red'
		})

	release_all: ->
		for string in [1..6]
			for fret in [0..@fretnote.nb_frets]
				@release {string, fret}


@FretBoard = FretBoard
