if (!Detector.webgl) {
  Detector.addGetWebGLMessage();
} else {
  var audioAnalyser = new AudioAnalyser();
  audioAnalyser.init();

  var view = new View();
  view.init(audioAnalyser);

  var controller = new Controller();
  controller.init(audioAnalyser, view);

  if (unitInterface) {
    audioAnalyser.setSourceNode(unitInterface.audioInputNode);
    unitInterface.audioInputNode.connect(unitInterface.audioOutputNode);
    var vizNames = Object.keys(controller.visualizers);
    unitInterface?.completeSetup({
      unitAspects: {
        unitType: "effect",
        categoryHint: "visualizer",
        viewSize: [700, 400],
      },
      persistence: {
        emitStateBytes() {
          var name = controller.getActiveVisualizerName();
          var index = vizNames.indexOf(name);
          return new Uint8Array([index < 0 ? 0 : index]);
        },
        applyStateBytes(stateBytes) {
          if (!stateBytes || stateBytes.length < 1) return;
          var name = vizNames[stateBytes[0]];
          if (name) controller.setActiveVisualizer(name);
        },
      },
    });
  } else {
    var dragDropUpload = new DragDropUpload();
    dragDropUpload.init(audioAnalyser);
  }
}
