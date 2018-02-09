function showText() {
    var args = arguments;
    var text = args[0];
    for (var key = 1; key < args.length; key++)
        text = text.replace(new RegExp('\\{' + (key - 1) + '\\}', 'g'), args[key]);
    return text;
}

function getJson(url) {
    var json = [];
    $.ajax({
        type: 'GET',
        url: url,
        dataType: 'json',
        success: function(data) {
            json = data;
        },
        async: false
    });
    return json;
}

function getText(url) {
    var text = "";
    $.ajax({
        type: 'GET',
        url: url,
        dataType: 'text',
        success: function(data) {
            text = data;
        },
        async: false
    });
    return text;
}

var HCGitUrlRaw = 'https://raw.githubusercontent.com/HoanChan/HoanChan.github.io/master/live/TCV/';

function getImage(divID, image) {
    var image_url = HCGitUrlRaw + 'assets/img/' + divID + '/' + image;
    return image_url;
    // var http = new XMLHttpRequest();
    // http.open('HEAD', image_url, false);
    // http.send();
    // return http.status != 404 ? image_url : 'assets/img/default-avatar.png';
}

function CreateHTML(data, divID) {
    if ($.isEmptyObject(data)) return "";
    var node = getText("profile.html");
    var text = '<h3 class="info-text">' + data.Text + '</h3>';
    data.Data.forEach(function(p) {
        var phone = "";
        p.Phone.forEach(function(aphone) {
            phone += showText(
                `<div class="info">
                    <i class="material-icons">phone</i>
                    <a href="tel:{0}" class="phone">{0}</a>
                </div>`, aphone);
        });
        var email = "";
        p.Email.forEach(function(aemail) {
            email += showText(
                `<div class="info">
                    <i class="material-icons">email</i>
                    <a href="mailto:{0}" class="email">{0}</a>
                </div>`, aemail);
        });
        text += showText(node, getImage(divID, p.Image), p.Call, p.Name, p.Birthday, phone, email);
    });
    return text;
}

function LoadData() {
    var args = arguments;
    var divID = args[0];
    setTimeout(function() {
        var html = '';
        for (var key = 1; key < args.length; key++) {
            var data = getJson(HCGitUrlRaw + 'assets/data/' + args[key] + '.json');
            html += CreateHTML(data, args[key]);
        }
        $('#' + divID).removeClass("loader").html(html)
            .on("click", "#image", function() {
                var url = $(this).attr('src');
                $('#myModal').on('show.bs.modal', function() {
                    $('.showimage').attr('src', url);
                });
            });
    }, 100);
}



$(document).ready(function() {
    LoadData('BGH', 'BGH');
    LoadData('Toan', 'Toan');
    LoadData('Ly-CN', 'Ly', 'CN');
    LoadData('Hoa', 'Hoa');
    LoadData('Sinh-Tin', 'Sinh', 'Tin');
    LoadData('Van', 'Van');
    LoadData('Anh', 'Anh');
    LoadData('Su-Dia-CD', 'Su', 'Dia', 'CD');
    LoadData('TD-QP', 'TD-QP');
    // var data = getJson('assets/data/TCV2.json');
    // data.sort(function (a, b) {
    //     return a.B.localeCompare(b.B);
    // });

    //Check to see if the window is top if not then display button
    $(window).scroll(function() {
        if ($(this).scrollTop() > 500) {
            $('.scrollToTop').fadeIn(1000);
        } else {
            $('.scrollToTop').fadeOut(1000);
        }
    });
    $('.scrollToTop').click(function() {
        $('html, body').animate({
            scrollTop: 0
        }, 1000);
        return false;
    });
});