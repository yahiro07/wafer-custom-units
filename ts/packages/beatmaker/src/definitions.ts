export type PadItem = {
  id: string;
  color: string;
  beat: string;
  title: string;
  bars?: number;
  oneShot?: boolean;
};

export const padItems: PadItem[] = [
  { id: "pad0", color: "red", title: "Beat", beat: "01", bars: 2 },
  { id: "pad1", color: "red", title: "Kick", beat: "02", bars: 2 },
  { id: "pad2", color: "red", title: "Fullbeat", beat: "28", bars: 2 },
  { id: "pad3", color: "red", title: "Break", beat: "04", bars: 2 },
  //
  { id: "pad4", color: "yellow", title: "Beep", beat: "16", bars: 2 },
  { id: "pad5", color: "yellow", title: "Bass", beat: "25", bars: 2 },
  { id: "pad6", color: "yellow", title: "Tesla", beat: "44", bars: 2 },
  { id: "pad7", color: "yellow", title: "Metal", beat: "32", bars: 1 },
  //
  { id: "pad8", color: "cyan", title: "Strings", beat: "29", bars: 2 },
  { id: "pad9", color: "cyan", title: "Chords", beat: "06", bars: 2 },
  { id: "pad10", color: "cyan", title: "Bells", beat: "07", bars: 1 },
  { id: "pad11", color: "cyan", title: "Bubbles", beat: "08", bars: 2 },
  //
  { id: "pad12", color: "orange", title: "Arp", beat: "11", oneShot: true },
  { id: "pad13", color: "orange", title: "Perc", beat: "12", oneShot: true },
  { id: "pad14", color: "orange", title: "Burnout", beat: "33", oneShot: true },
  { id: "pad15", color: "orange", title: "H2L", beat: "09", oneShot: true },
  //
  { id: "pad16", color: "green", title: "Stab", beat: "31", bars: 1 },
  { id: "pad17", color: "green", title: "Pad", beat: "18", bars: 2 },
  { id: "pad18", color: "green", title: "Shot", beat: "41", bars: 2 },
  { id: "pad19", color: "green", title: "Fall", beat: "35", bars: 2 },
  //
  { id: "pad20", color: "pink", title: "KT0A", beat: "21", bars: 2 },
  { id: "pad21", color: "pink", title: "Fire", beat: "22", bars: 2 },
  { id: "pad22", color: "pink", title: "Troop", beat: "47", bars: 1 },
  { id: "pad23", color: "pink", title: "Burn", beat: "24", bars: 2 },
  //
];
