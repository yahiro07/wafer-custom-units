export class Gate {
  output: ConstantSourceNode;

  constructor(private context: AudioContext) {
    this.output = context.createConstantSource();
    this.output.offset.value = 0.0;
    this.output.start();
  }

  public triggerOn(time: number = this.context.currentTime) {
    this.output.offset.cancelScheduledValues(time);
    this.output.offset.setValueAtTime(1, time);
  }

  public triggerOff(time: number = this.context.currentTime) {
    this.output.offset.cancelScheduledValues(time);
    this.output.offset.setValueAtTime(0, time);
  }
}
