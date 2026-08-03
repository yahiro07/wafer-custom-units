class Gain {
    constructor(AC) {
        this.AC = AC;
        this.node = this.AC.createGain();
    }

    connect = (destination) => {
        if (Array.isArray(destination)) {
            destination.forEach((dest) => this.node.connect(dest));
        } else {
            this.node.connect(destination);
        }
    }

    // Getters
    getNode = () => this.node;
    getGain = () => this.node.gain.value;

    // Setters
    setGain = (val, time = 0, when = this.AC.currentTime) => {
        time
            ? this.node.gain.setTargetAtTime(val, when, time)
            : this.node.gain.setValueAtTime(val, when);
    }
}

export default Gain;
