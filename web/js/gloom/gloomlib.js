// Generated by CoffeeScript 2.0.0-alpha1
(function() {
  var PlayerWidget,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  PlayerWidget = class PlayerWidget {
    constructor(container) {
      this.displayProgress = bind(this.displayProgress, this);
      this.onstop = bind(this.onstop, this);
      this.onresume = bind(this.onresume, this);
      this.onpause = bind(this.onpause, this);
      this.onplay = bind(this.onplay, this);
      this.$container = $(container);
      this.$controlsContainer = $('.player-controls', this.$container);
      this.$progressContainer = $('.player-progress-container', this.$container);
      this.$progressBar = $('.player-progress-bar', this.$container);
      this.$progressText = $('.player-progress-text', this.$container);
      this.$playBtn = $('.player-play', this.$container);
      this.$stopBtn = $('.player-stop', this.$container);
      this.$pauseBtn = $('.player-pause', this.$container);
      this.$stopBtn.click(() => {
        return this.stop();
      });
      this.$pauseBtn.click(() => {
        return this.pause();
      });
      this.$playBtn.click(() => {
        if (this.current === 'paused') {
          return this.resume();
        } else {
          return this.play();
        }
      });
      this.$progressContainer.click((event) => {
        var progress;
        progress = (event.clientX - this.$progressContainer.offset().left) / this.$progressContainer.width();
        return typeof this.progressCallback === "function" ? this.progressCallback(progress) : void 0;
      });
    }

    on(eventName, callback) {
      return this[`${eventName}Callback`] = callback;
    }

    onplay() {
      this.$playBtn.hide();
      this.$pauseBtn.show();
      return typeof this.playCallback === "function" ? this.playCallback() : void 0;
    }

    onpause() {
      this.$pauseBtn.hide();
      this.$playBtn.show();
      return typeof this.pauseCallback === "function" ? this.pauseCallback() : void 0;
    }

    onresume() {
      this.$playBtn.hide();
      this.$pauseBtn.show();
      return typeof this.resumeCallback === "function" ? this.resumeCallback() : void 0;
    }

    onstop() {
      this.$pauseBtn.hide();
      this.$playBtn.show();
      return typeof this.stopCallback === "function" ? this.stopCallback() : void 0;
    }

    displayProgress(event) {
      var curTime, current, progress, totTime, total;
      current = event.current, total = event.total;
      current = Math.min(current, total);
      progress = current / total;
      this.$progressBar.width(this.$progressContainer.width() * progress);
      curTime = this._formatTime(current);
      totTime = this._formatTime(total);
      return this.$progressText.text(`${curTime} / ${totTime}`);
    }

    _formatTime(time) {
      var minutes, seconds;
      minutes = time / 60 >> 0;
      seconds = String(time - (minutes * 60) >> 0);
      if (seconds.length === 1) {
        seconds = `0${seconds}`;
      }
      return `${minutes}:${seconds}`;
    }

  };

  StateMachine.create({
    target: PlayerWidget.prototype,
    events: [
      {
        name: 'init',
        from: 'none',
        to: 'ready'
      }, {
        name: 'play',
        from: 'ready',
        to: 'playing'
      }, {
        name: 'pause',
        from: 'playing',
        to: 'paused'
      }, {
        name: 'resume',
        from: 'paused',
        to: 'playing'
      }, {
        name: 'stop',
        from: '*',
        to: 'ready'
      }
    ]
  });

  this.PlayerWidget = PlayerWidget;

}).call(this);
// Generated by CoffeeScript 2.0.0-alpha1
(function() {
  var Gloom,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Gloom = class Gloom {
    constructor() {
      this.setProgressFrom = bind(this.setProgressFrom, this);
      this.setProgress = bind(this.setProgress, this);
      this.setCurrentTime = bind(this.setCurrentTime, this);
      this.getEndTime = bind(this.getEndTime, this);
      this.pause = bind(this.pause, this);
      this.stop = bind(this.stop, this);
      this.resume = bind(this.resume, this);
      this.start = bind(this.start, this);
      this.fretnote = new FretNote(21, 0);
      this.fretboard = new FretBoard("#fretboard", this.fretnote);
      this.tablature = new Tablature("#svg");
      this.technical = new TechnicalNotes(this.fretnote);
      this.player = MIDI.Player;
      this.player.addListener((data) => {
        var NOTE_OFF, NOTE_ON, message, technical;
        NOTE_OFF = 128;
        NOTE_ON = 144;
        technical = data.technical, message = data.message;
        if (message === NOTE_ON) {
          return this.fretboard.press(technical);
        } else if (message === NOTE_OFF) {
          if (technical != null) {
            return this.fretboard.release(technical);
          }
        }
      });
      this.player.setAnimation((data) => {
        var end, now;
        now = data.now, end = data.end;
        if (now >= end) {
          setTimeout(this._stop_player, 1000);
        }
        this.tablature.update(now * 1000);
        return typeof this.onprogress === "function" ? this.onprogress({
          current: now,
          total: end
        }) : void 0;
      });
    }

    _stop_player() {
      return window.player.stop();
    }

    initMidi(instrument, callback) {
      return MIDI.loadPlugin({
        instrument: instrument,
        onsuccess: function() {
          if (instrument === "acoustic_guitar_steel") {
            MIDI.programChange(0, 25);
          } else if (instrument === "acoustic_guitar_nylon") {
            MIDI.programChange(0, 24);
          }
          MIDI.channels[9].mute = true;
          return typeof callback === "function" ? callback() : void 0;
        }
      });
    }

    loadMidiFile(midiFile, callback) {
      this.player.BPM = 90;
      return this.technical.init("./songs/notes.Crying_in_the_rain.xml", () => {
        return this.player.loadFile(midiFile, () => {
          return this.tablature.setMidiData(this.player.data, callback);
        });
      });
    }

    start() {
      this.player.start();
      return this.playing = true;
    }

    resume() {
      this.player.currentTime += 1e-6;
      this.player.resume();
      return this.playing = true;
    }

    stop() {
      this.player.stop();
      this.fretboard.release_all();
      return this.playing = false;
    }

    pause() {
      this.player.pause();
      return this.playing = false;
    }

    getEndTime() {
      return this.player.endTime;
    }

    setCurrentTime(currentTime) {
      this.player.pause();
      this.player.currentTime = currentTime;
      if (this.playing) {
        return this.player.resume();
      }
    }

    setProgress(progress) {
      var currentTime;
      currentTime = this.player.endTime * progress;
      return this.setCurrentTime(currentTime);
    }

    setProgressFrom(delta) {
      var currentTime;
      this.fretboard.release_all();
      currentTime = this.player.currentTime + delta;
      return this.setCurrentTime(currentTime);
    }

    on(eventName, callback) {
      return this[`on${eventName}`] = callback;
    }

  };

  this.Gloom = Gloom;

}).call(this);
// Generated by CoffeeScript 2.0.0-alpha1
(function() {
  var FretNote;

  FretNote = class FretNote {
    constructor(nb_frets = 21, capodaster = 0) {
      var fret_nb, i, j, len, ref, ref1, string, string_A, string_B, string_D, string_E, string_G, string_e;
      this.nb_frets = nb_frets;
      this.capodaster = capodaster;
      this.strings = [
        string_e = {
          note: 64,
          num: 1,
          notes: []
        }, string_B = {
          note: 59,
          num: 2,
          notes: []
        }, string_G = {
          note: 55,
          num: 3,
          notes: []
        }, string_D = {
          note: 50,
          num: 4,
          notes: []
        }, string_A = {
          note: 45,
          num: 5,
          notes: []
        }, string_E = {
          note: 40,
          num: 6,
          notes: []
        }
      ];
      ref = this.strings;
      for (i = 0, len = ref.length; i < len; i++) {
        string = ref[i];
        for (fret_nb = j = 0, ref1 = this.nb_frets; 0 <= ref1 ? j <= ref1 : j >= ref1; fret_nb = 0 <= ref1 ? ++j : --j) {
          string.notes.push(string.note + fret_nb);
        }
      }
    }

    noteToFret(note) {
      var fret_nb, i, j, len, ref, ref1, ref2, string;
      for (fret_nb = i = ref = this.capodaster, ref1 = this.nb_frets; ref <= ref1 ? i <= ref1 : i >= ref1; fret_nb = ref <= ref1 ? ++i : --i) {
        ref2 = this.strings;
        for (j = 0, len = ref2.length; j < len; j++) {
          string = ref2[j];
          if (note === string.notes[fret_nb]) {
            return {
              string: string.num,
              fret: fret_nb
            };
          }
        }
      }
    }

    technicalNote(technical) {
      var fret, string;
      string = technical.string;
      fret = technical.fret;
      return this.strings[string - 1].notes[fret];
    }

  };

  this.FretNote = FretNote;

}).call(this);
// Generated by CoffeeScript 2.0.0-alpha1
(function() {
  var FretBoard;

  FretBoard = class FretBoard {
    constructor(container, fretnote) {
      var i, string;
      this.fretnote = fretnote;
      this.model = Snap(container);
      this.note_elm = [];
      for (string = i = 1; i <= 6; string = ++i) {
        this.note_elm[string] = [];
      }
    }

    init(callback) {
      Snap.load("https://cdn.jsdelivr.net/gh/ramanduh/gloom@master/web/img/fretboard.svg", (loadedFragment) => {
        var fret, i, id_elem, j, ref, string;
        for (string = i = 1; i <= 6; string = ++i) {
          for (fret = j = 0, ref = this.fretnote.nb_frets; 0 <= ref ? j <= ref : j >= ref; fret = 0 <= ref ? ++j : --j) {
            id_elem = "#f" + string + "-" + fret;
            this.note_elm[string][fret] = loadedFragment.select(id_elem);
          }
        }
        return this.model.append(loadedFragment);
      });
      return typeof callback === "function" ? callback() : void 0;
    }

    press(note) {
      var fret, string;
      string = note.string, fret = note.fret;
      this.note_elm[string][fret].attr({
        stroke: '#000',
        display: ''
      });
      return this.note_elm[string][fret].animate({
        fill: '#FF9800'
      }, 300);
    }

    release(note) {
      var fret, string;
      string = note.string, fret = note.fret;
      return this.note_elm[string][fret].attr({
        display: 'none',
        fill: 'red'
      });
    }

    release_all() {
      var fret, i, results, string;
      results = [];
      for (string = i = 1; i <= 6; string = ++i) {
        results.push((function() {
          var j, ref, results1;
          results1 = [];
          for (fret = j = 0, ref = this.fretnote.nb_frets; 0 <= ref ? j <= ref : j >= ref; fret = 0 <= ref ? ++j : --j) {
            results1.push(this.release({
              string: string,
              fret: fret
            }));
          }
          return results1;
        }).call(this));
      }
      return results;
    }

  };

  this.FretBoard = FretBoard;

}).call(this);
// Generated by CoffeeScript 2.0.0-alpha1
(function() {
  var Tablature,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Tablature = (function() {
    class Tablature {
      constructor(container) {
        this.update = bind(this.update, this);
        this._handleTabClick = bind(this._handleTabClick, this);
        var j, ref, y;
        this.model = Snap(container);
        for (y = j = 10, ref = this.string_offset; j <= 70; y = j += ref) {
          this.model.line(0, y, 700, y).attr({
            "stroke": "black",
            "stroke-width": "0.15"
          });
        }
        this.cursor = this.model.line(this.cursor_init_pos, 0, this.cursor_init_pos, 80).attr({
          "stroke": "red"
        });
        this.container_id = container.substr(1);
        this.pt = document.getElementById(this.container_id).createSVGPoint();
        this.g;
      }

      setMidiData(midiData, callback) {
        var noteInfos;
        noteInfos = this._getNoteInfos(midiData);
        return this._buildNoteMeshes(noteInfos, callback);
      }

      _handleTabClick(evt) {
        var cursorpt, delta;
        this.pt.x = evt.clientX;
        this.pt.y = evt.clientY;
        cursorpt = this.pt.matrixTransform(document.getElementById(this.container_id).getScreenCTM().inverse());
        delta = (cursorpt.x - this.cursor.attr("transform").localMatrix.e) / this.lengthScale;
        return typeof this.clicktabCallback === "function" ? this.clicktabCallback(delta) : void 0;
      }

      _getNoteInfos(midiData) {
        var channel, currentTime, duration, event, interval, j, len, noteInfos, noteNumber, noteTimes, ref, ref1, startTime, subtype, technical;
        currentTime = 0;
        noteInfos = [];
        noteTimes = [];
        for (j = 0, len = midiData.length; j < len; j++) {
          ref = midiData[j], (ref1 = ref[0], event = ref1.event), interval = ref[1];
          currentTime += interval;
          subtype = event.subtype, noteNumber = event.noteNumber, technical = event.technical, channel = event.channel;
          if (channel === 9) {
            continue;
          }
          if (subtype === 'noteOn') {
            noteTimes[noteNumber] = currentTime;
          } else if (subtype === 'noteOff') {
            startTime = noteTimes[noteNumber];
            duration = currentTime - startTime;
            noteInfos.push({
              noteNumber: noteNumber,
              startTime: startTime,
              duration: duration,
              technical: technical
            });
          }
        }
        return noteInfos;
      }

      _buildNoteMeshes(noteInfos, callback) {
        var SIZE_OF_EACH_GROUP, group, groups, j, len, sleepTask, splitToGroups, tasks;
        splitToGroups = function(items, sizeOfEachGroup) {
          var groups, i, j, numGroups, ref, start;
          groups = [];
          numGroups = Math.ceil(items.length / sizeOfEachGroup);
          start = 0;
          for (i = j = 0, ref = numGroups; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
            groups[i] = items.slice(start, start + sizeOfEachGroup);
            start += sizeOfEachGroup;
          }
          return groups;
        };
        sleepTask = function(done) {
          return setTimeout((function() {
            return done(null);
          }), 0);
        };
        tasks = [];
        SIZE_OF_EACH_GROUP = 100;
        groups = splitToGroups(noteInfos, SIZE_OF_EACH_GROUP);
        for (j = 0, len = groups.length; j < len; j++) {
          group = groups[j];
          tasks.push(sleepTask);
          tasks.push(((group) => {
            return (done) => {
              var duration, k, len1, noteInfo, noteNumber, startTime, technical, text, x, y;
              for (k = 0, len1 = group.length; k < len1; k++) {
                noteInfo = group[k];
                noteNumber = noteInfo.noteNumber, technical = noteInfo.technical, startTime = noteInfo.startTime, duration = noteInfo.duration;
                x = (startTime * this.lengthScale) + this.cursor_init_pos;
                y = 15 + (technical.string - 1) * this.string_offset;
                text = this.model.text(x, y, technical.fret.toString()).attr({
                  "fill": "#606060",
                  "font-size": 12,
                  "font-family": "Arial"
                });
                if (technical.lyric != null) {
                  this._setLyric(x, technical.lyric);
                }
              }
              return done(null);
            };
          })(group));
        }
        async.series(tasks, () => {
          return this._groupNotes(callback);
        });
        return this.model.click(this._handleTabClick);
      }


      /*
      	 * Put lyric in the tablature
       */

      _setLyric(x, lyric) {
        var block, text;
        block = this.model.rect(x - 5, 84, 700, 16, 9, 9);
        block.attr({
          fill: this.notes_color_map[lyric[0]]
        });
        return text = this.model.text(x, 97, lyric).attr({
          "font-size": 12,
          "font-family": "Arial"
        });
      }

      _groupNotes(callback) {
        var elt, j, len, ref;
        this.g = this.model.g();
        ref = this.model.children();
        for (j = 0, len = ref.length; j < len; j++) {
          elt = ref[j];
          if (elt.type === "text" || elt.type === "rect") {
            this.g.add(elt);
          }
        }
        return typeof callback === "function" ? callback() : void 0;
      }

      update(playerCurrentTime) {
        var cursor_pos, tab_pos;
        if (this.g == null) {
          this._groupNotes(function() {});
        }
        cursor_pos = playerCurrentTime * this.lengthScale;
        tab_pos = Math.floor(cursor_pos / this.cursor_max_pos) * -this.cursor_max_pos;
        cursor_pos = cursor_pos % this.cursor_max_pos;
        this.cursor.transform('t' + cursor_pos + ',0');
        return this.g.transform('t' + tab_pos + ',0');
      }

      on(eventName, callback) {
        return this[`${eventName}Callback`] = callback;
      }

    };

    Tablature.prototype.lengthScale = 0.001 * 70;

    Tablature.prototype.cursor_init_pos = 2;

    Tablature.prototype.cursor_max_pos = 700;

    Tablature.prototype.string_offset = 12;

    Tablature.prototype.notes_color_map = {
      "A": "#d71285",
      "B": "#1a53ff",
      "C": "#99ff99",
      "D": "#ff2e2e",
      "E": "#FF9800",
      "F": "#f4d33d",
      "G": "#16B84E"
    };

    return Tablature;

  })();

  this.Tablature = Tablature;

}).call(this);
// Generated by CoffeeScript 2.0.0-alpha1

