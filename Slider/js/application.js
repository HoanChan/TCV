"use strict";
$(document).ready(function() {
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
    data.forEach(function(p) {
      text += showText(
          '<li>' +
              (p.Video?'<video controls autoplay src="' + p.Video + '">video not supported</video>'
                :'<img src="' + p.Image + '" alt="{0}">') +
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
  audio.play();
  audio.ended = function(){
    audio.load();
    audio.currentTime = 0;
    audio.play();
  };
  
});