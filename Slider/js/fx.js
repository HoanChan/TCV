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
        that.resize(); // Cập nhật lại slide để hiển thị nội dung, không có cái này nó trắng bóc
        this.children = that.$container.children(),
        this.outgoing = this.children.eq(opts.outgoing_slide),
        this.target = this.children.eq(opts.upcoming_slide);
        this.currentImage = (this.options.effectMode === 'out' ? this.outgoing : this.target).children('img').first();
        this.inImage = this.target.children('img').first();
        this.outImage = this.outgoing.children('img').first();

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
            this.slider.$container.css('overflow', this.options.requires3d ? 'visible' : 'hidden');
            this.outgoing.css({ 
                zIndex: this.options.effectMode === 'out' ? 2 : 0, 
                display: 'block'
            }); 
            this.target.css({
                zIndex: this.options.effectMode === 'in' ? 2 : 0,
                opacity: 1,
                display: 'block'
            });
            this.target.css({
              left: this.outgoing.css("left")
            });
            if (this.options.effectMode === 'in') this.target.children().hide();
            if (this.options.requires3d === true) {
                this.outgoing.children().hide();
                this.target.children().hide();
            }
            if (this.options.setup !== undefined) this.options.setup.call(this);
            if (this.options.execute !== undefined) this.options.execute.call(this);
        },
        finished: function () {
            if (this.hasFinished) return;
            this.hasFinished = true;
            // this.slider.setupImages();
            this.target.css({ zIndex: 0 });
            this.outgoing.css({
                opacity: 1,
                display: 'none',
                zIndex: 0
            });
            this.outgoing.children().show(); // hiện lại khi đã ẩn ở settup
            this.target.children().show(); // hiện lại khi đã ẩn ở settup
            if (this.options.after) this.options.after.call(this);
        },
        fallbackSetup: function () {

        },
        fallbackExecute: function () {
            this.finished();
        }
    };
    
    fx.HC.transitions = {}; // danh sách các hiệu ứng
