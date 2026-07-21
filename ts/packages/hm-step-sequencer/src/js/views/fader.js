import _ from "underscore";
import Backbone from "backbone";

export const FaderView = Backbone.View.extend({
  template: _.template('<span id="fader_<%=id%>" class="fader"></span>'),

  render: function () {
    this.$el.html(
      this.template({
        id: this.model.id,
      }),
    );
    return this;
  },
});
