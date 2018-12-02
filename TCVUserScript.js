// ==UserScript==
// @name          TCV add bootstrap
// @namespace     HoanChan
// @description   TCV add bootstrap
// @author        Hoàn Chân
// @homepage      HoanChan.GitHub.io
// @run-at        document-start
// @version       0.1
// ==/UserScript==
(function() {var css = "";
if (false || document.domain == "tcvan.khanhhoa.edu.vn")
    css += `<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js"></script><script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script> <script>
jQuery.noConflict();
(function( $ ) {
  $(function() {
    var bsModal = $.fn.modal.noConflict();
});
})(jQuery);
</script>
<link rel="stylesheet" href="https://tcv.netlify.com/assets/css/tcv.main.css" />
<link rel="stylesheet" href="https://tcv.netlify.com/WOW/style.css" />`;
if (typeof GM_addStyle != "undefined") {
    GM_addStyle(css);
} else if (typeof PRO_addStyle != "undefined") {
    PRO_addStyle(css);
} else if (typeof addStyle != "undefined") {
    addStyle(css);
} else {
    var node = document.createElement("style");
    node.type = "text/css";
    node.appendChild(document.createTextNode(css));
    var heads = document.getElementsByTagName("head");
    if (heads.length > 0) {
        heads[0].appendChild(node);
    } else {
        // no head yet, stick it whereever
        document.documentElement.appendChild(node);
    }
}
})();
