jQuery.noConflict();
(function( $ ) {
  $(function() {
	    // More code using $ as alias to jQuery
		var Format = function(){
			var Main = $('td[bgcolor="#016AAB"]').parent();
			Main.each(function( index ) {
				var sp = $('<span></span>').append($( this ).find('b').last().text());
				var tintuc = $('<div class="tintuc"></div>').append(sp);
				var c_tintuc = $('<div class="c_tintuc"></div>').append(tintuc);
				var Parent = $(this).parents("div[id^='portlet_']");
				Parent.prepend(c_tintuc);
				$(this).html ('');
			});
			var pnTop = $('#pnTopDisplay');
			var pnBottom = $('#pnBottomDisplay');
			var mainBody = pnTop.parents('#form1 > div');
			mainBody.before(pnTop);
			mainBody.after(pnBottom);
		}
		var ControlPanel = $('#pnControlPanel');
		if (ControlPanel.length == 0){ // Run only on normal mode
			Format();
			url = 'http://hoanchan.droppages.com/TCV/customcss.css';
			if (document.createStyleSheet) document.createStyleSheet(url);
			else $('<link rel="stylesheet" type="text/css" href="' + url + '" />').appendTo('head'); 
		}

	});
})(jQuery);