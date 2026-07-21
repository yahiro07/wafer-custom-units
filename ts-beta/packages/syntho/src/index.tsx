import ReactDOM from "react-dom";
import "./index.css";
import { SynthoEngine } from "./audio/engine";
import { SynthUI } from "./ui/synth-ui";
import { FrequencyMap } from "./audio/frequency-map";
import { queryUnitInterface } from "wafer-host/unit-types";

const unitInterface = queryUnitInterface("wafer-v01");

const audioContext = unitInterface?.audioContext ?? new AudioContext();
const destinationNode =
  unitInterface?.audioOutputNode ?? audioContext.destination;
const engine = new SynthoEngine(audioContext, destinationNode);
const frequencyMap = new FrequencyMap();

ReactDOM.render(
  <SynthUI
    engine={engine}
    frequencyMap={frequencyMap}
    unitInterface={unitInterface}
  />,
  document.getElementById("root"),
);
