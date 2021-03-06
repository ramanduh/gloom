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
