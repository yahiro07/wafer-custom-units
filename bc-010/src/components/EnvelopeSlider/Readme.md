This is a stateless component that holds all of the slider components.

```jsx static
<EnvelopeSlider
  abbr={abbr}
  sliderName={sliderName}
  envelopeSliderChange={envelopeSliderChange}
  key={`${id}-${sliderName}`}
  type="range"
  min={min}
  max={max}
  step={step}
  value={sliderParams[sliderName]}
/>
```
