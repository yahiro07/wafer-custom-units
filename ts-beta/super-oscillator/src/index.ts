import * as loadingScreen from './lib/loading-screen';
import { SceneManager } from './lib/scene-manager';
import './index.css';
import { unitInterface } from './lib/oscillation-graph';

void main();

async function main(): Promise<void> {
  const appEl = document.querySelector('.app')!;
  // await welcomeScreen.render(appEl);
  await loadingScreen.render(appEl);
  const sceneManager = new SceneManager();
  sceneManager.render(appEl);

  const synth = sceneManager.getSynthesizer();
  unitInterface?.completeSetup({
    unitAspects: {
      unitType: 'instrument',
      outputs: ['audio'],
      inputs: ['note'],
      viewSize: [1000, 500],
    },
    noteInput: {
      noteOn: synth.noteOn.bind(synth),
      noteOff: synth.noteOff.bind(synth),
    },
  });
}
