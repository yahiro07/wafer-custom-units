/*
 * rompler_dsp.js
 *
 * This program is licensed under the MIT License.
 * Copyright 2012, aike (@aike1000)
 *
 */

var conf = {
  url: "http://aikelab.net/pg01/",
  x: 180,
  y: -5,
  basenote: 40,
  num_note: 13,
  num_mp3: 21,
};

const unitInterface = window.queryUnitInterface?.("wafer-v01");
const audioContext = unitInterface?.audioContext ?? new AudioContext();
const destinationNode =
  unitInterface?.audioOutputNode ?? audioContext.destination;

/////////////////////////////////////////////////////
var SampleBuffer = function (ctx, url, callback) {
  this.ctx = ctx;
  this.url = url;
  this.onload = callback;
  this.buffer = null;
};

SampleBuffer.prototype.loadBuffer = function (callback) {
  var request = new XMLHttpRequest();
  request.open("GET", this.url, true);
  request.responseType = "arraybuffer";

  var self = this;
  request.onload = function () {
    self.ctx.decodeAudioData(
      request.response,
      function (buffer) {
        if (!buffer) {
          console.log("error decode buffer: " + self.url);
          return;
        }
        self.buffer = buffer;
        m.ready_mp3++;
        if (m.ready_mp3 < conf.num_mp3)
          $("#lcd").text(
            "loading ... (" + m.ready_mp3 + "/" + conf.num_mp3 + ")",
          );
        else {
          //					lcd.show('load OK');
        }
        if (callback) {
          callback(self.buffer.getChannelData(0));
        }
      },
      function () {
        console.log("error decoding process: " + self.url);
        return;
      },
    );
  };
  request.onerror = function () {
    alert("BufferLoader: XHR error");
  };

  request.send();
};

/////////////////////////////////////////////////////
var Key = function (ctx, urls, layer, rel_smp) {
  this.max_smp = urls.length;
  this.layer_smp = this.max_smp / layer;
  this.cur_smp = 0;
  this.sample = new Array(this.max_smp);
  var buf;
  for (var i = 0; i < this.max_smp; i++) {
    this.sample[i] = new SampleBuffer(ctx, "./mp3/" + urls[i]);
    buf = this.sample[i];
    buf.loadBuffer();
  }
  this.rel_smp = new SampleBuffer(ctx, "./mp3/" + rel_smp);
  buf = this.rel_smp;
  buf.loadBuffer();

  this.playing = false;
  this.next_node = null;
  this.layer = 0;
  this.hold_count = 0;
};

Key.prototype.connect = function (next_node) {
  this.next_node = next_node;
};

Key.prototype.noteOn = function (ctx, layer, time) {
  time = Math.max(time ?? 0, ctx.currentTime);
  if (!this.playing) {
    this.src = ctx.createBufferSource();
    var smp = this.cur_smp + this.layer_smp * layer;
    if (this.sample[smp].buffer != null) {
      this.src.buffer = this.sample[smp].buffer;
      this.cur_smp = (this.cur_smp + 1) % this.layer_smp;
      this.src.connect(this.next_node);
      this.src.start(time);
    }
    // �b��F���C���[�[���imute�j�͏d�˂�note on�\�Ƃ���
    this.layer = layer;
    if (this.layer > 0) this.playing = true;
  }
};

Key.prototype.noteOff = function (ctx, time) {
  time = Math.max(time ?? 0, ctx.currentTime);
  if (this.playing) {
    this.src.stop(time);
    this.playing = false;

    // release note
    if (this.layer > 0) {
      this.src = ctx.createBufferSource();
      if (this.rel_smp.buffer != null) {
        this.src.buffer = this.rel_smp.buffer;
        this.src.connect(this.next_node);
        this.src.start(time);
      }
    }
  }
};

/////////////////////////////////////////////////////
var MasterTrack = function (ctx) {
  this.comp = ctx.createDynamicsCompressor();
  this.fader = ctx.createGain();
  this.fader.gain.value = 50 / 100;

  // doubling effects
  this.Lch = ctx.createPanner();
  this.Lch.setPosition(1.0, 0, -1.0);
  this.subgain = ctx.createGain();
  this.subgain.gain.value = 0.98;

  this.Rch = ctx.createPanner();
  this.Rch.setPosition(-1.0, 0, -1.0);
  this.delay = ctx.createDelay();
  this.delay.delayTime.value = 0.04;

  this.comp.connect(this.fader);
  // Lch
  this.fader.connect(this.subgain);
  this.subgain.connect(this.Lch);
  this.Lch.connect(destinationNode);
  // Rch
  this.fader.connect(this.delay);
  this.delay.connect(this.Rch);
  this.Rch.connect(destinationNode);
};

MasterTrack.prototype.get_node = function () {
  return this.comp;
};

MasterTrack.prototype.gain = function (val) {
  if (val != null) this.fader.gain.value = val / 100;
  else this.fader.gain.value = 50 / 100;
};

/////////////////////////////////////////////////////
var Rompler = function () {
  this.ready_mp3 = 0;
  this.ctx = audioContext;
  this.master = new MasterTrack(this.ctx);

  this.keys = new Array(conf.num_note);
  for (var i = 0; i < conf.num_note; i++) {
    var note = ("0" + i).slice(-2);
    this.keys[i] = new Key(
      this.ctx,
      [
        note + "0000.mp3",
        note + "0001.mp3",
        note + "0002.mp3",
        note + "0003.mp3",
        note + "0101.mp3",
        note + "0101.mp3",
        note + "0102.mp3",
        note + "0103.mp3",
      ],
      2,
      note + "01re.mp3",
    );
    this.keys[i].connect(this.master.get_node());
  }

  // check & retry
  var self = this;
  setTimeout(function () {
    self.check_data();
  }, 5000);
};

Rompler.prototype.check_data = function () {
  var err_cnt = 0;
  for (var i = 0; i < conf.num_note; i++) {
    for (var j = 0; j < this.keys[i].max_smp; j++) {
      if (this.keys[i].sample[j].buffer == null) {
        err_cnt++;
        console.log("error: " + this.keys[i].sample[j].url);
      }
    }
  }
  if (err_cnt != 0) {
    var self = this;
    setTimeout(function () {
      self.check_data();
    }, 1500);
  }
};

Rompler.prototype.mastergain = function (val) {
  this.master.gain(val);
};

Rompler.prototype.noteOn = function (note, vel, time) {
  var layer = vel >= 64 ? 1 : 0;
  const key = this.keys[note - conf.basenote];
  key.noteOn(this.ctx, layer, time);
  key.hold_count++;
};

Rompler.prototype.noteOff = function (note, time) {
  const key = this.keys[note - conf.basenote];
  if (key.hold_count > 0) {
    if (--key.hold_count === 0) {
      key.noteOff(this.ctx, time);
    }
  }
};

Rompler.prototype.resetRoundrobin = function (note) {
  for (var i = 0; i < 16; i++) {
    this.keys[i - conf.basenote].cur_smp = 0;
  }
};

var m = new Rompler();
