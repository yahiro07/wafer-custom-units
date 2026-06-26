import { combineReducers } from 'redux';
import octave from './components/OctaveContainer/reducer';
import oscillator from './components/WaveformContainer/reducer';
import {
  synthEnvelopeReducer as envelope,
  filterParamsReducer as filterParams,
} from './components/VerticalSlider/reducer';
import {
  sideNavReducer as sideNav,
  presetReducer as preset,
  themeReducer as theme,
} from './components/SideNav/reducer';

const synthesizer = combineReducers({
  oscillator,
  envelope,
});

const rootReducer = combineReducers({
  octave,
  synthesizer,
  filterParams,
  sideNav,
  preset,
  theme,
});

export default rootReducer;
