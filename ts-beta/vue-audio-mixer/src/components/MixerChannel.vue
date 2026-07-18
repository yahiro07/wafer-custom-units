<template>

  <Channel v-if="loaded" :index="_uid" :trackIndex="trackIndex" :title="title" :defaultPan="pan" :defaultMuted="muted"
    :defaultGain="defaultGain" @gainChange="changeGain" @muteChange="muteChange" @soloChange="soloChange"
    @panChange="changePan" :leftAnalyser="leftAnalyser" :rightAnalyser="rightAnalyser"
    :scriptProcessorNode="scriptProcessorNode" :showMute="true" :mixerVars="mixerVars" />

</template>

<script>
import Channel from './Channel.vue'
import EventBus from './../event-bus';
import { unitWrapper } from '../unit-wrapper';

export default {
  name: 'MixerChannel',
  props: [
    'channelId',
    'title',
    'context',
    'output',
    'defaultPan',
    'defaultGain',
    'defaultMuted',
    'trackIndex',
    'mixerVars',
    'hidden',
    'solodTracks'
  ],
  components: { Channel },
  data: function () {
    return {
      channelInputNode: false,
      scriptProcessorNode: false,
      gainNode: false,
      pannerNode: false,

      muted: false,
      leftAnalyser: false,

      leftBouncer: { average: 0, opacity: 1 },
      rightAnalyser: false,
      rightBouncer: { average: 0, opacity: 1 },
      splitter: false,
      gainValue: 0,
      pan: 0,
      loaded: false,
      mutedBySolo: false,
      mutedByMute: false
    };
  },

  watch: {

    solodTracks(newVal) {
      if (this.solodTracks.length && this.solodTracks.indexOf(this.trackIndex) === -1)
        this.muteChange(true, true);
      else
        this.muteChange(false, true);
    },


  },

  created() {
    this.muted = this.defaultMuted;
    this.pan = this.defaultPan;
    this.gainValue = this.defaultGain.toString();

    this.scriptProcessorNode = this.context.createScriptProcessor(2048, 1, 1);
    this.setupAudioNodes();
    unitWrapper.addCleanupCallback(() => this.disconnectAudioNodes());
  },

  beforeDestroy() {
    this.disconnectAudioNodes();
  },



  mounted() {

  },
  methods: {


    mute() {
      this.gainValue = this.gainNode.gain.value; // store gain value
      this.gainNode.gain.value = 0; // mute the gain node
      this.muted = true;
      this.$emit('muteChange', { index: this.trackIndex, muted: this.muted });
    },

    unMute() {
      this.muted = false;
      this.gainNode.gain.value = this.gainValue; // restore previous gain value
      this.$emit('muteChange', { index: this.trackIndex, muted: this.muted });
    },



    /*
    * MUTE CHANGE
    * Event when mute changes
    */

    muteChange(value, triggered_from_solo) {

      // don't mute hidden tracks
      if (this.hidden)
        return;


      if (triggered_from_solo) {
        if (value && !this.mutedByMute && !this.mutedBySolo)
          this.mute();

        if (!value && !this.mutedByMute)
          this.unMute();

        this.mutedBySolo = value;
      } else {
        if (value && !this.mutedByMute && !this.mutedBySolo)
          this.mute();

        if (!value && !this.mutedBySolo)
          this.unMute();

        this.mutedByMute = value;
      }

    },

    soloChange(value) {
      this.$emit('soloChange', { index: this.trackIndex });
    },

    changeGain(gain) {
      this.gainValue = gain;
      //this.gain = gain;

      if (!this.muted) {
        const currentTime = unitWrapper.getAudioContext().currentTime;
        this.gainNode.gain.linearRampToValueAtTime(gain, currentTime + 0.01);
      }

      this.$emit('gainChange', { index: this.trackIndex, gain: gain });
    },



    changePan(pan) {
      this.pan = pan;
      var xDeg = parseInt(pan);
      var zDeg = xDeg + 90;
      if (zDeg > 90) {
        zDeg = 180 - zDeg;
      }
      var x = Math.sin(xDeg * (Math.PI / 180));
      var z = Math.sin(zDeg * (Math.PI / 180));
      this.pannerNode.setPosition(x, 0, z);

      this.$emit('panChange', { index: this.trackIndex, pan: pan });
    },

    disconnectAudioNodes() {
      if (this.channelInputNode) this.channelInputNode.disconnect();
      if (this.scriptProcessorNode) this.scriptProcessorNode.disconnect();
      if (this.gainNode) this.gainNode.disconnect();
      if (this.pannerNode) this.pannerNode.disconnect();
      if (this.leftAnalyser) this.leftAnalyser.disconnect();
      if (this.rightAnalyser) this.rightAnalyser.disconnect();
      if (this.splitter) this.splitter.disconnect();
    },

    setupAudioNodes() {
      this.channelInputNode = unitWrapper.createChannelInputNode(this.channelId);

      // setup a analyzers
      this.leftAnalyser = this.context.createAnalyser();
      this.leftAnalyser.smoothingTimeConstant = 0.6;
      this.leftAnalyser.fftSize = 1024;

      this.rightAnalyser = this.context.createAnalyser();
      this.rightAnalyser.smoothingTimeConstant = 0.6;
      this.rightAnalyser.fftSize = 1024;

      // Create a gain node.
      this.gainNode = this.context.createGain();

      // Create a panner node.
      this.pannerNode = this.context.createPanner();
      this.pannerNode.panningModel = "equalpower";

      // create splitter
      this.splitter = this.context.createChannelSplitter(2);

      // connect everything together
      // channelInput -> gain -> pan -> output
      //                          \-> splitter -> analysers
      this.channelInputNode.connect(this.gainNode);
      this.gainNode.connect(this.pannerNode);
      this.pannerNode.connect(this.splitter);
      this.splitter.connect(this.leftAnalyser, 0, 0);
      this.splitter.connect(this.rightAnalyser, 1, 0);
      this.pannerNode.connect(this.output);
      this.scriptProcessorNode.connect(this.gainNode);

      let mutedBySolo = this.mutedBySolo;
      this.mutedBySolo = false;
      this.mutedByMute = false;

      this.gainNode.gain.value = this.gainValue;
      this.changeGain(this.gainValue);

      this.muteChange(this.muted, mutedBySolo);

      this.changePan(this.pan);

      this.loaded = true;
      EventBus.$emit(this.mixerVars.instance_id + 'track_loaded', 0);
    },



  }
}
</script>
