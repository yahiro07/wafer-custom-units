// @flow
import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { decrementOctave, incrementOctave } from './actions';
import { bindActionCreators } from 'redux';
import PanelSectionHeader from './../PanelSectionHeader';

const Container = styled.section`
  border: 1px solid ${({ theme }) => theme.primary};
  display: flex;
  flex-direction: column;

  div.octave-controls > div {
    margin-right: 0.4375rem;
  }

  div.octave-controls > div:last-child {
    margin-right: 0;
  }

  @media (max-width: 768px) {
    max-width: 150px;
    width: 68%;

    div.octave-controls > div {
      margin-right: 0.125rem;
    }
  }

  @media (max-width: 420px) {
    max-width: 100px;
    width: auto;

    div.octave-controls > div {
      margin: 0 0 0.125rem 0;
    }

    div.octave-controls > div:last-child {
      order: -1;
    }
    div.octave-controls > div:first-child {
      order: 2;
    }
  }
`;

const CurrentOctaveDisplay = styled.div`
  align-items: center;
  background-color: ${({ theme }) => theme.secondary};
  border: 1.5px solid ${({ theme }) => theme.primary};
  color: #ffffff;
  display: flex;
  font-size: 2.5rem;
  justify-content: center;
  line-height: 0;
  padding: 1rem;
  position: relative;
  width: 60%;

  &:after {
    content: '';
    display: block;
    padding-bottom: 100%;
  }

  @media (max-width: 768px) {
    font-size: 1.5rem;
    padding: 0.75rem;
  }

  @media (max-width: 420px) {
    padding: 0;
  }
`;

const OctaveButton = styled.div`
  align-items: center;
  border: 1.5px solid ${({ theme }) => theme.primary};
  display: flex;
  font-size: 3.25rem;
  justify-content: center;
  overflow: hidden;
  padding: 1rem;
  position: relative;
  transition: all ${({ theme }) => theme.globalTransition};
  width: 60%;

  &:after {
    content: '';
    display: block;
    padding-bottom: 100%;
  }

  @media (max-width: 768px) {
    font-size: 1.5rem;
    padding: 0.75rem;
  }

  @media (max-width: 420px) {
    padding: 0;
  }

  :hover {
    background-color: ${({ theme }) => theme.quaternary};
    color: white;
    cursor: pointer;
  }
`;

const OctaveContent = styled.div`
  align-items: center;
  display: flex;
  line-height: 0;
  position: absolute;
`;

const OctaveControls = styled.div`
  color: ${({ theme }) => theme.primary};
  display: flex;
  font-size: 2vw;
  justify-content: space-between;
  padding: 0.4375rem;

  @media (max-width: 768px) {
    padding: 0.125rem;
  }

  @media (max-width: 420px) {
    flex-direction: column;
    align-items: center;
  }
`;

type Props = {
  decrementOctave: Function,
  incrementOctave: Function,
  octave: number,
};

/** Holds the octave display in the control panel. */
function OctaveContainer({ decrementOctave, incrementOctave, octave }: Props) {
  return (
    <Container>
      <PanelSectionHeader name="octave" />
      <OctaveControls className="octave-controls">
        <OctaveButton onClick={decrementOctave}>
          <OctaveContent>-</OctaveContent>
        </OctaveButton>
        <CurrentOctaveDisplay>
          <OctaveContent>{octave}</OctaveContent>
        </CurrentOctaveDisplay>
        <OctaveButton onClick={incrementOctave}>
          <OctaveContent>+</OctaveContent>
        </OctaveButton>
      </OctaveControls>
    </Container>
  );
}

const mapStateToProps = state => ({
  octave: state.octave.octave,
});

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      decrementOctave,
      incrementOctave,
    },
    dispatch,
  );

OctaveContainer.propTypes = {
  /** Lowers octave by 1 */
  decrementOctave: PropTypes.func,
  /** Raises octave by 1 */
  incrementOctave: PropTypes.func,
  /** Current octave for the keyboard. Derived from App.jsx state. */
  octave: PropTypes.number,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(OctaveContainer);
