Reusable component that is used to create the ADSR envelope slider bank
and the filter slider bank. As the app grows, new tweakable features will
be added as new slider banks.

```jsx static
      <SliderBank
        envelopeSliderChange={functionToHandleSliderChange}
        sliderParams={synthParams}
        sliderArray={envelopeSliders}
      />
      <SliderBank
        envelopeSliderChange={functionToHandleSliderChange}
        sliderParams={filterParams}
        sliderArray={filterSliders}
      />
```
