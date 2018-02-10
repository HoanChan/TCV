$(document).ready(function() {
    // $.ajaxPrefilter(function(options) {
    //     if (options.crossDomain && jQuery.support.cors) {
    //         options.url = 'https://cors-anywhere.herokuapp.com/' + options.url;
    //     }
    // });
    $.get('https://cors-anywhere.herokuapp.com/http://tcvan.khanhhoa.edu.vn/',
        function(data, status) {
            var head = (/<head>(.+)<\/head>/gs).exec(data)[1]; //
            var body = (/<body[^>]*>(.+)<\/body>/gs).exec(data)[1]; //
            body = body.replace(/<script[^>]*>.*?<\/script>/gs, ""); //
            var tempDom = $('<output>').append(body);
            var appContainer = $('#app-container', tempDom);
            $('#headerPanel').html($('#pnTopDisplay', tempDom).html());
            $('#leftPanel').html($('#pnLeftDisplay', tempDom).html());
            $('#midPanel').html($('#pnCenterDisplay', tempDom).html());
            $('#rightPanel').html($('#pnRightDisplay', tempDom).html());
            $('#footerPanel').html($('#pnBottomDisplay', tempDom).html());

            // $('body').html(body);

            var Format = function() {
                var Main = $('td[bgcolor="#016AAB"]').parent();
                Main.each(function(index) {
                    var sp = $('<span></span>').append($(this).find('b').last().text());
                    var tintuc = $('<div class="tintuc"></div>').append(sp);
                    var c_tintuc = $('<div class="c_tintuc"></div>').append(tintuc);
                    var Parent = $(this).parents("div[id^='portlet_']");
                    Parent.prepend(c_tintuc);
                    $(this).html('');
                });
                var pnTop = $('#pnTopDisplay');
                var pnBottom = $('#pnBottomDisplay');
                var mainBody = pnTop.parents('#form1 > div');
                mainBody.before(pnTop);
                mainBody.after(pnBottom);
            }
            var ControlPanel = $('#pnControlPanel');
            if (ControlPanel.length == 0) { // Run only on normal mode
                Format();
            } else {
                url = 'assets/css/tcv.main.cp.css';
                if (document.createStyleSheet) document.createStyleSheet(url);
                else $('<link rel="stylesheet" type="text/css" href="' + url + '" />').appendTo('head');
            }
        });
});