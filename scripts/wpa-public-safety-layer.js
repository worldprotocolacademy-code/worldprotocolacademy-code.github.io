/* WPA Public Safety Layer v1.1
 * Civil, analytical, development-phase terminology and public-boundary enforcement.
 * No publishing, payment, credential or backend actions are performed here.
 */
(function(){
  'use strict';
  if(window.WPA_PUBLIC_SAFETY_LAYER_LOADED)return;
  window.WPA_PUBLIC_SAFETY_LAYER_LOADED=true;

  var path=(location.pathname||'/').toLowerCase();
  var relevant=/\/(index\.html)?$|\/institute\.html$|\/intelligence-center\.html$|\/analytical-center\.html$|\/wpa-live-intelligence-feed\.html$|\/w