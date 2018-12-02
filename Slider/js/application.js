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
          `<li>
              <img src="{0}" alt="{1}">
              <div class="container-{3}">
                <h1>{1}</h1>
                <div class="contrast">
                  <p>{2}</p>
                </div>
              </div>
            </li>`, p.Image, p.Header, p.Content, p.Position);
    });
    return text;
  }
  var html = CreateHTML(jsonData);
  $('#slides-content').html(html);
  $('#slides').superslides({
    play: 8000,
    animation: 'fade',
    animation_easing: 'easeInOutCubic',
    animation_speed: 800,
    // pagination: true,
    // hashchange: true,
    scrollable: true
  });
});