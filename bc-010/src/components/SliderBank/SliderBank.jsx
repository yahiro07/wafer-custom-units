// @flow
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import EnvelopeSlider from './../EnvelopeSlider';
import PanelSectionHeader from './../PanelSectionHeader';

const InnerSliderContainer = styled.section`
  align-self: flex-end;
  border: 1px solid ${props => props.theme.primary};
  display: flex;
  height: 40vh;
`;

const OuterSliderContainer = styled.section`
  display: flex;
  flex-direction: column;
`;

type Props = {
  bankName: string,
  sliderArray: Array<Object>,
  sliderParams: Object,
  typeOfParams: string,
};

/** Houses all the tweakable sliders. */
function SliderBank({
  bankName,
  sliderArray,
  sliderParams,
  typeOfParams,
}: Props) {
  return (
    <OuterSliderContainer>
      <PanelSectionHeader name={bankName} />
      <InnerSliderContainer>
        {sliderArray.map(({ abbr, id, max, min, sliderName, step }) => (
          <EnvelopeSlider
            abbr={abbr}
            sliderName={sliderName}
            key={`${id}-${sliderName}`}
            type="range"
            typeOfParams={typeOfParams}
            min={min}
            max={max}
            step={step}
            value={sliderParams[sliderName]}
          />
        ))}
      </InnerSliderContainer>
    </OuterSliderContainer>
  );
}

SliderBank.propTypes = {
  /** List of sliders to be created. */
  sliderArray: PropTypes.array,
  /** All tweakable properties accessible in the slider bank.  */
  sliderParams: PropTypes.object,
  /** Name of the object of which envelope to be adjusted */
  typeOfParams: PropTypes.string,
};

export default SliderBank;
