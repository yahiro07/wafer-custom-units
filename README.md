# wafer-custom-units

[Wafer](https://github.com/yahiro07/wafer)-compatible units based on open-source Web Audio applications.

## Overview

This repository contains open-source web applications adapted to the Wafer interface for use in host applications.

The units support host synchronization for accurate note timing and clock processing, as well as state persistence for saving and restoring edit data.

Some units do not preserve every feature of the original application. Features may have been added, removed, or adjusted to provide a better experience within a host.

## Screenshot

![screenshot](screenshot.png)

Units loaded in Wireboard app.

## Usage

Built units are published with `r<number>` tags. Use the latest tag when you add units to a host app.

### With the Vite plugin

Add the source URLs of the units you want to use to the Vite plugin configuration in your host application.

```ts
export const unitSourceUrls = [
  "https://cdn.jsdelivr.net/gh/yahiro07/wafer-custom-units@r19/webaudio-tinysynth-mini/",
  "https://cdn.jsdelivr.net/gh/yahiro07/wafer-custom-units@r19/shiny-drum-machine/",
  "https://cdn.jsdelivr.net/gh/yahiro07/wafer-custom-units@r19/midi-synth/",
  // ...
];
```

See the Wafer documentation for details on configuring the Vite plugin.

### With Vanilla JS

```sh
git clone -b r19 https://github.com/yahiro07/wafer-custom-units
```

Clone the repository at an `r<number>` tag to get the prebuilt units, then load whichever units you need.

## Directory Structure

```
.
├── build_all.sh
├── dist
│   ├── additive
│   ├── audio-input-effects
    ...
│   └── vue-audio-mixer
├── js
│   ├── additive
│   ├── audio-input-effects
    ...
│   └── webaudio-tinysynth-mini
└── ts
    ├── package.json
    ├── packages
    │   ├── aura
    │   ├── beatmaker
        ...
    │   └── vue-audio-mixer
    └──  pnpm-lock.yaml
```

The `js` directory contains Vanilla JS projects that do not require a build step.

The `ts` directory contains projects that must be built with a bundler. Although the original open-source projects use a variety of build tools — including Gulp, Grunt, Webpack, Create React App, and Vite — their build configurations have been standardized on pnpm and Vite in this repository.

## Building

Run the following command from the repository root:

```
sh ./build_all.sh
```

The output for all units will be placed in the `dist` directory. Projects under `ts` are built individually and their output is copied there, while projects under `js` are copied as-is.

## License

Each subdirectory is licensed according to its original open-source project. The projects used here are licensed under terms such as MIT, Apache License, and CC BY 4.0; GPL-licensed projects are not included.

When integrating a unit into a host application, make sure to comply with that unit's license.

## Acknowledgements

Our sincere thanks go to the authors of these outstanding applications and to everyone who has helped advance Web Audio.

If you run into any issues, please feel free to reach out. Let's continue moving Web Audio forward together!
