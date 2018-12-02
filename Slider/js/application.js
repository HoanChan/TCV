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
              <div class="container">
                <h1>{1}</h1>
                <div class="contrast">
                  <p>{2}</p>
                </div>
              </div>
            </li>`, p.Image, p.Header, p.Content);
    });
    return text;
  }
  var data = [
  {
    "Image": "images/img (1).jpg",
    "Header": "Hoạt động tập thể sôi nổi.",
    "Content": "Hình ảnh hoạt động của đội tiên phong Trần Cao Vân năm 2016."
  },
  {
    "Image": "images/img (2).jpg",
    "Header": "Lớp học yêu thương.",
    "Content": "Hình ảnh các bạn học sinh tổ chức chia tay giáo sinh thực tập năm 2018."
  },
  {
    "Image": "images/img (3).jpg",
    "Header": "Học sinh chăm ngoan.",
    "Content": "Hình ảnh các bạn được nhận giấy khen vì có thành tích tốt trong công tác Đoàn - Hội."
  },
  {
    "Image": "images/img (4).jpg",
    "Header": "Trường THPT Trần Cao Vân thân yêu",
    "Content": "Trường mới khang trang, thoáng mát, cơ sở vật chất đầy đủ phục vụ học tập."
  },
  {
    "Image": "images/img (5).jpg",
    "Header": "Chào cờ và sinh hoạt ngoài giờ thú vị",
    "Content": "Hàng tuần nhà trường tổ chức chào cờ và sinh hoạt ngoài giờ đầy ý nghĩa."
  },
  {
    "Image": "images/img (6).jpg",
    "Header": "Hoạt động thể thao hứng khởi",
    "Content": "Hội khoẻ phù đổng của trường luôn được các bạn hưởng ứng nhiệt tình."
  },
  {
    "Image": "images/img (7).jpg",
    "Header": "Hoạt động thể thao hứng khởi",
    "Content": "Tinh thần thể thao và sự gắp kết tập thể được nâng cao."
  },
];
  var html = CreateHTML(data);
  $('#slides-content').html(html);
  $('#slides').superslides({
    play: 5000,
    animation: 'fade',
    animation_easing: 'easeInOutCubic',
    animation_speed: 800,
    // pagination: true,
    // hashchange: true,
    scrollable: true
  });
});