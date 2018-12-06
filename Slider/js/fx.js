"use strict";
window.fx = {
    version: '1.4.8',
    Effects3D: 48,
    Effects2D: 19,
};
fx.HC ={};
// CSS3 Helper Function
(function ($) {
    $.fn.css3 = function (props) {
        var css = {};
        var prefixes = ['webkit', 'moz', 'ms', 'o'];

        for (var prop in props) {
            // Add the vendor specific versions
            for (var i = 0; i < prefixes.length; i++)
                css['-' + prefixes[i] + '-' + prop] = props[prop];

            // Add the actual version   
            css[prop] = props[prop];
        }

        this.css(css);
        return this;
    };
})(window.jQuery);

(function($) {
    fx.HC.browser = {
        init: function() {
            // Have we already been initialised?
            if (fx.HC.browser.supportsTransitions !== undefined)
                return;

            var div = document.createElement('div'),
                prefixes = ['-webkit', '-moz', '-o', '-ms'],
                domPrefixes = ['Webkit', 'Moz', 'O', 'Ms'];

            // Does the current browser support CSS Transitions?
            if (window.Modernizr && Modernizr.csstransitions !== undefined)
                fx.HC.browser.supportsTransitions = Modernizr.csstransitions;
            else {
                fx.HC.browser.supportsTransitions = this.supportsCSSProperty('Transition');
            }

            // Does the current browser support 3D CSS Transforms?
            if (window.Modernizr && Modernizr.csstransforms3d !== undefined)
                fx.HC.browser.supports3d = Modernizr.csstransforms3d;
            else {
                // Custom detection when Modernizr isn't available
                fx.HC.browser.supports3d = this.supportsCSSProperty("Perspective");

                if (fx.HC.browser.supports3d && 'webkitPerspective' in $('body').get(0).style) {
                    // Double check with a media query (similar to how Modernizr does this)
                    var div3D = $('<div id="csstransform3d"></div>');
                    var mq = $('<style media="(transform-3d), (' + prefixes.join('-transform-3d),(') + '-transform-3d)">div#csstransform3d { position: absolute; left: 9px }</style>');

                    $('body').append(div3D);
                    $('head').append(mq);

                    fx.HC.browser.supports3d = div3D.get(0).offsetLeft == 9;

                    div3D.remove();
                    mq.remove();
                }
            }

        },
        supportsCSSProperty: function(prop) {
            var div = document.createElement('div'),
                prefixes = ['-webkit', '-moz', '-o', '-ms'],
                domPrefixes = ['Webkit', 'Moz', 'O', 'Ms'];

            var support = false;
            for (var i = 0; i < domPrefixes.length; i++) {
                if (domPrefixes[i] + prop in div.style)
                    support = support || true;
            }

            return support;
        },
        translateX: function(len) {
            return fx.HC.browser.translate(len, 0, 0);
        },
        translateY: function(len) {
            return fx.HC.browser.translate(0, len, 0);
        },
        translateZ: function(len) {
            return fx.HC.browser.translate(0, 0, len);
        },
        translate: function(x, y, z) {
            x = (x != undefined) ? x : 0;
            y = (y != undefined) ? y : 0;
            z = (z != undefined) ? z : 0;

            return 'translate' + (fx.HC.browser.supports3d ? '3d(' : '(') + x + 'px,' + y + (fx.HC.browser.supports3d ? 'px,' + z + 'px)' : 'px)');
        },
        scale: function(x, y, z) {
            x = (x != undefined) ? x : 0;
            y = (y != undefined) ? y : 0;
            z = (z != undefined) ? z : 0;

            return 'scale' + (fx.HC.browser.supports3d ? '3d(' : '(') + x + ',' + y + (fx.HC.browser.supports3d ? ',' + z + ')' : ')');
        },
        rotateX: function(deg) {
            return fx.HC.browser.rotate('x', deg);
        },
        rotateY: function(deg) {
            return fx.HC.browser.rotate('y', deg);
        },
        rotateZ: function(deg) {
            return fx.HC.browser.rotate('z', deg);
        },
        rotate: function(axis, deg) {
            if (!axis in {
                    'x': '',
                    'y': '',
                    'z': ''
                })
                axis = 'z';

            deg = (deg != undefined) ? deg : 0;

            if (fx.HC.browser.supports3d)
                return 'rotate3d(' + (axis == 'x' ? '1' : '0') + ', ' + (axis == 'y' ? '1' : '0') + ', ' + (axis == 'z' ? '1' : '0') + ', ' + deg + 'deg)';
            else {
                if (axis == 'z')
                    return 'rotate(' + deg + 'deg)';
                else
                    return '';
            }
        }
    };

    $(function() {
        // To continue to work with legacy code, ensure that fx.HC.browser is initialised on document ready at the latest
        fx.HC.browser.init();
    });
})(window.jQuery);

