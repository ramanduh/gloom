class PlayerWidget
	constructor: (container) ->
		@$container = $(container)

		@$controlsContainer  = $('.player-controls', @$container)
		@$progressContainer  = $('.player-progress-container', @$container)

		@$progressBar        = $('.player-progress-bar', @$container)
		@$progressText       = $('.player-progress-text', @$container)

		@$playBtn  = $('.player-play', @$container)
		@$stopBtn  = $('.player-stop', @$container)
		@$pauseBtn = $('.player-pause', @$container)

		@$stopBtn.click  => @stop()
		@$pauseBtn.click => @pause()
		@$playBtn.click =>
			if @current is 'paused' then @resume() else @play()

		# invoke callback on progress bar click
		@$progressContainer.click (event) =>
			progress = (event.clientX - @$progressContainer.offset().left) / @$progressContainer.width()
			@progressCallback?(progress)

	on: (eventName, callback) ->
		@["#{eventName}Callback"] = callback

	onplay: =>
		@$playBtn.hide()
		@$pauseBtn.show()
		@playCallback?()

	onpause: =>
		@$pauseBtn.hide()
		@$playBtn.show()
		@pauseCallback?()

	onresume: =>
		@$playBtn.hide()
		@$pauseBtn.show()
		@resumeCallback?()

	onstop: =>
		@$pauseBtn.hide()
		@$playBtn.show()
		@stopCallback?()

	displayProgress: (event) =>
		{current, total} = event
		current = Math.min(current, total)
		progress = current / total
		@$progressBar.width(@$progressContainer.width() * progress)
		curTime = @_formatTime(current)
		totTime = @_formatTime(total)
		@$progressText.text("#{curTime} / #{totTime}")

	_formatTime: (time) ->
		minutes = time / 60 >> 0
		seconds = String(time - (minutes * 60) >> 0)
		if seconds.length is 1
			seconds = "0#{seconds}"
		"#{minutes}:#{seconds}"

StateMachine.create
	target: PlayerWidget.prototype
	events: [
		{ name: 'init'  , from: 'none'    , to: 'ready'   }
		{ name: 'play'  , from: 'ready'   , to: 'playing' }
		{ name: 'pause' , from: 'playing' , to: 'paused'  }
		{ name: 'resume', from: 'paused'  , to: 'playing' }
		{ name: 'stop'  , from: '*'       , to: 'ready'   }
	]

@PlayerWidget = PlayerWidget
