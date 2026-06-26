// @flow
import React from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { connect } from 'react-redux';

import OuterCasing from './../OuterCasing';
import Header from './../Header';
import SideNav from './../SideNav';
import theme from './../../styles/theme.js';

const Main = styled.main`
  background-color: ${props => props.theme.primary};
  min-height: 100vh;
  transition: all ${({ theme }) => theme.globalTransition};
`;

const Overlay = styled.div`
  background-color: rgba(0, 0, 0, 0.5);
  height: 100vh;
  position: absolute;
  width: 100vw;
  z-index: 1;
`;

function ThemeWrapper({ currentTheme, isSideNavOpen }) {
  return (
    <ThemeProvider theme={theme[currentTheme]}>
      <Main>
        <Header>bc-010</Header>
        {isSideNavOpen && <Overlay />}
        <OuterCasing key="outerCasing" />
        <SideNav />
      </Main>
    </ThemeProvider>
  );
}

const mapStateToProps = state => ({
  currentTheme: state.theme.name,
  isSideNavOpen: state.sideNav.isSideNavOpen,
});

export default connect(
  mapStateToProps,
  null,
)(ThemeWrapper);