//=================[ Transition Base Class ]=================//
(function ($) {
    fx.HC.transition = function (that, opts, completed) {
        this.slider = that;
        this.options = $.extend({
            fallback: false,
            requires3d: false,
            effectMode: 'out',
            after: function () {if (completed) completed();}
        }, opts);
        // We need to ensure transitions degrade gracefully if the transition is unsupported or not loaded
        if ((this.options.requires3d && !fx.HC.browser.supports3d) || !fx.HC.browser.supportsTransitions || this.options.fallback === true) {
            var _this = this;

            this.options.after = undefined;

            this.options.setup = function () {
                _this.fallbackSetup();
            };

            this.options.execute = function () {
                _this.fallbackExecute();
            };
        }
    };

    fx.HC.transition.prototype = {
        constructor: fx.HC.transition,
        hasFinished: false, // This is a lock to ensure that the HCTransitionEnd event is only fired once per transition
        run: function () {            
            // this.slider.imageContainer.css('overflow', this.options.requires3d ? 'visible' : 'hidden');
            if (this.options.setup !== undefined) this.options.setup.call(this);
            // if (this.options.effectMode === 'out') $outgoing.css({ 'background-image': 'none' });
            if (this.options.execute !== undefined) this.options.execute.call(this);
        },
        finished: function () {
            if (this.hasFinished) return;
            this.hasFinished = true;
            // this.slider.setupImages();
            if (this.options.after) this.options.after.call(this);
        },
        fallbackSetup: function () {

        },
        fallbackExecute: function () {
            this.finished();
        }
    };
//==============================================================//
    fx.HC.transitions = {}; // danh sách các hiệu ứng
    var randomProperty = function (obj) {
        var keys = Object.keys(obj)
        return obj[keys[ keys.length * Math.random() << 0]];
    };
    fx.HC.transitions.Random = function (that, opts, completed) {
        return new randomProperty(fx.HC.transitions)(that, opts, completed);
    };

    $.fn.superslides.fx = $.extend(fx.HC.transitions, $.fn.superslides.fx);
//=============================================================//
    fx.HC.transition_base = function (that, opts, completed) {
        var //that = this,
        $children = that.$container.children(),
        $outgoing = $children.eq(opts.outgoing_slide),
        $target = $children.eq(opts.upcoming_slide);
        return new fx.HC.transition(that, $.extend({
            columns: 7,
            rows: 7,
            forceSquare: false,
            perspective: 1000,
            setup: function () {
                $outgoing.css({ 
                    zIndex: 2, 
                    display: 'block'
                }).css3({
                    'perspective': this.options.perspective,
                    'perspective-origin': '50% 50%'
                });
                $target.css({
                    zIndex: 0,
                    opacity: 1,
                    display: 'block'
                });

                var imgWidth = $outgoing.width(),
                    imgHeight = $outgoing.height();

                var colWidth = imgWidth / this.options.columns,
                    rowHeight = imgHeight / this.options.rows;

                if (this.options.forceSquare) {
                    this.options.rows = Math.floor(imgHeight / colWidth);
                    rowHeight = imgHeight / this.options.rows;
                }
                var fragment = document.createDocumentFragment();
                for (var i = 0; i < this.options.columns; i++) {
                    for (var j = 0; j < this.options.rows; j++) {
                        var thisColWidth = Math.ceil(colWidth + 0.5),      // Add 0.5 to round up the number when browser display
                            thisRowHeight = Math.ceil(rowHeight + 0.5),    // eg: 3.24 + 0.5 = 3.74 when display, it locate at 4
                            totalLeft = Math.ceil(colWidth * i),
                            totalTop = Math.ceil(rowHeight * j);
                        var tile = $('<div class="tile tile-' + i + '-' + j + '"></div>').css({
                            width: thisColWidth + 'px',
                            height: thisRowHeight + 'px',
                            position: 'absolute',
                            top: totalTop + 'px',
                            left: totalLeft + 'px'
                        });
                        var targetImage = $outgoing.children('img').first();
                        var imgLeft = (parseInt(targetImage.css("left"), 10) || 0);
                        var imgTop = (parseInt(targetImage.css("top"), 10) || 0);
                        this.options.renderTile.call(this, tile, i, j, thisColWidth, thisRowHeight, totalLeft - imgLeft, totalTop - imgTop);
                        fragment.appendChild(tile.get(0));
                    }
                }

                // Append the fragement to the surface
                $outgoing.get(0).appendChild(fragment);
                $outgoing.children().not($('.tile')).hide();
            },
            execute: function () {

            },
            renderTile: function (elem, colIndex, rowIndex, colWidth, rowHeight, leftOffset, topOffset) {

            }
        }, opts), completed);
    };
})(window.jQuery);
//=================[ Dissolve Effects ]=================//
(function ($) {
    fx.HC.transitions.Dissolve = function (that, opts, completed) {
        var //that = this,
        $children = that.$container.children(),
        $outgoing = $children.eq(opts.outgoing_slide),
        $target = $children.eq(opts.upcoming_slide);
        return new fx.HC.transition(that, $.extend({
            duration: 2,
            ease: Quart.easeIn,
            setup: function () {
                $target.css({ // thiết lập cho slide mới, chuẩn bị chạy hoạt hình
                    zIndex: 2, // cho nó lên trên cái slide đang hiển thị
                    opacity: 0,// ẩn nó đi
                    display: 'block'
                });           
            },
            execute: function () {
                var _this = this;
                var complete = function() {
                    $target.css({ zIndex: 0 });
                    $outgoing.css({
                        opacity: 1,
                        display: 'none',
                        zIndex: 0
                    });                        
                    _this.finished();
                };
                $target.css({
                  left: that.width
                });
                TweenMax.to($target, _this.options.duration, {
                    autoAlpha: 1,
                    ease: _this.options.ease,
                    onComplete: complete
                });
            }
        }, opts), completed);
    };
})(window.jQuery);

