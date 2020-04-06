###
#  TODO : Rename this class as XMLExtraInfo as it is used to get all
#  extra information in a XML file (string, fret, lyric)
#  A technical is 
#  Initialisation of technical (string + fret) of the song
#  Will Read a MusicXML file to get these info
#
###
class TechnicalNotes
	constructor: (fretnote) ->
		@fretnote = fretnote
		@notes_on = []
		@notes_off = []

	init: (filename, callback) ->
		xmlhttp = new XMLHttpRequest()
		xmlhttp.onload = =>
			xmlDoc = new DOMParser().parseFromString(xmlhttp.responseText,'text/xml')
			technical_elements = xmlDoc.getElementsByTagName("technical")
			fret_elements = xmlDoc.getElementsByTagName("fret")
			string_elements = xmlDoc.getElementsByTagName("string")
			for i in [0..technical_elements.length - 1]
				technical = {}
				technical_nodes = technical_elements[i].childNodes
				for j in [0..technical_nodes.length - 1]
					node_name = technical_nodes[j].nodeName
					switch node_name
						when "fret" then technical.fret = technical_nodes[j].textContent.toString()
						when "string" then technical.string = technical_nodes[j].textContent.toString()
						when "lyric" then technical.lyric = technical_nodes[j].textContent.toString()
						else # Nothing to do
				@notes_on.push(technical)
			@notes_off = @notes_on.slice()
			callback?()
		xmlhttp.open("GET", filename, true)
		xmlhttp.send()

	getNextNoteOn: (note) ->
		if note == @fretnote.technicalNote(@notes_on[0])
			return @notes_on.shift()
		else
			console.log("ERROR #T1")
			return 1  # FIXME Remove it

	getNextNoteOff: (note) ->
		for i in [0..@notes_off.length - 1]
			if note == @fretnote.technicalNote(@notes_off[i])
				n = @notes_off[i]
				@notes_off.splice(i, 1)
				return n

# exports to global
@TechnicalNotes = TechnicalNotes
