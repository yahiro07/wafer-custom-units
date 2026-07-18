import Backbone from "backbone";
import { Step } from "../models/step";

export const StepCollection = Backbone.Collection.extend({
  model: Step,
  url: "data/steps.json",

  initialize: function (models, options) {
    // console.log('StepCollection:initialize()');
  },

  parse: function (response) {
    return response.steps;
  },
});
