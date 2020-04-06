class Tablature

	lengthScale: 0.001 * 70
	cursor_init_pos: 2
	cursor_max_pos: 700
	string_offset: 12
	notes_color_map: {"A": "#d71285", "B": "#1a53ff", "C": "#99ff99", "D": "#ff2e2e", "E": "#FF9800", "F": "#f4d33d", "G": "#16B84E"} # "#a71488"

	constructor: (container)->
		@model = Snap(container)
		# Draw tablature lines
		for y in [10..70] by @string_offset
			@model.line(0,y,700,y).attr({"stroke": "black", "stroke-width": "0.15"})
		# Draw cursor
		@cursor = @model.line(@cursor_init_pos, 0 , @cursor_init_pos, 80).attr({"stroke": "red"})
		# Add onclick event on tablature click
		# $("#svg").offset().left
		@container_id = container.substr(1)
		@pt = document.getElementById(@container_id).createSVGPoint()
		@g


	# midiData is acquired from MIDI.Player.data
	setMidiData: (midiData, callback) ->
		noteInfos = @_getNoteInfos(midiData)
		@_buildNoteMeshes(noteInfos, callback)

	_handleTabClick: (evt) =>
		@pt.x = evt.clientX
		@pt.y = evt.clientY
		cursorpt =  @pt.matrixTransform(document.getElementById(@container_id).getScreenCTM().inverse())
		delta = (cursorpt.x - @cursor.attr("transform").localMatrix.e) / @lengthScale
		@clicktabCallback?(delta)

	# the raw midiData uses delta time between events to represent the flow
	# and it's quite unintuitive
	# here we calculates the start and end time of each notebox
	_getNoteInfos: (midiData) ->
		currentTime = 0
		noteInfos = []
		noteTimes = []

		for [{event}, interval] in midiData
			currentTime += interval
			{subtype, noteNumber, technical, channel} = event

			# In General MIDI, channel 10 is reserved for percussion instruments only.
			# It doesn't make any sense to convert it into piano notes. So just skip it.
			continue if channel is 9 # off by 1

			if subtype is 'noteOn'
				# if note is on, record its start time
				noteTimes[noteNumber] = currentTime

			else if subtype is 'noteOff'
				# if note if off, calculate its duration and build the model
				startTime = noteTimes[noteNumber]
				duration = currentTime - startTime
				noteInfos.push {
					noteNumber: noteNumber
					startTime: startTime
					duration: duration
					technical: technical
				}
		noteInfos

	# given a list of note info, build their meshes
	# the callback is called on finishing this task
	_buildNoteMeshes: (noteInfos, callback) ->
		# function to split an array into groups
		splitToGroups = (items, sizeOfEachGroup) ->
			groups = []
			numGroups = Math.ceil(items.length / sizeOfEachGroup)
			start = 0
			for i in [0...numGroups]
				groups[i] = items[start...(start + sizeOfEachGroup)]
				start += sizeOfEachGroup
			groups

		# the sleep tasks will be inserted into the mesh-building procedure
		# in order to not to block the rendering of the browser UI
		sleepTask = (done) ->
			setTimeout (->
				done(null)
			), 0

		# tasks to build the meshes
		# all the tasks are asynchronous
		tasks = []

		# split the note infos into groups
		# for each group, generate a task that will build the notes' meshes
		SIZE_OF_EACH_GROUP = 100
		groups = splitToGroups(noteInfos, SIZE_OF_EACH_GROUP)
		for group in groups
			# insert an sleep task between every two mesh-building tasks
			tasks.push(sleepTask)

			# insert the mesh-building task
			tasks.push do (group) =>
				# every task will be an asynchronous function. the `done` callback will be
				# called on finishing the task
				(done) =>
					for noteInfo in group
						{noteNumber, technical, startTime, duration} = noteInfo

						# calculate the note's position
						x = (startTime * @lengthScale) + @cursor_init_pos
						y = 15 + (technical.string - 1) * @string_offset

						# color = @fretnote.noteToColor(noteNumber)
						text = @model.text(x, y, technical.fret.toString()).attr({"fill": "#606060", "font-size": 12, "font-family":"Arial"})
						if technical.lyric?
							@_setLyric(x, technical.lyric)
					done(null)

		# use the `async` library to execute the tasks in series
		async.series tasks, =>
			@_groupNotes callback
		# Add on click event on tablature
		@model.click(@_handleTabClick)

	###
	# Put lyric in the tablature
	###
	_setLyric: (x, lyric) ->
		block = @model.rect(x - 5, 84, 700, 16, 9, 9)
		block.attr({
			fill: @notes_color_map[lyric[0]]
		})
		text = @model.text(x, 97, lyric).attr({"font-size": 12, "font-family":"Arial"})

	#SVG group
	_groupNotes: (callback) ->
		@g = @model.g()
		for elt in @model.children()
			if elt.type == "text" || elt.type == "rect"
				@g.add(elt)
		callback?()

	update: (playerCurrentTime) =>
		if not @g?
			@_groupNotes -> # Not sure if we really need it
		cursor_pos = playerCurrentTime * @lengthScale
		tab_pos = Math.floor(cursor_pos / @cursor_max_pos) * -@cursor_max_pos
		cursor_pos = (cursor_pos % @cursor_max_pos)# +  @cursor_init_pos
		@cursor.transform('t' + cursor_pos + ',0')
		@g.transform('t' + tab_pos + ',0')

	on: (eventName, callback) ->
		@["#{eventName}Callback"] = callback

# export to global
@Tablature = Tablature
