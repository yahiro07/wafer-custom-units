import $ from "jquery";
import _ from "underscore";
import Backbone from "backbone";
import "../less/main.less";
import "nouislider/distribute/jquery.nouislider.min.css";

// Backbone / noUiSlider expect globals
window.$ = window.jQuery = $;
window._ = _;
Backbone.$ = $;

// noUiSlider attaches to window.jQuery; load after jQuery is global
await import("nouislider/distribute/jquery.nouislider.all.js");

const { SequenceView } = await import("./views/sequence");

$(document).ready(function () {
  var sequenceView = new SequenceView();
  $("#seq").append(sequenceView.render().$el);
});
