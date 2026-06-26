# bc-010

[![Netlify Status](https://api.netlify.com/api/v1/badges/4896724f-ab51-488c-98ea-e17c0b0b2dc9/deploy-status)](https://app.netlify.com/sites/frosty-swanson-669b64/deploys)

A browser based synthesizer. :musical_keyboard: :sound:

## What is this?

This is an audio synthesizer to be used right in your own web browser. You can play the computer keyboard to sound the notes or click them in with the mouse. The tone of the synth can be changed by clicking and dragging the sliders in the control panel.

## Screenshot:

![Screenshot of synth](https://res.cloudinary.com/bcimbali/image/upload/dpr_auto,c_scale,f_auto,q_auto:eco,w_900/v1593900403/bc-010/bc-010-07-04-2020.png)

## How to Use:

- Open a Chrome web browser (so far, only Chrome supports all features of Web MIDI / Web Audio)
- Go to the URL for the app/synth: https://frosty-swanson-669b64.netlify.com/
- Click on a musical key to play the synth
  - You can also use the "musical typing" feature of the computer keyboard to play notes
- Click and drag the sliders to adjust the tone
- Change the waveform of the synth between the 4 shown in the control panel (sine, square, triangle, sawtooth)
- Adjust the octave of the keyboard by toggling the plus and minus buttons in the octave section

## How to install and Run: :runner:

- `git clone` the repo
- Run `npm install` to get all dependencies
- `cd` into `bc-010`
- Run `npm start`
- Go to `localhost:3000` in your web browser

## How to type check with Flow :mag: :clipboard:

- `cd` into the root of the repo
- Run `npm install --save-dev flow-bin`
  - This command installs Flow as a Dev Dependency
- While in the root of the repo, run `npm run flow`
- Any errors will be logged to the console
  - If there aren't any errors, it will display as well

## Documentation :bookmark_tabs:

- [Components, props, and methods documented here](https://bcimbali.github.io/bc-010/)

### How To Run Documentation Server:

- Make sure [React Styleguidist](https://react-styleguidist.js.org/docs/getting-started.html) is installed. (It should have been installed as a devDependency).
- Then in the root directory of the project, run `npx styleguidist server`
- View the documenatation in your web browser at `http://localhost:6060/`

### Setting up AutoFix on save with VSCode :necktie:

Having Prettier/Eslint autofix errors is very handy for development. This repo is
all set up to autofix errors. If you're using VSCode, make sure these
settings below are in your workspace settings (below are the json version):

```
{
  "editor.formatOnSave": true,
  "eslint.autoFixOnSave": true,
}
```

## Built with:

- React
- [Flow](https://flow.org/)
- Javascript
- [Tone.js](https://tonejs.github.io/)
- HTML
- CSS

## Future Features:

- Ability to login and save presets
- Add MIDI keyboard recognition
- Fully adjustable portamento
