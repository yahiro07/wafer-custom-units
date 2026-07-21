import React from "react";
import Slider from "@material-ui/core/Slider";

interface Props {
  value: number;
  onChange: (value: number) => void;
  step?: number;
  max?: number;
  min?: number;
}

export const Parameter = ({
  value,
  onChange,
  step = 1,
  max = 30,
  min = 0,
}: Props) => {
  return (
    <div>
      <Slider
        value={value}
        valueLabelDisplay="auto"
        step={step}
        min={min}
        max={max}
        onChange={(event, nextValue) => onChange(nextValue as number)}
      />
    </div>
  );
};
