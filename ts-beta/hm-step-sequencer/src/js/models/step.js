import Backbone from "backbone";

export const Step = Backbone.Model.extend({
  defaults: {
    frequency: 440,
  },

  initialize: function (attrs) {
    // console.log('Step::initialize()', attrs);
  },
});
