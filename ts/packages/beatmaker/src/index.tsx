import clsx from "clsx";
import { render } from "preact";
import { useMemo, useState } from "preact/hooks";
import { PadItem, padItems } from "./definitions";
import { arrayPackN } from "./helper";
import { BeatSourceItem, createLoopPlayerEngine } from "./loop-player-engine";

const player = createLoopPlayerEngine();
const beatSourceItems: BeatSourceItem[] = padItems.map((padItem) => ({
  id: padItem.id,
  uri: `beats/0_${padItem.beat}.m4a`,
  barLength: padItem.bars ?? 2,
  originalBpm: 85,
}));
player.registerBeatSourceItems(beatSourceItems);

const PadView = ({ padItem }: { padItem: PadItem }) => {
  const [isActive, setIsActive] = useState(false);

  const handleClick = () => {
    const nextActive = !isActive;
    if (padItem.oneShot) {
      if (nextActive) {
        player.playInstantBeat(padItem.id, () => setIsActive(false));
      } else {
        player.stopInstantBeat(padItem.id);
      }
    } else {
      player.setBeatState(padItem.id, nextActive);
    }
    setIsActive(nextActive);
  };
  return (
    <div
      class={clsx("tile", padItem.color, isActive && "active")}
      onClick={handleClick}
    >
      <div class="icon"></div>
      <div class="title">{padItem.title}</div>
    </div>
  );
};

const App = () => {
  const padItems2DArray = useMemo(() => arrayPackN(padItems, 4), [padItems]);
  return (
    <>
      {padItems2DArray.map((padItems, i) => (
        <div key={i}>
          {padItems.map((padItem) => (
            <PadView key={padItem.id} padItem={padItem} />
          ))}
        </div>
      ))}
    </>
  );
};

const rootDiv = document.getElementById("root")!;
render(<App />, rootDiv);

player.unitInterface?.completeSetup({
  unitAspects: {
    unitType: "instrument",
    viewSize: [1000, 700],
  },
  hostCallbacks: {
    setBpm: player.setBpm,
  },
  clockHandlers: player.clockHandlers,
  cleanup: player.cleanup,
});
