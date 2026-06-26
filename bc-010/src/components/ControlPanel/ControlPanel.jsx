// @flow
import OctaveContainer from './../OctaveContainer';
import WaveformContainer from './../WaveformContainer';
import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';
import SliderBank from '../SliderBank/SliderBank';
import envelopeSliders from './../../data/envelopeSliders.json';
import filterSliders from './../../data/filterSliders.json';

const ControlPanelContainer = styled.section`
  align-items: flex-start;
  background-color: ${({ theme }) => theme.background};
  border: 2px solid ${({ theme }) => theme.primary};
  display: flex;
  height: 50vh;
  justify-content: space-between;
  padding: 1%;
  transition: all ${({ theme }) => theme.globalTransition};
`;

type Props = {
  filterParams: Object,
  octave: number,
  synthParams: Object,
  toggleOscillator: Function,
};

/** Component to hold all tweakable parameters (e.g. sliders, knobs etc.) for the synth. */
function ControlPanel({
  filterParams,
  octave,
  toggleOscillator,
  synthParams,
}: Props) {
  return (
    <ControlPanelContainer>
      <WaveformContainer />
      <SliderBank
        bankName="envelope"
        sliderParams={synthParams}
        sliderArray={envelopeSliders}
        typeOfParams="synthParams"
      />
      <SliderBank
        bankName="filter"
        sliderParams={filterParams}
        sliderArray={filterSliders}
        typeOfParams="filterParams"
      />
      <OctaveContainer key="octave-container" octave={octave} />
    </ControlPanelContainer>
  );
}

ControlPanel.propTypes = {
  /** Holds all tweakable properties for the Tone.js filter. */
  filterParams: PropTypes.object,
  /** Current octave for the keyboard. Derived from App.jsx state. */
  octave: PropTypes.number,
  /** Holds all tweakable properties for the Tone.js synth. */
  synthParams: PropTypes.object,
  /** Handles change in oscillator types for Tone.js synth. */
  toggleOscillator: PropTypes.func,
};

export default ControlPanel;
