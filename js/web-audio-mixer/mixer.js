(function () {
  /**
   *
   * The focus when writing this code was on getting something done and not on beautiful code.
   * A rewrite using React could be beneficial...
   */

  const unitInterface = window.queryUnitInterface?.("wafer-v01");
  // if (!unitInterface) {
  //   throw new Error("incompatible environment");
  // }
  const audioContext = unitInterface?.audioContext ?? new AudioContext();
  const ch1Input =
    unitInterface?.createAdditionalAudioInputNode("ch1") ??
    audioContext.createGain();
  const ch2Input =
    unitInterface?.createAdditionalAudioInputNode("ch2") ??
    audioContext.createGain();
  const ch3Input =
    unitInterface?.createAdditionalAudioInputNode("ch3") ??
    audioContext.createGain();
  const ch4Input =
    unitInterface?.createAdditionalAudioInputNode("ch4") ??
    audioContext.createGain();
  const masterOutput =
    unitInterface?.audioOutputNode ?? audioContext.destination;

  const channelInputs = [
    { input: ch1Input, name: "CH 1" },
    { input: ch2Input, name: "CH 2" },
    { input: ch3Input, name: "CH 3" },
    { input: ch4Input, name: "CH 4" },
  ];

  function Filter(ctx, type, frequency, gain, q) {
    var filter = ctx.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = frequency;
    if (gain) {
      filter.gain.value = gain;
    }
    if (q) {
      filter.Q.value = q;
    }
    return filter;
  }

  function Button(channel, className, text, label) {
    if (!label) label = "";
    if (!text) text = "";
    var button = $(
      '<div class="button-container ' +
        className +
        '">' +
        label +
        '<div class="button-control">' +
        text +
        "</div></div>",
    );
    var target = channel.children(".channel-left").length
      ? channel.children(".channel-left")
      : channel;
    target.append(button);
    button.on("click", function () {
      var channelNo = $(this).parents(".channel").index();
      $(this).trigger("focused", channelNo);
    });
    return button;
  }

  function Fader(channel, count, className, title) {
    var fader = $(
      '<div class="fader-container ' +
        className +
        '"><div class="channel-notches"><div class="channel-notch"></div><div class="channel-notch"></div><div class="channel-notch zeroed">0</div><div class="channel-notch"></div><div class="channel-notch"></div><div class="channel-notch"></div><div class="channel-notch"></div><div class="channel-notch"></div><div class="channel-notch"></div><div class="channel-notch"></div></div><div class="fader-no">' +
        (title ? title : `CH ${count + 1}`) +
        '</div><div class="fader-track"><div class="fader"><div></div></div></div></div>',
    );
    var target = channel.children(".channel-right").length
      ? channel.children(".channel-right")
      : channel;
    target.append(fader);
    $(fader)
      .find(".fader")
      .on("mousedown", function (e) {
        var el = $(this),
          pos = e.pageY,
          offset = el.position().top;
        $(document).mousemove(function (evt) {
          var move = evt.pageY - pos;
          var top = move + offset;
          if (top >= -35 && top <= 260) {
            el.css("top", move + offset + "px");
            //plus 35 so we have a positive range to deal with - by default the range is -35 to 250
            el.trigger("fader", move + offset + 35);
          }
        });
        $(document).on("mouseup", function () {
          $(document).off("mousemove");
        });
      });
    $(fader)
      .find(".fader")
      .on("dblclick", function () {
        $(this).css({
          top: "30px",
        });
        $(this).trigger("fader", 0 + 35 + $(this).position().top);
      });
    return fader;
  }

  function RotaryKnob(channel, label, className) {
    var knobTemplate = $(rotaryKnobTemplate);
    if (className) {
      knobTemplate.find(".dial").addClass(className);
    }
    var target = channel.children(".channel-left").length
      ? channel.children(".channel-left")
      : channel;
    target.append(knobTemplate);
    var notches = $(knobTemplate).find(".notches");
    $(knobTemplate).prepend("<p>" + label + "</p>");
    var degree = 0;
    for (var i = 0; i < 15; ++i) {
      if (i > 9 || i < 6) {
        if (i == 0) {
          var minute = $('<div class="minutes zero"></div>');
        } else {
          var minute = $('<div class="minutes"></div>');
        }
        minute.css("-webkit-transform", "rotate(" + degree + "deg)");
        notches.append(minute);
      }
      degree = degree + 24;
    }
    var dial = $(knobTemplate).find(".dial");
    dial.data("degree", 180);
    dial.on("mousedown", function (e) {
      e.preventDefault();
      var el = $(this),
        startY = e.pageY,
        startDegree = el.data("degree") || 180,
        sensitivity = 2.4;
      function onMove(evt) {
        // Drag up = +, drag down = -
        var nextDegree = startDegree - (evt.pageY - startY) * sensitivity;
        if (nextDegree < 50) nextDegree = 50;
        if (nextDegree > 310) nextDegree = 310;
        el.data("degree", nextDegree);
        el.css({
          "-moz-transform": "rotate(" + nextDegree + "deg)",
          "-webkit-transform": "rotate(" + nextDegree + "deg)",
          transform: "rotate(" + nextDegree + "deg)",
        });
        el.trigger("change", (nextDegree - 180) / 4);
      }
      function onUp() {
        $(document).off("mousemove", onMove);
        $(document).off("mouseup", onUp);
      }
      $(document).on("mousemove", onMove);
      $(document).on("mouseup", onUp);
    });
    dial.on("dblclick", function () {
      $(this).data("degree", 180);
      $(this).css({
        "-moz-transform": "rotate(180deg)",
        "-webkit-transform": "rotate(180deg)",
        transform: "rotate(180deg)",
      });
      $(this).trigger("change", 0);
    });
    return knobTemplate;
  }

  function Daw() {
    this.ctx = audioContext;
    this.mixer = new Mixer(this.ctx, channelInputs);
    this.hideLoader();
    this.showMixer();
    this.initHints();
  }

  Daw.prototype.showMixer = function () {
    $("#mixer").addClass("is-visible");
  };

  Daw.prototype.hideLoader = function () {
    $("#loader").hide();
  };

  Daw.prototype.initHints = function () {
    var hintsClone = $("#hints").clone();
    $("#mixer").prepend(hintsClone);
    hintsClone.show();
    hintsClone.find("li").hover(
      function () {
        $(this).find("div").show();
      },
      function () {
        $(this).find("div").hide();
      },
    );
  };

  /* Mixer based on Yamaha's N12 */
  function Mixer(ctx, tracks) {
    this.soloed = 0;
    this.channels = [];
    this.el = $("#mixer");
    this.ctx = ctx;
    this.tracks = tracks;
    this.createMasterChannel();
    this.masterGain.connect(masterOutput);
    for (var i = 0; i < tracks.length; ++i) {
      this.channels.push(
        new Channel(tracks[i].input, tracks[i].name, this, ctx, i),
      );
    }
  }

  Mixer.prototype.createMasterChannel = function () {
    var masterChannel = $(channelTemplate),
      masterFader = new Fader(masterChannel, "&nbsp;", "master", "MASTER"),
      oldMin = 285,
      oldMax = 0,
      newMin = 0,
      newMax = 1.3,
      newVol,
      self = this;
    masterChannel.addClass("master-channel");
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 1;
    this.masterFader = masterFader;
    this.el.append(masterChannel);
    masterFader.on("fader", function (e, val) {
      newVol =
        ((val - oldMin) / (newMin - oldMin)) * (newMax - newMin) + newMin;
      self.masterGain.gain.value = newVol;
    });
  };

  Mixer.prototype.disconnect = function () {
    for (var i = 0; i < this.channels.length; ++i) {
      this.channels[i].disconnect();
    }
    if (this.masterGain) {
      this.masterGain.disconnect();
    }
  };

  // [version][masterGain f32][per channel: 6×f32 + flags]
  var MIXER_STATE_VERSION = 1;
  var MIXER_CHANNEL_BYTES = 6 * 4 + 1;
  var MIXER_STATE_BYTES = 1 + 4 + 4 * MIXER_CHANNEL_BYTES;

  function setDialDegree(control, degree) {
    if (degree < 50) degree = 50;
    if (degree > 310) degree = 310;
    var dial = control.find(".dial");
    dial.data("degree", degree);
    dial.css({
      "-moz-transform": "rotate(" + degree + "deg)",
      "-webkit-transform": "rotate(" + degree + "deg)",
      transform: "rotate(" + degree + "deg)",
    });
  }

  function setDialFromChangeVal(control, val) {
    setDialDegree(control, val * 4 + 180);
  }

  function midFreqToChangeVal(frequency) {
    var pos = frequency < 3000 ? frequency / 100 : frequency / 160;
    return pos - 32;
  }

  function setFaderFromVolume(fader, volume, oldMin) {
    var val = oldMin - (volume / 1.3) * oldMin;
    var top = val - 35;
    if (top < -35) top = -35;
    if (top > 260) top = 260;
    fader.find(".fader").css("top", top + "px");
  }

  Mixer.prototype.emitStateBytes = function () {
    var bytes = new Uint8Array(MIXER_STATE_BYTES);
    var view = new DataView(bytes.buffer);
    bytes[0] = MIXER_STATE_VERSION;
    view.setFloat32(1, this.masterGain.gain.value, true);
    var offset = 5;
    for (var i = 0; i < this.channels.length; ++i) {
      offset = this.channels[i].writeStateBytes(view, bytes, offset);
    }
    return bytes;
  };

  Mixer.prototype.applyStateBytes = function (stateBytes) {
    if (!stateBytes || stateBytes.length !== MIXER_STATE_BYTES) return;
    if (stateBytes[0] !== MIXER_STATE_VERSION) return;
    var view = new DataView(
      stateBytes.buffer,
      stateBytes.byteOffset,
      stateBytes.byteLength,
    );
    var masterVol = view.getFloat32(1, true);
    this.masterGain.gain.value = masterVol;
    setFaderFromVolume(this.masterFader, masterVol, 285);
    var offset = 5;
    this.soloed = 0;
    for (var i = 0; i < this.channels.length; ++i) {
      offset = this.channels[i].readStateBytes(view, stateBytes, offset);
      if (this.channels[i].soloed) this.soloed++;
    }
    if (this.channels.length) {
      this.channels[0].enableDisableChannels();
    }
  };

  var AUTOMATION_PARAM_MAP = {
    ch1Volume: { type: "linear", min: 0, max: 1.3 },
    ch1Pan: { type: "linear", min: -1, max: 1 },
    ch2Volume: { type: "linear", min: 0, max: 1.3 },
    ch2Pan: { type: "linear", min: -1, max: 1 },
    ch3Volume: { type: "linear", min: 0, max: 1.3 },
    ch3Pan: { type: "linear", min: -1, max: 1 },
    ch4Volume: { type: "linear", min: 0, max: 1.3 },
    ch4Pan: { type: "linear", min: -1, max: 1 },
    masterVolume: { type: "linear", min: 0, max: 1.3 },
  };

  function clamp01(value) {
    return Math.min(1, Math.max(0, value));
  }

  function toNormalized(spec, internal) {
    return ((internal ?? spec.min) - spec.min) / (spec.max - spec.min);
  }

  function fromNormalized(spec, value) {
    var normalized = clamp01(value);
    return spec.min + normalized * (spec.max - spec.min);
  }

  Mixer.prototype.getParameter = function (id) {
    if (id === "masterVolume") {
      return this.masterGain.gain.value;
    }
    var match = id.match(/^ch([1-4])(Volume|Pan)$/);
    if (!match) {
      return;
    }
    var channel = this.channels[Number(match[1]) - 1];
    if (match[2] === "Volume") {
      return channel.currGain;
    }
    return channel.panner.pan.value;
  };

  Mixer.prototype.setParameter = function (id, value) {
    if (id === "masterVolume") {
      this.masterGain.gain.value = value;
      setFaderFromVolume(this.masterFader, value, 285);
      return;
    }
    var match = id.match(/^ch([1-4])(Volume|Pan)$/);
    if (!match) {
      return;
    }
    var channel = this.channels[Number(match[1]) - 1];
    if (match[2] === "Volume") {
      channel.currGain = value;
      setFaderFromVolume(channel.faderControl, value, 295);
      channel.enableDisableChannels();
      return;
    }
    var pan = value;
    if (pan < -1) pan = -1;
    if (pan > 1) pan = 1;
    channel.panner.pan.value = pan;
    setDialFromChangeVal(channel.pannerControl, pan * 31);
  };

  function Channel(input, trackName, mixer, ctx, count) {
    this.count = count;
    this.mixer = mixer;
    this.currGain = 1;
    this.el = $(channelTemplate);
    this.input = input;
    this.ctx = ctx;
    this.on = true;
    this.soloed = false;
    this.trackName = trackName;
    this.createChannelFilters();
    this.createChannelPanner();
    this.createChannelFader();
    this.connect();
    this.createChannelControls();
    this.el.insertBefore(this.mixer.el.find(".master-channel"));
  }

  Channel.prototype.enableDisableChannels = function () {
    var i;
    for (i = 0; i < this.mixer.channels.length; ++i) {
      if (!this.mixer.channels[i].on) {
        this.mixer.channels[i].gain.gain.value = 0;
      } else if (this.mixer.channels[i].on) {
        if (this.mixer.soloed === 0) {
          this.mixer.channels[i].gain.gain.value =
            this.mixer.channels[i].currGain;
        } else if (this.mixer.soloed > 0 && this.mixer.channels[i].soloed) {
          this.mixer.channels[i].gain.gain.value =
            this.mixer.channels[i].currGain;
        } else {
          this.mixer.channels[i].gain.gain.value = 0;
        }
      }
    }
  };

  //break event listeners out in to seperate method
  Channel.prototype.createChannelControls = function () {
    var self = this;
    this.highShelfControl = new RotaryKnob(this.el, "HIGH");
    this.highShelfControl.on("change", function (e, val) {
      self.highShelfFilter.gain.value = val;
    });
    this.midControl = new RotaryKnob(this.el, "MID", "mid");
    this.midControl.on("change", function (e, val) {
      self.midFilter.gain.value = val;
    });
    this.midFrequencyControl = new RotaryKnob(this.el, "MID", "mid");
    this.midFrequencyControl.on("change", function (e, val) {
      //a little hack to get rotary to output frequency between 100hz-10khz
      var pos = val + 32;
      var value = pos < 30 ? pos * 100 : pos * 160;
      if (value < 100) value = 100;
      self.midFilter.frequency.value = value;
    });
    this.lowShelfControl = new RotaryKnob(this.el, "LOW");
    this.lowShelfControl.on("change", function (e, val) {
      self.lowShelfFilter.gain.value = val;
    });
    this.pannerControl = new RotaryKnob(this.el, "PAN", "panner");
    this.pannerControl.on("change", function (e, val) {
      var pan = val / 31;
      if (pan < -1) pan = -1;
      if (pan > 1) pan = 1;
      self.panner.pan.value = pan;
    });
    this.soloControl = new Button(this.el, "solo", undefined, "SOLO");
    this.soloControl.on("focused", function (e, val) {
      if ($(this).hasClass("on")) {
        self.mixer.soloed--;
        $(this).removeClass("on");
        self.soloed = false;
      } else {
        self.soloed = true;
        $(this).addClass("on");
        self.mixer.soloed++;
      }
      self.enableDisableChannels();
    });
    this.muteControl = new Button(this.el, "mute", "ON");
    this.muteControl.on("focused", function (e, val) {
      if ($(this).hasClass("off")) {
        $(this).removeClass("off");
        self.on = true;
      } else {
        $(this).addClass("off");
        self.on = false;
      }
      self.enableDisableChannels();
    });
    this.faderControl = new Fader(this.el, this.count);
    this.faderControl.on("fader", function (e, val) {
      var oldMin = 295,
        oldMax = 0,
        newMin = 0,
        newMax = 1.3;
      var newVol =
        ((val - oldMin) / (newMin - oldMin)) * (newMax - newMin) + newMin;
      self.currGain = newVol;
      self.enableDisableChannels();
    });
  };

  Channel.prototype.connect = function () {
    this.input.connect(this.highPassFilter);
    this.highPassFilter.connect(this.lowShelfFilter);
    this.lowShelfFilter.connect(this.highShelfFilter);
    this.highShelfFilter.connect(this.midFilter);
    this.midFilter.connect(this.panner);
    this.panner.connect(this.gain);
    this.gain.connect(this.mixer.masterGain);
  };

  Channel.prototype.disconnect = function () {
    if (this.input) this.input.disconnect();
    if (this.highPassFilter) this.highPassFilter.disconnect();
    if (this.lowShelfFilter) this.lowShelfFilter.disconnect();
    if (this.highShelfFilter) this.highShelfFilter.disconnect();
    if (this.midFilter) this.midFilter.disconnect();
    if (this.panner) this.panner.disconnect();
    if (this.gain) this.gain.disconnect();
  };

  Channel.prototype.createChannelPanner = function () {
    this.panner = this.ctx.createStereoPanner();
    this.panner.pan.value = 0;
  };

  Channel.prototype.createChannelFader = function () {
    this.gain = this.ctx.createGain();
    this.gain.gain.value = 1.0;
  };

  Channel.prototype.createChannelFilters = function () {
    this.highPassFilter = Filter(this.ctx, "highpass", 80, 0);
    this.lowShelfFilter = Filter(this.ctx, "lowshelf", 90, 0);
    this.highShelfFilter = Filter(this.ctx, "highshelf", 10000, 0);
    this.midFilter = Filter(this.ctx, "peaking", 10000, 0);
  };

  Channel.prototype.writeStateBytes = function (view, bytes, offset) {
    view.setFloat32(offset, this.highShelfFilter.gain.value, true);
    view.setFloat32(offset + 4, this.midFilter.gain.value, true);
    view.setFloat32(offset + 8, this.midFilter.frequency.value, true);
    view.setFloat32(offset + 12, this.lowShelfFilter.gain.value, true);
    view.setFloat32(offset + 16, this.panner.pan.value, true);
    view.setFloat32(offset + 20, this.currGain, true);
    bytes[offset + 24] = (this.on ? 1 : 0) | (this.soloed ? 2 : 0);
    return offset + MIXER_CHANNEL_BYTES;
  };

  Channel.prototype.readStateBytes = function (view, bytes, offset) {
    var highGain = view.getFloat32(offset, true);
    var midGain = view.getFloat32(offset + 4, true);
    var midFreq = view.getFloat32(offset + 8, true);
    var lowGain = view.getFloat32(offset + 12, true);
    var pan = view.getFloat32(offset + 16, true);
    var currGain = view.getFloat32(offset + 20, true);
    var flags = bytes[offset + 24];

    this.highShelfFilter.gain.value = highGain;
    this.midFilter.gain.value = midGain;
    this.midFilter.frequency.value = midFreq;
    this.lowShelfFilter.gain.value = lowGain;
    this.panner.pan.value = pan;
    this.currGain = currGain;
    this.on = (flags & 1) !== 0;
    this.soloed = (flags & 2) !== 0;

    setDialFromChangeVal(this.highShelfControl, highGain);
    setDialFromChangeVal(this.midControl, midGain);
    setDialFromChangeVal(this.midFrequencyControl, midFreqToChangeVal(midFreq));
    setDialFromChangeVal(this.lowShelfControl, lowGain);
    setDialFromChangeVal(this.pannerControl, pan * 31);
    setFaderFromVolume(this.faderControl, currGain, 295);

    if (this.on) this.muteControl.removeClass("off");
    else this.muteControl.addClass("off");
    if (this.soloed) this.soloControl.addClass("on");
    else this.soloControl.removeClass("on");

    return offset + MIXER_CHANNEL_BYTES;
  };

  function init() {
    var daw = new Daw();

    unitInterface?.completeSetup({
      unitAspects: {
        unitType: "effect",
        viewSize: [852, 464],
      },
      persistence: {
        emitStateBytes() {
          return daw.mixer.emitStateBytes();
        },
        applyStateBytes(stateBytes) {
          daw.mixer.applyStateBytes(stateBytes);
        },
      },
      automationInput: {
        getParameterSpecs() {
          return Object.keys(AUTOMATION_PARAM_MAP).map(function (id) {
            return { id: id };
          });
        },
        getParameter(id) {
          var spec = AUTOMATION_PARAM_MAP[id];
          if (!spec) {
            return;
          }
          return toNormalized(spec, daw.mixer.getParameter(id));
        },
        setParameter(id, value) {
          var spec = AUTOMATION_PARAM_MAP[id];
          if (!spec) {
            return;
          }
          daw.mixer.setParameter(id, fromNormalized(spec, value));
        },
      },
      cleanup() {
        daw.mixer.disconnect();
      },
    });
  }

  var channelTemplate =
    '<div class="channel"><div class="channel-left"></div><div class="channel-right"></div></div>';
  var rotaryKnobTemplate =
    '<div class="dial-container"><div class="notches"></div><div class="dial"><div class="dial-inner"></div></div></div>';
  window.addEventListener("load", init, false);
})();
