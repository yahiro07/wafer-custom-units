import { configureStore, createSlice } from "@reduxjs/toolkit";

const initialState = {
  threshold: -36,
  ratio: 4,
  attack: 0.044,
  release: 0.07,
  mix: 1,
  gain: 0,
  sidechain: true,
  bypass: false,
};

export const slice = createSlice({
  name: "compressor",
  initialState,
  reducers: {
    setThreshold: (state, action: { payload: number }) => {
      state.threshold = action.payload;
    },
    setRatio: (state, action: { payload: number }) => {
      state.ratio = action.payload;
    },
    setAttack: (state, action: { payload: number }) => {
      state.attack = action.payload;
    },
    setRelease: (state, action: { payload: number }) => {
      state.release = action.payload;
    },
    setMix: (state, action: { payload: number }) => {
      state.mix = action.payload;
    },
    setGain: (state, action: { payload: number }) => {
      state.gain = action.payload;
    },
    setSidechain: (state, action: { payload: boolean }) => {
      state.sidechain = action.payload;
    },
    setBypass: (state, action: { payload: boolean }) => {
      state.bypass = action.payload;
    },
    setParameters: (_state, action: { payload: typeof initialState }) => {
      return action.payload;
    },
  },
});

export const store = configureStore({
  reducer: {
    compressor: slice.reducer,
  },
});

export type StoreState = ReturnType<(typeof store)["getState"]>;

export const {
  setThreshold,
  setAttack,
  setGain,
  setMix,
  setRatio,
  setRelease,
  setSidechain,
  setBypass,
  setParameters,
} = slice.actions;