//=================[ Swipe Effects ]=================//
(function ($) {
    fx.HC.transitions.SwipeLeft = function (that, opts, completed) {
        var //that = this,
        $children = that.$container.children(),
        $outgoing = $children.eq(opts.outgoing_slide),
        $target = $children.eq(opts.upcoming_slide);
        return new fx.HC.transition(that, $.extend({
            duration: 2,
            ease: Sine.easeOut,
            direction: 'left',
            size: 140,
            setup: function () {
                $outgoing.css({ 
                    zIndex: 2, 
                    display: 'block'
                }); 
                $target.css({
                    zIndex: 0,
                    opacity: 1,
                    display: 'block'
                });
                var sizePer = 100 * (this.options.size / $outgoing.width() / 3) / 2;
                var rec = this.options.direction === 'right' || this.options.direction === 'down';
                var rec1 = rec ? 0 : 1;
                var rec2 = rec ? 1 : 0;
                var dir = this.options.direction === 'up' || this.options.direction === 'down' ? 'top' : 'left';
                var targetImage = $outgoing.children('img').first();
                var mask = $('<div id="mask"/>').css({
                    width: targetImage.width(),
                    height: targetImage.height(),
                    position: 'absolute',
                    left: targetImage.css("left"),
                    top: targetImage.css("top"),
                    'background-size': 'cover',
                    'background-image': 'url("' + targetImage.attr('src') + '")'
                }).css3({
                    'mask-image': '-webkit-linear-gradient(' + dir + ', rgba(0,0,0,' + rec1 + ') 0%, rgba(0,0,0,' + rec1 + ') ' + (50 - sizePer) + '%, rgba(0,0,0,' + rec2 + ') ' + (50 + sizePer) + '%, rgba(0,0,0,' + rec2 + ') 100%)',
                    'mask-size': '300%'
                });//.attr("style", targetImage.attr("style")).addClass(targetImage.attr("class"));

                var timer = $('<div id="timer"/>').css({ width: '0px' });
                $outgoing.append(mask).append(timer);
                //targetImage.hide();
                $outgoing.children().not(mask).hide();
            },
            execute: function () {
                var _this = this,
                    mask = $outgoing.find('div#mask'),
                    timer = $outgoing.find('div#timer');
                var complete = function () {
                    $outgoing.show(0);
                    $outgoing.css({
                        zIndex: 0,
                        display: 'none'
                    }); 
                    $outgoing.children().show();
                    mask.remove();
                    timer.remove();
                    _this.finished();
                };
                var update = function () {
                    var per = _this.options.direction === 'right' || _this.options.direction === 'down' ? 100 - timer.width() : timer.width();
                    mask.css3({
                        'mask-position': _this.options.direction === 'up' || _this.options.direction === 'down' ? '0% ' + per + '%' : per + '% 0%'
                    });
                };
                TweenMax.to(timer, _this.options.duration, {
                    width: 100,
                    ease: _this.options.ease,
                    onUpdate: update,
                    onComplete: complete
                });
            },
            compatibilityCheck: function () {
                return fx.HC.browser.supportsCSSProperty('MaskImage');
            }
        }, opts), completed);
    };
    fx.HC.transitions.SwipeRight = function (that, opts, completed) {
        return new fx.HC.transitions.SwipeLeft(that, $.extend({
            direction: 'right',
        }, opts), completed);
    };
    fx.HC.transitions.SwipeUp = function (that, opts, completed) {
        return new fx.HC.transitions.SwipeLeft(that, $.extend({
            direction: 'up',
        }, opts), completed);
    };
    fx.HC.transitions.SwipeDown = function (that, opts, completed) {
        return new fx.HC.transitions.SwipeLeft(that, $.extend({
            direction: 'down',
        }, opts), completed);
    };
})(window.jQuery);

