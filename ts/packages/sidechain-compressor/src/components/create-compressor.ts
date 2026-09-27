import { queryUnitInterface } from "wafer-host/unit-types";
import { SidechainCompressorInsert } from "../modules/sidechain-compressor";

export async function createCompressor() {
  const unitInterface = queryUnitInterface("wafer-v01");
  const audioContext = unitInterface?.audioContext ?? new AudioContext();

  const compressor = await SidechainCompressorInsert.create({
    context: audioContext,
  });

  const inputNode = unitInterface?.audioInputNode ?? audioContext.createGain();
  const sideChainInputNode =
    unitInterface?.createAdditionalAudioInputNode("SC") ??
    audioContext.createGain();
  const outputNode = unitInterface?.audioOutputNode ?? audioContext.destination;
  const compressorNode = compressor.node;

  inputNode.connect(compressorNode, 0, 0);
  sideChainInputNode.connect(compressorNode, 0, 1);
  compressorNode.connect(outputNode);

  unitInterface?.completeSetup({
    unitAspects: {
      unitType: "effect",
      viewSize: [776, 256],
    },
    cleanup() {
      inputNode.disconnect(compressorNode);
      sideChainInputNode.disconnect(compressorNode);
      compressorNode.disconnect(outputNode);
    },
  });

  return compressor;
}
