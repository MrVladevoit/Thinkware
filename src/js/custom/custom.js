$(document).ready(function() {
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
	PRODUCTS ORDER
----------------------------------------*/
	// var button = $('.btn-product'),
	// 		buttonAccess = $('.btn-access'),
	// 		title = $('#modal-title'),
	// 		image = $('#modal-image');

	// button.on('click', function(event) {
	// 	event.preventDefault();

	// 	var name = $(this).attr('data-name'),
	// 			dataImage = $(this).attr('data-image');

	// 	title.text(name);
	// 	image.prop('src','images/thinkware-'+ dataImage +'-front.jpg');

	// });

	// buttonAccess.on('click', function(event) {
	// 	event.preventDefault();

	// 	var name = $(this).attr('data-name'),
	// 			dataImage = $(this).attr('data-image');

	// 	title.text(name);
	// 	image.prop('src','images/'+ dataImage +'.jpg');

	// });


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
							var iframe_url = "https://www.youtube.com/embed/" + this.id + "?autoplay=1&autohide=1 ";
							if ($(this).data('params')) iframe_url+='&'+$(this).data('params');

							// Высота и ширина iframe должны быть такими же, как и у родительского блока
							var iframe = $('<iframe/>', {'frameborder': '0' , 'src': iframe_url, 'width': $(this).width(), 'height': $(this).height(), 'allowfullscreen': 'allowfullscreen' })

							// Заменяем миниатюру HTML5 плеером с YouTube
							$(this).replaceWith(iframe);
					});
			});
	 });
});

/*----------------------------------------
	HIDE MAP
----------------------------------------*/

	$('.map').hide();

	$(function () {
			var myLatlng = new google.maps.LatLng( 59.890438, 30.440293);
			//create map options object
			var mapOptions = {
				zoom: 15,
				center: myLatlng,
				mapTypeId: google.maps.MapTypeId.ROADMAP,
				// This is where you would paste any style found on Snazzy Maps.
				styles: [{"featureType":"administrative","elementType":"all","stylers":[{"visibility":"simplified"}]},{"featureType":"landscape","elementType":"geometry","stylers":[{"visibility":"simplified"},{"color":"#fcfcfc"}]},{"featureType":"poi","elementType":"geometry","stylers":[{"visibility":"simplified"},{"color":"#fcfcfc"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"visibility":"simplified"},{"color":"#dddddd"}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"visibility":"simplified"},{"color":"#dddddd"}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"visibility":"simplified"},{"color":"#eeeeee"}]},{"featureType":"water","elementType":"geometry","stylers":[{"visibility":"simplified"},{"color":"#dddddd"}]}]
			};
			var map = new google.maps.Map(document.getElementById('map'), mapOptions);

			var image = 'images/marker.svg';

			var marker = new google.maps.Marker({
				position: new google.maps.LatLng( 59.890438, 30.440293),
				map: map,
				icon: image,
				title: 'thinkware'
			});


			$(".map-open").click(function () {
				$(this).addClass('opened');
				$('.map-close').addClass('active');
				$('.map').slideDown(200 , function(){
					google.maps.event.trigger(map, "resize");
					map.setCenter(myLatlng);
				});
			});

			$(".map-close").click(function () {
				$('.map-open').removeClass('opened');
				$('.map-close').removeClass('active');
				$('.map').slideUp( 1000, function(){
					google.maps.event.trigger(map, "resize");
					map.setCenter(myLatlng);
				});
			});

	});
