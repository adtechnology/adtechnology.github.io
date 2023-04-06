/*-----------------------------------------------------------
* Template Name    : Tamox | Responsive Minimal Template
* Author           : SRBThemes
* Version          : 1.0.0
* Created          : March 2018
* File Description : Main Js file of the template
*------------------------------------------------------------
*/

! function($) {
    "use strict";

    var TamoxApp = function() {};

    TamoxApp.prototype.initMenuOpen = function() {
        $(".open-lightbox").on("click", function(e) {
            e.preventDefault();
            
            $(".nav-bg-box").fadeIn("normal", function(){$(this).addClass("active")});
            $(".close-lightbox").addClass("loaded");
        });
    },

    TamoxApp.prototype.initMenuClose = function() {
        $(".close-lightbox").on("click", function(e) {
            e.preventDefault();
            
            $(".nav-bg-box").delay(100).removeClass("active").delay(200).fadeOut("slow");
            $(".close-lightbox").removeClass("loaded");
        });
    },

    TamoxApp.prototype.initMenuToggleClose = function() {
        $(".navbar-nav-tamox li a").on("click", function(e) {
            $(".close-lightbox").trigger("click");
        });
    },

    TamoxApp.prototype.initCounter = function() {
        var a = 0;
        $(window).on('scroll',function() {
            var oTop = $('#counter').offset().top - window.innerHeight;
            if (a == 0 && $(window).scrollTop() > oTop) {
                $('.lan_fun_value').each(function() {
                    var $this = $(this),
                        countTo = $this.attr('data-count');
                    $({
                        countNum: $this.text()
                    }).animate({
                            countNum: countTo
                        },
                        {
                            duration: 2000,
                            easing: 'swing',
                            step: function() {
                                $this.text(Math.floor(this.countNum));
                            },
                            complete: function() {
                                $this.text(this.countNum);
                                //alert('finished');
                            }

                        });
                });
                a = 1;
            }
        });
    },

    TamoxApp.prototype.initWorkFilter = function() {
        $(window).on('load', function () {
            //PORTFOLIO FILTER 
            var $container = $('.work-filter');
            var $filter = $('#menu-filter');
            // Initialize isotope 
            $container.isotope({
                filter: '*',
                layoutMode: 'masonry',
                animationOptions: {
                    duration: 750,
                    easing: 'linear'
                }
            });

            // Filter items when filter link is clicked
            $filter.find('a').on("click",function() {
                var selector = $(this).attr('data-filter');
                $filter.find('a').removeClass('active');
                $(this).addClass('active');
                $container.isotope({
                    filter: selector,
                    animationOptions: {
                        animationDuration: 750,
                        easing: 'linear',
                        queue: false,
                    }
                });
                return false;
            });
        });
    },

    TamoxApp.prototype.init = function() {
        this.initMenuOpen();
        this.initMenuClose();
        this.initMenuToggleClose();
        this.initCounter();
        this.initWorkFilter();
    },
    //init
    $.TamoxApp = new TamoxApp, $.TamoxApp.Constructor = TamoxApp
}(window.jQuery),

//initializing
function($) {
    "use strict";
    $.TamoxApp.init();
}(window.jQuery);