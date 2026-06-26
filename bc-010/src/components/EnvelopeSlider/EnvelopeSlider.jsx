// @flow
import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';
import SliderLabel from './../SliderLabel';
import SliderNumberDisplay from './../SliderNumberDisplay';
import VerticalSlider from './../VerticalSlider';

const Container = styled.article`
  border: 1px solid ${props => props.theme.primary};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 5vw;

  @media (max-width: 768px) {
    width: 8vw;
  }
`;

type Props = {
  abbr: string,
  max: number,
  min: number,
  sliderName: string,
  step: number,
  type: string,
  typeOfParams: string,
  value: number,
};

/** Holds all the slider components (SliderLabel, VerticalSlider, SliderNumberDisplay) */
function EnvelopeSlider({
  abbr,
  min,
  max,
  sliderName,
  step,
  type,
  typeOfParams,
  value,
}: Props) {
  return (
    <Container>
      <SliderLabel abbr={abbr} sliderName={type} />
      <VerticalSlider
        sliderName={sliderName}
        max={max}
        min={min}
        step={step}
        type={type}
        typeOfParams={typeOfParams}
        value={value}
      />
      <SliderNumberDisplay value={value} />
    </Container>
  );
}

EnvelopeSlider.propTypes = {
  /** Abbreviation of the parameter the slider changes (eg. A,D,S,R). */
  abbr: PropTypes.string,
  /** Maximum value the slider can reach. */
  max: PropTypes.number,
  /** Minimum value the slider can reach. */
  min: PropTypes.number,
  /** Full name of the parameter the slider changes (eg. "attack", "decay" etc.) */
  sliderName: PropTypes.string,
  /** Specifies the size of each movement for the slider control */
  step: PropTypes.number,
  /** Always listed as "range" so that each HTML slider is of range type. */
  type: PropTypes.string,
  /** Name of the object for the parameter to be adjusted */
  typeOfParams: PropTypes.string,
  /** Value for that parameter as it is in App.jsx state. */
  value: PropTypes.number,
};

export default EnvelopeSlider;
