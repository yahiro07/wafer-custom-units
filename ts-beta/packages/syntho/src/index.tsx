import ReactDOM from "react-dom";
import "./index.css";
import { SynthoEngine } from "./audio/engine";
import { SynthUI } from "./ui/synth-ui";
import { FrequencyMap } from "./audio/frequency-map";
import { queryUnitInterface } from "wafer-host/unit-types";
import { Vco } from "./audio/vco";

const unitInterface = queryUnitInterface("wafer-v01");

const audioContext = unitInterface?.audioContext ?? new AudioContext();
const destinationNode =
  unitInterface?.audioOutputNode ?? audioContext.destination;
const engine = new SynthoEngine(audioContext, destinationNode);

let lastNoteNumber = 0;
const noteRoute = {
  _affectVcoFrequency(vco: Vco, noteNumber) {
    const relOctave = vco.octave - 4;
    const note = noteNumber + relOctave * 12;
    vco.frequency = frequencyMap.getFrequency(note);
  },
  noteOn(noteNumber) {
    this._affectVcoFrequency(engine.vco1, noteNumber);
    this._affectVcoFrequency(engine.vco2, noteNumber);
    this._affectVcoFrequency(engine.vco3, noteNumber);
    engine.trigger(1);
    lastNoteNumber = noteNumber;
  },
  noteOff(noteNumber) {
    if (noteNumber === lastNoteNumber) {
      engine.trigger(0);
      lastNoteNumber = -1;
    }
  },
};

unitInterface?.completeSetup({
  unitAspects: {
    unitType: "instrument",
    outputs: ["audio"],
    inputs: ["note"],
    viewSize: [1200, 620],
  },
  noteInput: {
    noteOn(noteNumber, time, velocity) {
      noteRoute.noteOn(noteNumber);
    },
    noteOff(noteNumber, time) {
      noteRoute.noteOff(noteNumber);
    },
  },
});

const frequencyMap = new FrequencyMap();
ReactDOM.render(
  <SynthUI engine={engine} frequencyMap={frequencyMap} />,
  document.getElementById("root"),
);
