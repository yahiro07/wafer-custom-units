// @flow
import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';

const Header = styled.header`
  align-items: center;
  display: flex;
  justify-content: center;
  font-size: 1.5vw;
  height: 5vh;
  text-align: center;
  vertical-align: middle;
  width: 100%;
`;

const Label = styled.label`
  color: ${props => props.theme.primary};
  font-size: 1.5rem;
  line-height: 75%;
  overflow: hidden;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 1rem;
    margin-bottom: 0.125rem;
  }

  @media (max-width: 420px) {
    font-size: 0.75rem;
  }
`;

type Props = {
  abbr: string,
};

/** Display component just shows the type of slider. */
function SliderLabel({ abbr }: Props) {
  return (
    <Header>
      <Label>{abbr}</Label>
    </Header>
  );
}

SliderLabel.propTypes = {
  /** Abbreviation of the parameter the slider changes (eg. A,D,S,R). */
  abbr: PropTypes.string,
};

export default SliderLabel;
