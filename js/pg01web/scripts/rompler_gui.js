/*
 * rompler_gui.js
 *
 * This program is licensed under the MIT License.
 * Copyright 2012, aike (@aike1000)
 *
 */

$(function () {
  // Background
  $("<img />")
    .panel({
      id: "panel",
      image: "images/panel.png",
      left: 20,
      top: 40,
    })
    .appendTo("#draw");

  ///////////// MASTER

  $("<img />")
    .knob({
      id: "ms_vol",
      image: "images/knob1.png",
      left: 570,
      top: 75,
      width: 40,
      height: 40,
      value: 50,
      change: function () {
        m.master.gain($(this).knob("value"));
      },
    })
    .appendTo("#draw");

  ///////////// fretboard marker
  var x = 20;
  var sx = 80;
  var rx = 0.9;
  var y = 217;
  var sy = 16;
  var n = 0;
  $("<img />")
    .keypad({
      id: "fr" + n,
      image: "images/dot.png",
      left: x,
      top: y,
      width: 36,
      height: 12,
      value: 0,
      mousedown: function () {
        $("#fr7").keypad("value", 1);
        m.noteOn(40, 100);
      },
      mouseup: function () {
        $("#fr7").keypad("value", 0);
        m.noteOff(40);
      },
    })
    .appendTo("#draw");

  n++;
  x = 60;
  $("<img />")
    .keypad({
      id: "fr" + n,
      image: "images/dot.png",
      left: x,
      top: y,
      width: 36,
      height: 12,
      value: 0,
      mousedown: function () {
        $("#fr8").keypad("value", 1);
        m.noteOn(41, 100);
      },
      mouseup: function () {
        $("#fr8").keypad("value", 0);
        m.noteOff(41);
      },
    })
    .appendTo("#draw");
  n++;
  sx *= rx;
  x += sx;
  $("<img />")
    .keypad({
      id: "fr" + n,
      image: "images/dot.png",
      left: x,
      top: y,
      width: 36,
      height: 12,
      value: 0,
      mousedown: function () {
        $("#fr9").keypad("value", 1);
        m.noteOn(42, 100);
      },
      mouseup: function () {
        $("#fr9").keypad("value", 0);
        m.noteOff(42);
      },
    })
    .appendTo("#draw");
  n++;
  sx *= rx;
  x += sx;
  $("<img />")
    .keypad({
      id: "fr" + n,
      image: "images/dot.png",
      left: x,
      top: y,
      width: 36,
      height: 12,
      value: 0,
      mousedown: function () {
        $("#fr10").keypad("value", 1);
        m.noteOn(43, 100);
      },
      mouseup: function () {
        $("#fr10").keypad("value", 0);
        m.noteOff(43);
      },
    })
    .appendTo("#draw");
  n++;
  sx *= rx;
  x += sx;
  $("<img />")
    .keypad({
      id: "fr" + n,
      image: "images/dot.png",
      left: x,
      top: y,
      width: 36,
      height: 12,
      value: 0,
      mousedown: function () {
        $("#fr11").keypad("value", 1);
        m.noteOn(44, 100);
      },
      mouseup: function () {
        $("#fr11").keypad("value", 0);
        m.noteOff(44);
      },
    })
    .appendTo("#draw");
  n++;

  rx = 0.94;
  sx *= rx;
  x += sx;
  $("<img />")
    .keypad({
      id: "fr5_6",
      image: "images/dot.png",
      left: x,
      top: y,
      width: 36,
      height: 12,
      value: 0,
      mousedown: function () {
        $("#fr12").keypad("value", 1);
        m.noteOn(45, 100);
      },
      mouseup: function () {
        $("#fr12").keypad("value", 0);
        m.noteOff(45);
      },
    })
    .appendTo("#draw");
  sx *= rx;
  x += sx;
  $("<img />")
    .keypad({
      id: "fr6_6",
      image: "images/dot.png",
      left: x,
      top: y,
      width: 36,
      height: 12,
      value: 0,
      mousedown: function () {
        $("#fr13").keypad("value", 1);
        m.noteOn(46, 100);
      },
      mouseup: function () {
        $("#fr13").keypad("value", 0);
        m.noteOff(46);
      },
    })
    .appendTo("#draw");
  sx *= rx;
  x += sx;
  $("<img />")
    .keypad({
      id: "fr7_6",
      image: "images/dot.png",
      left: x,
      top: y,
      width: 36,
      height: 12,
      value: 0,
      mousedown: function () {
        $("#fr14").keypad("value", 1);
        m.noteOn(47, 100);
      },
      mouseup: function () {
        $("#fr14").keypad("value", 0);
        m.noteOff(47);
      },
    })
    .appendTo("#draw");

  rx = 0.9;
  x = 20;
  sx = 80;
  y -= sy;
  $("<img />")
    .keypad({
      id: "fr" + n,
      image: "images/dot.png",
      left: x,
      top: y,
      width: 36,
      height: 12,
      value: 0,
      mousedown: function () {
        $("#fr17").keypad("value", 1);
        m.noteOn(45, 100);
      },
      mouseup: function () {
        $("#fr17").keypad("value", 0);
        m.noteOff(45);
      },
    })
    .appendTo("#draw");

  n++;
  x = 60;
  $("<img />")
    .keypad({
      id: "fr" + n,
      image: "images/dot.png",
      left: x,
      top: y,
      width: 36,
      height: 12,
      value: 0,
      mousedown: function () {
        $("#fr18").keypad("value", 1);
        m.noteOn(46, 100);
      },
      mouseup: function () {
        $("#fr18").keypad("value", 0);
        m.noteOff(46);
      },
    })
    .appendTo("#draw");
  n++;
  sx *= rx;
  x += sx;
  $("<img />")
    .keypad({
      id: "fr" + n,
      image: "images/dot.png",
      left: x,
      top: y,
      width: 36,
      height: 12,
      value: 0,
      mousedown: function () {
        $("#fr19").keypad("value", 1);
        m.noteOn(47, 100);
      },
      mouseup: function () {
        $("#fr19").keypad("value", 0);
        m.noteOff(47);
      },
    })
    .appendTo("#draw");
  n++;
  sx *= rx;
  x += sx;
  $("<img />")
    .keypad({
      id: "fr" + n,
      image: "images/dot.png",
      left: x,
      top: y,
      width: 36,
      height: 12,
      value: 0,
      mousedown: function () {
        $("#fr20").keypad("value", 1);
        m.noteOn(48, 100);
      },
      mouseup: function () {
        $("#fr20").keypad("value", 0);
        m.noteOff(48);
      },
    })
    .appendTo("#draw");
  n++;
  sx *= rx;
  x += sx;
  $("<img />")
    .keypad({
      id: "fr" + n,
      image: "images/dot.png",
      left: x,
      top: y,
      width: 36,
      height: 12,
      value: 0,
      mousedown: function () {
        $("#fr21").keypad("value", 1);
        m.noteOn(49, 100);
      },
      mouseup: function () {
        $("#fr21").keypad("value", 0);
        m.noteOff(49);
      },
    })
    .appendTo("#draw");
  n++;

  rx = 0.94;
  sx *= rx;
  x += sx;
  $("<img />")
    .keypad({
      id: "fr" + n,
      image: "images/dot.png",
      left: x,
      top: y,
      width: 36,
      height: 12,
      value: 0,
      mousedown: function () {
        $("#fr22").keypad("value", 1);
        m.noteOn(50, 100);
      },
      mouseup: function () {
        $("#fr22").keypad("value", 0);
        m.noteOff(50);
      },
    })
    .appendTo("#draw");
  n++;
  sx *= rx;
  x += sx;
  $("<img />")
    .keypad({
      id: "fr" + n,
      image: "images/dot.png",
      left: x,
      top: y,
      width: 36,
      height: 12,
      value: 0,
      mousedown: function () {
        $("#fr23").keypad("value", 1);
        m.noteOn(51, 100);
      },
      mouseup: function () {
        $("#fr23").keypad("value", 0);
        m.noteOff(51);
      },
    })
    .appendTo("#draw");
  n++;
  sx *= rx;
  x += sx;
  $("<img />")
    .keypad({
      id: "fr" + n,
      image: "images/dot.png",
      left: x,
      top: y,
      width: 36,
      height: 12,
      value: 0,
      mousedown: function () {
        $("#fr24").keypad("value", 1);
        m.noteOn(52, 100);
      },
      mouseup: function () {
        $("#fr24").keypad("value", 0);
        m.noteOff(52);
      },
    })
    .appendTo("#draw");
  n++;
  sx *= rx;
  x += sx;
  $("<img />")
    .keypad({
      id: "fr" + n,
      image: "images/dot.png",
      left: x,
      top: y,
      width: 36,
      height: 12,
      value: 0,
      clickable: false,
    })
    .appendTo("#draw");
  n++;
  sx *= rx;
  x += sx;
  $("<img />")
    .keypad({
      id: "fr" + n,
      image: "images/dot.png",
      left: x,
      top: y,
      width: 36,
      height: 12,
      value: 0,
      clickable: false,
    })
    .appendTo("#draw");
  n++;

  rx = 0.9;
  x = 20;
  sx = 80;
  y -= sy;
  $("<img />")
    .keypad({
      id: "fr" + n,
      image: "images/dot.png",
      left: x,
      top: y,
      width: 36,
      height: 12,
      value: 0,
      clickable: false,
    })
    .appendTo("#draw");

  n++;
  x = 60;
  $("<img />")
    .keypad({
      id: "fr" + n,
      image: "images/dot.png",
      left: x,
      top: y,
      width: 36,
      height: 12,
      value: 0,
      clickable: false,
    })
    .appendTo("#draw");
  n++;
  sx *= rx;
  x += sx;
  $("<img />")
    .keypad({
      id: "fr" + n,
      image: "images/dot.png",
      left: x,
      top: y,
      width: 36,
      height: 12,
      value: 0,
      clickable: false,
    })
    .appendTo("#draw");
  n++;
  sx *= rx;
  x += sx;
  $("<img />")
    .keypad({
      id: "fr" + n,
      image: "images/dot.png",
      left: x,
      top: y,
      width: 36,
      height: 12,
      value: 0,
      clickable: false,
    })
    .appendTo("#draw");
  n++;
  sx *= rx;
  x += sx;
  $("<img />")
    .keypad({
      id: "fr" + n,
      image: "images/dot.png",
      left: x,
      top: y,
      width: 36,
      height: 12,
      value: 0,
      clickable: false,
    })
    .appendTo("#draw");
  n++;
  rx = 0.94;
  sx *= rx;
  x += sx;
  $("<img />")
    .keypad({
      id: "fr" + n,
      image: "images/dot.png",
      left: x,
      top: y,
      width: 36,
      height: 12,
      value: 0,
      clickable: false,
    })
    .appendTo("#draw");
  n++;
  sx *= rx;
  x += sx;
  $("<img />")
    .keypad({
      id: "fr" + n,
      image: "images/dot.png",
      left: x,
      top: y,
      width: 36,
      height: 12,
      value: 0,
      clickable: false,
    })
    .appendTo("#draw");
  n++;
  sx *= rx;
  x += sx;
  $("<img />")
    .keypad({
      id: "fr" + n,
      image: "images/dot.png",
      left: x,
      top: y,
      width: 36,
      height: 12,
      value: 0,
      clickable: false,
    })
    .appendTo("#draw");
  n++;
  sx *= rx;
  x += sx;
  $("<img />")
    .keypad({
      id: "fr" + n,
      image: "images/dot.png",
      left: x,
      top: y,
      width: 36,
      height: 12,
      value: 0,
      clickable: false,
    })
    .appendTo("#draw");
  n++;
  sx *= rx;
  x += sx;
  $("<img />")
    .keypad({
      id: "fr" + n,
      image: "images/dot.png",
      left: x,
      top: y,
      width: 36,
      height: 12,
      value: 0,
      clickable: false,
    })
    .appendTo("#draw");

  // SFM logo
  $("<div>")
    .attr({ id: "sfm_d" })
    .css({
      position: "absolute",
      left: 500,
      top: 280,
      width: 150,
      height: 30,
    })
    .appendTo("#draw");
  $("<a>")
    .attr({
      id: "sfm_a",
      href: "http://soundfrostmusic.com/jp/",
      target: "_blank",
    })
    .appendTo("#sfm_d");
  $("<img>")
    .attr({
      id: "sfm_img",
      src: "images/space.gif",
    })
    .css({
      width: 150,
      height: 30,
    })
    .appendTo("#sfm_a");
});
