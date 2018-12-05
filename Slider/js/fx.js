"use strict";
window.fx = {
    version: '1.4.8',
    Effects3D: 48,
    Effects2D: 19,
};
fx.HC ={};
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
(function ($) {
    fx.HC.transition = function (that, opts) {
        this.slider = that;
        this.options = $.extend({
            fallback: false,
            requires3d: false,
            effectMode: 'out',
            after: function () {
                // Default callback for after the transition has completed
            }
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
            // if (this.options.effectMode === 'out') this.slider.image1.css({ 'background-image': 'none' });
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

    fx.HC.transitions = {};
})(window.jQuery);

(function ($) {
    fx.HC.transitions.Dissolve = function (that, opts, completed) {
        var //that = this,
        $children = that.$container.children(),
        $outgoing = $children.eq(opts.outgoing_slide),
        $target = $children.eq(opts.upcoming_slide);
        opts = $.extend({
            after: function () {if (completed) completed();}
        }, opts);
        return new fx.HC.transition(that, $.extend({
            duration: 2,
            ease: Quart.easeIn,
            setup: function () {
                $target.css({
                  left: 0,
                  opacity: 0,
                  display: 'block'
                });
                $outgoing.css({
                  left: 0,
                  opacity: 1,
                  display: 'block'
                });
            },
            execute: function () {
                var _this = this;
                var complete = function() {
                    if (that.size() > 1) {
                      $target.css({ zIndex: 2 });
                      if (opts.outgoing_slide >= 0) {
                        $outgoing.css({
                          opacity: 1,
                          display: 'none',
                          zIndex: 0
                        });
                      }
                    }
                    _this.finished();
                };
                TweenMax.to($target, that.options.animation_speed/1000, {
                    autoAlpha: 1,
                    //ease: that.options.animation_easing,
                    onComplete: complete
                });
            }
        }, opts));
    };
})(window.jQuery);


(function($) {
    $.fn.superslides.fx = $.extend(fx.HC.transitions, $.fn.superslides.fx);
})(window.jQuery);