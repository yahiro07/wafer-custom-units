import React from "react";
import ToggleButton from "@material-ui/lab/ToggleButton";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup";
import SquareFootIcon from "@material-ui/icons/SquareFoot";
import CheckBoxOutlineBlankIcon from "@material-ui/icons/CheckBoxOutlineBlank";
import RadioButtonUncheckedIcon from "@material-ui/icons/RadioButtonUnchecked";
import { OscillatorType } from "../../synthState";

export const defaultType: OscillatorType = "sawtooth";

interface Props {
  value: OscillatorType;
  onChange: (type: OscillatorType) => void;
}

export const Oscillator = ({ value, onChange }: Props) => {
  return (
    <ToggleButtonGroup
      value={value}
      exclusive
      onChange={(event, nextValue) => {
        if (nextValue) {
          onChange(nextValue);
        }
      }}
    >
      <ToggleButton value={defaultType}>
        <SquareFootIcon fontSize="small" />
      </ToggleButton>
      <ToggleButton value="square">
        <CheckBoxOutlineBlankIcon fontSize="small" />
      </ToggleButton>
      <ToggleButton value="sine8">
        <RadioButtonUncheckedIcon fontSize="small" />
      </ToggleButton>
    </ToggleButtonGroup>
  );
};
