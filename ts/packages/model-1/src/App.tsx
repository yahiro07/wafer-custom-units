import { useSynthSelectors, useSynthStore } from "./store/synthStore";
import styles from "./styles/App.module.css";
import "./styles/variables.css";
import PresetSelector from "./components/PresetSelector/PresetSelector";
import { presets } from "./synth/presets";
import Synth from "./components/Synth/Synth";
import { unitInterface } from "@/synth/audio/wafer-unit-interface";
import { midiNoteToNote } from "@/hooks/useMidiHandling";
import { useEffect } from "react";
import { applyPresetSettings } from "./store/utils/applyParameters";
import {
  applyPersistedState,
  emitPersistedState,
} from "./store/utils/persistence";

function App() {
  const selectedPresetName = useSynthSelectors.useSelectedPresetName();
  const setSelectedPresetName = useSynthSelectors.useSetSelectedPresetName();
  const keyboardRef = useSynthSelectors.useKeyboardRef();
  const synth = keyboardRef.synth;

  const handlePresetSelect = (presetName: string) => {
    const preset = presets[presetName];
    if (!preset) return;

    setSelectedPresetName(presetName);
    applyPresetSettings(useSynthStore.getState(), preset);
  };

  useEffect(() => {
    if (synth) {
      unitInterface?.completeSetup({
        unitAspects: {
          unitType: "instrument",
          viewSize: [1180, 540],
        },
        noteInput: {
          noteOn(noteNumber) {
            synth?.triggerAttack(midiNoteToNote(noteNumber));
          },
          noteOff(noteNumber) {
            synth?.triggerRelease(midiNoteToNote(noteNumber));
          },
        },
        persistence: {
          emitState: emitPersistedState,
          applyState: applyPersistedState,
        },
      });
    }
  }, [synth]);

  return (
    <div className={styles.appContainer}>
      <PresetSelector
        selectedPresetName={selectedPresetName}
        onPresetSelect={handlePresetSelect}
      />
      <Synth />
      {/* <Footer /> */}
    </div>
  );
}

export default App;
