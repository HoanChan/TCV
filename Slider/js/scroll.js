"use strict";
$(document).ready(function () {
  var DELAY_READING = 10000; // 4 seconds = 4000; 10 seconds = 10000
  var DELAY_SCROLLING = 2000;
  var PERCENTSCROLL = .5;
  var timerId = 0;
  delayLinks(0);
  function delayLinks(top) {
    if (top >= $(document).height()) top = 0;
    $('body,html').stop().animate({ scrollTop: top }, DELAY_SCROLLING);
    var next = top + $(window).height() * PERCENTSCROLL;
    timerId = setTimeout(function () { delayLinks(next) }, DELAY_READING);
  }
});