//=======================================================[ Zip Effects ]========================================================//
(function ($) {
    fx.HC.transitions.ZipLeft = function (that, opts, completed) {
        var //that = this,
        $children = that.$container.children(),
        $outgoing = $children.eq(opts.outgoing_slide),
        $target = $children.eq(opts.upcoming_slide);
        return new fx.HC.transition_base(that, $.extend({
            forceSquare: false,
            columns: 16,
            rows: 1,
            delayBetweenBarsX: 0.06,
            delayBetweenBarsY: 0.06,
            duration: 0.8,
            axis: 'y',
            ease: Linear.easeIn,
            calcDelay: function (rowIndex, colIndex) { return colIndex * this.options.delayBetweenBarsX + rowIndex * this.options.delayBetweenBarsY; },
            renderTile: function (elem, colIndex, rowIndex, colWidth, rowHeight, leftOffset, topOffset) {
                var targetImage = $outgoing.children('img').first();
                $(elem).css({
                    'background-size': 'cover',
                    'background-image': 'url("' + targetImage.attr('src') + '")',
                    'background-position': '-' + leftOffset + 'px -' + topOffset + 'px'
                });
            },
            execute: function () {
                var _this = this;
                var bars = $outgoing.find('div.tile');
                var count = 0;
                var complete = function () {
                    count++;
                    if (count >= bars.length) {
                        $target.show(0);
                        bars.empty().remove();
                        _this.finished();
                        $outgoing.css({ 
                            zIndex: 0, 
                            display: 'none'
                        })
                        $outgoing.children().show();
                    }
                };
                var height = $outgoing.height();
                var width = $outgoing.width();
                bars.each(function (index, bar) {
                    var rowIndex = index % _this.options.rows;              // In the base transition, web loop in rows
                    var colIndex = (index - rowIndex) / _this.options.rows; // first => calc from rows
                    var wait = _this.options.calcDelay.call(_this, colIndex, rowIndex);
                    if (_this.options.axis === 'y')
                        TweenMax.to(bar, _this.options.duration, {
                            delay: wait,
                            y: (index % 2 == 0 ? "+=" : "-=") + height,
                            autoAlpha: 0,
                            ease: _this.options.ease,
                            onComplete: complete
                        });
                    else
                        TweenMax.to(bar, _this.options.duration, {
                            delay: wait,
                            x: (index % 2 == 0 ? "+=" : "-=") + width,
                            autoAlpha: 0,
                            ease: _this.options.ease,
                            onComplete: complete
                        });
                });
            }
        }, opts), completed);
    };
    fx.HC.transitions.ZipRight = function (that, opts, completed) {
        return new fx.HC.transitions.ZipLeft(that, $.extend({
            calcDelay: function (rowIndex, colIndex) { return (this.options.columns - colIndex) * this.options.delayBetweenBarsX + (this.options.rows - rowIndex) * this.options.delayBetweenBarsY; },
        }, opts), completed);
    };
    fx.HC.transitions.ZipTop = function (that, opts, completed) {
        return new fx.HC.transitions.ZipLeft(that, $.extend({
            columns: 1,
            rows: 14,
            axis: 'x'
        }, opts), completed);
    };
    fx.HC.transitions.ZipBot = function (that, opts, completed) {
        return new fx.HC.transitions.ZipRight(that, $.extend({
            columns: 1,
            rows: 14,
            axis: 'x'
        }, opts), completed);
    };
    fx.HC.transitions.ZipMidV = function (that, opts, completed) {
        return new fx.HC.transitions.ZipLeft(that, $.extend({
            delayBetweenBarsX: 0.12,
            delayBetweenBarsY: 0.12,
            calcDelay: function (colIndex, rowIndex) {
                var midCol = (this.options.columns - 1) / 2;
                var midRow = (this.options.rows - 1) / 2;
                return Math.abs(midCol - colIndex) * this.options.delayBetweenBarsX + Math.abs(midRow - rowIndex) * this.options.delayBetweenBarsY;
            },
        }, opts), completed);
    };
    fx.HC.transitions.ZipMidH = function (that, opts, completed) {
        return new fx.HC.transitions.ZipMidV(that, $.extend({
            columns: 1,
            rows: 14,
            axis: 'x',
        }, opts), completed);
    };
})(window.jQuery);