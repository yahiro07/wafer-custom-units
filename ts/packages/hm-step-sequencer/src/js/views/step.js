import $ from "jquery";
import _ from "underscore";
import Backbone from "backbone";

export const StepView = Backbone.View.extend({
  className: "step",

  events: {
    "click .trigger": "toggleStep",
  },

  initialize: function () {
    // console.log(this.model);
  },

  render: function () {
    this.template = _.template($("#step-template").html());
    this.$el.html(
      this.template({
        id: this.model.id,
      }),
    );
    this.initSlider();

    return this;
  },

  initSlider: function () {
    var self = this;

    this.$(".slider")
      .noUiSlider({
        start: [self.model.get("delta")],
        direction: "rtl",
        step: 1,
        connect: false,
        orientation: "vertical",
        range: {
          min: [0],
          max: [24],
        },
        format: wNumb({
          decimals: 0,
        }),
      })
      .on("slide", function (e) {
        self.setPitch($(this).val());
      });
  },

  setPitch: function (delta) {
    this.model.set({ delta: delta });
  },

  flashLed: function () {
    var $ledEl = this.$(".led_" + this.model.id);
    $ledEl.addClass("lit");
    setTimeout(function () {
      $ledEl.removeClass("lit");
    }, 200);
  },

  toggleStep: function () {
    this.setActive(!this.isActive());
  },

  isActive: function () {
    return this.$(".trigger_" + this.model.id).hasClass("step-active");
  },

  setActive: function (active) {
    this.$(".trigger_" + this.model.id).toggleClass("step-active", !!active);
  },

  getDelta: function () {
    return Number(this.model.get("delta")) || 0;
  },

  setDelta: function (delta) {
    delta = Math.max(0, Math.min(24, Number(delta) || 0));
    this.model.set({ delta: delta });
    this.$(".slider").val(delta);
  },
});