/*
 *  TODO : Rename this class as XMLExtraInfo as it is used to get all
 *  extra information in a XML file (string, fret, lyric)
 *  A technical is 
 *  Initialisation of technical (string + fret) of the song
 *  Will Read a MusicXML file to get these info
 *
 */

(function() {
  var TechnicalNotes;

  TechnicalNotes = class TechnicalNotes {
    constructor(fretnote) {
      this.fretnote = fretnote;
      this.notes_on = [];
      this.notes_off = [];
    }

    init(filename, callback) {
      var xmlhttp;
      xmlhttp = new XMLHttpRequest();
      xmlhttp.onload = () => {
        var fret_elements, i, j, k, l, node_name, ref, ref1, string_elements, technical, technical_elements, technical_nodes, xmlDoc;
        xmlDoc = new DOMParser().parseFromString(xmlhttp.responseText, 'text/xml');
        technical_elements = xmlDoc.getElementsByTagName("technical");
        fret_elements = xmlDoc.getElementsByTagName("fret");
        string_elements = xmlDoc.getElementsByTagName("string");
        for (i = k = 0, ref = technical_elements.length - 1; 0 <= ref ? k <= ref : k >= ref; i = 0 <= ref ? ++k : --k) {
          technical = {};
          technical_nodes = technical_elements[i].childNodes;
          for (j = l = 0, ref1 = technical_nodes.length - 1; 0 <= ref1 ? l <= ref1 : l >= ref1; j = 0 <= ref1 ? ++l : --l) {
            node_name = technical_nodes[j].nodeName;
            switch (node_name) {
              case "fret":
                technical.fret = technical_nodes[j].textContent.toString();
                break;
              case "string":
                technical.string = technical_nodes[j].textContent.toString();
                break;
              case "lyric":
                technical.lyric = technical_nodes[j].textContent.toString();
                break;
            }
          }
          this.notes_on.push(technical);
        }
        this.notes_off = this.notes_on.slice();
        return typeof callback === "function" ? callback() : void 0;
      };
      xmlhttp.open("GET", filename, true);
      return xmlhttp.send();
    }

    getNextNoteOn(note) {
      if (note === this.fretnote.technicalNote(this.notes_on[0])) {
        return this.notes_on.shift();
      } else {
        console.log("ERROR #T1");
        return 1;
      }
    }

    getNextNoteOff(note) {
      var i, k, n, ref;
      for (i = k = 0, ref = this.notes_off.length - 1; 0 <= ref ? k <= ref : k >= ref; i = 0 <= ref ? ++k : --k) {
        if (note === this.fretnote.technicalNote(this.notes_off[i])) {
          n = this.notes_off[i];
          this.notes_off.splice(i, 1);
          return n;
        }
      }
    }

  };

  this.TechnicalNotes = TechnicalNotes;

}).call(this);
