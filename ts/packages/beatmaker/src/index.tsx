import clsx from "clsx";
import { render } from "preact";
import { useMemo, useState } from "preact/hooks";
import { PadItem, padItems } from "./definitions";
import { player, sequencer, unitInterface } from "./engine";
import { arrayPackN } from "./helper";

const PadView = ({ padItem }: { padItem: PadItem }) => {
  const [isActive, setIsActive] = useState(false);

  const handleClick = () => {
    const nextActive = !isActive;
    if (padItem.oneShot) {
      if (nextActive) {
        sequencer.playPadOneShot(padItem.id, () => setIsActive(false));
      } else {
        sequencer.stopPadOneShot(padItem.id);
      }
    } else {
      sequencer.setPadActive(padItem.id, nextActive);
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

unitInterface?.completeSetup({
  unitAspects: {
    unitType: "instrument",
    viewSize: [1000, 700],
  },
  hostCallbacks: {
    setBpm: sequencer.setBpm,
  },
  clockHandlers: {
    start: sequencer.onHostStart,
    processScheduling(timeFrom, barFrom, _barTo, bpm) {
      sequencer.onHostScheduling(timeFrom, barFrom, bpm);
    },
    stop: sequencer.onHostStop,
  },
  cleanup: player.cleanup,
});
