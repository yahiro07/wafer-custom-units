<template>
  <div class="vue-audio-mixer-slider" ref="vue-audio-mixer-slider">
    <div class="vue-audio-mixer-fader-thumb" v-on:mousedown="startDrag" v-on:touchstart="startDrag"
      :style="{ bottom: thumbPosition }"></div>
    <div class="vue-audio-mixer-fader-slider-track"></div>

    <div class="vue-audio-mixer-fader-slider-row" v-for="p in rows" v-bind:style="{ bottom: p + 'px' }"></div>
    <div class="vue-audio-mixer-fader-slider-row-right" v-for="p in rows" v-bind:style="{ bottom: p + 'px' }"></div>
  </div>
</template>

<style></style>

<script>

import variables from '../variables.js';

export default {
  mixins: [],
  props: {
    value: {
      type: [Number, String]
    }
  },

  data: function () {
    return {
      dragging: false,
      progress: 0,
      rows: [23, 43, 63, 83, 103, 123, 143, 163, 183]
    };
  },


  watch: {

    inputVal: function () {
      this.setProgress();
    },
  },

  mounted() {
    this.setProgress();
  },

  created() {







    //console.log(this.progress);
    //        this.inputVal = ((percent/100) * 1.5).toFixed(1);
    //        

    window.addEventListener('mousemove', this.doDrag);
    window.addEventListener('touchmove', this.doDrag);

    window.addEventListener("mouseup", this.triggerMouseUpEvent);
    window.addEventListener("touchend", this.triggerMouseUpEvent);
  },
  beforeDestroy() {
    window.removeEventListener('mousemove', this.doDrag);
    window.removeEventListener('touchmove', this.doDrag);
    window.removeEventListener("mouseup", this.triggerMouseUpEvent);
    window.removeEventListener("touchend", this.triggerMouseUpEvent);
  },
  computed: {

    trackHeight() {


      let paddingtop = 58;
      return parseInt(variables.meterHeight) - paddingtop;

    },
    thumbPosition() {
      return (this.progress) + 'px';
    },
    inputVal: {
      get: function () {
        return this.value;
      },

      set: function (value) {
        this.$emit('input', value);
      }
    }
  },
  methods: {

    setProgress() {
      let percent = (100 / 1.5) * this.value;
      let percentt = (this.trackHeight / 100) * percent;
      this.progress = Math.round(percentt);
    },

    triggerMouseUpEvent() {
      this.dragging = false;
    },

    doDrag(e) {


      if (!this.dragging) {
        return;
      }

      if (e.cancelable)
        e.preventDefault();

      e = e.type == 'touchmove' ? e.touches[0] : e;

      let target = this.$refs['vue-audio-mixer-slider'];
      let rect = target.getBoundingClientRect();
      let x = rect.bottom - e.clientY; //x position within the element.

      // Map to 0–150 (matches formattedGain) in steps of 1, then to gain 0–1.5
      let displayVal = Math.round((x / this.trackHeight) * 150);
      if (displayVal > 150)
        displayVal = 150;
      if (displayVal < 0)
        displayVal = 0;

      this.inputVal = (displayVal / 100).toFixed(2);

    },


    startDrag(e) {
      if (e.cancelable)
        e.preventDefault();
      this.dragging = true;
    }

  }
}


</script>