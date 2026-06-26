// @flow
import React from 'react';
import PropTypes from 'prop-types';

import { ICONS } from './icons.js';

type Props = {
  icon: string,
  fillColor: string,
  height: string,
  strokeColor: string,
  strokeWidth: string,
  width: string,
};

/** Re-usable component to handle SVGs & styling. Icons need to
 be added to the icons.js for use in this component. */
const Icon = ({
  icon,
  fillColor,
  height,
  strokeColor,
  strokeWidth,
  width,
}: Props) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox={ICONS[icon].viewBox}
      preserveAspectRatio="xMinYMin meet"
    >
      <path
        d={ICONS[icon].path}
        fill={fillColor ? fillColor : 'transparent'}
        stroke={strokeColor ? strokeColor : 'transparent'}
        strokeWidth={strokeWidth ? strokeWidth : '2'}
      />
    </svg>
  );
};

Icon.defaultProps = {
  strokeWidth: '2',
  width: '100%',
};

Icon.propTypes = {
  /** Name of the icon that's used as an object key in icons.js. */
  icon: PropTypes.string,
  /** String name for the svg fill color. */
  fillColor: PropTypes.string,
  /** Height of svg. */
  height: PropTypes.string,
  /** String name for the svg stroke color. */
  strokeColor: PropTypes.string,
  /** String value for the width of the svg stroke. */
  strokeWidth: PropTypes.string,
  /** Width of the svg. */
  width: PropTypes.string,
};

export default Icon;
