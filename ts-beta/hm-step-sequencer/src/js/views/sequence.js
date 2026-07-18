import $ from "jquery";
import _ from "underscore";
import Backbone from "backbone";
import { Clock } from "../models/clock";
import { Sequence } from "../models/sequence";
import { StepCollection } from "../collections/steps";
import { StepView } from "./step";

const unitInterface = window.queryUnitInterface?.("wafer-v01");

export const SequenceView = Backbone.View.extend({
  className: "sequence",

  events: {
    "click #start": "start",
    "click #stop": "stop",
  },

  initialize: function () {
    var self = this;
    this.setNoteMapper();
    this.stepIndex = 0;
    this.clock = new Clock();
    this.listenTo(this.clock, "step", this.stepWasTriggered);
    this.stepCollection = new StepCollection();
    this.stepCollection.fetch().done(function () {
      self.createAndRenderStepViews();
    });
    this.model = new Sequence({
      tempo: 120,
      rootPitch: "A4",
      stepCollection: this.stepCollection,
    });
    unitInterface?.completeSetup({
      unitAspects: {
        unitType: "sequencer",
        outputs: ["note"],
        viewSize: [600, 414],
      },
      clockHandlers: {
        start() {
          self.$(".play").addClass("started");
        },
        stop() {
          self.$(".play").removeClass("started");
        },
        processStep(stepIndex, time, unitDuration) {
          stepIndex %= 16;
          if (stepIndex % 2 === 0) {
            self.triggerStepInternal(stepIndex >> 1, time, unitDuration * 2);
          }
        },
      },
      hostCallbacks: {
        setBpm(bpm) {
          self.model.set("tempo", bpm);
          self.clock.tempo = bpm;
        },
      },
    });
  },

  render: function () {
    this.template = _.template($("#sequence-template").html());
    this.$el.html(this.template({}));
    return this;
  },

  createAndRenderStepViews: function () {
    var self = this;
    this._stepViews = [];
    _.each(this.stepCollection.models, function (stepModel) {
      var stepView = new StepView({ model: stepModel });
      self._stepViews.push(stepView);
    });
    this.renderStepViews();
  },

  removeStepViews: function () {
    _.invoke(this.stepCollection, "remove");
  },

  renderStepViews: function () {
    _.each(this._stepViews, function (stepView) {
      $("#step-views").append(stepView.render().$el);
    });
  },

  stepWasTriggered: function (e) {
    this.triggerStep();
  },

  start: function (e) {
    // console.log("SequenceView::start()");
    this.stepIndex = 0;
    this.clock.start();
    $(e.currentTarget).addClass("started");
  },

  stop: function () {
    // console.log("SequenceView::stop()");
    this.clock.stop();
    this.$(".play").removeClass("started");
  },

  triggerStepInternal: function (si, time, duration) {
    var currentStepView = this._stepViews[si];
    if (currentStepView.isActive() === true) {
      // TODO: would be cool if by frequency...
      // var HALF_STEP_DELTA = Math.pow(2, 1/12);

      var pitchDelta = currentStepView.model.get("delta");
      var currentNote = this.noteMapper[pitchDelta];
      if (unitInterface) {
        time = Math.max(time, unitInterface.audioContext.currentTime);
        const noteNumber =
          Math.round(12 * Math.log2(currentNote.freq / 440)) + 69;
        unitInterface.noteOutputPort.noteOn(noteNumber, time);
        unitInterface.noteOutputPort.noteOff(noteNumber, time + duration);
      } else {
        this.model.createAndTriggerOscillator(currentNote.freq, 0.1);
      }
    }
    this._stepViews[si].flashLed();
  },

  triggerStep: function () {
    var self = this;
    if (this.stepIndex == this.stepCollection.length) {
      this.stepIndex = 0;
    }
    const durationSec = 60 / this.model.get("tempo") / 2;
    this.triggerStepInternal(this.stepIndex, 0, durationSec);
    this.stepIndex++;
  },

  setNoteMapper: function () {
    this.noteMapper = [
      { name: "A3", freq: 220.0 },
      { name: "A#3", freq: 233.08 },
      { name: "B3", freq: 246.94 },
      { name: "C4", freq: 261.63 },
      { name: "C#4", freq: 277.18 },
      { name: "D4", freq: 293.66 },
      { name: "D#4", freq: 311.13 },
      { name: "E4", freq: 329.63 },
      { name: "F4", freq: 349.23 },
      { name: "F#4", freq: 369.99 },
      { name: "G4", freq: 392.0 },
      { name: "G#4", freq: 415.3 },
      { name: "A4", freq: 440.0 },
      { name: "A#4", freq: 466.16 },
      { name: "B4", freq: 493.88 },
      { name: "C5", freq: 523.25 },
      { name: "C#5", freq: 554.37 },
      { name: "D5", freq: 587.33 },
      { name: "D#5", freq: 622.25 },
      { name: "E5", freq: 659.25 },
      { name: "F5", freq: 698.46 },
      { name: "F#5", freq: 739.99 },
      { name: "G5", freq: 783.99 },
      { name: "G#5", freq: 830.61 },
      { name: "A5", freq: 880.0 },
    ];
  },
});
