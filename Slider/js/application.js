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
              '<img src="{0}" alt="{1}">' +
              (p.Position ? 
              '<div class="container {3}">' +
                '<h1 class="header">{1}</h1>' +
                '<div class="content">' +
                  '<p>{2}</p>' +
                '</div>' +
              '</div>' : "") +
            '</li>', p.Image, p.Header, p.Content, p.Position);
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
    // pagination: true,
    // hashchange: true,
    scrollable: true
  });
});