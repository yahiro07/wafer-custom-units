export class Adsr {
  attack = 0.0;
  decay = 0.0;
  sustain = 1.0;
  release = 0.0;

  output: ConstantSourceNode;

  constructor(private context: AudioContext) {
    this.output = context.createConstantSource();
    this.output.offset.value = 0.0;
    this.output.start();
  }

  public triggerOn(time: number = this.context.currentTime) {
    this.output.offset.cancelScheduledValues(time);
    this.output.offset.setValueAtTime(0, time);
    this.output.offset.linearRampToValueAtTime(1, time + this.attack / 1000.0);
    this.output.offset.linearRampToValueAtTime(
      this.sustain,
      time + this.attack / 1000.0 + this.decay / 1000.0,
    );
  }

  public triggerOff(time: number = this.context.currentTime) {
    this.output.offset.cancelAndHoldAtTime(time);
    this.output.offset.linearRampToValueAtTime(0, time + this.release / 1000.0);
  }
}
