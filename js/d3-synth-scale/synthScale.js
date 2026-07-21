const unitInterface = window.queryUnitInterface?.("wafer-v01");
const audioContext = unitInterface?.audioContext ?? new AudioContext();
const audioDestination =
  unitInterface?.audioOutputNode ?? audioContext.destination;
const noteOutputPort = unitInterface?.createNoteOutputPort();

//helper functions
var f = function (str) {
  return function (obj) {
    return str ? obj[str] : obj;
  };
};
var compose = function (g, h) {
  return function (d) {
    return g(h(d));
  };
};

var width = 750,
  height = 750,
  numBeats = 16,
  pitches = [
    130.81,
    146.83,
    164.81,
    174.61,
    196.0,
    220.0,
    246.94,
    261.63,
    146.83 * 2,
    164.81 * 2,
    174.61 * 2,
    196.0 * 2,
    220.0 * 2,
    246.94 * 2,
    261.63 * 2,
  ].reverse();

//beat number to angle
var rotationScale = d3.scale
  .linear()
  .domain([0, numBeats - 1])
  .range([360 / numBeats, 360]);

//pitch index to distance from center of circle
var heightScale = d3.scale
  .linear()
  .domain([0, pitches.length])
  .range([100, height / 2 - 1]);

//member of pitchs to arc path
var arc = d3.svg
  .arc()
  .innerRadius(function (d, i) {
    return heightScale(i);
  })
  .outerRadius(function (d, i) {
    return heightScale(i + 1) - 0;
  })
  .startAngle(0)
  .endAngle((2 * Math.PI) / numBeats);

//waveform number to color
var color = d3.scale
  .ordinal()
  .domain(d3.range(4))
  .range(["white", "#338AE5", "#FFB800", "#BA5FD6"]);

//translate (0, 0) to center of svg to make circle math easier
var svg = d3
  .select("#synth")
  .attr("height", height)
  .attr("width", width)
  .append("g")
  .attr("transform", "translate(" + [width / 2, height / 2] + ")");

//create a g element for each beat
//rotated so we only have to worry about circular math
var beats = svg
  .selectAll("g")
  .data(d3.range(numBeats))
  .enter()
  .append("g")
  .attr("transform", function (d) {
    return "rotate(" + rotationScale(d) + ")";
  });

//add array of notes to each beat
var notes = beats
  .selectAll("path")
  .data(function () {
    return pitches.map(function (d, i) {
      return { pitch: d, lockon: 0 };
    });
  })
  .enter()
  .append("path")
  .attr("d", arc)
  .on("click", function (d) {
    d.lockon = (d.lockon + 1) % 4;
    d.on = d.lockon;
    d3.select(this).call(colorNote).style("stroke", "black");
  })
  .on("mouseover", function (d) {
    d.on = (d.lockon + 1) % 4;
    d3.select(this).transition().duration(100).style("fill", color(d.on));
  })
  .on("mouseout", function (d) {
    d.on = d.lockon;
    d3.select(this).transition().duration(1000).call(colorNote);
  })
  .style("stroke-width", 1.4)
  .style("stroke", "lightgrey")
  .style("fill", "white");

function colorNote(selection) {
  selection.style("fill", compose(color, f("on")));
}

// var ac = null;
var isPlaying = false;
var nextBeat = 0;
var nextBeatTime = 0;
var schedulerId = null;

function ensureAudio() {
  if (!unitInterface) {
    if (audioContext.state === "suspended") {
      audioContext.resume();
    }
  }
}

function startPlayback() {
  ensureAudio();
  isPlaying = true;
  nextBeat = 0;
  nextBeatTime = audioContext.currentTime;
  updatePlayButton();
  if (!schedulerId) {
    schedulerId = setInterval(scheduleNotes, 25);
  }
}

function stopPlayback() {
  isPlaying = false;
  nextBeat = 0;
  updatePlayButton();
}

function togglePlayback() {
  if (isPlaying) stopPlayback();
  else startPlayback();
}

function scheduleNotes() {
  if (!isPlaying || !audioContext) return;
  //ac time is more accurate than setInterval, look ahead 100 ms to schedule notes
  while (nextBeatTime < audioContext.currentTime + 0.1) {
    //grab the active beat column
    beats
      .filter(function (d, i) {
        return i == nextBeat;
      })
      .selectAll("path")
      .each(function (d) {
        //if the note is selected, play pitch at scheduled nextBeat
        if (d.on) {
          triggerNote(d.pitch, nextBeatTime, getDuration(), d.on);
        }
        //highlight and unhighlight selected column
        //visually exact timing doesn't matter as much
        //easier to hear something off by a few ms
        var selection = d3.select(this).style("stroke", "grey");
        //use timeout instead of transition so mouseovers transitions don't cancel)
        setTimeout(function () {
          selection.style("stroke", "lightgrey");
        }, getBPM() * 1000);
      });

    //update time and index of nextBeat
    nextBeatTime += getBPM();
    nextBeat = (nextBeat + 1) % numBeats;
  }
}

function updatePlayButton() {
  playButton
    .style("background", isPlaying ? "#338AE5" : "#eee")
    .style("color", isPlaying ? "white" : "#333");
}

//add play button and sliders to the page
var controls = d3.select("#synthSliders").style({
  display: "flex",
  "align-items": "center",
  "justify-content": "center",
  gap: "24px",
  "margin-top": "12px",
});

var playButton = controls
  .append("button")
  .attr("id", "Play")
  .text("Play")
  .style({
    width: "72px",
    height: "40px",
    border: "1px solid #ccc",
    "border-radius": "4px",
    background: "#eee",
    color: "#333",
    cursor: "pointer",
    "font-size": "14px",
    "font-weight": "bold",
  })
  .on("click", togglePlayback);

