const unitInterface = window.queryUnitInterface("wafer-v01");

class CircularAudioWave {
  constructor(elem, opts = {}) {
    this.opts = opts;
    this.lastMaxR = 0;
    this.maxChartValue = 240;
    this.minChartValue = 100;
    this.elem = elem;
    this.elem.style.width = "100%";
    this.elem.style.height = "100%";
    this.chart = echarts.init(elem);
    this.playing = false;
    this.lineColorOffset = 0;
    this.tick = 0;
    this.bpm = 120;
    this._resizeObserver = new ResizeObserver(() => {
      this.chart.resize();
    });
    this._resizeObserver.observe(elem);

    this.context = unitInterface.audioContext;
    this.analyser = this.context.createAnalyser();

    this.defaultChartOption = this._createDefaultChartOption();
    this.chartOption = this._cloneChartOption(this.defaultChartOption);
  }

  _createDefaultChartOption() {
    if (this.opts.mode === "sunburst") {
      return this._createSunburstOption();
    }
    return this._createCircularOption();
  }

  _createCircularOption() {
    return {
      backgroundColor: "#fff",
      angleAxis: {
        type: "value",
        clockwise: false,
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          show: false,
        },
        splitLine: {
          show: false,
        },
      },
      radiusAxis: {
        min: 0,
        max: this.maxChartValue,
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          show: false,
        },
        splitLine: {
          show: false,
        },
      },
      polar: {
        center: ["50%", "50%"],
        radius: "100%",
      },
      series: [
        {
          coordinateSystem: "polar",
          name: "line",
          type: "line",
          showSymbol: false,
          lineStyle: {
            color: {
              colorStops: [
                {
                  offset: 0.7,
                  color: "#e91e63",
                },
                {
                  offset: 0.3,
                  color: "#3f51b5",
                },
              ],
            },
            shadowColor: "blue",
            shadowBlur: 10,
          },
          zlevel: 2,
          data: Array.apply(null, {
            length: 361,
          }).map(Function.call, (i) => {
            return [this.minChartValue, i];
          }),
          silent: true,
          hoverAnimation: false,
        },
        {
          coordinateSystem: "polar",
          name: "maxbar",
          type: "line",
          showSymbol: false,
          lineStyle: {
            color: "#87b9ca",
            shadowColor: "#87b9ca",
            shadowBlur: 10,
          },
          data: Array.apply(null, {
            length: 361,
          }).map(Function.call, (i) => {
            return [this.minChartValue, i];
          }),
          silent: true,
          hoverAnimation: false,
        },
        {
          coordinateSystem: "polar",
          name: "interior",
          type: "effectScatter",
          showSymbol: false,
          data: [0],
          symbolSize: 100,
          rippleEffect: {
            period: 3.5,
            scale: 3,
          },
          itemStyle: {
            color: {
              type: "radial",
              colorStops: [
                {
                  offset: 0,
                  color: "#87b9ca",
                },
                {
                  offset: 1,
                  color: "white",
                },
              ],
            },
          },
          silent: true,
          hoverAnimation: false,
          animation: false,
        },
      ],
    };
  }

  _createSunburstOption() {
    let bgColor = "#2E2733";
    let colors = ["#FFAE57", "#FF7853", "#EA5151", "#CC3F57", "#9A2555"];

    let data = [
      {
        children: [
          {
            children: [],
          },
        ],
      },
      {
        children: [
          {
            children: [],
          },
        ],
      },
    ];
    for (let i = 0; i < 5; i++) {
      data[0].children[0].children.push({
        name: "-",
        children: [
          {
            name: "",
          },
        ],
      });
      data[1].children[0].children.push({
        name: "-",
        children: [
          {
            name: "",
          },
        ],
      });
    }

    data.forEach((level0) => {
      level0.children.forEach((level1) => {
        level1.children.forEach((item) => {
          item.children[0].value = 1;
        });
      });
    });

    return {
      backgroundColor: bgColor,
      color: colors,
      series: [
        {
          type: "sunburst",
          center: ["50%", "48%"],
          data: data,
          nodeClick: false,
          sort: function (a, b) {
            if (a.depth === 1) {
              return b.getValue() - a.getValue();
            } else {
              return a.dataIndex - b.dataIndex;
            }
          },
          itemStyle: {
            borderColor: bgColor,
            borderWidth: 2,
          },
          levels: [
            {},
            {
              r0: 0,
              r: 40,
            },
            {
              r0: 40,
              r: 105,
            },
            {
              r0: 115,
              r: 140,
              itemStyle: {
                shadowBlur: 2,
                shadowColor: colors[2],
                color: "transparent",
              },
              label: {
                rotate: "tangential",
                fontSize: 10,
                color: colors[0],
              },
            },
            {
              r0: 140,
              r: 145,
              itemStyle: {
                shadowBlur: 80,
                shadowColor: colors[0],
                color: colors[0],
              },
              label: {
                position: "outside",
                textShadowBlur: 5,
                textShadowColor: "#333",
                backgroundColor: colors[0],
              },
            },
          ],
        },
      ],
    };
  }

  _cloneChartOption(option) {
    let sortFn =
      option.series && option.series[0] && option.series[0].sort
        ? option.series[0].sort
        : null;
    let cloned = JSON.parse(JSON.stringify(option));
    if (sortFn) {
      cloned.series[0].sort = sortFn;
    }
    return cloned;
  }

  start() {
    this._setupAudioNodes();
    this._init();

    unitInterface.completeSetup({
      unitAspects: {
        unitType: "effect",
        categoryHint: "visualizer",
        outputs: ["audio"],
        inputs: ["audio"],
        viewSize: [700, 400],
      },
      hostCallbacks: {
        setBpm: (bpm) => {
          this.bpm = bpm;
          this._applyBpmToChart();
        },
        setPlayState: (playing) => {
          if (playing) {
            this.play();
          } else {
            this.pause();
          }
        },
      },
      cleanup: () => {
        this.destroy();
      },
    });
  }

  _init() {
    this.chart.setOption(this.chartOption, true);
    this.chart.resize();
    this._debouncedDraw = this._debounce(this._drawAnimation.bind(this), 25);
  }

  _applyBpmToChart() {
    if (this.opts.mode !== "sunburst" && this.chartOption.series[2]) {
      this.chartOption.series[2].rippleEffect.period = 150 / this.bpm;
    }
  }

  play() {
    if (this.playing) {
      return;
    }
    this.playing = true;
    this._applyBpmToChart();
    if (this.opts.mode !== "sunburst") {
      this.chartOption.series[0].animation = false;
    }
    this._debouncedDraw();
  }

  pause() {
    this.playing = false;
  }

  destroy() {
    this.playing = false;
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
      this._resizeObserver = null;
    }
    this.chart.dispose();
  }

  reset() {
    this.tick = 0;
    this.lastMaxR = 0;
    this.defaultChartOption = this._createDefaultChartOption();
    this.chartOption = this._cloneChartOption(this.defaultChartOption);
    this._applyBpmToChart();
    this._init();
  }

  toggleMode() {
    this.opts.mode = this.opts.mode === "sunburst" ? "circular" : "sunburst";
    this.reset();
    if (this.playing && this.opts.mode !== "sunburst") {
      this.chartOption.series[0].animation = false;
    }
  }

  _setupAudioNodes() {
    this.analyser.smoothingTimeConstant = 0.3;
    this.analyser.fftSize = 2048;

    unitInterface.audioInputNode.connect(this.analyser);
    unitInterface.audioInputNode.connect(unitInterface.audioOutputNode);
  }

  _drawAnimation() {
    if (!this.playing) {
      return;
    }
    let freqData = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(freqData);
    this._draw(freqData);
    requestAnimationFrame(this._debouncedDraw.bind(this));
  }

  _draw(freqData) {
    if (!this.playing) {
      return;
    }

    let waveData = this._generateWaveData(freqData);
    this.chartOption.series[0].data = waveData.data;

    if (waveData.maxR > this.lastMaxR) {
      this.lastMaxR = waveData.maxR + 4;
    } else {
      this.lastMaxR -= 2;
    }

    if (this.opts.mode !== "sunburst") {
      this.chartOption.series[1].data = Array.apply(null, {
        length: 361,
      }).map(Function.call, (i) => {
        return [this.lastMaxR, i];
      });
    }
    this.chart.setOption(this.chartOption, true);
    this.tick++;
  }

  _generateWaveData(data) {
    let waveData = [];
    let maxR = 0;
    if (this.opts.mode !== "sunburst") {
      for (let i = 0; i <= 360; i++) {
        let freq = data[i];
        var r =
          ((freq - 0) * (this.maxChartValue - this.minChartValue)) / (255 - 0) +
          this.minChartValue;
        if (r > maxR) {
          maxR = r;
        }
        waveData.push([r, i]);
      }
      waveData.push([waveData[0][0], 360]);
    } else {
      waveData = JSON.parse(JSON.stringify(this.chartOption.series[0].data));
      let index = 0;
      waveData.forEach((level0) => {
        level0.children.forEach((level1) => {
          level1.children.forEach((item) => {
            let freq = data[index];
            var r = ((freq - 0) * (40 - 0)) / (255 - 0) + 0;

            item.children[0].name = Array.apply(null, {
              length: r,
            })
              .map(Function.call, (i) => {
                return "";
              })
              .join(" ");
            index++;
          });
        });
      });
    }
    return {
      maxR: maxR,
      data: waveData,
    };
  }

  _debounce(func, wait, immediate) {
    var timeout;
    return function () {
      var context = this,
        args = arguments;
      var later = function () {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  }
}
