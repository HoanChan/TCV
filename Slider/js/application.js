"use strict";
$(document).ready(function () {
  function showText() {
    var args = arguments;
    var text = args[0];
    for (var key = 1; key < args.length; key++)
      text = text.replace(new RegExp('\\{' + (key - 1) + '\\}', 'g'), args[key]);
    return text;
  }

  function CreateHTML(data) {
    if ($.isEmptyObject(data)) return "";
    var text = '';
    data.forEach(function (p) {
      var content = "";
      if (p.Video) {
        content = '<li data-type="video"><video controls autoplay src="' + p.Video + '">video not supported</video>';
      }
      else if (p.Link) {
        content = '<li data-type="link"><a href="' + p.Link + '" title="{0}">{0}</a>';
      }
      else if (p.Image) {
        content = '<li data-type="image"><img src="' + p.Image + '" alt="{0}">';
      }
      text += showText( content +
        (p.Position ?
          '<div class="container {2}">' +
          '<h1 class="header">{0}</h1>' +
          '<div class="content">' +
          '<p>{1}</p>' +
          '</div>' +
          '</div>' : "") +
        '</li>', p.Header, p.Content, p.Position);
    });
    return text;
  }
  var html = CreateHTML(jsonData);
  $('#slides-content').html(html);
  var slider = $('#slides');
  slider.superslides({
    play: slider.data('speed'),
    animation: slider.data('animation'),
    // animation_easing: 'easeInOutCubic',
    // animation_speed: slider.data('animation-speed'),
    pagination: typeof IsUsePagination !== 'undefined' && IsUsePagination === false ? false : true,
    // hashchange: true,
    scrollable: true
  });
  var audio = $('#music').get(0);
  if (audio) {
    audio.play().catch(function () {
      console.log('audio autoplay blocked by web browser!')
    });
    audio.onended = function () {
      audio.load();
      audio.currentTime = 0;
      audio.play();
    };
  }
});