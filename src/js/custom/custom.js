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

});
/*----------------------------------------
MAIN SLIDER
----------------------------------------*/
// $(document).ready(function() {

// 	$("#main-slider").owlCarousel({
// 		navigation : false,
// 		slideSpeed : 300,
// 		paginationSpeed : 400,
// 		singleItem:true
// 	});

// 	$(".carousel").owlCarousel({
// 		navigation : true,
// 		pagination:false,
// 		navigationText:["<i class='icon-prev'></i>","<i class='icon-next'></i>"],
// 		items : 4,
// 		itemsDesktop : [1199,3],
// 		itemsDesktopSmall : [992,2]
// 	});
// });
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