var sliders = controls
  .selectAll(".slider")
  .data(["Pitch", "BPM", "Duration"])
  .enter()
  .append("div")
  .attr("class", "slider")
  .style({
    display: "inline-block",
    "text-align": "center",
  });

sliders.append("p").style("margin", "4px 0").text(f());

sliders
  .append("p")
  .style("margin", "4px 0")
  .append("input")
  .attr("type", "range")
  .attr("id", f())
  .attr("min", function (d) {
    return d === "Pitch" ? "-2" : "0";
  })
  .attr("max", function (d) {
    return d === "Pitch" ? "2" : "1";
  })
  .attr("step", function (d) {
    return d === "Pitch" ? "1" : "0.0001";
  })
  .attr("value", function (d) {
    return d === "Pitch" ? "0" : ".5";
  })
  .style("width", "127px");

function clearNotes() {
  notes.each(function (d) {
    d.lockon = 0;
    d.on = 0;
  });
  notes.call(colorNote).style("stroke", "lightgrey");
}

controls
  .append("button")
  .attr("id", "Clear")
  .text("Clear")
  .style({
    width: "72px",
    height: "40px",
    border: "1px solid #ccc",
    "border-radius": "4px",
    background: "#eee",
    color: "#333",
    cursor: "pointer",
    "font-size": "14px",
    "font-weight": "bold",
  })
  .on("click", clearNotes);

//pitch: octave shift (-2..2); bpm/duration: inverse log for finer control
function getPitch() {
  return Math.pow(2, d3.select("#Pitch").node().valueAsNumber);
}
function getBPM() {
  var scale = d3.scale.log().base(2).domain([40, 1200]);
  var rv = 60 / scale.invert(d3.select("#BPM").node().valueAsNumber);
  return rv;
}
function getDuration() {
  var scale = d3.scale.log().base(2).domain([0.05, 1]);
  return scale.invert(d3.select("#Duration").node().valueAsNumber);
}

//generate oscillator
function triggerNote(pitch, time, duration, waveform) {
  let frequency = pitch * getPitch();
  if (true) {
    //output audio
    const oscillator = audioContext.createOscillator();
    oscillator.type = ["dummy", "sine", "triangle", "square"][waveform];
    oscillator.frequency.value = frequency;
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioDestination);

    const peak = 0.2;
    const attack = 0.005;
    const release = 0.01;
    const fade = Math.min(attack + release, duration * 0.4);
    const attackTime = fade * (attack / (attack + release));
    const releaseTime = fade - attackTime;

    gainNode.gain.setValueAtTime(0, time);
    gainNode.gain.linearRampToValueAtTime(peak, time + attackTime);
    gainNode.gain.setValueAtTime(peak, time + duration - releaseTime);
    gainNode.gain.linearRampToValueAtTime(0, time + duration);

    oscillator.start(time);
    oscillator.stop(time + duration + 0.001);
  }
  if (noteOutputPort) {
    const noteNumber = Math.round(12 * Math.log2(frequency / 440) + 69);
    noteOutputPort.noteOn(noteNumber, time, 1);
    noteOutputPort.noteOff(noteNumber, time + duration);
  }
}

// [pitchOffset][bpm f32 LE][duration f32 LE][lockon × beats × pitches]
var STATE_HEADER_BYTES = 1 + 4 + 4;
var STATE_BYTE_LENGTH = STATE_HEADER_BYTES + numBeats * pitches.length;

function emitStateBytes() {
  var bytes = new Uint8Array(STATE_BYTE_LENGTH);
  var view = new DataView(bytes.buffer);
  bytes[0] = d3.select("#Pitch").node().valueAsNumber + 2;
  view.setFloat32(1, d3.select("#BPM").node().valueAsNumber, true);
  view.setFloat32(5, d3.select("#Duration").node().valueAsNumber, true);
  var i = STATE_HEADER_BYTES;
  notes.each(function (d) {
    bytes[i++] = d.lockon & 3;
  });
  return bytes;
}

function applyStateBytes(stateBytes) {
  if (!stateBytes || stateBytes.length !== STATE_BYTE_LENGTH) return;
  var view = new DataView(
    stateBytes.buffer,
    stateBytes.byteOffset,
    stateBytes.byteLength,
  );
  var pitch = stateBytes[0] - 2;
  if (pitch < -2 || pitch > 2) return;
  d3.select("#Pitch").property("value", pitch);
  d3.select("#BPM").property("value", view.getFloat32(1, true));
  d3.select("#Duration").property("value", view.getFloat32(5, true));
  var i = STATE_HEADER_BYTES;
  notes.each(function (d) {
    d.lockon = stateBytes[i++] & 3;
    d.on = d.lockon;
  });
  notes.call(colorNote).style("stroke", "lightgrey");
}

unitInterface?.completeSetup({
  unitAspects: {
    unitType: "sequencer",
    viewSize: [900, 880],
  },
  clockHandlers: {
    start() {},
    stop() {},
    processStep(stepIndex, time, unitDurationSec) {
      if (stepIndex % 2 === 0) {
        const si = Math.floor(stepIndex / 2) % 16;
        beats
          .filter((_, i) => i == si)
          .selectAll("path")
          .each(function (d) {
            if (d.on) {
              triggerNote(d.pitch, time, getDuration(), d.on);
            }
            var selection = d3.select(this).style("stroke", "grey");
            setTimeout(() => {
              selection.style("stroke", "lightgrey");
            }, getBPM() * 1000);
          });
      }
    },
  },
  persistence: {
    emitStateBytes,
    applyStateBytes,
  },
});
