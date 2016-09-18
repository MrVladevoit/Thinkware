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
	/* Parallax */
	$('.parallax').parallax();

});
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
// $('.slider__thumbnails_item').find('.inner__line').removeClass('active');

// $('.slider__thumbnails_item.slick-current').find('.inner__line').addClass('active');

$('.inner__line').children()


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