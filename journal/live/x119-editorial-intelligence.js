(() => {
  "use strict";
  if (window.WPA_X119) return;
  const V = "X11.9", RX = /\/api\/v1\/(live|ticker)$/, PF = fetch.bind(window), WIN = 48 * 36e5;
  const STOP = new Set("the a an and or but for from with into over under after before says said new latest live update report reports reported of to in on at by as is are was were be been this that these those it its their his her about amid via