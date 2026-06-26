This is a stateless component that holds all of the tweakable parameters. In other words,
this is what would be the non-keyboard part of most synthesizers. This component
will hold all slider banks, knobs, switches, etc.

```jsx static
<ControlPanel
  envelopeSliderChange={envelopeSliderChange}
  filterParams={filterParams}
  key="control-panel"
  octave={octave}
  toggleOscillator={toggleOscillator}
  synthParams={synthParams}
/>
```
