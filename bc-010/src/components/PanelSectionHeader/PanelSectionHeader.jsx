// @flow
import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';

const ContainerHeader = styled.div`
  background-color: ${props => props.theme.primary};
  color: ${props => props.theme.tertiary};
  display: flex;
  font-size: 2.25rem;
  justify-content: center;
  overflow: hidden;
  text-overflow: ellipsis;
  text-transform: uppercase;
  transition: all ${({ theme }) => theme.globalTransition};
  width: 100%;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

type Props = {
  name: string,
};

/** Component header used for banks in control panel. */
function PanelSectionHeader({ name }: Props) {
  return <ContainerHeader>{name}</ContainerHeader>;
}

PanelSectionHeader.propTypes = {
  /** Name used in panel section header. */
  name: PropTypes.string,
};

export default PanelSectionHeader;
