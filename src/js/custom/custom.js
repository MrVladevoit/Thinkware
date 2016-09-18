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
		autoplaySpeed: 4000,
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


});

/*----------------------------------------
MOBILE
----------------------------------------*/
// media query event handler

// $('#header-swipe').swipe( {
// 	//Single swipe handler for left swipes
// 	swipeLeft: function () {
// 			$.sidr('open', 'sidr');
// 			$('#simple-menu').addClass('is-active');
// 	}
// });
// if (matchMedia) {
// 	var mq = window.matchMedia("(min-width: 767px)");
// 	mq.addListener(WidthChange);
// 	WidthChange(mq);
// }
// // media query change
// function WidthChange(mq) {
// 	if (mq.matches) {
// 	// window width is at least 767px
// 	} else {
// 		$('body').swipe({
// 			swipeRight: function () {
// 					$.sidr('close', 'sidr');
// 					$('#simple-menu').removeClass('is-active');
// 			}
// 		});
// 	}
// };

// /*Select */
//   $( function() {
//     $( ".select-box" ).selectmenu();

//   } );