$(document).ready(function() {

	/*FOR SVG*/
		svg4everybody({});
	/*----------------------------------------
		MATERIAL BUTTON
	----------------------------------------*/
	$(function(){
		var ink, d, x, y;
		$(".btn").click(function(e){
		if($(this).find(".ink").length === 0){
			$(this).prepend("<span class='ink'></span>");
		}

		ink = $(this).find(".ink");
		ink.removeClass("animate");

		if(!ink.height() && !ink.width()){
			d = Math.max($(this).outerWidth(), $(this).outerHeight());
			ink.css({height: d, width: d});
		}

		x = e.pageX - $(this).offset().left - ink.width()/2;
		y = e.pageY - $(this).offset().top - ink.height()/2;

		ink.css({top: y+'px', left: x+'px'}).addClass("animate");
		});
	});

	$('body').scrollspy({ target: '#menu' })
	/*----------------------------------------
	MAIN SLIDER
	----------------------------------------*/
	 $('.slider__catalog').slick({
		slidesToShow: 1,
		slidesToScroll: 1,
		arrows: false,
		autoplay: true,
		autoplaySpeed: 30000,
		speed: 300,
		pauseOnHover:false,
		asNavFor: '.slider__thumbnails'
	});

	$('.slider__thumbnails').slick({
		slidesToShow: 3,
		slidesToScroll: 1,
		asNavFor: '.slider__catalog',
		dots: true,
		arrows: false,
		centerMode: true,
		speed: 300,
		focusOnSelect: true
	});

	/*----------------------------------------
	Parallax
	----------------------------------------*/
	$(window).scroll(function () {

		var scroll = $(this).scrollTop();
		var res = scroll / 3;

		$('#slider').css({'transform' : 'translateY(' + res +'px)'})
	});


/*----------------------------------------
	SCROLL / плавный скролл
----------------------------------------*/

	 $('a.scroll').on("click", function(e){

			var anchor = $(this);

			$('html, body').stop().animate({
				 scrollTop: $(anchor.attr('href')).offset().top
			}, 2000);
			// e.preventDefault();
	 });

	$('.btn-open').click(function() {
		$('.map').css('display', 'block');
	});

	$('.product__properties_item').click(function(event) {
		$('.product__properties_item').removeClass('active');
		$(this).toggleClass('active');
	});


/*----------------------------------------
	MODAL
----------------------------------------*/
	var overlay = $('.md-overlay'),
			trigger = $('.md-trigger'),
			modal = $('.md-modal'),
			close = $ ('.md-close');


	function removeModal(e){

		e.preventDefault();
		modal.removeClass('md-show')
		overlay.removeClass('opened');
	};

	function openModal(e){

		e.preventDefault();

		var id = $(this).attr('data-modal');
		$('#' + id + '.md-modal').toggleClass('md-show');

		overlay.addClass('opened');
	};



	trigger.on('click',openModal);
	close.on('click',removeModal);
	overlay.on('click',removeModal);

/*----------------------------------------
	PRODUCTS ANIMATE
----------------------------------------*/

	var product = $('.preview'),
			hidden = $('.product_hide');

	hidden.hide();

	product.on('click', function(event) {
		event.preventDefault();
		// $(this).fadeOut('slow');
		$(this).closest('.product__preview').fadeOut(300, function () {
			$(this).closest('.product__preview').remove();
		});
		$(this).closest('.product__preview').prev('.product_hide').slideToggle( 800 );
	});
});


/*----------------------------------------
	YOUTUBE VIDEOS
----------------------------------------*/
jQuery(document).ready(function() {
	"use strict";
	$(function() {
	    $(".youtube").each(function() {
	        // Зная идентификатор видео на YouTube, легко можно найти его миниатюру
	        $(this).css('background-image', 'url(http://i.ytimg.com/vi/' + this.id + '/sddefault.jpg)');

	        // Добавляем иконку Play поверх миниатюры, чтобы было похоже на видеоплеер
	        $(this).append($('<div/>', {'class': 'play'}));

	        $(document).delegate('#'+this.id, 'click', function() {
	            // создаем iframe со включенной опцией autoplay
	            var iframe_url = "https://www.youtube.com/embed/" + this.id + "?autoplay=1&autohide=1";
	            if ($(this).data('params')) iframe_url+='&'+$(this).data('params');

	            // Высота и ширина iframe должны быть такими же, как и у родительского блока
	            var iframe = $('<iframe/>', {'frameborder': '0', 'src': iframe_url, 'width': $(this).width(), 'height': $(this).height() })

	            // Заменяем миниатюру HTML5 плеером с YouTube
	            $(this).replaceWith(iframe);
	        });
	    });
	 });
});