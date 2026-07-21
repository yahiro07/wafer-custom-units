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
    unitInterface?.completeSetup({
      unitAspects: {
        unitType: "effect",
        categoryHint: "visualizer",
        viewSize: [700, 400],
      },
    });
  } else {
    var dragDropUpload = new DragDropUpload();
    dragDropUpload.init(audioAnalyser);
  }
}