//=============================================================//
    fx.HC.transition_base = function (that, opts, completed) {
        return new fx.HC.transition(that, $.extend({
            columns: 16,
            rows: 9,
            forceSquare: false, // chia thành các ô vuông
            perspective: "100vw", // góc nhìn ở chế độ 3D bằng 100% chiều rộng màn hình
            customSetup: function(){},
            setup: function () {
                this.outgoing.css3({
                    'perspective': this.options.perspective,
                    'perspective-origin': '50% 50%'
                });
                this.target.css3({
                    'perspective': this.options.perspective,
                    'perspective-origin': '50% 50%'
                });
                var imgWidth = this.outgoing.width(),
                    imgHeight = this.outgoing.height();

                var colWidth = imgWidth / this.options.columns,
                    rowHeight = imgHeight / this.options.rows;

                // if (this.options.forceSquare) {
                //     this.options.rows = Math.floor(imgHeight / colWidth);
                //     rowHeight = imgHeight / this.options.rows;
                // }
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
                        var imgLeft = (parseInt(this.currentImage.css("left"), 10) || 0);
                        var imgTop = (parseInt(this.currentImage.css("top"), 10) || 0);
                        var imgWidth = (parseInt(this.currentImage.css("width"), 10) || 0);
                        var imgHeight = (parseInt(this.currentImage.css("height"), 10) || 0);
                        tile.css({
                            'background-size': imgWidth +'px ' + imgHeight + 'px'
                        });
                        this.options.renderTile.call(this, tile, i, j, thisColWidth, thisRowHeight, totalLeft - imgLeft, totalTop - imgTop);
                        fragment.appendChild(tile.get(0));
                    }
                }

                // Append the fragement to the surface
                if (this.options.effectMode === 'out') {
                    this.outgoing.get(0).appendChild(fragment);
                    this.outgoing.children().not($('.tile')).hide();
                }
                else {
                    this.target.get(0).appendChild(fragment);
                    this.target.children().not($('.tile')).hide();
                }
            },
            execute: function () {

            },
            renderTile: function (elem, colIndex, rowIndex, colWidth, rowHeight, leftOffset, topOffset) {

            }
        }, opts), completed);
    };
})(window.jQuery);
//=================[ Tiles 3D Effects ]=================//
(function ($) {
    fx.HC.transitions.Tiles3DLeftTopLeft = function (that, opts, completed) {
        return new fx.HC.transition_base(that, $.extend({
            requires3d: true,
            forceSquare: true,
            columns: 5, // bug with 7 and 9 >"<
            rows: 3,
            disperseFactor: 10,
            scaleFactor: 0.8,
            duration: 1.5,
            delayBetweenBarsX: 0.2,
            delayBetweenBarsY: 0.15,
            thickness: 15,
            nextImgPos: 'back left',//'back left' 'back right' 'back top' 'back bot' 'left' 'right' 'top' 'bot' 'top bot' 'left right'
            ease: Back.easeInOut,
            renderTile: function (elem, colIndex, rowIndex, colWidth, rowHeight, leftOffset, topOffset) {
                var arrPos = this.options.nextImgPos.split(' ');
                if ($.inArray('back', arrPos) < 0) {
                    if ($.inArray('left', arrPos) >= 0 ||
                        $.inArray('right', arrPos) >= 0) this.options.thickness = colWidth;
                    if ($.inArray('top', arrPos) >= 0 ||
                        $.inArray('bot', arrPos) >= 0) this.options.thickness = rowHeight;
                }

                var haveImage = {
                    'background-size': $(elem).css('background-size'),
                    'background-image': 'url("' + this.inImage.attr('src') + '")',
                    'background-position': '-' + leftOffset + 'px -' + topOffset + 'px',
                    'background-repeat': 'no-repeat',
                    'z-index': 200
                };

                var haveNoImage = {
                    'background-image': '',
                    background: '#222',
                    'z-index': 190
                }

                var front = $('<div/>').css({
                    width: colWidth + 'px',
                    height: rowHeight + 'px',
                    position: 'absolute',
                    top: '0px',
                    left: '0px',
                    'z-index': 200,
                    'background-size': $(elem).css('background-size'),
                    'background-image': 'url("' + this.outImage.attr('src') + '")',
                    'background-position': '-' + leftOffset + 'px -' + topOffset + 'px',
                    'background-repeat': 'no-repeat',
                }).css3({
                    'transform': fx.HC.browser.translateZ(this.options.thickness / 2),
                    'backface-visibility': 'hidden'
                });

                var bonus = $.inArray('up', arrPos) >= 0 ||
                            $.inArray('down', arrPos) >= 0 ?
                            ' ' + fx.HC.browser.rotateZ(180) + ' ' : ' ';
                var back = $(front.get(0).cloneNode(false)).css3({
                    'transform': fx.HC.browser.rotateY(180) + bonus + fx.HC.browser.translateZ(this.options.thickness / 2),
                });

                var top = $('<div/>').css({
                    width: colWidth + 'px',
                    height: this.options.thickness + 'px',
                    position: 'absolute',
                    top: -this.options.thickness / 2 + 'px',
                    left: '0px',
                }).css3({
                    'transform': fx.HC.browser.rotateX(90),
                    'backface-visibility': 'hidden'
                });

                var bot = $(top.get(0).cloneNode(false)).css({
                    top: rowHeight - this.options.thickness / 2 - 1 + 'px'
                }).css3({
                    'transform': fx.HC.browser.rotateX(-90)
                });
                var left = $(top.get(0).cloneNode(false)).css({
                    width: this.options.thickness + 'px',
                    height: rowHeight + 'px',
                    top: '0px',
                    left: -this.options.thickness / 2 + 'px',
                }).css3({
                    'transform': fx.HC.browser.rotateY(-90)
                });

                var right = $(left.get(0).cloneNode(false)).css({
                    left: colWidth - this.options.thickness / 2 - 1 + 'px'
                }).css3({
                    'transform': fx.HC.browser.rotateY(90)
                });

                if ($.inArray('back', arrPos) >= 0) back.css(haveImage); else back.css(haveNoImage);
                if ($.inArray('top', arrPos) >= 0) top.css(haveImage); else top.css(haveNoImage);
                if ($.inArray('bot', arrPos) >= 0) bot.css(haveImage); else bot.css(haveNoImage);
                if ($.inArray('back', arrPos) < 0 && $.inArray('left', arrPos) >= 0) left.css(haveImage); else left.css(haveNoImage);
                if ($.inArray('back', arrPos) < 0 && $.inArray('right', arrPos) >= 0) right.css(haveImage); else right.css(haveNoImage);

                $(elem).css({
                    'z-index': (colIndex > this.options.columns / 2 ? 500 - colIndex : 500) + (rowIndex > this.options.rows / 2 ? 500 - rowIndex : 500) // Fix for Chrome to ensure that the z-index layering is correct!
                }).css3({
                    'transform-style': 'preserve-3d',
                    'transform': fx.HC.browser.translateZ(-this.options.thickness / 2),
                }).append(front).append(back).append(left).append(right).append(top).append(bot);
            },
            calcDelay: function (colIndex, rowIndex) {
                return colIndex * this.options.delayBetweenBarsX + rowIndex * this.options.delayBetweenBarsY;
            },
            calcRotation: function (index) {
                return 1;
            },
            bonusFx: function (rotatefunc, tile, index, mid, arrPos) {
                var move = this.options.disperseFactor * (index - mid);
                if ($.inArray('back', arrPos) < 0) { // no bonus if this is title mode
                    if (rotatefunc === 'rotationY') {
                        TweenMax.to(tile, this.options.duration / 2, { top: '+=' + move, ease: Linear.easeNone })
                        TweenMax.to(tile, this.options.duration / 2, { delay: this.options.duration / 2, top: '-=' + move, ease: Linear.easeNone });
                    }
                    else {
                        TweenMax.to(tile, this.options.duration / 2, { left: '+=' + move, ease: Linear.easeNone })
                        TweenMax.to(tile, this.options.duration / 2, { delay: this.options.duration / 2, left: '-=' + move, ease: Linear.easeNone });
                    }

                    TweenMax.to(tile, this.options.duration / 2, { scale: this.options.scaleFactor, ease: Linear.easeNone })
                    TweenMax.to(tile, this.options.duration / 2, { delay: this.options.duration / 2, scale: 1, ease: Linear.easeNone }); 
                }
            },
            mainFx: function (wait, tile, index, rotatefunc, rotateDeg, mid, arrPos, complete) {
                var _this = this;
                TweenMax.delayedCall(wait, function () {
                    if (rotatefunc === 'rotationY')
                        TweenMax.to(tile, _this.options.duration, {
                            rotationY: _this.options.calcRotation.call(_this, index) * rotateDeg,
                            z: -_this.options.thickness / 2,
                            transformOrigin: "50% 50%",
                            transformStyle: "preserve-3d",
                            ease: _this.options.ease,
                            onComplete: complete
                        });
                    else
                        TweenMax.to(tile, _this.options.duration, {
                            rotationX: _this.options.calcRotation.call(_this, index) * rotateDeg,
                            z: -_this.options.thickness / 2,
                            transformOrigin: "50% 50%",
                            transformStyle: "preserve-3d",
                            ease: _this.options.ease,
                            onComplete: complete
                        });
                    _this.options.bonusFx.call(_this, rotatefunc, tile, index, mid, arrPos);
                });
            },
            execute: function () {
                var _this = this;
                var arrPos = this.options.nextImgPos.split(' ');
                var tiles = (this.options.effectMode === 'out' ? this.outgoing : this.target).find('div.tile');

                //this.slider.image2.hide();

                var count = 0;
                var complete = function () {
                    count++;
                    if (count >= tiles.length) {
                        //_this.slider.image2.show(0);
                        tiles.empty().remove();
                        _this.finished();
                    }
                }

                var rotateDeg = 180;
                var rotatefunc = 'rotationY';
                if ($.inArray('back', arrPos) >= 0) {
                    if ($.inArray('left', arrPos) >= 0) { rotateDeg = 180; rotatefunc = 'rotationY'; }
                    if ($.inArray('right', arrPos) >= 0) { rotateDeg = -180; rotatefunc = 'rotationY'; }
                    if ($.inArray('up', arrPos) >= 0) { rotateDeg = 180; rotatefunc = 'rotationX'; }
                    if ($.inArray('down', arrPos) >= 0) { rotateDeg = -180; rotatefunc = 'rotationX'; }
                }
                else {
                    if (this.options.nextImgPos === 'top') { rotateDeg = -90; rotatefunc = 'rotationX'; }
                    if (this.options.nextImgPos === 'bot') { rotateDeg = 90; rotatefunc = 'rotationX'; }
                    if (this.options.nextImgPos === 'left') { rotateDeg = 90; rotatefunc = 'rotationY'; }
                    if (this.options.nextImgPos === 'right') { rotateDeg = -90; rotatefunc = 'rotationY'; }

                    if ($.inArray('top', arrPos) >= 0 &&
                        $.inArray('bot', arrPos) >= 0) { rotateDeg = 90; rotatefunc = 'rotationX'; }
                    if ($.inArray('left', arrPos) >= 0 &&
                        $.inArray('right', arrPos) >= 0) { rotateDeg = 90; rotatefunc = 'rotationY'; }
                }
                var mid = (tiles.length - 1) / 2;

                tiles.each(function (index, tile) {
                    var rowIndex = index % _this.options.rows;              // In the base transition, web loop in rows
                    var colIndex = (index - rowIndex) / _this.options.rows; // first => calc from rows
                    var wait = _this.options.calcDelay.call(_this, colIndex, rowIndex);
                    _this.options.mainFx.call(_this, wait, tile, index, rotatefunc, rotateDeg, mid, arrPos, complete);
                });
            },
        }, opts), completed);
    };
    fx.HC.transitions.Tiles3DLeftBotRight = function (that, opts, completed) {
        return new fx.HC.transitions.Tiles3DLeftTopLeft(that, $.extend({
            calcDelay: function (colIndex, rowIndex) {
                return (this.options.columns - colIndex) * this.options.delayBetweenBarsX + (this.options.rows - rowIndex) * this.options.delayBetweenBarsY;
            },
        }, opts), completed);
    };
    fx.HC.transitions.Tiles3DLeftMidMid = function (that, opts, completed) {
        return new fx.HC.transitions.Tiles3DLeftTopLeft(that, $.extend({
            duration: 3,
            delayBetweenBarsX: 0.4,
            delayBetweenBarsY: 0.25,
            calcDelay: function (colIndex, rowIndex) {
                var midCol = (this.options.columns - 1) / 2;
                var midRow = (this.options.rows - 1) / 2;
                return Math.abs(midCol - colIndex) * this.options.delayBetweenBarsX + Math.abs(midRow - rowIndex) * this.options.delayBetweenBarsY;
            },
        }, opts), completed);
    };

    fx.HC.transitions.Tiles3DRightTopLeft = function (that, opts, completed) {
        return new fx.HC.transitions.Tiles3DLeftTopLeft(that, $.extend({
            nextImgPos: 'back right',
        }, opts), completed);
    };
    fx.HC.transitions.Tiles3DRightBotRight = function (that, opts, completed) {
        return new fx.HC.transitions.Tiles3DLeftBotRight(that, $.extend({
            nextImgPos: 'back right',
        }, opts), completed);
    };
    fx.HC.transitions.Tiles3DRightMidMid = function (that, opts, completed) {
        return new fx.HC.transitions.Tiles3DLeftMidMid(that, $.extend({
            nextImgPos: 'back right',
        }, opts), completed);
    };

    fx.HC.transitions.Tiles3DUpTopLeft = function (that, opts, completed) {
        return new fx.HC.transitions.Tiles3DLeftTopLeft(that, $.extend({
            nextImgPos: 'back up',
        }, opts), completed);
    };
    fx.HC.transitions.Tiles3DUpBotRight = function (that, opts, completed) {
        return new fx.HC.transitions.Tiles3DLeftBotRight(that, $.extend({
            nextImgPos: 'back up',
        }, opts), completed);
    };
    fx.HC.transitions.Tiles3DUpMidMid = function (that, opts, completed) {
        return new fx.HC.transitions.Tiles3DLeftMidMid(that, $.extend({
            nextImgPos: 'back up',
        }, opts), completed);
    };

    fx.HC.transitions.Tiles3DDownTopLeft = function (that, opts, completed) {
        return new fx.HC.transitions.Tiles3DLeftTopLeft(that, $.extend({
            nextImgPos: 'back down',
        }, opts), completed);
    };
    fx.HC.transitions.Tiles3DDownBotRight = function (that, opts, completed) {
        return new fx.HC.transitions.Tiles3DLeftBotRight(that, $.extend({
            nextImgPos: 'back down',
        }, opts), completed);
    };
    fx.HC.transitions.Tiles3DDownMidMid = function (that, opts, completed) {
        return new fx.HC.transitions.Tiles3DLeftMidMid(that, $.extend({
            nextImgPos: 'back down',
        }, opts), completed);
    };
})(window.jQuery);
//=================[ Bars 3D Effects ]=================//
(function ($) {
    fx.HC.transitions.Bars3DLeftTop = function (that, opts, completed) {
        return new fx.HC.transitions.Tiles3DLeftTopLeft(that, $.extend({
            forceSquare: false,
            columns: 1,
            rows: 7,
            duration: 2,
            delayBetweenBarsX: 0.22,
            delayBetweenBarsY: 0.22,
            nextImgPos: 'left',
        }, opts), completed);
    };
    fx.HC.transitions.Bars3DLeftBot = function (that, opts, completed) {
        return new fx.HC.transitions.Tiles3DLeftBotRight(that, $.extend({
            forceSquare: false,
            columns: 1,
            rows: 7,
            duration: 2,
            delayBetweenBarsX: 0.22,
            delayBetweenBarsY: 0.22,
            nextImgPos: 'left',
        }, opts), completed);
    };
    fx.HC.transitions.Bars3DLeftMid = function (that, opts, completed) {
        return new fx.HC.transitions.Tiles3DLeftMidMid(that, $.extend({
            forceSquare: false,
            columns: 1,
            rows: 7,
            duration: 2,
            delayBetweenBarsX: 0.22,
            delayBetweenBarsY: 0.22,
            nextImgPos: 'left',
        }, opts), completed);
    };

    fx.HC.transitions.Bars3DRightTop = function (that, opts, completed) {
        return new fx.HC.transitions.Bars3DLeftTop(that, $.extend({
            nextImgPos: 'right',
        }, opts), completed);
    };
    fx.HC.transitions.Bars3DRightBot = function (that, opts, completed) {
        return new fx.HC.transitions.Bars3DLeftBot(that, $.extend({
            nextImgPos: 'right',
        }, opts), completed);
    };
    fx.HC.transitions.Bars3DRightMid = function (that, opts, completed) {
        return new fx.HC.transitions.Bars3DLeftMid(that, $.extend({
            nextImgPos: 'right',
        }, opts), completed);
    };

    fx.HC.transitions.Bars3DUpLeft = function (that, opts, completed) {
        return new fx.HC.transitions.Bars3DLeftTop(that, $.extend({
            columns: 9,
            rows: 1,
            nextImgPos: 'bot',
        }, opts), completed);
    };
    fx.HC.transitions.Bars3DUpRight = function (that, opts, completed) {
        return new fx.HC.transitions.Bars3DLeftBot(that, $.extend({
            columns: 9,
            rows: 1,
            nextImgPos: 'bot',
        }, opts), completed);
    };
    fx.HC.transitions.Bars3DUpMid = function (that, opts, completed) {
        return new fx.HC.transitions.Bars3DLeftMid(that, $.extend({
            columns: 9,
            rows: 1,
            nextImgPos: 'bot',
        }, opts), completed);
    };

    fx.HC.transitions.Bars3DDownLeft = function (that, opts, completed) {
        return new fx.HC.transitions.Bars3DUpLeft(that, $.extend({
            nextImgPos: 'top',
        }, opts), completed);
    };
    fx.HC.transitions.Bars3DDownRight = function (that, opts, completed) {
        return new fx.HC.transitions.Bars3DUpRight(that, $.extend({
            nextImgPos: 'top',
        }, opts), completed);
    };
    fx.HC.transitions.Bars3DDownMid = function (that, opts, completed) {
        return new fx.HC.transitions.Bars3DUpMid(that, $.extend({
            nextImgPos: 'top',
        }, opts), completed);
    };

    fx.HC.transitions.Bars3DMixHLeft = function (that, opts, completed) {
        return new fx.HC.transitions.Bars3DUpLeft(that, $.extend({
            nextImgPos: 'top bot',
            calcRotation: function (index) {
                return index % 2 == 0 ? 1 : -1;
            }
        }, opts), completed);
    };
    fx.HC.transitions.Bars3DMixHRight = function (that, opts, completed) {
        return new fx.HC.transitions.Bars3DUpRight(that, $.extend({
            nextImgPos: 'top bot',
            calcRotation: function (index) {
                return index % 2 == 0 ? 1 : -1;
            }
        }, opts), completed);
    };
    fx.HC.transitions.Bars3DMixHMid = function (that, opts, completed) {
        return new fx.HC.transitions.Bars3DUpMid(that, $.extend({
            nextImgPos: 'top bot',
            calcRotation: function (index) {
                return index % 2 == 0 ? 1 : -1;
            }
        }, opts), completed);
    };

    fx.HC.transitions.Bars3DMixVUp = function (that, opts, completed) {
        return new fx.HC.transitions.Bars3DMixHLeft(that, $.extend({
            columns: 1,
            rows: 7,
            nextImgPos: 'left right',
        }, opts), completed);
    };
    fx.HC.transitions.Bars3DMixVDown = function (that, opts, completed) {
        return new fx.HC.transitions.Bars3DMixHRight(that, $.extend({
            columns: 1,
            rows: 7,
            nextImgPos: 'left right',
        }, opts), completed);
    };
    fx.HC.transitions.Bars3DMixVMid = function (that, opts, completed) {
        return new fx.HC.transitions.Bars3DMixHMid(that, $.extend({
            columns: 1,
            rows: 7,
            nextImgPos: 'left right',
        }, opts), completed);
    };
    //=======================================================[ Cube Effects ]========================================================//
    fx.HC.transitions.CubeUp = function (that, opts, completed) {
        return new fx.HC.transitions.Bars3DUpLeft(that, $.extend({
            columns: 1,
            rows: 1,
            scaleFactor: 0.9,
        }, opts), completed);
    };
    fx.HC.transitions.CubeDown = function (that, opts, completed) {
        return new fx.HC.transitions.CubeUp(that, $.extend({
            nextImgPos: 'top',
        }, opts), completed);
    };
    fx.HC.transitions.CubeLeft = function (that, opts, completed) {
        return new fx.HC.transitions.CubeUp(that, $.extend({
            nextImgPos: 'right',
        }, opts), completed);
    };
    fx.HC.transitions.CubeRight = function (that, opts, completed) {
        return new fx.HC.transitions.CubeUp(that, $.extend({
            nextImgPos: 'left',
        }, opts), completed);
    };
})(window.jQuery);
//=================[ Blinds 3D Effects ]=================//
(function ($) {
    fx.HC.transitions.Blinds3DLeftLeft = function (that, opts, completed) {
        return new fx.HC.transitions.Tiles3DLeftTopLeft(that, $.extend({
            forceSquare: false,
            columns: 9,
            rows: 1,
            duration: 2,
            delayBetweenBarsX: 0.22,
            delayBetweenBarsY: 0.22,
        }, opts), completed);
    };
    fx.HC.transitions.Blinds3DLeftRight = function (that, opts, completed) {
        return new fx.HC.transitions.Tiles3DLeftBotRight(that, $.extend({
            forceSquare: false,
            columns: 9,
            rows: 1,
            duration: 2,
            delayBetweenBarsX: 0.22,
            delayBetweenBarsY: 0.22,
        }, opts), completed);
    };
    fx.HC.transitions.Blinds3DLeftMid = function (that, opts, completed) {
        return new fx.HC.transitions.Tiles3DLeftMidMid(that, $.extend({
            forceSquare: false,
            columns: 9,
            rows: 1,
            duration: 2,
            delayBetweenBarsX: 0.22,
            delayBetweenBarsY: 0.22,
        }, opts), completed);
    };

    fx.HC.transitions.Blinds3DRightLeft = function (that, opts, completed) {
        return new fx.HC.transitions.Blinds3DLeftLeft(that, $.extend({
            nextImgPos: 'back right'
        }, opts), completed);
    };
    fx.HC.transitions.Blinds3DRightRight = function (that, opts, completed) {
        return new fx.HC.transitions.Blinds3DLeftRight(that, $.extend({
            nextImgPos: 'back right'
        }, opts), completed);
    };
    fx.HC.transitions.Blinds3DRightMid = function (that, opts, completed) {
        return new fx.HC.transitions.Blinds3DLeftMid(that, $.extend({
            nextImgPos: 'back right'
        }, opts), completed);
    };

    fx.HC.transitions.Blinds3DUpTop = function (that, opts, completed) {
        return new fx.HC.transitions.Blinds3DLeftLeft(that, $.extend({
            columns: 1,
            rows: 7,
            nextImgPos: 'back up'
        }, opts), completed);
    };
    fx.HC.transitions.Blinds3DUpBot = function (that, opts, completed) {
        return new fx.HC.transitions.Blinds3DLeftRight(that, $.extend({
            columns: 1,
            rows: 7,
            nextImgPos: 'back up'
        }, opts), completed);
    };
    fx.HC.transitions.Blinds3DUpMid = function (that, opts, completed) {
        return new fx.HC.transitions.Blinds3DLeftMid(that, $.extend({
            columns: 1,
            rows: 7,
            nextImgPos: 'back up'
        }, opts), completed);
    };

    fx.HC.transitions.Blinds3DDownTop = function (that, opts, completed) {
        return new fx.HC.transitions.Blinds3DUpTop(that, $.extend({
            nextImgPos: 'back down'
        }, opts), completed);
    };
    fx.HC.transitions.Blinds3DDownBot = function (that, opts, completed) {
        return new fx.HC.transitions.Blinds3DUpBot(that, $.extend({
            nextImgPos: 'back down'
        }, opts), completed);
    };
    fx.HC.transitions.Blinds3DDownMid = function (that, opts, completed) {
        return new fx.HC.transitions.Blinds3DUpMid(that, $.extend({
            nextImgPos: 'back down'
        }, opts), completed);
    };
})(window.jQuery);
//=================[ Book 3D Effects ]=================//
(function ($) {
    fx.HC.transitions.BookLeft = function (that, opts, completed) {
        return new fx.HC.transition(that, $.extend({
            requires3d: true,
            perspective: "200vw",// góc nhìn ở chế độ 3D bằng 200% chiều rộng màn hình
            duration: 2,
            direction: 'left',
            ease: Cubic.easeInOut,
            setup: function () {
                var imgWidth = (parseInt(this.currentImage.css("width"), 10) || 0);
                var imgHeight = (parseInt(this.currentImage.css("height"), 10) || 0);
                var tab = $('<div id="tab"></div>').css({
                    width: '50%',
                    height: '100%',
                    position: 'absolute',
                    top: '0px',
                    left: this.options.direction == 'left' ? '50%' : '0%',
                    'z-index': 101
                }).css3({
                    'perspective': this.options.perspective,
                    'perspective-origin': '50% 50%',
                    'transform-style': 'preserve-3d',
                }),

                front = $('<div/>').appendTo(tab).css({
                    'background-size': imgWidth +'px ' + imgHeight + 'px',
                    'background-image': 'url("' + this.outImage.attr('src') + '")',
                    'background-position': (this.options.direction == 'left' ? '-' + (this.slider.$container.width() / 2) : 0) + 'px 0',
                    width: '100%',
                    height: '100%',
                    position: 'absolute',
                    top: '0',
                    left: '0',
                }).css3({
                    'backface-visibility': 'hidden'
                }),

                back = $('<div/>').appendTo(tab).css({
                    'background-size': imgWidth +'px ' + imgHeight + 'px',
                    'background-image': 'url("' + this.inImage.attr('src') + '")',
                    'background-position': (this.options.direction == 'left' ? 0 : '-' + (this.slider.$container.width() / 2)) + 'px 0',
                    width: '100%',
                    height: '100%',
                    position: 'absolute',
                    top: '0',
                    left: '0'
                }).css3({
                    transform: fx.HC.browser.rotateY(180),
                    'backface-visibility': 'hidden'
                }),

                current = $('<div></div>').css({
                    position: 'absolute',
                    top: '0',
                    left: this.options.direction == 'left' ? '0' : '50%',
                    width: '50%',
                    height: '100%',
                    'background-size': imgWidth +'px ' + imgHeight + 'px',
                    'background-image': 'url("' + this.outImage.attr('src') + '")',
                    'background-position': (this.options.direction == 'left' ? 0 : '-' + (this.slider.$container.width() / 2)) + 'px 0',
                    'z-index': 100
                });
                this.outgoing.children().hide();
                this.target.children().show();
                this.outgoing.css3({
                    'perspective': '',
                    'perspective-origin': ''
                }).append(tab).append(current);
            },
            execute: function () {
                var _this = this;
                var tab = _this.outgoing.find('div#tab');
                var complete = function () {
                    _this.target.show(0);
                    tab.empty().remove();
                    _this.finished();
                }
                TweenMax.to(tab, _this.options.duration, {
                    rotationY: _this.options.direction == 'left' ? -179 : 179,
                    transformOrigin: _this.options.direction + ' center',
                    ease: _this.options.ease,
                    onComplete: complete
                });
            }
        }, opts), completed);
    };
    fx.HC.transitions.BookRight = function (that, opts, completed) {
        return new fx.HC.transitions.BookLeft(that, $.extend({
            direction: 'right',
        }, opts), completed);
    };
})(window.jQuery);
//=================[ Concentric Effects ]=================//
(function ($) {
    fx.HC.transitions.Concentric = function (that, opts, completed) {
        return new fx.HC.transition(that, $.extend({
            duration: 2,
            blockSize: 60,
            delay: 0.2,
            ease: Sine.easeOut,
            alternate: false,
            setup: function () {
                var w = this.outgoing.width(),
                    h = this.outgoing.height(),
                    largestLength = Math.sqrt(w * w + h * h), // Largest length is the diagonal

                    // How many blocks do we need?
                    blockCount = Math.ceil(((largestLength - this.options.blockSize) / 2) / this.options.blockSize) + 1, // 1 extra to account for the round border
                    fragment = document.createDocumentFragment();

                var imgWidth = (parseInt(this.currentImage.css("width"), 10) || 0);
                var imgHeight = (parseInt(this.currentImage.css("height"), 10) || 0);
                for (var i = 0; i < blockCount; i++) {
                    var thisBlockSize = (2 * i * this.options.blockSize) + this.options.blockSize;

                    var block = $('<div></div>').attr('class', 'block block-' + i).css({
                        width: thisBlockSize + 'px',
                        height: thisBlockSize + 'px',
                        position: 'absolute',
                        top: ((h - thisBlockSize) / 2) + 'px',
                        left: ((w - thisBlockSize) / 2) + 'px',
                        'z-index': 100 + (blockCount - i),
                        'background-size': imgWidth +'px ' + imgHeight + 'px',
                        'background-image': 'url("' + this.currentImage.attr('src') + '")',
                        'background-position': 'center center'
                    }).css3({
                        'border-radius': thisBlockSize + 'px',
                    });

                    fragment.appendChild(block.get(0));
                }
                this.outgoing.children().hide();
                this.outgoing.get(0).appendChild(fragment);
            },
            execute: function () {
                var _this = this;

                var blocks = this.outgoing.find('div.block');
                var count = 0;
                var complete = function () {
                    count++;
                    if (count >= blocks.length) {
                        //_this.slider.image2.show(0);
                        blocks.empty().remove();
                        _this.finished();
                    }
                }
                blocks.each(function (index, block) {
                    TweenMax.to(block, _this.options.duration, {
                        delay: ((blocks.length - index - 1) * _this.options.delay),
                        rotationZ: (!_this.options.alternate || index % 2 ? '' : '-') + '180',
                        autoAlpha: 0,
                        ease: _this.options.ease,
                        onComplete: complete
                    });
                });
            }
        }, opts), completed);
    };
    fx.HC.transitions.Concentric2 = function (that, opts, completed) {
        return new fx.HC.transitions.Concentric(that, $.extend({
            alternate: true,
        }, opts), completed);
    };
})(window.jQuery);
//=================[ Swipe Effects ]=================//
(function ($) {
    fx.HC.transitions.SwipeLeft = function (that, opts, completed) {
        return new fx.HC.transition(that, $.extend({
            duration: 2,
            ease: Sine.easeOut,
            direction: 'left',
            size: 140,
            setup: function () {
                var sizePer = 100 * (this.options.size / this.slider.image1.width() / 3) / 2;
                var rec = this.options.direction === 'right' || this.options.direction === 'down';
                var rec1 = rec ? 0 : 1;
                var rec2 = rec ? 1 : 0;
                var dir = this.options.direction === 'up' || this.options.direction === 'down' ? 'top' : 'left';
                var mask = $('<div id="mask"/>').css({
                    width: '100%',
                    height: '100%',
                    'background-image': this.slider.image1.css('background-image'),
                    'background-position': 'center center'
                }).css3({
                    'mask-image': '-webkit-linear-gradient(' + dir + ', rgba(0,0,0,' + rec1 + ') 0%, rgba(0,0,0,' + rec1 + ') ' + (50 - sizePer) + '%, rgba(0,0,0,' + rec2 + ') ' + (50 + sizePer) + '%, rgba(0,0,0,' + rec2 + ') 100%)',
                    'mask-size': '300%'
                });
                var timer = $('<div id="timer"/>').css({ width: '0px' });
                this.slider.image1.append(mask).append(timer);
            },
            execute: function () {
                var _this = this,
                    mask = this.slider.image1.find('div#mask'),
                    timer = this.slider.image1.find('div#timer');
                var complete = function () {
                    _this.slider.image2.show(0);
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
//=================[ Dissolve Effects ]=================//
(function ($) {
    fx.HC.transitions.Dissolve = function (that, opts, completed) {
        return new fx.HC.transition(that, $.extend({
            duration: 2,
            ease: Quart.easeIn,
            setup: function () {
                // this.target.css({
                //   left: this.outgoing.css("left")
                // });      
            },
            execute: function () {
                var _this = this;
                var complete = function() {
                    _this.finished();
                };
                TweenMax.to(this.target, _this.options.duration, {
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
        return new fx.HC.transition(that, $.extend({
            duration: 2,
            ease: Sine.easeOut,
            direction: 'left',
            size: 140,
            setup: function () {
                var sizePer = 100 * (this.options.size / this.outgoing.width() / 3) / 2;
                var rec = this.options.direction === 'right' || this.options.direction === 'down';
                var rec1 = rec ? 0 : 1;
                var rec2 = rec ? 1 : 0;
                var dir = this.options.direction === 'up' || this.options.direction === 'down' ? 'top' : 'left';
                var targetImage = this.outgoing.children('img').first();
                var imgWidth = (parseInt(targetImage.css("width"), 10) || 0);
                var imgHeight = (parseInt(targetImage.css("height"), 10) || 0);
                var mask = $('<div id="mask"/>').css({
                    width: targetImage.width(),
                    height: targetImage.height(),
                    position: 'absolute',
                    left: targetImage.css("left"),
                    top: targetImage.css("top"),
                    'background-size': imgWidth +'px ' + imgHeight + 'px',
                    'background-image': 'url("' + targetImage.attr('src') + '")'
                }).css3({
                    'mask-image': '-webkit-linear-gradient(' + dir + ', rgba(0,0,0,' + rec1 + ') 0%, rgba(0,0,0,' + rec1 + ') ' + (50 - sizePer) + '%, rgba(0,0,0,' + rec2 + ') ' + (50 + sizePer) + '%, rgba(0,0,0,' + rec2 + ') 100%)',
                    'mask-size': '300%'
                });//.attr("style", targetImage.attr("style")).addClass(targetImage.attr("class"));

                var timer = $('<div id="timer"/>').css({ width: '0px' });
                if(this.options.effectMode === 'out'){
                    this.outgoing.append(mask).append(timer);
                    //targetImage.hide();
                    this.outgoing.children().not(mask).hide();
                }
                else{
                    this.target.append(mask).append(timer);
                    //targetImage.hide();
                    this.target.children().not(mask).hide();
                }
            },
            execute: function () {
                var _this = this,
                    mask = this.outgoing.find('div#mask'),
                    timer = this.outgoing.find('div#timer');
                var complete = function () {
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
//=================[ Blocks Effects ]=================//
(function ($) {
    fx.HC.transitions.BlocksRandom = function (that, opts, completed) {
        return new fx.HC.transition_base(that, $.extend({
            forceSquare: true,
            delayBetweenBlocksX: 0.2,
            delayBetweenBlocksY: 0.15,
            duration: 0.4,
            scale: 0.8,
            ease: Linear.easeIn,
            calcDelay: function (rowIndex, colIndex) { return Math.random() * 2 * this.options.duration; },
            renderTile: function (elem, colIndex, rowIndex, colWidth, rowHeight, leftOffset, topOffset) {
                var _this = this;
                $(elem).css({
                    'background-image': 'url("' + _this.currentImage.attr('src') + '")',
                    'background-position': '-' + leftOffset + 'px -' + topOffset + 'px'
                });
            },
            execute: function () {
                var _this = this;
                var blocks = this.outgoing.find('div.tile');
                var count = 0;
                var complete = function () {
                    count++;
                    if (count >= blocks.length) {
                        blocks.empty().remove();
                        _this.finished();
                    }
                };
                blocks.each(function (index, block) {
                    var rowIndex = index % _this.options.rows;              // In the base transition, web loop in rows
                    var colIndex = (index - rowIndex) / _this.options.rows; // first => calc from rows
                    var wait = _this.options.calcDelay.call(_this, colIndex, rowIndex);
                    TweenMax.to(block, _this.options.duration, {
                        delay: wait,
                        scale: _this.options.scale,
                        autoAlpha: 0,
                        ease: _this.options.ease,
                        onComplete: complete
                    });
                });
            }
        }, opts), completed);
    };
    fx.HC.transitions.BlocksTopLeft = function (that, opts, completed) {
        return new fx.HC.transitions.BlocksRandom(that, $.extend({
            calcDelay: function (rowIndex, colIndex) { return colIndex * this.options.delayBetweenBlocksX + rowIndex * this.options.delayBetweenBlocksY; },
        }, opts), completed);
    };
    fx.HC.transitions.BlocksBotRight = function (that, opts, completed) {
        return new fx.HC.transitions.BlocksRandom(that, $.extend({
            calcDelay: function (rowIndex, colIndex) { return (this.options.columns - colIndex) * this.options.delayBetweenBlocksX + (this.options.rows - rowIndex) * this.options.delayBetweenBlocksY; },
        }, opts), completed);
    };
    fx.HC.transitions.BlocksMidMid = function (that, opts, completed) {
        return new fx.HC.transitions.BlocksRandom(that, $.extend({
            calcDelay: function (colIndex, rowIndex) {
                var midCol = (this.options.columns - 1) / 2;
                var midRow = (this.options.rows - 1) / 2;
                return Math.abs(midCol - colIndex) * this.options.delayBetweenBlocksX + Math.abs(midRow - rowIndex) * this.options.delayBetweenBlocksY;
            },
        }, opts), completed);
    };
})(window.jQuery);
//=================[ Zip Effects ]=================//
(function ($) {
    fx.HC.transitions.ZipLeft = function (that, opts, completed) {
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
                var _this = this;
                $(elem).css({
                    //'background-size': 'cover',
                    'background-image': 'url("' + _this.currentImage.attr('src') + '")',
                    'background-position': '-' + leftOffset + 'px -' + topOffset + 'px'
                });
            },
            execute: function () {
                var _this = this;
                var bars = (this.options.effectMode === 'out' ? this.outgoing : this.target).find('div.tile');
                var count = 0;
                var complete = function () {
                    count++;
                    if (count >= bars.length) {
                        _this.target.show(0);
                        bars.empty().remove();
                        _this.finished();
                    }
                };
                var height = this.outgoing.height();
                var width = this.outgoing.width();
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
//=================[ Spiral Effects ]=================//
(function ($) {
    fx.HC.transitions.SpiralOut = function (that, opts, completed) {
        return new fx.HC.transition_base(that, $.extend({
            effectMode: 'out',
            forceSquare: false,
            columns: 9,
            rows: 6,
            delay: 0.08,
            duration: 0.8,
            scale: 0.1,
            ease: Linear.easeIn,
            initArray: function () {
                var width = this.options.columns;
                var height = this.options.rows;
                var arr = new Array(width * height + 1);
                var left = 0;
                var right = width - 1;
                var top = 0;
                var bot = height - 1;
                var vector = "right";
                var rowindex = 0;
                var colindex = 0;
                for (var index = 0; index < width * height; index++) {
                    arr[rowindex * width + colindex] = index;
                    if (vector == "right") {
                        if (colindex < right) colindex++; else { vector = "down"; top++; rowindex++; }
                    }
                    else if (vector == "down") {
                        if (rowindex < bot) rowindex++; else { vector = "left"; right--; colindex--; }
                    }
                    else if (vector == "left") {
                        if (colindex > left) colindex--; else { vector = "up"; bot--; rowindex--; }
                    }
                    else if (vector == "up") {
                        if (rowindex > top) rowindex--; else { vector = "right"; left++; colindex++; }
                    }
                }
                this.timeArray = arr;
            },
            calcDelay: function (rowIndex, colIndex) { return this.timeArray[colIndex * this.options.columns + rowIndex] * this.options.delay; },
            renderTile: function (elem, colIndex, rowIndex, colWidth, rowHeight, leftOffset, topOffset) {
                var _this = this;
                $(elem).css({
                    'background-image': 'url("' + _this.currentImage.attr('src') + '")',
                    'background-position': '-' + leftOffset + 'px -' + topOffset + 'px'
                });
                if (this.options.effectMode === 'in') {
                    TweenMax.set(elem, {
                        rotationZ: -90,
                        scale: this.options.scale,
                        autoAlpha: 0,
                    });
                }
            },
            execute: function () {
                var _this = this;
                var bars = (this.options.effectMode === 'out' ? this.outgoing : this.target).find('div.tile');
                var count = 0;
                var complete = function () {
                    count++;
                    if (count >= bars.length) {
                        bars.empty().remove();
                        _this.finished();
                    }
                };
                this.options.initArray.call(this);
                var height = this.outgoing.height();
                var width = this.outgoing.width();
                bars.each(function (index, bar) {
                    var rowIndex = index % _this.options.rows;              // In the base transition, web loop in rows
                    var colIndex = (index - rowIndex) / _this.options.rows; // first => calc from rows
                    var wait = _this.options.calcDelay.call(_this, colIndex, rowIndex);
                    TweenMax.to(bar, _this.options.duration, {
                        delay: wait,
                        rotationZ: _this.options.effectMode === 'in' ? 0 : 90,
                        scale: _this.options.effectMode === 'in' ? 1 : _this.options.scale,
                        autoAlpha: _this.options.effectMode === 'in' ? 1 : 0,
                        ease: _this.options.ease,
                        onComplete: complete
                    });
                });
            }
        }, opts), completed);
    };
    fx.HC.transitions.SpiralIn = function (that, opts, completed) {
        return new fx.HC.transitions.SpiralOut(that, $.extend({
            effectMode: 'in'
        }, opts), completed);
    };
})(window.jQuery); 

//=============================================================//
(function ($) {
    function shuffle(a) {
        var j, x, i;
        for (i = a.length - 1; i > 0; i--) {
            j = Math.floor(Math.random() * (i + 1));
            x = a[i];
            a[i] = a[j];
            a[j] = x;
        }
        return a;
    }
    fx.HC.randomIndex = 0;
    var keys = shuffle(Object.keys(fx.HC.transitions));
    var length = keys.length;
    fx.HC.transitions.Random = function (that, opts, completed) {
        fx.HC.randomIndex = (fx.HC.randomIndex + 1) % length;
        return new fx.HC.transitions[keys[fx.HC.randomIndex]](that, opts, completed);
    };
    $.fn.superslides.fx = $.extend(fx.HC.transitions, $.fn.superslides.fx);
})(window.jQuery); 