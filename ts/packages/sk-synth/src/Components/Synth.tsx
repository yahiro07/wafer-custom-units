import React from "react";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import * as Tone from "tone";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import { Keyboard } from "./Keyboard";
import { Oscillator, Toggle, Parameter, effects } from "./Control";
import { defaultType } from "./Control/Oscillator";
import { createWaferToneSynthBridge } from "../wafer-tone-synth-bridge";
import {
  applyParameters,
  DEFAULT_PARAMETERS,
  parsePersistedState,
  SynthParameters,
} from "../synthState";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: "flex",
      maxWidth: 700,
      justifyContent: "center",
      alignItems: "center",
    },
    synth: {
      "background-color": "indianred",
      "box-shadow":
        "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
    },
    paper: {
      padding: theme.spacing(2),
      textAlign: "center",
      color: theme.palette.text.secondary,
      "background-color": "bisque",
    },
  }),
);

const waferToneSynthBridge = createWaferToneSynthBridge();

const effectsChain = Object.entries(effects).map(
  ([name, effect]) => effect.object,
);
const synth = new Tone.MonoSynth({ oscillator: { type: defaultType } }).chain(
  ...effectsChain,
  waferToneSynthBridge.destinationNode,
);

applyParameters(synth, DEFAULT_PARAMETERS);

export const Synth = () => {
  const titleDelimiter = " ";
  const [parameters, setParameters] =
    React.useState<SynthParameters>(DEFAULT_PARAMETERS);
  const persistenceRef = React.useRef({
    emitPersistedState: () => ({ parameters: DEFAULT_PARAMETERS }),
    applyPersistedState: (_state: unknown) => {},
  });

  persistenceRef.current = {
    emitPersistedState: () => ({ parameters }),
    applyPersistedState: (state) => {
      const nextParameters = parsePersistedState(state);
      if (!nextParameters) return;
      setParameters(nextParameters);
    },
  };

  React.useEffect(() => {
    applyParameters(synth, parameters);
  }, [parameters]);

  React.useEffect(() => {
    waferToneSynthBridge.unitInterface?.completeSetup({
      unitAspects: {
        unitType: "instrument",
        viewSize: [756, 370],
      },
      noteInput: waferToneSynthBridge.createNotePortAdapted(synth),
      persistence: {
        emitState() {
          return persistenceRef.current.emitPersistedState();
        },
        applyState(state) {
          persistenceRef.current.applyPersistedState(state);
        },
      },
    });
  }, []);

  const updateParameters = (partial: Partial<SynthParameters>) => {
    setParameters((current) => ({ ...current, ...partial }));
  };

  const titleAdjectiveString = React.useMemo(() => {
    const activeAdjectives = [
      parameters.pitchShift.enabled ? effects.pitchShift.adjective : "",
      parameters.filter.enabled ? effects.filter.adjective : "",
      parameters.distortion.enabled ? effects.distortion.adjective : "",
    ].filter(Boolean);

    return (
      titleDelimiter + activeAdjectives.join(titleDelimiter) + titleDelimiter
    );
  }, [parameters]);

  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Grid
        className={classes.synth}
        container
        spacing={2}
        alignItems="center"
        justifyContent="center"
      >
        <Grid item xs={12}>
          <Paper className={classes.paper} style={{ fontSize: "1.5rem" }}>
            My{titleAdjectiveString || titleDelimiter}Synth
          </Paper>
        </Grid>
        <Grid container item xs={3} alignItems="center" justifyContent="center">
          <Grid item xs={12}>
            <Oscillator
              value={parameters.oscillatorType}
              onChange={(oscillatorType) => updateParameters({ oscillatorType })}
            />
          </Grid>
        </Grid>
        <Grid container item xs={3} alignItems="center" justifyContent="center">
          <Grid item xs={6}>
            <Toggle
              text={effects.pitchShift.name}
              selected={parameters.pitchShift.enabled}
              onChange={(enabled) =>
                updateParameters({
                  pitchShift: { ...parameters.pitchShift, enabled },
                })
              }
            />
          </Grid>
          <Grid item xs={6}>
            <Parameter
              value={parameters.pitchShift.pitch}
              onChange={(pitch) =>
                updateParameters({
                  pitchShift: { ...parameters.pitchShift, pitch },
                })
              }
            />
          </Grid>
        </Grid>
        <Grid container item xs={3} alignItems="center" justifyContent="center">
          <Grid item xs={6}>
            <Toggle
              text={effects.filter.name}
              selected={parameters.filter.enabled}
              onChange={(enabled) =>
                updateParameters({
                  filter: { ...parameters.filter, enabled },
                })
              }
            />
          </Grid>
          <Grid item xs={6}>
            <Parameter
              value={parameters.filter.sensitivity}
              max={50}
              onChange={(sensitivity) =>
                updateParameters({
                  filter: { ...parameters.filter, sensitivity },
                })
              }
            />
          </Grid>
        </Grid>
        <Grid container item xs={3} alignItems="center" justify="center">
          <Grid item xs={6}>
            <Toggle
              text={effects.distortion.name}
              selected={parameters.distortion.enabled}
              onChange={(enabled) =>
                updateParameters({
                  distortion: { ...parameters.distortion, enabled },
                })
              }
            />
          </Grid>
          <Grid item xs={6}>
            <Parameter
              value={parameters.distortion.amount}
              max={10}
              onChange={(amount) =>
                updateParameters({
                  distortion: { ...parameters.distortion, amount },
                })
              }
            />
          </Grid>
        </Grid>
        <Grid item xs={12} alignItems="center" justifyContent="center">
          <Keyboard synth={synth} />
        </Grid>
      </Grid>
    </div>
  );
};
