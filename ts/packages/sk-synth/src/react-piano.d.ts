declare module "react-piano" {
  import * as React from "react";

  export type KeyboardShortcut = {
    key: string;
    midiNumber: number;
  };

  export type KeyboardConfigKey = {
    natural: string;
    flat: string;
    sharp: string;
  };

  export const MidiNumbers: {
    fromNote: (note: string) => number;
  };

  export const KeyboardShortcuts: {
    create: (config: {
      firstNote: number;
      lastNote: number;
      keyboardConfig: KeyboardConfigKey[];
    }) => KeyboardShortcut[];
    HOME_ROW: KeyboardConfigKey[];
    BOTTOM_ROW: KeyboardConfigKey[];
    QWERTY_ROW: KeyboardConfigKey[];
  };

  export type PianoProps = {
    noteRange: {
      first: number;
      last: number;
    };
    width?: number;
    playNote: (midiNumber: number) => void;
    stopNote: (midiNumber: number) => void;
    keyboardShortcuts?: KeyboardShortcut[];
  };

  export const Piano: React.ComponentType<PianoProps>;
}
