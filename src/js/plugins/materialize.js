    // Custom Easing
    jQuery.extend( jQuery.easing,
    {
      easeInOutMaterial: function (x, t, b, c, d) {
        if ((t/=d/2) < 1) return c/2*t*t + b;
        return c/4*((t-=2)*t*t + 2) + b;
      }
    });


(function ($) {
  $(document).ready(function() {

    // jQuery reverse
    $.fn.reverse = [].reverse;

    // Hover behaviour: make sure this doesn't work on .click-to-toggle FABs!
    $(document).on('mouseenter.fixedActionBtn', '.fixed-action-btn:not(.click-to-toggle)', function(e) {
      var $this = $(this);
      openFABMenu($this);
    });
    $(document).on('mouseleave.fixedActionBtn', '.fixed-action-btn:not(.click-to-toggle)', function(e) {
      var $this = $(this);
      closeFABMenu($this);
    });

    // Toggle-on-click behaviour.
    $(document).on('click.fixedActionBtn', '.fixed-action-btn.click-to-toggle > a', function(e) {
      var $this = $(this);
      var $menu = $this.parent();
      if ($menu.hasClass('active')) {
        closeFABMenu($menu);
      } else {
        openFABMenu($menu);
      }
    });

  });

  $.fn.extend({
    openFAB: function() {
      openFABMenu($(this));
    },
    closeFAB: function() {
      closeFABMenu($(this));
    }
  });


  var openFABMenu = function (btn) {
    $this = btn;
    if ($this.hasClass('active') === false) {

      // Get direction option
      var horizontal = $this.hasClass('horizontal');
      var offsetY, offsetX;

      if (horizontal === true) {
        offsetX = 40;
      } else {
        offsetY = 40;
      }

      $this.addClass('active');
      $this.find('ul .btn-floating').velocity(
        { scaleY: ".4", scaleX: ".4", translateY: offsetY + 'px', translateX: offsetX + 'px'},
        { duration: 0 });

      var time = 0;
      $this.find('ul .btn-floating').reverse().each( function () {
        $(this).velocity(
          { opacity: "1", scaleX: "1", scaleY: "1", translateY: "0", translateX: '0'},
          { duration: 80, delay: time });
        time += 40;
      });
    }
  };

  var closeFABMenu = function (btn) {
    $this = btn;
    // Get direction option
    var horizontal = $this.hasClass('horizontal');
    var offsetY, offsetX;

    if (horizontal === true) {
      offsetX = 40;
    } else {
      offsetY = 40;
    }

    $this.removeClass('active');
    var time = 0;
    $this.find('ul .btn-floating').velocity("stop", true);
    $this.find('ul .btn-floating').velocity(
      { opacity: "0", scaleX: ".4", scaleY: ".4", translateY: offsetY + 'px', translateX: offsetX + 'px'},
      { duration: 80 }
    );
  };


}( jQuery ));

(function ($) {
  $(document).ready(function() {

    $(document).on('click.card', '.card', function (e) {
      if ($(this).find('> .card-reveal').length) {
        if ($(e.target).is($('.card-reveal .card-title')) || $(e.target).is($('.card-reveal .card-title i'))) {
          // Make Reveal animate down and display none
          $(this).find('.card-reveal').velocity(
            {translateY: 0}, {
              duration: 225,
              queue: false,
              easing: 'easeInOutQuad',
              complete: function() { $(this).css({ display: 'none'}); }
            }
          );
        }
        else if ($(e.target).is($('.card .activator')) ||
                 $(e.target).is($('.card .activator i')) ) {
          $(e.target).closest('.card').css('overflow', 'hidden');
          $(this).find('.card-reveal').css({ display: 'block'}).velocity("stop", false).velocity({translateY: '-100%'}, {duration: 300, queue: false, easing: 'easeInOutQuad'});
        }
      }
    });

  });
}( jQuery ));
(function ($) {

  var methods = {

    init : function(options) {
      var defaults = {
        time_constant: 200, // ms
        dist: -100, // zoom scale TODO: make this more intuitive as an option
        shift: 0, // spacing for center image
        padding: 0, // Padding between non center items
        full_width: false, // Change to full width styles
        indicators: false, // Toggle indicators
        no_wrap: false // Don't wrap around and cycle through items.
      };
      options = $.extend(defaults, options);

      return this.each(function() {

        var images, offset, center, pressed, dim, count,
            reference, referenceY, amplitude, target, velocity,
            xform, frame, timestamp, ticker, dragged, vertical_dragged;
        var $indicators = $('<ul class="indicators"></ul>');


        // Initialize
        var view = $(this);
        var showIndicators = view.attr('data-indicators') || options.indicators;

        // Don't double initialize.
        if (view.hasClass('initialized')) {
          // Redraw carousel.
          $(this).trigger('carouselNext', [0.000001]);
          return true;
        }


        // Options
        if (options.full_width) {
          options.dist = 0;
          var firstImage = view.find('.carousel-item img').first();
          if (firstImage.length) {
            imageHeight = firstImage.load(function(){
              view.css('height', $(this).height());
            });
          } else {
            imageHeight = view.find('.carousel-item').first().height();
            view.css('height', imageHeight);
          }

          // Offset fixed items when indicators.
          if (showIndicators) {
            view.find('.carousel-fixed-item').addClass('with-indicators');
          }
        }


        view.addClass('initialized');
        pressed = false;
        offset = target = 0;
        images = [];
        item_width = view.find('.carousel-item').first().innerWidth();
        dim = item_width * 2 + options.padding;

        view.find('.carousel-item').each(function (i) {
          images.push($(this)[0]);
          if (showIndicators) {
            var $indicator = $('<li class="indicator-item"></li>');

            // Add active to first by default.
            if (i === 0) {
              $indicator.addClass('active');
            }

            // Handle clicks on indicators.
            $indicator.click(function () {
              var index = $(this).index();
              cycleTo(index);
            });
            $indicators.append($indicator);
          }
        });

        if (showIndicators) {
          view.append($indicators);
        }
        count = images.length;


        function setupEvents() {
          if (typeof window.ontouchstart !== 'undefined') {
            view[0].addEventListener('touchstart', tap);
            view[0].addEventListener('touchmove', drag);
            view[0].addEventListener('touchend', release);
          }
          view[0].addEventListener('mousedown', tap);
          view[0].addEventListener('mousemove', drag);
          view[0].addEventListener('mouseup', release);
          view[0].addEventListener('mouseleave', release);
          view[0].addEventListener('click', click);
        }

        function xpos(e) {
          // touch event
          if (e.targetTouches && (e.targetTouches.length >= 1)) {
            return e.targetTouches[0].clientX;
          }

          // mouse event
          return e.clientX;
        }

        function ypos(e) {
          // touch event
          if (e.targetTouches && (e.targetTouches.length >= 1)) {
            return e.targetTouches[0].clientY;
          }

          // mouse event
          return e.clientY;
        }

        function wrap(x) {
          return (x >= count) ? (x % count) : (x < 0) ? wrap(count + (x % count)) : x;
        }

        function scroll(x) {
          var i, half, delta, dir, tween, el, alignment, xTranslation;

          offset = (typeof x === 'number') ? x : offset;
          center = Math.floor((offset + dim / 2) / dim);
          delta = offset - center * dim;
          dir = (delta < 0) ? 1 : -1;
          tween = -dir * delta * 2 / dim;
          half = count >> 1;

          if (!options.full_width) {
            alignment = 'translateX(' + (view[0].clientWidth - item_width) / 2 + 'px) ';
            alignment += 'translateY(' + (view[0].clientHeight - item_width) / 2 + 'px)';
          } else {
            alignment = 'translateX(0)';
          }

          // Set indicator active
          if (showIndicators) {
            var diff = (center % count);
            var activeIndicator = $indicators.find('.indicator-item.active');
            if (activeIndicator.index() !== diff) {
              activeIndicator.removeClass('active');
              $indicators.find('.indicator-item').eq(diff).addClass('active');
            }
          }

          // center
          // Don't show wrapped items.
          if (!options.no_wrap || (center >= 0 && center < count)) {
            el = images[wrap(center)];
            el.style[xform] = alignment +
              ' translateX(' + (-delta / 2) + 'px)' +
              ' translateX(' + (dir * options.shift * tween * i) + 'px)' +
              ' translateZ(' + (options.dist * tween) + 'px)';
            el.style.zIndex = 0;
            if (options.full_width) { tweenedOpacity = 1; }
            else { tweenedOpacity = 1 - 0.2 * tween; }
            el.style.opacity = tweenedOpacity;
            el.style.display = 'block';
          }

          for (i = 1; i <= half; ++i) {
            // right side
            if (options.full_width) {
              zTranslation = options.dist;
              tweenedOpacity = (i === half && delta < 0) ? 1 - tween : 1;
            } else {
              zTranslation = options.dist * (i * 2 + tween * dir);
              tweenedOpacity = 1 - 0.2 * (i * 2 + tween * dir);
            }
            // Don't show wrapped items.
            if (!options.no_wrap || center + i < count) {
              el = images[wrap(center + i)];
              el.style[xform] = alignment +
                ' translateX(' + (options.shift + (dim * i - delta) / 2) + 'px)' +
                ' translateZ(' + zTranslation + 'px)';
              el.style.zIndex = -i;
              el.style.opacity = tweenedOpacity;
              el.style.display = 'block';
            }


            // left side
            if (options.full_width) {
              zTranslation = options.dist;
              tweenedOpacity = (i === half && delta > 0) ? 1 - tween : 1;
            } else {
              zTranslation = options.dist * (i * 2 - tween * dir);
              tweenedOpacity = 1 - 0.2 * (i * 2 - tween * dir);
            }
            // Don't show wrapped items.
            if (!options.no_wrap || center - i >= 0) {
              el = images[wrap(center - i)];
              el.style[xform] = alignment +
                ' translateX(' + (-options.shift + (-dim * i - delta) / 2) + 'px)' +
                ' translateZ(' + zTranslation + 'px)';
              el.style.zIndex = -i;
              el.style.opacity = tweenedOpacity;
              el.style.display = 'block';
            }
          }

          // center
          // Don't show wrapped items.
          if (!options.no_wrap || (center >= 0 && center < count)) {
            el = images[wrap(center)];
            el.style[xform] = alignment +
              ' translateX(' + (-delta / 2) + 'px)' +
              ' translateX(' + (dir * options.shift * tween) + 'px)' +
              ' translateZ(' + (options.dist * tween) + 'px)';
            el.style.zIndex = 0;
            if (options.full_width) { tweenedOpacity = 1; }
            else { tweenedOpacity = 1 - 0.2 * tween; }
            el.style.opacity = tweenedOpacity;
            el.style.display = 'block';
          }
        }

        function track() {
          var now, elapsed, delta, v;

          now = Date.now();
          elapsed = now - timestamp;
          timestamp = now;
          delta = offset - frame;
          frame = offset;

          v = 1000 * delta / (1 + elapsed);
          velocity = 0.8 * v + 0.2 * velocity;
        }

        function autoScroll() {
          var elapsed, delta;

          if (amplitude) {
            elapsed = Date.now() - timestamp;
            delta = amplitude * Math.exp(-elapsed / options.time_constant);
            if (delta > 2 || delta < -2) {
                scroll(target - delta);
                requestAnimationFrame(autoScroll);
            } else {
                scroll(target);
            }
          }
        }

        function click(e) {
          // Disable clicks if carousel was dragged.
          if (dragged) {
            e.preventDefault();
            e.stopPropagation();
            return false;

          } else if (!options.full_width) {
            var clickedIndex = $(e.target).closest('.carousel-item').index();
            var diff = (center % count) - clickedIndex;

            // Disable clicks if carousel was shifted by click
            if (diff !== 0) {
              e.preventDefault();
              e.stopPropagation();
            }
            cycleTo(clickedIndex);
          }
        }

        function cycleTo(n) {
          var diff = (center % count) - n;

          // Account for wraparound.
          if (!options.no_wrap) {
            if (diff < 0) {
              if (Math.abs(diff + count) < Math.abs(diff)) { diff += count; }

            } else if (diff > 0) {
              if (Math.abs(diff - count) < diff) { diff -= count; }
            }
          }

          // Call prev or next accordingly.
          if (diff < 0) {
            view.trigger('carouselNext', [Math.abs(diff)]);

          } else if (diff > 0) {
            view.trigger('carouselPrev', [diff]);
          }
        }

        function tap(e) {
          pressed = true;
          dragged = false;
          vertical_dragged = false;
          reference = xpos(e);
          referenceY = ypos(e);

          velocity = amplitude = 0;
          frame = offset;
          timestamp = Date.now();
          clearInterval(ticker);
          ticker = setInterval(track, 100);

        }

        function drag(e) {
          var x, delta, deltaY;
          if (pressed) {
            x = xpos(e);
            y = ypos(e);
            delta = reference - x;
            deltaY = Math.abs(referenceY - y);
            if (deltaY < 30 && !vertical_dragged) {
              // If vertical scrolling don't allow dragging.
              if (delta > 2 || delta < -2) {
                dragged = true;
                reference = x;
                scroll(offset + delta);
              }

            } else if (dragged) {
              // If dragging don't allow vertical scroll.
              e.preventDefault();
              e.stopPropagation();
              return false;

            } else {
              // Vertical scrolling.
              vertical_dragged = true;
            }
          }

          if (dragged) {
            // If dragging don't allow vertical scroll.
            e.preventDefault();
            e.stopPropagation();
            return false;
          }
        }

        function release(e) {
          if (pressed) {
            pressed = false;
          } else {
            return;
          }

          clearInterval(ticker);
          target = offset;
          if (velocity > 10 || velocity < -10) {
            amplitude = 0.9 * velocity;
            target = offset + amplitude;
          }
          target = Math.round(target / dim) * dim;

          // No wrap of items.
          if (options.no_wrap) {
            if (target >= dim * (count - 1)) {
              target = dim * (count - 1);
            } else if (target < 0) {
              target = 0;
            }
          }
          amplitude = target - offset;
          timestamp = Date.now();
          requestAnimationFrame(autoScroll);

          if (dragged) {
            e.preventDefault();
            e.stopPropagation();
          }
          return false;
        }

        xform = 'transform';
        ['webkit', 'Moz', 'O', 'ms'].every(function (prefix) {
          var e = prefix + 'Transform';
          if (typeof document.body.style[e] !== 'undefined') {
            xform = e;
            return false;
          }
          return true;
        });



        window.onresize = scroll;

        setupEvents();
        scroll(offset);

        $(this).on('carouselNext', function(e, n) {
          if (n === undefined) {
            n = 1;
          }
          target = offset + dim * n;
          if (offset !== target) {
            amplitude = target - offset;
            timestamp = Date.now();
            requestAnimationFrame(autoScroll);
          }
        });

        $(this).on('carouselPrev', function(e, n) {
          if (n === undefined) {
            n = 1;
          }
          target = offset - dim * n;
          if (offset !== target) {
            amplitude = target - offset;
            timestamp = Date.now();
            requestAnimationFrame(autoScroll);
          }
        });

        $(this).on('carouselSet', function(e, n) {
          if (n === undefined) {
            n = 0;
          }
          cycleTo(n);
        });

      });



    },
    next : function(n) {
      $(this).trigger('carouselNext', [n]);
    },
    prev : function(n) {
      $(this).trigger('carouselPrev', [n]);
    },
    set : function(n) {
      $(this).trigger('carouselSet', [n]);
    }
  };


    $.fn.carousel = function(methodOrOptions) {
      if ( methods[methodOrOptions] ) {
        return methods[ methodOrOptions ].apply( this, Array.prototype.slice.call( arguments, 1 ));
      } else if ( typeof methodOrOptions === 'object' || ! methodOrOptions ) {
        // Default to "init"
        return methods.init.apply( this, arguments );
      } else {
        $.error( 'Method ' +  methodOrOptions + ' does not exist on jQuery.carousel' );
      }
    }; // Plugin end
}( jQuery ));
(function ($) {
  var chipsHandleEvents = false;
  var materialChipsDefaults = {
    data: [],
    placeholder: '',
    secondaryPlaceholder: '',
  };

  $(document).ready(function(){
    // Handle removal of static chips.
    $(document).on('click', '.chip .close', function(e){
      var $chips = $(this).closest('.chips');
      if ($chips.data('initialized')) {
        return;
      }
      $(this).closest('.chip').remove();
    });
  });

  $.fn.material_chip = function (options) {
    var self = this;
    this.$el = $(this);
    this.$document = $(document);
    this.SELS = {
      CHIPS: '.chips',
      CHIP: '.chip',
      INPUT: 'input',
      DELETE: '.material-icons',
      SELECTED_CHIP: '.selected',
    };

    if ('data' === options) {
      return this.$el.data('chips');
    }

    if ('options' === options) {
      return this.$el.data('options');
    }

    this.$el.data('options', $.extend({}, materialChipsDefaults, options));

    // Initialize
    this.init = function() {
      var i = 0;
      var chips;
      self.$el.each(function(){
        var $chips = $(this);
        if ($chips.data('initialized')) {
          // Prevent double initialization.
          return;
        }
        var options = $chips.data('options');
        if (!options.data || !options.data instanceof Array) {
          options.data = [];
        }
        $chips.data('chips', options.data);
        $chips.data('index', i);
        $chips.data('initialized', true);

        if (!$chips.hasClass(self.SELS.CHIPS)) {
          $chips.addClass('chips');
        }

        self.chips($chips);
        i++;
      });
    };

    this.handleEvents = function(){
      var SELS = self.SELS;

      self.$document.on('click', SELS.CHIPS, function(e){
        $(e.target).find(SELS.INPUT).focus();
      });

      self.$document.on('click', SELS.CHIP, function(e){
        $(SELS.CHIP).removeClass('selected');
        $(this).toggleClass('selected');
      });

      self.$document.on('keydown', function(e){
        if ($(e.target).is('input, textarea')) {
          return;
        }

        // delete
        var $chip = self.$document.find(SELS.CHIP + SELS.SELECTED_CHIP);
        var $chips = $chip.closest(SELS.CHIPS);
        var length = $chip.siblings(SELS.CHIP).length;
        var index;

        if (!$chip.length) {
          return;
        }

        if (e.which === 8 || e.which === 46) {
          e.preventDefault();
          var chipsIndex = $chips.data('index');

          index = $chip.index();
          self.deleteChip(chipsIndex, index, $chips);

          var selectIndex = null;
          if ((index + 1) < length) {
            selectIndex = index;
          } else if (index === length || (index + 1) === length) {
            selectIndex = length - 1;
          }

          if (selectIndex < 0) selectIndex = null;

          if (null !== selectIndex) {
            self.selectChip(chipsIndex, selectIndex, $chips);
          }
          if (!length) $chips.find('input').focus();

        // left
        } else if (e.which === 37) {
          index = $chip.index() - 1;
          if (index < 0) {
            return;
          }
          $(SELS.CHIP).removeClass('selected');
          self.selectChip($chips.data('index'), index, $chips);

        // right
        } else if (e.which === 39) {
          index = $chip.index() + 1;
          $(SELS.CHIP).removeClass('selected');
          if (index > length) {
            $chips.find('input').focus();
            return;
          }
          self.selectChip($chips.data('index'), index, $chips);
        }
      });

      self.$document.on('focusin', SELS.CHIPS + ' ' + SELS.INPUT, function(e){
        $(e.target).closest(SELS.CHIPS).addClass('focus');
        $(SELS.CHIP).removeClass('selected');
      });

      self.$document.on('focusout', SELS.CHIPS + ' ' + SELS.INPUT, function(e){
        $(e.target).closest(SELS.CHIPS).removeClass('focus');
      });

      self.$document.on('keydown', SELS.CHIPS + ' ' + SELS.INPUT, function(e){
        var $target = $(e.target);
        var $chips = $target.closest(SELS.CHIPS);
        var chipsIndex = $chips.data('index');
        var chipsLength = $chips.children(SELS.CHIP).length;

        // enter
        if (13 === e.which) {
          e.preventDefault();
          self.addChip(chipsIndex, {tag: $target.val()}, $chips);
          $target.val('');
          return;
        }

        // delete or left
         if ((8 === e.keyCode || 37 === e.keyCode) && '' === $target.val() && chipsLength) {
          self.selectChip(chipsIndex, chipsLength - 1, $chips);
          $target.blur();
          return;
        }
      });

      self.$document.on('click', SELS.CHIPS + ' ' + SELS.DELETE, function(e) {
        var $target = $(e.target);
        var $chips = $target.closest(SELS.CHIPS);
        var $chip = $target.closest(SELS.CHIP);
        e.stopPropagation();
        self.deleteChip(
          $chips.data('index'),
          $chip.index(),
          $chips
        );
        $chips.find('input').focus();
      });
    };

    this.chips = function($chips) {
      var html = '';
      var options = $chips.data('options');
      $chips.data('chips').forEach(function(elem){
        html += self.renderChip(elem);
      });
      html += '<input class="input" placeholder="">';
      $chips.html(html);
      self.setPlaceholder($chips);
    };

    this.renderChip = function(elem) {
      if (!elem.tag) return;

      var html = '<div class="chip">' + elem.tag;
      if (elem.image) {
        html += ' <img src="' + elem.image + '"> ';
      }
      html += '<i class="material-icons close">close</i>';
      html += '</div>';
      return html;
    };

    this.setPlaceholder = function($chips) {
      var options = $chips.data('options');
      if ($chips.data('chips').length && options.placeholder) {
        $chips.find('input').prop('placeholder', options.placeholder);
      } else if (!$chips.data('chips').length && options.secondaryPlaceholder) {
        $chips.find('input').prop('placeholder', options.secondaryPlaceholder);
      }
    };

    this.isValid = function($chips, elem) {
      var chips = $chips.data('chips');
      var exists = false;
      for (var i=0; i < chips.length; i++) {
        if (chips[i].tag === elem.tag) {
            exists = true;
            return;
        }
      }
      return '' !== elem.tag && !exists;
    };

    this.addChip = function(chipsIndex, elem, $chips) {
      if (!self.isValid($chips, elem)) {
        return;
      }
      var options = $chips.data('options');
      var chipHtml = self.renderChip(elem);
      $chips.data('chips').push(elem);
      $(chipHtml).insertBefore($chips.find('input'));
      $chips.trigger('chip.add', elem);
      self.setPlaceholder($chips);
    };

    this.deleteChip = function(chipsIndex, chipIndex, $chips) {
      var chip = $chips.data('chips')[chipIndex];
      $chips.find('.chip').eq(chipIndex).remove();
      $chips.data('chips').splice(chipIndex, 1);
      $chips.trigger('chip.delete', chip);
      self.setPlaceholder($chips);
    };

    this.selectChip = function(chipsIndex, chipIndex, $chips) {
      var $chip = $chips.find('.chip').eq(chipIndex);
      if ($chip && false === $chip.hasClass('selected')) {
        $chip.addClass('selected');
        $chips.trigger('chip.select', $chips.data('chips')[chipIndex]);
      }
    };

    this.getChipsElement = function(index, $chips) {
      return $chips.eq(index);
    };

    // init
    this.init();

    if (!chipsHandleEvents) {
      this.handleEvents();
      chipsHandleEvents = true;
    }
  };
}( jQuery ));
(function ($) {
  $.fn.collapsible = function(options) {
    var defaults = {
        accordion: undefined
    };

    options = $.extend(defaults, options);


    return this.each(function() {

      var $this = $(this);

      var $panel_headers = $(this).find('> li > .collapsible-header');

      var collapsible_type = $this.data("collapsible");

      // Turn off any existing event handlers
       $this.off('click.collapse', '> li > .collapsible-header');
       $panel_headers.off('click.collapse');


       /****************
       Helper Functions
       ****************/

      // Accordion Open
      function accordionOpen(object) {
        $panel_headers = $this.find('> li > .collapsible-header');
        if (object.hasClass('active')) {
            object.parent().addClass('active');
        }
        else {
            object.parent().removeClass('active');
        }
        if (object.parent().hasClass('active')){
          object.siblings('.collapsible-body').stop(true,false).slideDown({ duration: 350, easing: "easeOutQuart", queue: false, complete: function() {$(this).css('height', '');}});
        }
        else{
          object.siblings('.collapsible-body').stop(true,false).slideUp({ duration: 350, easing: "easeOutQuart", queue: false, complete: function() {$(this).css('height', '');}});
        }

        $panel_headers.not(object).removeClass('active').parent().removeClass('active');
        $panel_headers.not(object).parent().children('.collapsible-body').stop(true,false).slideUp(
          {
            duration: 350,
            easing: "easeOutQuart",
            queue: false,
            complete:
              function() {
                $(this).css('height', '');
              }
          });
      }

      // Expandable Open
      function expandableOpen(object) {
        if (object.hasClass('active')) {
            object.parent().addClass('active');
        }
        else {
            object.parent().removeClass('active');
        }
        if (object.parent().hasClass('active')){
          object.siblings('.collapsible-body').stop(true,false).slideDown({ duration: 350, easing: "easeOutQuart", queue: false, complete: function() {$(this).css('height', '');}});
        }
        else{
          object.siblings('.collapsible-body').stop(true,false).slideUp({ duration: 350, easing: "easeOutQuart", queue: false, complete: function() {$(this).css('height', '');}});
        }
      }

      /**
       * Check if object is children of panel header
       * @param  {Object}  object Jquery object
       * @return {Boolean} true if it is children
       */
      function isChildrenOfPanelHeader(object) {

        var panelHeader = getPanelHeader(object);

        return panelHeader.length > 0;
      }

      /**
       * Get panel header from a children element
       * @param  {Object} object Jquery object
       * @return {Object} panel header object
       */
      function getPanelHeader(object) {

        return object.closest('li > .collapsible-header');
      }

      /*****  End Helper Functions  *****/



      // Add click handler to only direct collapsible header children
      $this.on('click.collapse', '> li > .collapsible-header', function(e) {
        var $header = $(this),
            element = $(e.target);

        if (isChildrenOfPanelHeader(element)) {
          element = getPanelHeader(element);
        }

        element.toggleClass('active');

        if (options.accordion || collapsible_type === "accordion" || collapsible_type === undefined) { // Handle Accordion
          accordionOpen(element);
        } else { // Handle Expandables
          expandableOpen(element);

          if ($header.hasClass('active')) {
            expandableOpen($header);
          }
        }
      });

      // Open first active
      var $panel_headers = $this.find('> li > .collapsible-header');
      if (options.accordion || collapsible_type === "accordion" || collapsible_type === undefined) { // Handle Accordion
        accordionOpen($panel_headers.filter('.active').first());
      }
      else { // Handle Expandables
        $panel_headers.filter('.active').each(function() {
          expandableOpen($(this));
        });
      }

    });
  };

  $(document).ready(function(){
    $('.collapsible').collapsible();
  });
}( jQuery ));
(function ($) {

  // Add posibility to scroll to selected option
  // usefull for select for example
  $.fn.scrollTo = function(elem) {
    $(this).scrollTop($(this).scrollTop() - $(this).offset().top + $(elem).offset().top);
    return this;
  };

  $.fn.dropdown = function (options) {
    var defaults = {
      inDuration: 300,
      outDuration: 225,
      constrain_width: true, // Constrains width of dropdown to the activator
      hover: false,
      gutter: 0, // Spacing from edge
      belowOrigin: false,
      alignment: 'left',
      stopPropagation: false
    };

    // Open dropdown.
    if (options === "open") {
      this.each(function() {
        $(this).trigger('open');
      });
      return false;
    }

    // Close dropdown.
    if (options === "close") {
      this.each(function() {
        $(this).trigger('close');
      });
      return false;
    }

    this.each(function(){
      var origin = $(this);
      var options = $.extend({}, defaults, options);
      var isFocused = false;

      // Dropdown menu
      var activates = $("#"+ origin.attr('data-activates'));

      function updateOptions() {
        if (origin.data('induration') !== undefined)
          options.inDuration = origin.data('induration');
        if (origin.data('outduration') !== undefined)
          options.outDuration = origin.data('outduration');
        if (origin.data('constrainwidth') !== undefined)
          options.constrain_width = origin.data('constrainwidth');
        if (origin.data('hover') !== undefined)
          options.hover = origin.data('hover');
        if (origin.data('gutter') !== undefined)
          options.gutter = origin.data('gutter');
        if (origin.data('beloworigin') !== undefined)
          options.belowOrigin = origin.data('beloworigin');
        if (origin.data('alignment') !== undefined)
          options.alignment = origin.data('alignment');
        if (origin.data('stoppropagation') !== undefined)
          options.stopPropagation = origin.data('stoppropagation');
      }

      updateOptions();

      // Attach dropdown to its activator
      origin.after(activates);

      /*
        Helper function to position and resize dropdown.
        Used in hover and click handler.
      */
      function placeDropdown(eventType) {
        // Check for simultaneous focus and click events.
        if (eventType === 'focus') {
          isFocused = true;
        }

        // Check html data attributes
        updateOptions();

        // Set Dropdown state
        activates.addClass('active');
        origin.addClass('active');

        // Constrain width
        if (options.constrain_width === true) {
          activates.css('width', origin.outerWidth());

        } else {
          activates.css('white-space', 'nowrap');
        }

        // Offscreen detection
        var windowHeight = window.innerHeight;
        var originHeight = origin.innerHeight();
        var offsetLeft = origin.offset().left;
        var offsetTop = origin.offset().top - $(window).scrollTop();
        var currAlignment = options.alignment;
        var gutterSpacing = 0;
        var leftPosition = 0;

        // Below Origin
        var verticalOffset = 0;
        if (options.belowOrigin === true) {
          verticalOffset = originHeight;
        }

        // Check for scrolling positioned container.
        var scrollYOffset = 0;
        var scrollXOffset = 0;
        var wrapper = origin.parent();
        if (!wrapper.is('body')) {
          if (wrapper[0].scrollHeight > wrapper[0].clientHeight) {
            scrollYOffset = wrapper[0].scrollTop;
          }
          if (wrapper[0].scrollWidth > wrapper[0].clientWidth) {
            scrollXOffset = wrapper[0].scrollLeft;
          }
        }


        if (offsetLeft + activates.innerWidth() > $(window).width()) {
          // Dropdown goes past screen on right, force right alignment
          currAlignment = 'right';

        } else if (offsetLeft - activates.innerWidth() + origin.innerWidth() < 0) {
          // Dropdown goes past screen on left, force left alignment
          currAlignment = 'left';
        }
        // Vertical bottom offscreen detection
        if (offsetTop + activates.innerHeight() > windowHeight) {
          // If going upwards still goes offscreen, just crop height of dropdown.
          if (offsetTop + originHeight - activates.innerHeight() < 0) {
            var adjustedHeight = windowHeight - offsetTop - verticalOffset;
            activates.css('max-height', adjustedHeight);
          } else {
            // Flow upwards.
            if (!verticalOffset) {
              verticalOffset += originHeight;
            }
            verticalOffset -= activates.innerHeight();
          }
        }

        // Handle edge alignment
        if (currAlignment === 'left') {
          gutterSpacing = options.gutter;
          leftPosition = origin.position().left + gutterSpacing;
        }
        else if (currAlignment === 'right') {
          var offsetRight = origin.position().left + origin.outerWidth() - activates.outerWidth();
          gutterSpacing = -options.gutter;
          leftPosition =  offsetRight + gutterSpacing;
        }

        // Position dropdown
        activates.css({
          position: 'absolute',
          top: origin.position().top + verticalOffset + scrollYOffset,
          left: leftPosition + scrollXOffset
        });


        // Show dropdown
        activates.stop(true, true).css('opacity', 0)
          .slideDown({
            queue: false,
            duration: options.inDuration,
            easing: 'easeOutCubic',
            complete: function() {
              $(this).css('height', '');
            }
          })
          .animate( {opacity: 1}, {queue: false, duration: options.inDuration, easing: 'easeOutSine'});
      }

      function hideDropdown() {
        // Check for simultaneous focus and click events.
        isFocused = false;
        activates.fadeOut(options.outDuration);
        activates.removeClass('active');
        origin.removeClass('active');
        setTimeout(function() { activates.css('max-height', ''); }, options.outDuration);
      }

      // Hover
      if (options.hover) {
        var open = false;
        origin.unbind('click.' + origin.attr('id'));
        // Hover handler to show dropdown
        origin.on('mouseenter', function(e){ // Mouse over
          if (open === false) {
            placeDropdown();
            open = true;
          }
        });
        origin.on('mouseleave', function(e){
          // If hover on origin then to something other than dropdown content, then close
          var toEl = e.toElement || e.relatedTarget; // added browser compatibility for target element
          if(!$(toEl).closest('.dropdown-content').is(activates)) {
            activates.stop(true, true);
            hideDropdown();
            open = false;
          }
        });

        activates.on('mouseleave', function(e){ // Mouse out
          var toEl = e.toElement || e.relatedTarget;
          if(!$(toEl).closest('.dropdown-button').is(origin)) {
            activates.stop(true, true);
            hideDropdown();
            open = false;
          }
        });

        // Click
      } else {
        // Click handler to show dropdown
        origin.unbind('click.' + origin.attr('id'));
        origin.bind('click.'+origin.attr('id'), function(e){
          if (!isFocused) {
            if ( origin[0] == e.currentTarget &&
                 !origin.hasClass('active') &&
                 ($(e.target).closest('.dropdown-content').length === 0)) {
              e.preventDefault(); // Prevents button click from moving window
              if (options.stopPropagation) {
                e.stopPropagation();
              }
              placeDropdown('click');
            }
            // If origin is clicked and menu is open, close menu
            else if (origin.hasClass('active')) {
              hideDropdown();
              $(document).unbind('click.'+ activates.attr('id') + ' touchstart.' + activates.attr('id'));
            }
            // If menu open, add click close handler to document
            if (activates.hasClass('active')) {
              $(document).bind('click.'+ activates.attr('id') + ' touchstart.' + activates.attr('id'), function (e) {
                if (!activates.is(e.target) && !origin.is(e.target) && (!origin.find(e.target).length) ) {
                  hideDropdown();
                  $(document).unbind('click.'+ activates.attr('id') + ' touchstart.' + activates.attr('id'));
                }
              });
            }
          }
        });

      } // End else

      // Listen to open and close event - useful for select component
      origin.on('open', function(e, eventType) {
        placeDropdown(eventType);
      });
      origin.on('close', hideDropdown);


    });
  }; // End dropdown plugin

  $(document).ready(function(){
    $('.dropdown-button').dropdown();
  });
}( jQuery ));

(function ($) {
  $(document).ready(function() {

    // Function to update labels of text fields
    Materialize.updateTextFields = function() {
      var input_selector = 'input[type=text], input[type=password], input[type=email], input[type=url], input[type=tel], input[type=number], input[type=search], textarea';
      $(input_selector).each(function(index, element) {
        if ($(element).val().length > 0 || element.autofocus ||$(this).attr('placeholder') !== undefined || $(element)[0].validity.badInput === true) {
          $(this).siblings('label').addClass('active');
        }
        else {
          $(this).siblings('label').removeClass('active');
        }
      });
    };

    // Text based inputs
    var input_selector = 'input[type=text], input[type=password], input[type=email], input[type=url], input[type=tel], input[type=number], input[type=search], textarea';

    // Add active if form auto complete
    $(document).on('change', input_selector, function () {
      if($(this).val().length !== 0 || $(this).attr('placeholder') !== undefined) {
        $(this).siblings('label').addClass('active');
      }
      validate_field($(this));
    });

    // Add active if input element has been pre-populated on document ready
    $(document).ready(function() {
      Materialize.updateTextFields();
    });

    // HTML DOM FORM RESET handling
    $(document).on('reset', function(e) {
      var formReset = $(e.target);
      if (formReset.is('form')) {
        formReset.find(input_selector).removeClass('valid').removeClass('invalid');
        formReset.find(input_selector).each(function () {
          if ($(this).attr('value') === '') {
            $(this).siblings('label').removeClass('active');
          }
        });

        // Reset select
        formReset.find('select.initialized').each(function () {
          var reset_text = formReset.find('option[selected]').text();
          formReset.siblings('input.select-dropdown').val(reset_text);
        });
      }
    });

    // Add active when element has focus
    $(document).on('focus', input_selector, function () {
      $(this).siblings('label, .prefix').addClass('active');
    });

    $(document).on('blur', input_selector, function () {
      var $inputElement = $(this);
      var selector = ".prefix";

      if ($inputElement.val().length === 0 && $inputElement[0].validity.badInput !== true && $inputElement.attr('placeholder') === undefined) {
        selector += ", label";
      }

      $inputElement.siblings(selector).removeClass('active');

      validate_field($inputElement);
    });

    window.validate_field = function(object) {
      var hasLength = object.attr('length') !== undefined;
      var lenAttr = parseInt(object.attr('length'));
      var len = object.val().length;

      if (object.val().length === 0 && object[0].validity.badInput === false) {
        if (object.hasClass('validate')) {
          object.removeClass('valid');
          object.removeClass('invalid');
        }
      }
      else {
        if (object.hasClass('validate')) {
          // Check for character counter attributes
          if ((object.is(':valid') && hasLength && (len <= lenAttr)) || (object.is(':valid') && !hasLength)) {
            object.removeClass('invalid');
            object.addClass('valid');
          }
          else {
            object.removeClass('valid');
            object.addClass('invalid');
          }
        }
      }
    };

    // Radio and Checkbox focus class
    var radio_checkbox = 'input[type=radio], input[type=checkbox]';
    $(document).on('keyup.radio', radio_checkbox, function(e) {
      // TAB, check if tabbing to radio or checkbox.
      if (e.which === 9) {
        $(this).addClass('tabbed');
        var $this = $(this);
        $this.one('blur', function(e) {

          $(this).removeClass('tabbed');
        });
        return;
      }
    });

    // Textarea Auto Resize
    var hiddenDiv = $('.hiddendiv').first();
    if (!hiddenDiv.length) {
      hiddenDiv = $('<div class="hiddendiv common"></div>');
      $('body').append(hiddenDiv);
    }
    var text_area_selector = '.materialize-textarea';

    function textareaAutoResize($textarea) {
      // Set font properties of hiddenDiv

      var fontFamily = $textarea.css('font-family');
      var fontSize = $textarea.css('font-size');
      var lineHeight = $textarea.css('line-height');

      if (fontSize) { hiddenDiv.css('font-size', fontSize); }
      if (fontFamily) { hiddenDiv.css('font-family', fontFamily); }
      if (lineHeight) { hiddenDiv.css('line-height', lineHeight); }

      if ($textarea.attr('wrap') === "off") {
        hiddenDiv.css('overflow-wrap', "normal")
                 .css('white-space', "pre");
      }

      hiddenDiv.text($textarea.val() + '\n');
      var content = hiddenDiv.html().replace(/\n/g, '<br>');
      hiddenDiv.html(content);


      // When textarea is hidden, width goes crazy.
      // Approximate with half of window size

      if ($textarea.is(':visible')) {
        hiddenDiv.css('width', $textarea.width());
      }
      else {
        hiddenDiv.css('width', $(window).width()/2);
      }

      $textarea.css('height', hiddenDiv.height());
    }

    $(text_area_selector).each(function () {
      var $textarea = $(this);
      if ($textarea.val().length) {
        textareaAutoResize($textarea);
      }
    });

    $('body').on('keyup keydown autoresize', text_area_selector, function () {
      textareaAutoResize($(this));
    });

    // File Input Path
    $(document).on('change', '.file-field input[type="file"]', function () {
      var file_field = $(this).closest('.file-field');
      var path_input = file_field.find('input.file-path');
      var files      = $(this)[0].files;
      var file_names = [];
      for (var i = 0; i < files.length; i++) {
        file_names.push(files[i].name);
      }
      path_input.val(file_names.join(", "));
      path_input.trigger('change');
    });

    /****************
    *  Range Input  *
    ****************/

    var range_type = 'input[type=range]';
    var range_mousedown = false;
    var left;

    $(range_type).each(function () {
      var thumb = $('<span class="thumb"><span class="value"></span></span>');
      $(this).after(thumb);
    });

    var range_wrapper = '.range-field';
    $(document).on('change', range_type, function(e) {
      var thumb = $(this).siblings('.thumb');
      thumb.find('.value').html($(this).val());
    });

    $(document).on('input mousedown touchstart', range_type, function(e) {
      var thumb = $(this).siblings('.thumb');
      var width = $(this).outerWidth();

      // If thumb indicator does not exist yet, create it
      if (thumb.length <= 0) {
        thumb = $('<span class="thumb"><span class="value"></span></span>');
        $(this).after(thumb);
      }

      // Set indicator value
      thumb.find('.value').html($(this).val());

      range_mousedown = true;
      $(this).addClass('active');

      if (!thumb.hasClass('active')) {
        thumb.velocity({ height: "30px", width: "30px", top: "-20px", marginLeft: "-15px"}, { duration: 300, easing: 'easeOutExpo' });
      }

      if (e.type !== 'input') {
        if(e.pageX === undefined || e.pageX === null){//mobile
           left = e.originalEvent.touches[0].pageX - $(this).offset().left;
        }
        else{ // desktop
           left = e.pageX - $(this).offset().left;
        }
        if (left < 0) {
          left = 0;
        }
        else if (left > width) {
          left = width;
        }
        thumb.addClass('active').css('left', left);
      }

      thumb.find('.value').html($(this).val());
    });

    $(document).on('mouseup touchend', range_wrapper, function() {
      range_mousedown = false;
      $(this).removeClass('active');
    });

    $(document).on('mousemove touchmove', range_wrapper, function(e) {
      var thumb = $(this).children('.thumb');
      var left;
      if (range_mousedown) {
        if (!thumb.hasClass('active')) {
          thumb.velocity({ height: '30px', width: '30px', top: '-20px', marginLeft: '-15px'}, { duration: 300, easing: 'easeOutExpo' });
        }
        if (e.pageX === undefined || e.pageX === null) { //mobile
          left = e.originalEvent.touches[0].pageX - $(this).offset().left;
        }
        else{ // desktop
          left = e.pageX - $(this).offset().left;
        }
        var width = $(this).outerWidth();

        if (left < 0) {
          left = 0;
        }
        else if (left > width) {
          left = width;
        }
        thumb.addClass('active').css('left', left);
        thumb.find('.value').html(thumb.siblings(range_type).val());
      }
    });

    $(document).on('mouseout touchleave', range_wrapper, function() {
      if (!range_mousedown) {

        var thumb = $(this).children('.thumb');

        if (thumb.hasClass('active')) {
          thumb.velocity({ height: '0', width: '0', top: '10px', marginLeft: '-6px'}, { duration: 100 });
        }
        thumb.removeClass('active');
      }
    });

    /**************************
     * Auto complete plugin  *
     *************************/
    $.fn.autocomplete = function (options) {
      // Defaults
      var defaults = {
        data: {}
      };

      options = $.extend(defaults, options);

      return this.each(function() {
        var $input = $(this);
        var data = options.data,
            $inputDiv = $input.closest('.input-field'); // Div to append on

        // Check if data isn't empty
        if (!$.isEmptyObject(data)) {
          // Create autocomplete element
          var $autocomplete = $('<ul class="autocomplete-content dropdown-content"></ul>');

          // Append autocomplete element
          if ($inputDiv.length) {
            $inputDiv.append($autocomplete); // Set ul in body
          } else {
            $input.after($autocomplete);
          }

          var highlight = function(string, $el) {
            var img = $el.find('img');
            var matchStart = $el.text().toLowerCase().indexOf("" + string.toLowerCase() + ""),
                matchEnd = matchStart + string.length - 1,
                beforeMatch = $el.text().slice(0, matchStart),
                matchText = $el.text().slice(matchStart, matchEnd + 1),
                afterMatch = $el.text().slice(matchEnd + 1);
            $el.html("<span>" + beforeMatch + "<span class='highlight'>" + matchText + "</span>" + afterMatch + "</span>");
            if (img.length) {
              $el.prepend(img);
            }
          };

          // Perform search
          $input.on('keyup', function (e) {
            // Capture Enter
            if (e.which === 13) {
              $autocomplete.find('li').first().click();
              return;
            }

            var val = $input.val().toLowerCase();
            $autocomplete.empty();

            // Check if the input isn't empty
            if (val !== '') {
              for(var key in data) {
                if (data.hasOwnProperty(key) &&
                    key.toLowerCase().indexOf(val) !== -1 &&
                    key.toLowerCase() !== val) {
                  var autocompleteOption = $('<li></li>');
                  if(!!data[key]) {
                    autocompleteOption.append('<img src="'+ data[key] +'" class="right circle"><span>'+ key +'</span>');
                  } else {
                    autocompleteOption.append('<span>'+ key +'</span>');
                  }
                  $autocomplete.append(autocompleteOption);

                  highlight(val, autocompleteOption);
                }
              }
            }
          });

          // Set input value
          $autocomplete.on('click', 'li', function () {
            $input.val($(this).text().trim());
            $autocomplete.empty();
          });
        }
      });
    };

  }); // End of $(document).ready

  /*******************
   *  Select Plugin  *
   ******************/
  $.fn.material_select = function (callback) {
    $(this).each(function(){
      var $select = $(this);

      if ($select.hasClass('browser-default')) {
        return; // Continue to next (return false breaks out of entire loop)
      }

      var multiple = $select.attr('multiple') ? true : false,
          lastID = $select.data('select-id'); // Tear down structure if Select needs to be rebuilt

      if (lastID) {
        $select.parent().find('span.caret').remove();
        $select.parent().find('input').remove();

        $select.unwrap();
        $('ul#select-options-'+lastID).remove();
      }

      // If destroying the select, remove the selelct-id and reset it to it's uninitialized state.
      if(callback === 'destroy') {
        $select.data('select-id', null).removeClass('initialized');
        return;
      }

      var uniqueID = Materialize.guid();
      $select.data('select-id', uniqueID);
      var wrapper = $('<div class="select-wrapper"></div>');
      wrapper.addClass($select.attr('class'));
      var options = $('<ul id="select-options-' + uniqueID +'" class="dropdown-content select-dropdown ' + (multiple ? 'multiple-select-dropdown' : '') + '"></ul>'),
          selectChildren = $select.children('option, optgroup'),
          valuesSelected = [],
          optionsHover = false;

      var label = $select.find('option:selected').html() || $select.find('option:first').html() || "";

      // Function that renders and appends the option taking into
      // account type and possible image icon.
      var appendOptionWithIcon = function(select, option, type) {
        // Add disabled attr if disabled
        var disabledClass = (option.is(':disabled')) ? 'disabled ' : '';
        var optgroupClass = (type === 'optgroup-option') ? 'optgroup-option ' : '';

        // add icons
        var icon_url = option.data('icon');
        var classes = option.attr('class');
        if (!!icon_url) {
          var classString = '';
          if (!!classes) classString = ' class="' + classes + '"';

          // Check for multiple type.
          if (type === 'multiple') {
            options.append($('<li class="' + disabledClass + '"><img src="' + icon_url + '"' + classString + '><span><input type="checkbox"' + disabledClass + '/><label></label>' + option.html() + '</span></li>'));
          } else {
            options.append($('<li class="' + disabledClass + optgroupClass + '"><img src="' + icon_url + '"' + classString + '><span>' + option.html() + '</span></li>'));
          }
          return true;
        }

        // Check for multiple type.
        if (type === 'multiple') {
          options.append($('<li class="' + disabledClass + '"><span><input type="checkbox"' + disabledClass + '/><label></label>' + option.html() + '</span></li>'));
        } else {
          options.append($('<li class="' + disabledClass + optgroupClass + '"><span>' + option.html() + '</span></li>'));
        }
      };

      /* Create dropdown structure. */
      if (selectChildren.length) {
        selectChildren.each(function() {
          if ($(this).is('option')) {
            // Direct descendant option.
            if (multiple) {
              appendOptionWithIcon($select, $(this), 'multiple');

            } else {
              appendOptionWithIcon($select, $(this));
            }
          } else if ($(this).is('optgroup')) {
            // Optgroup.
            var selectOptions = $(this).children('option');
            options.append($('<li class="optgroup"><span>' + $(this).attr('label') + '</span></li>'));

            selectOptions.each(function() {
              appendOptionWithIcon($select, $(this), 'optgroup-option');
            });
          }
        });
      }

      options.find('li:not(.optgroup)').each(function (i) {
        $(this).click(function (e) {
          // Check if option element is disabled
          if (!$(this).hasClass('disabled') && !$(this).hasClass('optgroup')) {
            var selected = true;

            if (multiple) {
              $('input[type="checkbox"]', this).prop('checked', function(i, v) { return !v; });
              selected = toggleEntryFromArray(valuesSelected, $(this).index(), $select);
              $newSelect.trigger('focus');
            } else {
              options.find('li').removeClass('active');
              $(this).toggleClass('active');
              $newSelect.val($(this).text());
            }

            activateOption(options, $(this));
            $select.find('option').eq(i).prop('selected', selected);
            // Trigger onchange() event
            $select.trigger('change');
            if (typeof callback !== 'undefined') callback();
          }

          e.stopPropagation();
        });
      });

      // Wrap Elements
      $select.wrap(wrapper);
      // Add Select Display Element
      var dropdownIcon = $('<span class="caret">&#9660;</span>');
      if ($select.is(':disabled'))
        dropdownIcon.addClass('disabled');

      // escape double quotes
      var sanitizedLabelHtml = label.replace(/"/g, '&quot;');

      var $newSelect = $('<input type="text" class="select-dropdown" readonly="true" ' + (($select.is(':disabled')) ? 'disabled' : '') + ' data-activates="select-options-' + uniqueID +'" value="'+ sanitizedLabelHtml +'"/>');
      $select.before($newSelect);
      $newSelect.before(dropdownIcon);

      $newSelect.after(options);
      // Check if section element is disabled
      if (!$select.is(':disabled')) {
        $newSelect.dropdown({'hover': false, 'closeOnClick': false});
      }

      // Copy tabindex
      if ($select.attr('tabindex')) {
        $($newSelect[0]).attr('tabindex', $select.attr('tabindex'));
      }

      $select.addClass('initialized');

      $newSelect.on({
        'focus': function (){
          if ($('ul.select-dropdown').not(options[0]).is(':visible')) {
            $('input.select-dropdown').trigger('close');
          }
          if (!options.is(':visible')) {
            $(this).trigger('open', ['focus']);
            var label = $(this).val();
            var selectedOption = options.find('li').filter(function() {
              return $(this).text().toLowerCase() === label.toLowerCase();
            })[0];
            activateOption(options, selectedOption);
          }
        },
        'click': function (e){
          e.stopPropagation();
        }
      });

      $newSelect.on('blur', function() {
        if (!multiple) {
          $(this).trigger('close');
        }
        options.find('li.selected').removeClass('selected');
      });

      options.hover(function() {
        optionsHover = true;
      }, function () {
        optionsHover = false;
      });

      $(window).on({
        'click': function () {
          multiple && (optionsHover || $newSelect.trigger('close'));
        }
      });

      // Add initial multiple selections.
      if (multiple) {
        $select.find("option:selected:not(:disabled)").each(function () {
          var index = $(this).index();

          toggleEntryFromArray(valuesSelected, index, $select);
          options.find("li").eq(index).find(":checkbox").prop("checked", true);
        });
      }

      // Make option as selected and scroll to selected position
      var activateOption = function(collection, newOption) {
        if (newOption) {
          collection.find('li.selected').removeClass('selected');
          var option = $(newOption);
          option.addClass('selected');
          options.scrollTo(option);
        }
      };

      // Allow user to search by typing
      // this array is cleared after 1 second
      var filterQuery = [],
          onKeyDown = function(e){
            // TAB - switch to another input
            if(e.which == 9){
              $newSelect.trigger('close');
              return;
            }

            // ARROW DOWN WHEN SELECT IS CLOSED - open select options
            if(e.which == 40 && !options.is(':visible')){
              $newSelect.trigger('open');
              return;
            }

            // ENTER WHEN SELECT IS CLOSED - submit form
            if(e.which == 13 && !options.is(':visible')){
              return;
            }

            e.preventDefault();

            // CASE WHEN USER TYPE LETTERS
            var letter = String.fromCharCode(e.which).toLowerCase(),
                nonLetters = [9,13,27,38,40];
            if (letter && (nonLetters.indexOf(e.which) === -1)) {
              filterQuery.push(letter);

              var string = filterQuery.join(''),
                  newOption = options.find('li').filter(function() {
                    return $(this).text().toLowerCase().indexOf(string) === 0;
                  })[0];

              if (newOption) {
                activateOption(options, newOption);
              }
            }

            // ENTER - select option and close when select options are opened
            if (e.which == 13) {
              var activeOption = options.find('li.selected:not(.disabled)')[0];
              if(activeOption){
                $(activeOption).trigger('click');
                if (!multiple) {
                  $newSelect.trigger('close');
                }
              }
            }

            // ARROW DOWN - move to next not disabled option
            if (e.which == 40) {
              if (options.find('li.selected').length) {
                newOption = options.find('li.selected').next('li:not(.disabled)')[0];
              } else {
                newOption = options.find('li:not(.disabled)')[0];
              }
              activateOption(options, newOption);
            }

            // ESC - close options
            if (e.which == 27) {
              $newSelect.trigger('close');
            }

            // ARROW UP - move to previous not disabled option
            if (e.which == 38) {
              newOption = options.find('li.selected').prev('li:not(.disabled)')[0];
              if(newOption)
                activateOption(options, newOption);
            }

            // Automaticaly clean filter query so user can search again by starting letters
            setTimeout(function(){ filterQuery = []; }, 1000);
          };

      $newSelect.on('keydown', onKeyDown);
    });

    function toggleEntryFromArray(entriesArray, entryIndex, select) {
      var index = entriesArray.indexOf(entryIndex),
          notAdded = index === -1;

      if (notAdded) {
        entriesArray.push(entryIndex);
      } else {
        entriesArray.splice(index, 1);
      }

      select.siblings('ul.dropdown-content').find('li').eq(entryIndex).toggleClass('active');

      // use notAdded instead of true (to detect if the option is selected or not)
      select.find('option').eq(entryIndex).prop('selected', notAdded);
      setValueToInput(entriesArray, select);

      return notAdded;
    }

    function setValueToInput(entriesArray, select) {
      var value = '';

      for (var i = 0, count = entriesArray.length; i < count; i++) {
        var text = select.find('option').eq(entriesArray[i]).text();

        i === 0 ? value += text : value += ', ' + text;
      }

      if (value === '') {
        value = select.find('option:disabled').eq(0).text();
      }

      select.siblings('input.select-dropdown').val(value);
    }
  };

}( jQuery ));

// Required for Meteor package, the use of window prevents export by Meteor
(function(window){
  if(window.Package){
    Materialize = {};
  } else {
    window.Materialize = {};
  }
})(window);


// Unique ID
Materialize.guid = (function() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return function() {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
           s4() + '-' + s4() + s4() + s4();
  };
})();

Materialize.elementOrParentIsFixed = function(element) {
    var $element = $(element);
    var $checkElements = $element.add($element.parents());
    var isFixed = false;
    $checkElements.each(function(){
        if ($(this).css("position") === "fixed") {
            isFixed = true;
            return false;
        }
    });
    return isFixed;
};

// Velocity has conflicts when loaded with jQuery, this will check for it
var Vel;
if ($) {
  Vel = $.Velocity;
} else if (jQuery) {
  Vel = jQuery.Velocity;
} else {
  Vel = Velocity;
}

(function($){
  $(function(){

    var window_width = $(window).width();

    // convert rgb to hex value string
    function rgb2hex(rgb) {
      if (/^#[0-9A-F]{6}$/i.test(rgb)) { return rgb; }

      rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);

      if (rgb === null) { return "N/A"; }

      function hex(x) {
          return ("0" + parseInt(x).toString(16)).slice(-2);
      }

      return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
    }

    $('.dynamic-color .col').each(function () {
      $(this).children().each(function () {
        var color = $(this).css('background-color'),
            classes = $(this).attr('class');
        $(this).html(rgb2hex(color) + " " + classes);
        if (classes.indexOf("darken") >= 0 || $(this).hasClass('black')) {
          $(this).css('color', 'rgba(255,255,255,.9');
        }
      });
    });

    // Floating-Fixed table of contents
    setTimeout(function() {
      var tocWrapperHeight = 260; // Max height of ads.
      var tocHeight = $('.toc-wrapper .table-of-contents').length ? $('.toc-wrapper .table-of-contents').height() : 0;
      var socialHeight = 95; // Height of unloaded social media in footer.
      var footerOffset = $('body > footer').first().length ? $('body > footer').first().offset().top : 0;
      var bottomOffset = footerOffset - socialHeight - tocHeight - tocWrapperHeight;

      if ($('nav').length) {
        $('.toc-wrapper').pushpin({
          top: $('nav').height(),
          bottom: bottomOffset
        });
      }
      else if ($('#index-banner').length) {
        $('.toc-wrapper').pushpin({
          top: $('#index-banner').height(),
          bottom: bottomOffset
        });
      }
      else {
        $('.toc-wrapper').pushpin({
          top: 0,
          bottom: bottomOffset
        });
      }
    }, 100);


    // BuySellAds Detection
    var $bsa = $(".buysellads"),
        $timesToCheck = 3;
    function checkForChanges() {
        if (!$bsa.find('#carbonads').length) {
          $timesToCheck -= 1;
          if ($timesToCheck >= 0) {
            setTimeout(checkForChanges, 500);
          }
          else {
            var donateAd = $('<div id="carbonads"><span><a class="carbon-text" href="#!" onclick="document.getElementById(\'paypal-donate\').submit();"> Help support us by turning off adblock. If you still prefer to keep adblock on for this page but still want to support us, feel free to donate. Any little bit helps.</a></form></span></div>');

            $bsa.append(donateAd);
          }
        }

    }
    checkForChanges();


    // Github Latest Commit
    if ($('.github-commit').length) { // Checks if widget div exists (Index only)
      $.ajax({
        url: "https://api.github.com/repos/dogfalo/materialize/commits/master",
        dataType: "json",
        success: function (data) {
          var sha = data.sha,
              date = jQuery.timeago(data.commit.author.date);
          if (window_width < 1120) {
            sha = sha.substring(0,7);
          }
          $('.github-commit').find('.date').html(date);
          $('.github-commit').find('.sha').html(sha).attr('href', data.html_url);
        }
      });
    }

    // Toggle Flow Text
    var toggleFlowTextButton = $('#flow-toggle');
    toggleFlowTextButton.click( function(){
      $('#flow-text-demo').children('p').each(function(){
          $(this).toggleClass('flow-text');
        });
    });

//    Toggle Containers on page
    var toggleContainersButton = $('#container-toggle-button');
    toggleContainersButton.click(function(){
      $('body .browser-window .container, .had-container').each(function(){
        $(this).toggleClass('had-container');
        $(this).toggleClass('container');
        if ($(this).hasClass('container')) {
          toggleContainersButton.text("Turn off Containers");
        }
        else {
          toggleContainersButton.text("Turn on Containers");
        }
      });
    });

    // Detect touch screen and enable scrollbar if necessary
    function is_touch_device() {
      try {
        document.createEvent("TouchEvent");
        return true;
      } catch (e) {
        return false;
      }
    }
    if (is_touch_device()) {
      $('#nav-mobile').css({ overflow: 'auto'});
    }

    // Set checkbox on forms.html to indeterminate
    var indeterminateCheckbox = document.getElementById('indeterminate-checkbox');
    if (indeterminateCheckbox !== null)
      indeterminateCheckbox.indeterminate = true;


    // Plugin initialization
    $('.carousel.carousel-slider').carousel({full_width: true});
    $('.carousel').carousel();
    $('.slider').slider({full_width: true});
    $('.parallax').parallax();
    $('.modal-trigger').leanModal();
    $('.scrollspy').scrollSpy();
    $('.button-collapse').sideNav({'edge': 'left'});
    $('select').not('.disabled').material_select();
    $('input.autocomplete').autocomplete({
      data: {"Apple": null, "Microsoft": null, "Google": 'http://placehold.it/250x250'}
    });

    $('.chips-initial').material_chip({
      readOnly: true,
      data: [{
        tag: 'Apple',
      }, {
        tag: 'Microsoft',
      }, {
        tag: 'Google',
      }]
    });

    $('.chips-placeholder').material_chip({
      placeholder: 'Enter a tag',
      secondaryPlaceholder: '+Tag',
    });

    $('.chips').material_chip();

  }); // end of document ready
})(jQuery); // end of jQuery name space

// Check for jQuery.
if (typeof(jQuery) === 'undefined') {
  var jQuery;
  // Check if require is a defined function.
  if (typeof(require) === 'function') {
    jQuery = $ = require('jquery');
  // Else use the dollar sign alias.
  } else {
    jQuery = $;
  }
}

(function($) {
    var _stack = 0,
    _lastID = 0,
    _generateID = function() {
      _lastID++;
      return 'materialize-lean-overlay-' + _lastID;
    };

  $.fn.extend({
    openModal: function(options) {

      var $body = $('body');
      var oldWidth = $body.innerWidth();
      $body.css('overflow', 'hidden');
      $body.width(oldWidth);

      var defaults = {
        opacity: 0.5,
        in_duration: 350,
        out_duration: 250,
        ready: undefined,
        complete: undefined,
        dismissible: true,
        starting_top: '4%',
        ending_top: '10%'
      };
      var $modal = $(this);

      if ($modal.hasClass('open')) {
        return;
      }

      var overlayID = _generateID();
      var $overlay = $('<div class="lean-overlay"></div>');
      lStack = (++_stack);

      // Store a reference of the overlay
      $overlay.attr('id', overlayID).css('z-index', 1000 + lStack * 2);
      $modal.data('overlay-id', overlayID).css('z-index', 1000 + lStack * 2 + 1);
      $modal.addClass('open');

      $("body").append($overlay);

      // Override defaults
      options = $.extend(defaults, options);

      if (options.dismissible) {
        $overlay.click(function() {
          $modal.closeModal(options);
        });
        // Return on ESC
        $(document).on('keyup.leanModal' + overlayID, function(e) {
          if (e.keyCode === 27) {   // ESC key
            $modal.closeModal(options);
          }
        });
      }

      $modal.find(".modal-close").on('click.close', function(e) {
        $modal.closeModal(options);
      });

      $overlay.css({ display : "block", opacity : 0 });

      $modal.css({
        display : "block",
        opacity: 0
      });

      $overlay.velocity({opacity: options.opacity}, {duration: options.in_duration, queue: false, ease: "easeOutCubic"});
      $modal.data('associated-overlay', $overlay[0]);

      // Define Bottom Sheet animation
      if ($modal.hasClass('bottom-sheet')) {
        $modal.velocity({bottom: "0", opacity: 1}, {
          duration: options.in_duration,
          queue: false,
          ease: "easeOutCubic",
          // Handle modal ready callback
          complete: function() {
            if (typeof(options.ready) === "function") {
              options.ready();
            }
          }
        });
      }
      else {
        $.Velocity.hook($modal, "scaleX", 0.7);
        $modal.css({ top: options.starting_top });
        $modal.velocity({top: options.ending_top, opacity: 1, scaleX: '1'}, {
          duration: options.in_duration,
          queue: false,
          ease: "easeOutCubic",
          // Handle modal ready callback
          complete: function() {
            if (typeof(options.ready) === "function") {
              options.ready();
            }
          }
        });
      }


    }
  });

  $.fn.extend({
    closeModal: function(options) {
      var defaults = {
        out_duration: 250,
        complete: undefined
      };
      var $modal = $(this);
      var overlayID = $modal.data('overlay-id');
      var $overlay = $('#' + overlayID);
      $modal.removeClass('open');

      options = $.extend(defaults, options);

      // Enable scrolling
      $('body').css({
        overflow: '',
        width: ''
      });

      $modal.find('.modal-close').off('click.close');
      $(document).off('keyup.leanModal' + overlayID);

      $overlay.velocity( { opacity: 0}, {duration: options.out_duration, queue: false, ease: "easeOutQuart"});


      // Define Bottom Sheet animation
      if ($modal.hasClass('bottom-sheet')) {
        $modal.velocity({bottom: "-100%", opacity: 0}, {
          duration: options.out_duration,
          queue: false,
          ease: "easeOutCubic",
          // Handle modal ready callback
          complete: function() {
            $overlay.css({display:"none"});

            // Call complete callback
            if (typeof(options.complete) === "function") {
              options.complete();
            }
            $overlay.remove();
            _stack--;
          }
        });
      }
      else {
        $modal.velocity(
          { top: options.starting_top, opacity: 0, scaleX: 0.7}, {
          duration: options.out_duration,
          complete:
            function() {

              $(this).css('display', 'none');
              // Call complete callback
              if (typeof(options.complete) === "function") {
                options.complete();
              }
              $overlay.remove();
              _stack--;
            }
          }
        );
      }
    }
  });

  $.fn.extend({
    leanModal: function(option) {
      return this.each(function() {

        var defaults = {
          starting_top: '4%'
        },
        // Override defaults
        options = $.extend(defaults, option);

        // Close Handlers
        $(this).click(function(e) {
          options.starting_top = ($(this).offset().top - $(window).scrollTop()) /1.15;
          var modal_id = $(this).attr("href") || '#' + $(this).data('target');
          $(modal_id).openModal(options);
          e.preventDefault();
        }); // done set on click
      }); // done return
    }
  });
})(jQuery);

(function ($) {

  $.fn.materialbox = function () {

    return this.each(function() {

      if ($(this).hasClass('initialized')) {
        return;
      }

      $(this).addClass('initialized');

      var overlayActive = false;
      var doneAnimating = true;
      var inDuration = 275;
      var outDuration = 200;
      var origin = $(this);
      var placeholder = $('<div></div>').addClass('material-placeholder');
      var originalWidth = 0;
      var originalHeight = 0;
      var ancestorsChanged;
      var ancestor;
      origin.wrap(placeholder);


      origin.on('click', function(){
        var placeholder = origin.parent('.material-placeholder');
        var windowWidth = window.innerWidth;
        var windowHeight = window.innerHeight;
        var originalWidth = origin.width();
        var originalHeight = origin.height();


        // If already modal, return to original
        if (doneAnimating === false) {
          returnToOriginal();
          return false;
        }
        else if (overlayActive && doneAnimating===true) {
          returnToOriginal();
          return false;
        }


        // Set states
        doneAnimating = false;
        origin.addClass('active');
        overlayActive = true;

        // Set positioning for placeholder
        placeholder.css({
          width: placeholder[0].getBoundingClientRect().width,
          height: placeholder[0].getBoundingClientRect().height,
          position: 'relative',
          top: 0,
          left: 0
        });

        // Find ancestor with overflow: hidden; and remove it
        ancestorsChanged = undefined;
        ancestor = placeholder[0].parentNode;
        var count = 0;
        while (ancestor !== null && !$(ancestor).is(document)) {
          var curr = $(ancestor);
          if (curr.css('overflow') !== 'visible') {
            curr.css('overflow', 'visible');
            if (ancestorsChanged === undefined) {
              ancestorsChanged = curr;
            }
            else {
              ancestorsChanged = ancestorsChanged.add(curr);
            }
          }
          ancestor = ancestor.parentNode;
        }

        // Set css on origin
        origin.css({position: 'absolute', 'z-index': 1000})
        .data('width', originalWidth)
        .data('height', originalHeight);

        // Add overlay
        var overlay = $('<div id="materialbox-overlay"></div>')
          .css({
            opacity: 0
          })
          .click(function(){
            if (doneAnimating === true)
            returnToOriginal();
          });
          // Animate Overlay
          // Put before in origin image to preserve z-index layering.
          origin.before(overlay);
          overlay.velocity({opacity: 1},
                           {duration: inDuration, queue: false, easing: 'easeOutQuad'} );

        // Add and animate caption if it exists
        if (origin.data('caption') !== "") {
          var $photo_caption = $('<div class="materialbox-caption"></div>');
          $photo_caption.text(origin.data('caption'));
          $('body').append($photo_caption);
          $photo_caption.css({ "display": "inline" });
          $photo_caption.velocity({opacity: 1}, {duration: inDuration, queue: false, easing: 'easeOutQuad'});
        }

        // Resize Image
        var ratio = 0;
        var widthPercent = originalWidth / windowWidth;
        var heightPercent = originalHeight / windowHeight;
        var newWidth = 0;
        var newHeight = 0;

        if (widthPercent > heightPercent) {
          ratio = originalHeight / originalWidth;
          newWidth = windowWidth * 0.9;
          newHeight = windowWidth * 0.9 * ratio;
        }
        else {
          ratio = originalWidth / originalHeight;
          newWidth = (windowHeight * 0.9) * ratio;
          newHeight = windowHeight * 0.9;
        }

        // Animate image + set z-index
        if(origin.hasClass('responsive-img')) {
          origin.velocity({'max-width': newWidth, 'width': originalWidth}, {duration: 0, queue: false,
            complete: function(){
              origin.css({left: 0, top: 0})
              .velocity(
                {
                  height: newHeight,
                  width: newWidth,
                  left: $(document).scrollLeft() + windowWidth/2 - origin.parent('.material-placeholder').offset().left - newWidth/2,
                  top: $(document).scrollTop() + windowHeight/2 - origin.parent('.material-placeholder').offset().top - newHeight/ 2
                },
                {
                  duration: inDuration,
                  queue: false,
                  easing: 'easeOutQuad',
                  complete: function(){doneAnimating = true;}
                }
              );
            } // End Complete
          }); // End Velocity
        }
        else {
          origin.css('left', 0)
          .css('top', 0)
          .velocity(
            {
              height: newHeight,
              width: newWidth,
              left: $(document).scrollLeft() + windowWidth/2 - origin.parent('.material-placeholder').offset().left - newWidth/2,
              top: $(document).scrollTop() + windowHeight/2 - origin.parent('.material-placeholder').offset().top - newHeight/ 2
            },
            {
              duration: inDuration,
              queue: false,
              easing: 'easeOutQuad',
              complete: function(){doneAnimating = true;}
            }
            ); // End Velocity
        }

    }); // End origin on click


      // Return on scroll
      $(window).scroll(function() {
        if (overlayActive) {
          returnToOriginal();
        }
      });

      // Return on ESC
      $(document).keyup(function(e) {

        if (e.keyCode === 27 && doneAnimating === true) {   // ESC key
          if (overlayActive) {
            returnToOriginal();
          }
        }
      });


      // This function returns the modaled image to the original spot
      function returnToOriginal() {

          doneAnimating = false;

          var placeholder = origin.parent('.material-placeholder');
          var windowWidth = window.innerWidth;
          var windowHeight = window.innerHeight;
          var originalWidth = origin.data('width');
          var originalHeight = origin.data('height');

          origin.velocity("stop", true);
          $('#materialbox-overlay').velocity("stop", true);
          $('.materialbox-caption').velocity("stop", true);


          $('#materialbox-overlay').velocity({opacity: 0}, {
            duration: outDuration, // Delay prevents animation overlapping
            queue: false, easing: 'easeOutQuad',
            complete: function(){
              // Remove Overlay
              overlayActive = false;
              $(this).remove();
            }
          });

          // Resize Image
          origin.velocity(
            {
              width: originalWidth,
              height: originalHeight,
              left: 0,
              top: 0
            },
            {
              duration: outDuration,
              queue: false, easing: 'easeOutQuad'
            }
          );

          // Remove Caption + reset css settings on image
          $('.materialbox-caption').velocity({opacity: 0}, {
            duration: outDuration, // Delay prevents animation overlapping
            queue: false, easing: 'easeOutQuad',
            complete: function(){
              placeholder.css({
                height: '',
                width: '',
                position: '',
                top: '',
                left: ''
              });

              origin.css({
                height: '',
                top: '',
                left: '',
                width: '',
                'max-width': '',
                position: '',
                'z-index': ''
              });

              // Remove class
              origin.removeClass('active');
              doneAnimating = true;
              $(this).remove();

              // Remove overflow overrides on ancestors
              if (ancestorsChanged) {
                ancestorsChanged.css('overflow', '');
              }
            }
          });

        }
        });
};

$(document).ready(function(){
  $('.materialboxed').materialbox();
});

}( jQuery ));

(function ($) {

    $.fn.parallax = function () {
      var window_width = $(window).width();
      // Parallax Scripts
      return this.each(function(i) {
        var $this = $(this);
        $this.addClass('parallax');

        function updateParallax(initial) {
          var container_height;
          if (window_width < 601) {
            container_height = ($this.height() > 0) ? $this.height() : $this.children("img").height();
          }
          else {
            container_height = ($this.height() > 0) ? $this.height() : 500;
          }
          var $img = $this.children("img").first();
          var img_height = $img.height();
          var parallax_dist = img_height - container_height;
          var bottom = $this.offset().top + container_height;
          var top = $this.offset().top;
          var scrollTop = $(window).scrollTop();
          var windowHeight = window.innerHeight;
          var windowBottom = scrollTop + windowHeight;
          var percentScrolled = (windowBottom - top) / (container_height + windowHeight);
          var parallax = Math.round((parallax_dist * percentScrolled));

          if (initial) {
            $img.css('display', 'block');
          }
          if ((bottom > scrollTop) && (top < (scrollTop + windowHeight))) {
            $img.css('transform', "translate3D(-50%," + parallax + "px, 0)");
          }

        }

        // Wait for image load
        $this.children("img").one("load", function() {
          updateParallax(true);
        }).each(function() {
          if(this.complete) $(this).load();
        });

        $(window).scroll(function() {
          window_width = $(window).width();
          updateParallax(false);
        });

        $(window).resize(function() {
          window_width = $(window).width();
          updateParallax(false);
        });

      });

    };
}( jQuery ));
/* http://prismjs.com/download.html?themes=prism&languages=markup+css+clike+javascript+scss+bash */
self="undefined"!=typeof window?window:"undefined"!=typeof WorkerGlobalScope&&self instanceof WorkerGlobalScope?self:{};var Prism=function(){var e=/\blang(?:uage)?-(?!\*)(\w+)\b/i,t=self.Prism={util:{encode:function(e){return e instanceof n?new n(e.type,t.util.encode(e.content),e.alias):"Array"===t.util.type(e)?e.map(t.util.encode):e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/\u00a0/g," ")},type:function(e){return Object.prototype.toString.call(e).match(/\[object (\w+)\]/)[1]},clone:function(e){var n=t.util.type(e);switch(n){case"Object":var a={};for(var r in e)e.hasOwnProperty(r)&&(a[r]=t.util.clone(e[r]));return a;case"Array":return e.slice()}return e}},languages:{extend:function(e,n){var a=t.util.clone(t.languages[e]);for(var r in n)a[r]=n[r];return a},insertBefore:function(e,n,a,r){r=r||t.languages;var i=r[e];if(2==arguments.length){a=arguments[1];for(var l in a)a.hasOwnProperty(l)&&(i[l]=a[l]);return i}var s={};for(var o in i)if(i.hasOwnProperty(o)){if(o==n)for(var l in a)a.hasOwnProperty(l)&&(s[l]=a[l]);s[o]=i[o]}return t.languages.DFS(t.languages,function(t,n){n===r[e]&&t!=e&&(this[t]=s)}),r[e]=s},DFS:function(e,n,a){for(var r in e)e.hasOwnProperty(r)&&(n.call(e,r,e[r],a||r),"Object"===t.util.type(e[r])?t.languages.DFS(e[r],n):"Array"===t.util.type(e[r])&&t.languages.DFS(e[r],n,r))}},highlightAll:function(e,n){for(var a,r=document.querySelectorAll('code[class*="language-"], [class*="language-"] code, code[class*="lang-"], [class*="lang-"] code'),i=0;a=r[i++];)t.highlightElement(a,e===!0,n)},highlightElement:function(a,r,i){for(var l,s,o=a;o&&!e.test(o.className);)o=o.parentNode;if(o&&(l=(o.className.match(e)||[,""])[1],s=t.languages[l]),s){a.className=a.className.replace(e,"").replace(/\s+/g," ")+" language-"+l,o=a.parentNode,/pre/i.test(o.nodeName)&&(o.className=o.className.replace(e,"").replace(/\s+/g," ")+" language-"+l);var g=a.textContent;if(g){var u={element:a,language:l,grammar:s,code:g};if(t.hooks.run("before-highlight",u),r&&self.Worker){var c=new Worker(t.filename);c.onmessage=function(e){u.highlightedCode=n.stringify(JSON.parse(e.data),l),t.hooks.run("before-insert",u),u.element.innerHTML=u.highlightedCode,i&&i.call(u.element),t.hooks.run("after-highlight",u)},c.postMessage(JSON.stringify({language:u.language,code:u.code}))}else u.highlightedCode=t.highlight(u.code,u.grammar,u.language),t.hooks.run("before-insert",u),u.element.innerHTML=u.highlightedCode,i&&i.call(a),t.hooks.run("after-highlight",u)}}},highlight:function(e,a,r){var i=t.tokenize(e,a);return n.stringify(t.util.encode(i),r)},tokenize:function(e,n){var a=t.Token,r=[e],i=n.rest;if(i){for(var l in i)n[l]=i[l];delete n.rest}e:for(var l in n)if(n.hasOwnProperty(l)&&n[l]){var s=n[l];s="Array"===t.util.type(s)?s:[s];for(var o=0;o<s.length;++o){var g=s[o],u=g.inside,c=!!g.lookbehind,f=0,h=g.alias;g=g.pattern||g;for(var p=0;p<r.length;p++){var d=r[p];if(r.length>e.length)break e;if(!(d instanceof a)){g.lastIndex=0;var m=g.exec(d);if(m){c&&(f=m[1].length);var y=m.index-1+f,m=m[0].slice(f),v=m.length,k=y+v,b=d.slice(0,y+1),w=d.slice(k+1),O=[p,1];b&&O.push(b);var N=new a(l,u?t.tokenize(m,u):m,h);O.push(N),w&&O.push(w),Array.prototype.splice.apply(r,O)}}}}}return r},hooks:{all:{},add:function(e,n){var a=t.hooks.all;a[e]=a[e]||[],a[e].push(n)},run:function(e,n){var a=t.hooks.all[e];if(a&&a.length)for(var r,i=0;r=a[i++];)r(n)}}},n=t.Token=function(e,t,n){this.type=e,this.content=t,this.alias=n};if(n.stringify=function(e,a,r){if("string"==typeof e)return e;if("[object Array]"==Object.prototype.toString.call(e))return e.map(function(t){return n.stringify(t,a,e)}).join("");var i={type:e.type,content:n.stringify(e.content,a,r),tag:"span",classes:["token",e.type],attributes:{},language:a,parent:r};if("comment"==i.type&&(i.attributes.spellcheck="true"),e.alias){var l="Array"===t.util.type(e.alias)?e.alias:[e.alias];Array.prototype.push.apply(i.classes,l)}t.hooks.run("wrap",i);var s="";for(var o in i.attributes)s+=o+'="'+(i.attributes[o]||"")+'"';return"<"+i.tag+' class="'+i.classes.join(" ")+'" '+s+">"+i.content+"</"+i.tag+">"},!self.document)return self.addEventListener?(self.addEventListener("message",function(e){var n=JSON.parse(e.data),a=n.language,r=n.code;self.postMessage(JSON.stringify(t.util.encode(t.tokenize(r,t.languages[a])))),self.close()},!1),self.Prism):self.Prism;var a=document.getElementsByTagName("script");return a=a[a.length-1],a&&(t.filename=a.src,document.addEventListener&&!a.hasAttribute("data-manual")&&document.addEventListener("DOMContentLoaded",t.highlightAll)),self.Prism}();"undefined"!=typeof module&&module.exports&&(module.exports=Prism);;
Prism.languages.markup={comment:/<!--[\w\W]*?-->/g,prolog:/<\?.+?\?>/,doctype:/<!DOCTYPE.+?>/,cdata:/<!\[CDATA\[[\w\W]*?]]>/i,tag:{pattern:/<\/?[\w:-]+\s*(?:\s+[\w:-]+(?:=(?:("|')(\\?[\w\W])*?\1|[^\s'">=]+))?\s*)*\/?>/gi,inside:{tag:{pattern:/^<\/?[\w:-]+/i,inside:{punctuation:/^<\/?/,namespace:/^[\w-]+?:/}},"attr-value":{pattern:/=(?:('|")[\w\W]*?(\1)|[^\s>]+)/gi,inside:{punctuation:/=|>|"/g}},punctuation:/\/?>/g,"attr-name":{pattern:/[\w:-]+/g,inside:{namespace:/^[\w-]+?:/}}}},entity:/\&#?[\da-z]{1,8};/gi},Prism.hooks.add("wrap",function(t){"entity"===t.type&&(t.attributes.title=t.content.replace(/&amp;/,"&"))});;
Prism.languages.css={comment:/\/\*[\w\W]*?\*\//g,atrule:{pattern:/@[\w-]+?.*?(;|(?=\s*{))/gi,inside:{punctuation:/[;:]/g}},url:/url\((["']?).*?\1\)/gi,selector:/[^\{\}\s][^\{\};]*(?=\s*\{)/g,property:/(\b|\B)[\w-]+(?=\s*:)/gi,string:/("|')(\\?.)*?\1/g,important:/\B!important\b/gi,punctuation:/[\{\};:]/g,"function":/[-a-z0-9]+(?=\()/gi},Prism.languages.markup&&(Prism.languages.insertBefore("markup","tag",{style:{pattern:/<style[\w\W]*?>[\w\W]*?<\/style>/gi,inside:{tag:{pattern:/<style[\w\W]*?>|<\/style>/gi,inside:Prism.languages.markup.tag.inside},rest:Prism.languages.css},alias:"language-css"}}),Prism.languages.insertBefore("inside","attr-value",{"style-attr":{pattern:/\s*style=("|').+?\1/gi,inside:{"attr-name":{pattern:/^\s*style/gi,inside:Prism.languages.markup.tag.inside},punctuation:/^\s*=\s*['"]|['"]\s*$/,"attr-value":{pattern:/.+/gi,inside:Prism.languages.css}},alias:"language-css"}},Prism.languages.markup.tag));;
Prism.languages.clike={comment:[{pattern:/(^|[^\\])\/\*[\w\W]*?\*\//g,lookbehind:!0},{pattern:/(^|[^\\:])\/\/.*?(\r?\n|$)/g,lookbehind:!0}],string:/("|')(\\?.)*?\1/g,"class-name":{pattern:/((?:(?:class|interface|extends|implements|trait|instanceof|new)\s+)|(?:catch\s+\())[a-z0-9_\.\\]+/gi,lookbehind:!0,inside:{punctuation:/(\.|\\)/}},keyword:/\b(if|else|while|do|for|return|in|instanceof|function|new|try|throw|catch|finally|null|break|continue)\b/g,"boolean":/\b(true|false)\b/g,"function":{pattern:/[a-z0-9_]+\(/gi,inside:{punctuation:/\(/}},number:/\b-?(0x[\dA-Fa-f]+|\d*\.?\d+([Ee]-?\d+)?)\b/g,operator:/[-+]{1,2}|!|<=?|>=?|={1,3}|&{1,2}|\|?\||\?|\*|\/|\~|\^|\%/g,ignore:/&(lt|gt|amp);/gi,punctuation:/[{}[\];(),.:]/g};;
Prism.languages.javascript=Prism.languages.extend("clike",{keyword:/\b(break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|false|finally|for|function|get|if|implements|import|in|instanceof|interface|let|new|null|package|private|protected|public|return|set|static|super|switch|this|throw|true|try|typeof|var|void|while|with|yield)\b/g,number:/\b-?(0x[\dA-Fa-f]+|\d*\.?\d+([Ee][+-]?\d+)?|NaN|-?Infinity)\b/g,"function":/(?!\d)[a-z0-9_$]+(?=\()/gi}),Prism.languages.insertBefore("javascript","keyword",{regex:{pattern:/(^|[^/])\/(?!\/)(\[.+?]|\\.|[^/\r\n])+\/[gim]{0,3}(?=\s*($|[\r\n,.;})]))/g,lookbehind:!0}}),Prism.languages.markup&&Prism.languages.insertBefore("markup","tag",{script:{pattern:/<script[\w\W]*?>[\w\W]*?<\/script>/gi,inside:{tag:{pattern:/<script[\w\W]*?>|<\/script>/gi,inside:Prism.languages.markup.tag.inside},rest:Prism.languages.javascript},alias:"language-javascript"}});;
Prism.languages.scss=Prism.languages.extend("css",{comment:{pattern:/(^|[^\\])(\/\*[\w\W]*?\*\/|\/\/.*?(\r?\n|$))/g,lookbehind:!0},atrule:/@[\w-]+(?=\s+(\(|\{|;))/gi,url:/([-a-z]+-)*url(?=\()/gi,selector:/([^@;\{\}\(\)]?([^@;\{\}\(\)]|&|\#\{\$[-_\w]+\})+)(?=\s*\{(\}|\s|[^\}]+(:|\{)[^\}]+))/gm}),Prism.languages.insertBefore("scss","atrule",{keyword:/@(if|else if|else|for|each|while|import|extend|debug|warn|mixin|include|function|return|content)|(?=@for\s+\$[-_\w]+\s)+from/i}),Prism.languages.insertBefore("scss","property",{variable:/((\$[-_\w]+)|(#\{\$[-_\w]+\}))/i}),Prism.languages.insertBefore("scss","ignore",{placeholder:/%[-_\w]+/i,statement:/\B!(default|optional)\b/gi,"boolean":/\b(true|false)\b/g,"null":/\b(null)\b/g,operator:/\s+([-+]{1,2}|={1,2}|!=|\|?\||\?|\*|\/|\%)\s+/g});;
Prism.languages.bash=Prism.languages.extend("clike",{comment:{pattern:/(^|[^"{\\])(#.*?(\r?\n|$))/g,lookbehind:!0},string:{pattern:/("|')(\\?[\s\S])*?\1/g,inside:{property:/\$([a-zA-Z0-9_#\?\-\*!@]+|\{[^\}]+\})/g}},keyword:/\b(if|then|else|elif|fi|for|break|continue|while|in|case|function|select|do|done|until|echo|exit|return|set|declare)\b/g}),Prism.languages.insertBefore("bash","keyword",{property:/\$([a-zA-Z0-9_#\?\-\*!@]+|\{[^}]+\})/g}),Prism.languages.insertBefore("bash","comment",{important:/(^#!\s*\/bin\/bash)|(^#!\s*\/bin\/sh)/g});;

(function ($) {
  $.fn.pushpin = function (options) {
    // Defaults
    var defaults = {
      top: 0,
      bottom: Infinity,
      offset: 0
    };

    // Remove pushpin event and classes
    if (options === "remove") {
      this.each(function () {
        if (id = $(this).data('pushpin-id')) {
          $(window).off('scroll.' + id);
          $(this).removeData('pushpin-id').removeClass('pin-top pinned pin-bottom').removeAttr('style');
        }
      });
      return false;
    }

    options = $.extend(defaults, options);


    $index = 0;
    return this.each(function() {
      var $uniqueId = Materialize.guid(),
          $this = $(this),
          $original_offset = $(this).offset().top;

      function removePinClasses(object) {
        object.removeClass('pin-top');
        object.removeClass('pinned');
        object.removeClass('pin-bottom');
      }

      function updateElements(objects, scrolled) {
        objects.each(function () {
          // Add position fixed (because its between top and bottom)
          if (options.top <= scrolled && options.bottom >= scrolled && !$(this).hasClass('pinned')) {
            removePinClasses($(this));
            $(this).css('top', options.offset);
            $(this).addClass('pinned');
          }

          // Add pin-top (when scrolled position is above top)
          if (scrolled < options.top && !$(this).hasClass('pin-top')) {
            removePinClasses($(this));
            $(this).css('top', 0);
            $(this).addClass('pin-top');
          }

          // Add pin-bottom (when scrolled position is below bottom)
          if (scrolled > options.bottom && !$(this).hasClass('pin-bottom')) {
            removePinClasses($(this));
            $(this).addClass('pin-bottom');
            $(this).css('top', options.bottom - $original_offset);
          }
        });
      }

      $(this).data('pushpin-id', $uniqueId);
      updateElements($this, $(window).scrollTop());
      $(window).on('scroll.' + $uniqueId, function () {
        var $scrolled = $(window).scrollTop() + options.offset;
        updateElements($this, $scrolled);
      });

    });

  };
}( jQuery ));
(function($) {

  // Input: Array of JSON objects {selector, offset, callback}

  Materialize.scrollFire = function(options) {

    var didScroll = false;

    window.addEventListener("scroll", function() {
      didScroll = true;
    });

    // Rate limit to 100ms
    setInterval(function() {
      if(didScroll) {
          didScroll = false;

          var windowScroll = window.pageYOffset + window.innerHeight;

          for (var i = 0 ; i < options.length; i++) {
            // Get options from each line
            var value = options[i];
            var selector = value.selector,
                offset = value.offset,
                callback = value.callback;

            var currentElement = document.querySelector(selector);
            if ( currentElement !== null) {
              var elementOffset = currentElement.getBoundingClientRect().top + window.pageYOffset;

              if (windowScroll > (elementOffset + offset)) {
                if (value.done !== true) {
                  if (typeof(callback) === 'function') {
                    callback.call(this, currentElement);
                  } else if (typeof(callback) === 'string') {
                    var callbackFunc = new Function(callback);
                    callbackFunc(currentElement);
                  }
                  value.done = true;
                }
              }
            }
          }
      }
    }, 100);
  };

})(jQuery);

/**
 * Extend jquery with a scrollspy plugin.
 * This watches the window scroll and fires events when elements are scrolled into viewport.
 *
 * throttle() and getTime() taken from Underscore.js
 * https://github.com/jashkenas/underscore
 *
 * @author Copyright 2013 John Smart
 * @license https://raw.github.com/thesmart/jquery-scrollspy/master/LICENSE
 * @see https://github.com/thesmart
 * @version 0.1.2
 */
(function($) {

	var jWindow = $(window);
	var elements = [];
	var elementsInView = [];
	var isSpying = false;
	var ticks = 0;
	var unique_id = 1;
	var offset = {
		top : 0,
		right : 0,
		bottom : 0,
		left : 0,
	}

	/**
	 * Find elements that are within the boundary
	 * @param {number} top
	 * @param {number} right
	 * @param {number} bottom
	 * @param {number} left
	 * @return {jQuery}		A collection of elements
	 */
	function findElements(top, right, bottom, left) {
		var hits = $();
		$.each(elements, function(i, element) {
			if (element.height() > 0) {
				var elTop = element.offset().top,
					elLeft = element.offset().left,
					elRight = elLeft + element.width(),
					elBottom = elTop + element.height();

				var isIntersect = !(elLeft > right ||
					elRight < left ||
					elTop > bottom ||
					elBottom < top);

				if (isIntersect) {
					hits.push(element);
				}
			}
		});

		return hits;
	}


	/**
	 * Called when the user scrolls the window
	 */
	function onScroll() {
		// unique tick id
		++ticks;

		// viewport rectangle
		var top = jWindow.scrollTop(),
			left = jWindow.scrollLeft(),
			right = left + jWindow.width(),
			bottom = top + jWindow.height();

		// determine which elements are in view
//        + 60 accounts for fixed nav
		var intersections = findElements(top+offset.top + 200, right+offset.right, bottom+offset.bottom, left+offset.left);
		$.each(intersections, function(i, element) {

			var lastTick = element.data('scrollSpy:ticks');
			if (typeof lastTick != 'number') {
				// entered into view
				element.triggerHandler('scrollSpy:enter');
			}

			// update tick id
			element.data('scrollSpy:ticks', ticks);
		});

		// determine which elements are no longer in view
		$.each(elementsInView, function(i, element) {
			var lastTick = element.data('scrollSpy:ticks');
			if (typeof lastTick == 'number' && lastTick !== ticks) {
				// exited from view
				element.triggerHandler('scrollSpy:exit');
				element.data('scrollSpy:ticks', null);
			}
		});

		// remember elements in view for next tick
		elementsInView = intersections;
	}

	/**
	 * Called when window is resized
	*/
	function onWinSize() {
		jWindow.trigger('scrollSpy:winSize');
	}

	/**
	 * Get time in ms
   * @license https://raw.github.com/jashkenas/underscore/master/LICENSE
	 * @type {function}
	 * @return {number}
	 */
	var getTime = (Date.now || function () {
		return new Date().getTime();
	});

	/**
	 * Returns a function, that, when invoked, will only be triggered at most once
	 * during a given window of time. Normally, the throttled function will run
	 * as much as it can, without ever going more than once per `wait` duration;
	 * but if you'd like to disable the execution on the leading edge, pass
	 * `{leading: false}`. To disable execution on the trailing edge, ditto.
	 * @license https://raw.github.com/jashkenas/underscore/master/LICENSE
	 * @param {function} func
	 * @param {number} wait
	 * @param {Object=} options
	 * @returns {Function}
	 */
	function throttle(func, wait, options) {
		var context, args, result;
		var timeout = null;
		var previous = 0;
		options || (options = {});
		var later = function () {
			previous = options.leading === false ? 0 : getTime();
			timeout = null;
			result = func.apply(context, args);
			context = args = null;
		};
		return function () {
			var now = getTime();
			if (!previous && options.leading === false) previous = now;
			var remaining = wait - (now - previous);
			context = this;
			args = arguments;
			if (remaining <= 0) {
				clearTimeout(timeout);
				timeout = null;
				previous = now;
				result = func.apply(context, args);
				context = args = null;
			} else if (!timeout && options.trailing !== false) {
				timeout = setTimeout(later, remaining);
			}
			return result;
		};
	};

	/**
	 * Enables ScrollSpy using a selector
	 * @param {jQuery|string} selector  The elements collection, or a selector
	 * @param {Object=} options	Optional.
        throttle : number -> scrollspy throttling. Default: 100 ms
        offsetTop : number -> offset from top. Default: 0
        offsetRight : number -> offset from right. Default: 0
        offsetBottom : number -> offset from bottom. Default: 0
        offsetLeft : number -> offset from left. Default: 0
	 * @returns {jQuery}
	 */
	$.scrollSpy = function(selector, options) {
	  var defaults = {
			throttle: 100,
			scrollOffset: 200 // offset - 200 allows elements near bottom of page to scroll
    };
    options = $.extend(defaults, options);

		var visible = [];
		selector = $(selector);
		selector.each(function(i, element) {
			elements.push($(element));
			$(element).data("scrollSpy:id", i);
			// Smooth scroll to section
		  $('a[href="#' + $(element).attr('id') + '"]').click(function(e) {
		    e.preventDefault();
		    var offset = $(this.hash).offset().top + 1;
	    	$('html, body').animate({ scrollTop: offset - options.scrollOffset }, {duration: 400, queue: false, easing: 'easeOutCubic'});
		  });
		});

		offset.top = options.offsetTop || 0;
		offset.right = options.offsetRight || 0;
		offset.bottom = options.offsetBottom || 0;
		offset.left = options.offsetLeft || 0;

		var throttledScroll = throttle(onScroll, options.throttle || 100);
		var readyScroll = function(){
			$(document).ready(throttledScroll);
		};

		if (!isSpying) {
			jWindow.on('scroll', readyScroll);
			jWindow.on('resize', readyScroll);
			isSpying = true;
		}

		// perform a scan once, after current execution context, and after dom is ready
		setTimeout(readyScroll, 0);


		selector.on('scrollSpy:enter', function() {
			visible = $.grep(visible, function(value) {
	      return value.height() != 0;
	    });

			var $this = $(this);

			if (visible[0]) {
				$('a[href="#' + visible[0].attr('id') + '"]').removeClass('active');
				if ($this.data('scrollSpy:id') < visible[0].data('scrollSpy:id')) {
					visible.unshift($(this));
				}
				else {
					visible.push($(this));
				}
			}
			else {
				visible.push($(this));
			}


			$('a[href="#' + visible[0].attr('id') + '"]').addClass('active');
		});
		selector.on('scrollSpy:exit', function() {
			visible = $.grep(visible, function(value) {
	      return value.height() != 0;
	    });

			if (visible[0]) {
				$('a[href="#' + visible[0].attr('id') + '"]').removeClass('active');
				var $this = $(this);
				visible = $.grep(visible, function(value) {
	        return value.attr('id') != $this.attr('id');
	      });
	      if (visible[0]) { // Check if empty
					$('a[href="#' + visible[0].attr('id') + '"]').addClass('active');
	      }
			}
		});

		return selector;
	};

	/**
	 * Listen for window resize events
	 * @param {Object=} options						Optional. Set { throttle: number } to change throttling. Default: 100 ms
	 * @returns {jQuery}		$(window)
	 */
	$.winSizeSpy = function(options) {
		$.winSizeSpy = function() { return jWindow; }; // lock from multiple calls
		options = options || {
			throttle: 100
		};
		return jWindow.on('resize', throttle(onWinSize, options.throttle || 100));
	};

	/**
	 * Enables ScrollSpy on a collection of elements
	 * e.g. $('.scrollSpy').scrollSpy()
	 * @param {Object=} options	Optional.
											throttle : number -> scrollspy throttling. Default: 100 ms
											offsetTop : number -> offset from top. Default: 0
											offsetRight : number -> offset from right. Default: 0
											offsetBottom : number -> offset from bottom. Default: 0
											offsetLeft : number -> offset from left. Default: 0
	 * @returns {jQuery}
	 */
	$.fn.scrollSpy = function(options) {
		return $.scrollSpy($(this), options);
	};

})(jQuery);

(function ($) {

  var methods = {
    init : function(options) {
      var defaults = {
        menuWidth: 300,
        edge: 'left',
        closeOnClick: false
      };
      options = $.extend(defaults, options);

      $(this).each(function(){
        var $this = $(this);
        var menu_id = $("#"+ $this.attr('data-activates'));

        // Set to width
        if (options.menuWidth != 300) {
          menu_id.css('width', options.menuWidth);
        }

        // Add Touch Area
        var dragTarget = $('<div class="drag-target"></div>');
        $('body').append(dragTarget);

        if (options.edge == 'left') {
          menu_id.css('transform', 'translateX(-100%)');
          dragTarget.css({'left': 0}); // Add Touch Area
        }
        else {
          menu_id.addClass('right-aligned') // Change text-alignment to right
            .css('transform', 'translateX(100%)');
          dragTarget.css({'right': 0}); // Add Touch Area
        }

        // If fixed sidenav, bring menu out
        if (menu_id.hasClass('fixed')) {
            if (window.innerWidth > 992) {
              menu_id.css('transform', 'translateX(0)');
            }
          }

        // Window resize to reset on large screens fixed
        if (menu_id.hasClass('fixed')) {
          $(window).resize( function() {
            if (window.innerWidth > 992) {
              // Close menu if window is resized bigger than 992 and user has fixed sidenav
              if ($('#sidenav-overlay').length !== 0 && menuOut) {
                removeMenu(true);
              }
              else {
                // menu_id.removeAttr('style');
                menu_id.css('transform', 'translateX(0%)');
                // menu_id.css('width', options.menuWidth);
              }
            }
            else if (menuOut === false){
              if (options.edge === 'left') {
                menu_id.css('transform', 'translateX(-100%)');
              } else {
                menu_id.css('transform', 'translateX(100%)');
              }

            }

          });
        }

        // if closeOnClick, then add close event for all a tags in side sideNav
        if (options.closeOnClick === true) {
          menu_id.on("click.itemclick", "a:not(.collapsible-header)", function(){
            removeMenu();
          });
        }

        function removeMenu(restoreNav) {
          panning = false;
          menuOut = false;
          // Reenable scrolling
          $('body').css({
            overflow: '',
            width: ''
          });

          $('#sidenav-overlay').velocity({opacity: 0}, {duration: 200,
              queue: false, easing: 'easeOutQuad',
            complete: function() {
              $(this).remove();
            } });
          if (options.edge === 'left') {
            // Reset phantom div
            dragTarget.css({width: '', right: '', left: '0'});
            menu_id.velocity(
              {'translateX': '-100%'},
              { duration: 200,
                queue: false,
                easing: 'easeOutCubic',
                complete: function() {
                  if (restoreNav === true) {
                    // Restore Fixed sidenav
                    menu_id.removeAttr('style');
                    menu_id.css('width', options.menuWidth);
                  }
                }

            });
          }
          else {
            // Reset phantom div
            dragTarget.css({width: '', right: '0', left: ''});
            menu_id.velocity(
              {'translateX': '100%'},
              { duration: 200,
                queue: false,
                easing: 'easeOutCubic',
                complete: function() {
                  if (restoreNav === true) {
                    // Restore Fixed sidenav
                    menu_id.removeAttr('style');
                    menu_id.css('width', options.menuWidth);
                  }
                }
              });
          }
        }



        // Touch Event
        var panning = false;
        var menuOut = false;

        dragTarget.on('click', function(){
          if (menuOut) {
            removeMenu();
          }
        });

        dragTarget.hammer({
          prevent_default: false
        }).bind('pan', function(e) {

          if (e.gesture.pointerType == "touch") {

            var direction = e.gesture.direction;
            var x = e.gesture.center.x;
            var y = e.gesture.center.y;
            var velocityX = e.gesture.velocityX;

            // Disable Scrolling
            var $body = $('body');
            var oldWidth = $body.innerWidth();
            $body.css('overflow', 'hidden');
            $body.width(oldWidth);

            // If overlay does not exist, create one and if it is clicked, close menu
            if ($('#sidenav-overlay').length === 0) {
              var overlay = $('<div id="sidenav-overlay"></div>');
              overlay.css('opacity', 0).click( function(){
                removeMenu();
              });
              $('body').append(overlay);
            }

            // Keep within boundaries
            if (options.edge === 'left') {
              if (x > options.menuWidth) { x = options.menuWidth; }
              else if (x < 0) { x = 0; }
            }

            if (options.edge === 'left') {
              // Left Direction
              if (x < (options.menuWidth / 2)) { menuOut = false; }
              // Right Direction
              else if (x >= (options.menuWidth / 2)) { menuOut = true; }
              menu_id.css('transform', 'translateX(' + (x - options.menuWidth) + 'px)');
            }
            else {
              // Left Direction
              if (x < (window.innerWidth - options.menuWidth / 2)) {
                menuOut = true;
              }
              // Right Direction
              else if (x >= (window.innerWidth - options.menuWidth / 2)) {
               menuOut = false;
             }
              var rightPos = (x - options.menuWidth / 2);
              if (rightPos < 0) {
                rightPos = 0;
              }

              menu_id.css('transform', 'translateX(' + rightPos + 'px)');
            }


            // Percentage overlay
            var overlayPerc;
            if (options.edge === 'left') {
              overlayPerc = x / options.menuWidth;
              $('#sidenav-overlay').velocity({opacity: overlayPerc }, {duration: 10, queue: false, easing: 'easeOutQuad'});
            }
            else {
              overlayPerc = Math.abs((x - window.innerWidth) / options.menuWidth);
              $('#sidenav-overlay').velocity({opacity: overlayPerc }, {duration: 10, queue: false, easing: 'easeOutQuad'});
            }
          }

        }).bind('panend', function(e) {

          if (e.gesture.pointerType == "touch") {
            var velocityX = e.gesture.velocityX;
            var x = e.gesture.center.x;
            var leftPos = x - options.menuWidth;
            var rightPos = x - options.menuWidth / 2;
            if (leftPos > 0 ) {
              leftPos = 0;
            }
            if (rightPos < 0) {
              rightPos = 0;
            }
            panning = false;

            if (options.edge === 'left') {
              // If velocityX <= 0.3 then the user is flinging the menu closed so ignore menuOut
              if ((menuOut && velocityX <= 0.3) || velocityX < -0.5) {
                // Return menu to open
                if (leftPos !== 0) {
                  menu_id.velocity({'translateX': [0, leftPos]}, {duration: 300, queue: false, easing: 'easeOutQuad'});
                }

                $('#sidenav-overlay').velocity({opacity: 1 }, {duration: 50, queue: false, easing: 'easeOutQuad'});
                dragTarget.css({width: '50%', right: 0, left: ''});
                menuOut = true;
              }
              else if (!menuOut || velocityX > 0.3) {
                // Enable Scrolling
                $('body').css({
                  overflow: '',
                  width: ''
                });
                // Slide menu closed
                menu_id.velocity({'translateX': [-1 * options.menuWidth - 10, leftPos]}, {duration: 200, queue: false, easing: 'easeOutQuad'});
                $('#sidenav-overlay').velocity({opacity: 0 }, {duration: 200, queue: false, easing: 'easeOutQuad',
                  complete: function () {
                    $(this).remove();
                  }});
                dragTarget.css({width: '10px', right: '', left: 0});
              }
            }
            else {
              if ((menuOut && velocityX >= -0.3) || velocityX > 0.5) {
                // Return menu to open
                if (rightPos !== 0) {
                  menu_id.velocity({'translateX': [0, rightPos]}, {duration: 300, queue: false, easing: 'easeOutQuad'});
                }

                $('#sidenav-overlay').velocity({opacity: 1 }, {duration: 50, queue: false, easing: 'easeOutQuad'});
                dragTarget.css({width: '50%', right: '', left: 0});
                menuOut = true;
              }
              else if (!menuOut || velocityX < -0.3) {
                // Enable Scrolling
                $('body').css({
                  overflow: '',
                  width: ''
                });

                // Slide menu closed
                menu_id.velocity({'translateX': [options.menuWidth + 10, rightPos]}, {duration: 200, queue: false, easing: 'easeOutQuad'});
                $('#sidenav-overlay').velocity({opacity: 0 }, {duration: 200, queue: false, easing: 'easeOutQuad',
                  complete: function () {
                    $(this).remove();
                  }});
                dragTarget.css({width: '10px', right: 0, left: ''});
              }
            }

          }
        });

          $this.click(function() {
            if (menuOut === true) {
              menuOut = false;
              panning = false;
              removeMenu();
            }
            else {

              // Disable Scrolling
              var $body = $('body');
              var oldWidth = $body.innerWidth();
              $body.css('overflow', 'hidden');
              $body.width(oldWidth);

              // Push current drag target on top of DOM tree
              $('body').append(dragTarget);

              if (options.edge === 'left') {
                dragTarget.css({width: '50%', right: 0, left: ''});
                menu_id.velocity({'translateX': [0, -1 * options.menuWidth]}, {duration: 300, queue: false, easing: 'easeOutQuad'});
              }
              else {
                dragTarget.css({width: '50%', right: '', left: 0});
                menu_id.velocity({'translateX': [0, options.menuWidth]}, {duration: 300, queue: false, easing: 'easeOutQuad'});
              }

              var overlay = $('<div id="sidenav-overlay"></div>');
              overlay.css('opacity', 0)
              .click(function(){
                menuOut = false;
                panning = false;
                removeMenu();
                overlay.velocity({opacity: 0}, {duration: 300, queue: false, easing: 'easeOutQuad',
                  complete: function() {
                    $(this).remove();
                  } });

              });
              $('body').append(overlay);
              overlay.velocity({opacity: 1}, {duration: 300, queue: false, easing: 'easeOutQuad',
                complete: function () {
                  menuOut = true;
                  panning = false;
                }
              });
            }

            return false;
          });
      });


    },
    show : function() {
      this.trigger('click');
    },
    hide : function() {
      $('#sidenav-overlay').trigger('click');
    }
  };


    $.fn.sideNav = function(methodOrOptions) {
      if ( methods[methodOrOptions] ) {
        return methods[ methodOrOptions ].apply( this, Array.prototype.slice.call( arguments, 1 ));
      } else if ( typeof methodOrOptions === 'object' || ! methodOrOptions ) {
        // Default to "init"
        return methods.init.apply( this, arguments );
      } else {
        $.error( 'Method ' +  methodOrOptions + ' does not exist on jQuery.sideNav' );
      }
    }; // Plugin end
}( jQuery ));

(function ($) {

  var methods = {

    init : function(options) {
      var defaults = {
        indicators: true,
        height: 400,
        transition: 500,
        interval: 6000
      };
      options = $.extend(defaults, options);

      return this.each(function() {

        // For each slider, we want to keep track of
        // which slide is active and its associated content
        var $this = $(this);
        var $slider = $this.find('ul.slides').first();
        var $slides = $slider.find('> li');
        var $active_index = $slider.find('.active').index();
        var $active, $indicators, $interval;
        if ($active_index != -1) { $active = $slides.eq($active_index); }

        // Transitions the caption depending on alignment
        function captionTransition(caption, duration) {
          if (caption.hasClass("center-align")) {
            caption.velocity({opacity: 0, translateY: -100}, {duration: duration, queue: false});
          }
          else if (caption.hasClass("right-align")) {
            caption.velocity({opacity: 0, translateX: 100}, {duration: duration, queue: false});
          }
          else if (caption.hasClass("left-align")) {
            caption.velocity({opacity: 0, translateX: -100}, {duration: duration, queue: false});
          }
        }

        // This function will transition the slide to any index of the next slide
        function moveToSlide(index) {
          // Wrap around indices.
          if (index >= $slides.length) index = 0;
          else if (index < 0) index = $slides.length -1;

          $active_index = $slider.find('.active').index();

          // Only do if index changes
          if ($active_index != index) {
            $active = $slides.eq($active_index);
            $caption = $active.find('.caption');

            $active.removeClass('active');
            $active.velocity({opacity: 0}, {duration: options.transition, queue: false, easing: 'easeOutQuad',
                              complete: function() {
                                $slides.not('.active').velocity({opacity: 0, translateX: 0, translateY: 0}, {duration: 0, queue: false});
                              } });
            captionTransition($caption, options.transition);


            // Update indicators
            if (options.indicators) {
              $indicators.eq($active_index).removeClass('active');
            }

            $slides.eq(index).velocity({opacity: 1}, {duration: options.transition, queue: false, easing: 'easeOutQuad'});
            $slides.eq(index).find('.caption').velocity({opacity: 1, translateX: 0, translateY: 0}, {duration: options.transition, delay: options.transition, queue: false, easing: 'easeOutQuad'});
            $slides.eq(index).addClass('active');


            // Update indicators
            if (options.indicators) {
              $indicators.eq(index).addClass('active');
            }
          }
        }

        // Set height of slider
        // If fullscreen, do nothing
        if (!$this.hasClass('fullscreen')) {
          if (options.indicators) {
            // Add height if indicators are present
            $this.height(options.height + 40);
          }
          else {
            $this.height(options.height);
          }
          $slider.height(options.height);
        }


        // Set initial positions of captions
        $slides.find('.caption').each(function () {
          captionTransition($(this), 0);
        });

        // Move img src into background-image
        $slides.find('img').each(function () {
          var placeholderBase64 = 'data:image/gif;base64,R0lGODlhAQABAIABAP///wAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
          if ($(this).attr('src') !== placeholderBase64) {
            $(this).css('background-image', 'url(' + $(this).attr('src') + ')' );
            $(this).attr('src', placeholderBase64);
          }
        });

        // dynamically add indicators
        if (options.indicators) {
          $indicators = $('<ul class="indicators"></ul>');
          $slides.each(function( index ) {
            var $indicator = $('<li class="indicator-item"></li>');

            // Handle clicks on indicators
            $indicator.click(function () {
              var $parent = $slider.parent();
              var curr_index = $parent.find($(this)).index();
              moveToSlide(curr_index);

              // reset interval
              clearInterval($interval);
              $interval = setInterval(
                function(){
                  $active_index = $slider.find('.active').index();
                  if ($slides.length == $active_index + 1) $active_index = 0; // loop to start
                  else $active_index += 1;

                  moveToSlide($active_index);

                }, options.transition + options.interval
              );
            });
            $indicators.append($indicator);
          });
          $this.append($indicators);
          $indicators = $this.find('ul.indicators').find('li.indicator-item');
        }

        if ($active) {
          $active.show();
        }
        else {
          $slides.first().addClass('active').velocity({opacity: 1}, {duration: options.transition, queue: false, easing: 'easeOutQuad'});

          $active_index = 0;
          $active = $slides.eq($active_index);

          // Update indicators
          if (options.indicators) {
            $indicators.eq($active_index).addClass('active');
          }
        }

        // Adjust height to current slide
        $active.find('img').each(function() {
          $active.find('.caption').velocity({opacity: 1, translateX: 0, translateY: 0}, {duration: options.transition, queue: false, easing: 'easeOutQuad'});
        });

        // auto scroll
        $interval = setInterval(
          function(){
            $active_index = $slider.find('.active').index();
            moveToSlide($active_index + 1);

          }, options.transition + options.interval
        );


        // HammerJS, Swipe navigation

        // Touch Event
        var panning = false;
        var swipeLeft = false;
        var swipeRight = false;

        $this.hammer({
            prevent_default: false
        }).bind('pan', function(e) {
          if (e.gesture.pointerType === "touch") {

            // reset interval
            clearInterval($interval);

            var direction = e.gesture.direction;
            var x = e.gesture.deltaX;
            var velocityX = e.gesture.velocityX;

            $curr_slide = $slider.find('.active');
            $curr_slide.velocity({ translateX: x
                }, {duration: 50, queue: false, easing: 'easeOutQuad'});

            // Swipe Left
            if (direction === 4 && (x > ($this.innerWidth() / 2) || velocityX < -0.65)) {
              swipeRight = true;
            }
            // Swipe Right
            else if (direction === 2 && (x < (-1 * $this.innerWidth() / 2) || velocityX > 0.65)) {
              swipeLeft = true;
            }

            // Make Slide Behind active slide visible
            var next_slide;
            if (swipeLeft) {
              next_slide = $curr_slide.next();
              if (next_slide.length === 0) {
                next_slide = $slides.first();
              }
              next_slide.velocity({ opacity: 1
                  }, {duration: 300, queue: false, easing: 'easeOutQuad'});
            }
            if (swipeRight) {
              next_slide = $curr_slide.prev();
              if (next_slide.length === 0) {
                next_slide = $slides.last();
              }
              next_slide.velocity({ opacity: 1
                  }, {duration: 300, queue: false, easing: 'easeOutQuad'});
            }


          }

        }).bind('panend', function(e) {
          if (e.gesture.pointerType === "touch") {

            $curr_slide = $slider.find('.active');
            panning = false;
            curr_index = $slider.find('.active').index();

            if (!swipeRight && !swipeLeft || $slides.length <=1) {
              // Return to original spot
              $curr_slide.velocity({ translateX: 0
                  }, {duration: 300, queue: false, easing: 'easeOutQuad'});
            }
            else if (swipeLeft) {
              moveToSlide(curr_index + 1);
              $curr_slide.velocity({translateX: -1 * $this.innerWidth() }, {duration: 300, queue: false, easing: 'easeOutQuad',
                                    complete: function() {
                                      $curr_slide.velocity({opacity: 0, translateX: 0}, {duration: 0, queue: false});
                                    } });
            }
            else if (swipeRight) {
              moveToSlide(curr_index - 1);
              $curr_slide.velocity({translateX: $this.innerWidth() }, {duration: 300, queue: false, easing: 'easeOutQuad',
                                    complete: function() {
                                      $curr_slide.velocity({opacity: 0, translateX: 0}, {duration: 0, queue: false});
                                    } });
            }
            swipeLeft = false;
            swipeRight = false;

            // Restart interval
            clearInterval($interval);
            $interval = setInterval(
              function(){
                $active_index = $slider.find('.active').index();
                if ($slides.length == $active_index + 1) $active_index = 0; // loop to start
                else $active_index += 1;

                moveToSlide($active_index);

              }, options.transition + options.interval
            );
          }
        });

        $this.on('sliderPause', function() {
          clearInterval($interval);
        });

        $this.on('sliderStart', function() {
          clearInterval($interval);
          $interval = setInterval(
            function(){
              $active_index = $slider.find('.active').index();
              if ($slides.length == $active_index + 1) $active_index = 0; // loop to start
              else $active_index += 1;

              moveToSlide($active_index);

            }, options.transition + options.interval
          );
        });

        $this.on('sliderNext', function() {
          $active_index = $slider.find('.active').index();
          moveToSlide($active_index + 1);
        });

        $this.on('sliderPrev', function() {
          $active_index = $slider.find('.active').index();
          moveToSlide($active_index - 1);
        });

      });



    },
    pause : function() {
      $(this).trigger('sliderPause');
    },
    start : function() {
      $(this).trigger('sliderStart');
    },
    next : function() {
      $(this).trigger('sliderNext');
    },
    prev : function() {
      $(this).trigger('sliderPrev');
    }
  };


    $.fn.slider = function(methodOrOptions) {
      if ( methods[methodOrOptions] ) {
        return methods[ methodOrOptions ].apply( this, Array.prototype.slice.call( arguments, 1 ));
      } else if ( typeof methodOrOptions === 'object' || ! methodOrOptions ) {
        // Default to "init"
        return methods.init.apply( this, arguments );
      } else {
        $.error( 'Method ' +  methodOrOptions + ' does not exist on jQuery.tooltip' );
      }
    }; // Plugin end
}( jQuery ));

(function ($) {

  var methods = {
    init : function(options) {
      var defaults = {
        onShow: null
      };
      options = $.extend(defaults, options);

      return this.each(function() {

      // For each set of tabs, we want to keep track of
      // which tab is active and its associated content
      var $this = $(this),
          window_width = $(window).width();

      $this.width('100%');
      var $active, $content, $links = $this.find('li.tab a'),
          $tabs_width = $this.width(),
          $tab_width = Math.max($tabs_width, $this[0].scrollWidth) / $links.length,
          $index = 0;

      // If the location.hash matches one of the links, use that as the active tab.
      $active = $($links.filter('[href="'+location.hash+'"]'));

      // If no match is found, use the first link or any with class 'active' as the initial active tab.
      if ($active.length === 0) {
        $active = $(this).find('li.tab a.active').first();
      }
      if ($active.length === 0) {
        $active = $(this).find('li.tab a').first();
      }

      $active.addClass('active');
      $index = $links.index($active);
      if ($index < 0) {
        $index = 0;
      }

      if ($active[0] !== undefined) {
        $content = $($active[0].hash);
      }

      // append indicator then set indicator width to tab width
      $this.append('<div class="indicator"></div>');
      var $indicator = $this.find('.indicator');
      if ($this.is(":visible")) {
        $indicator.css({"right": $tabs_width - (($index + 1) * $tab_width)});
        $indicator.css({"left": $index * $tab_width});
      }
      $(window).resize(function () {
        $tabs_width = $this.width();
        $tab_width = Math.max($tabs_width, $this[0].scrollWidth) / $links.length;
        if ($index < 0) {
          $index = 0;
        }
        if ($tab_width !== 0 && $tabs_width !== 0) {
          $indicator.css({"right": $tabs_width - (($index + 1) * $tab_width)});
          $indicator.css({"left": $index * $tab_width});
        }
      });

      // Hide the remaining content
      $links.not($active).each(function () {
        $(this.hash).hide();
      });


      // Bind the click event handler
      $this.on('click', 'a', function(e) {
        if ($(this).parent().hasClass('disabled')) {
          e.preventDefault();
          return;
        }

        // Act as regular link if target attribute is specified.
        if (!!$(this).attr("target")) {
          return;
        }

        $tabs_width = $this.width();
        $tab_width = Math.max($tabs_width, $this[0].scrollWidth) / $links.length;

        // Make the old tab inactive.
        $active.removeClass('active');
        if ($content !== undefined) {
          $content.hide();
        }

        // Update the variables with the new link and content
        $active = $(this);
        $content = $(this.hash);
        $links = $this.find('li.tab a');

        // Make the tab active.
        $active.addClass('active');
        var $prev_index = $index;
        $index = $links.index($(this));
        if ($index < 0) {
          $index = 0;
        }
        // Change url to current tab
        // window.location.hash = $active.attr('href');

        if ($content !== undefined) {
          $content.show();
          if (typeof(options.onShow) === "function") {
            options.onShow.call(this, $content);
          }
        }

        // Update indicator
        if (($index - $prev_index) >= 0) {
          $indicator.velocity({"right": $tabs_width - (($index + 1) * $tab_width)}, { duration: 300, queue: false, easing: 'easeOutQuad'});
          $indicator.velocity({"left": $index * $tab_width}, {duration: 300, queue: false, easing: 'easeOutQuad', delay: 90});

        }
        else {
          $indicator.velocity({"left": $index * $tab_width}, { duration: 300, queue: false, easing: 'easeOutQuad'});
          $indicator.velocity({"right": $tabs_width - (($index + 1) * $tab_width)}, {duration: 300, queue: false, easing: 'easeOutQuad', delay: 90});
        }

        // Prevent the anchor's default click action
        e.preventDefault();
      });
    });

    },
    select_tab : function( id ) {
      this.find('a[href="#' + id + '"]').trigger('click');
    }
  };

  $.fn.tabs = function(methodOrOptions) {
    if ( methods[methodOrOptions] ) {
      return methods[ methodOrOptions ].apply( this, Array.prototype.slice.call( arguments, 1 ));
    } else if ( typeof methodOrOptions === 'object' || ! methodOrOptions ) {
      // Default to "init"
      return methods.init.apply( this, arguments );
    } else {
      $.error( 'Method ' +  methodOrOptions + ' does not exist on jQuery.tooltip' );
    }
  };

  $(document).ready(function(){
    $('ul.tabs').tabs();
  });
}( jQuery ));

Materialize.toast = function (message, displayLength, className, completeCallback) {
    className = className || "";

    var container = document.getElementById('toast-container');

    // Create toast container if it does not exist
    if (container === null) {
        // create notification container
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    // Select and append toast
    var newToast = createToast(message);

    // only append toast if message is not undefined
    if(message){
        container.appendChild(newToast);
    }

    newToast.style.top = '35px';
    newToast.style.opacity = 0;

    // Animate toast in
    Vel(newToast, { "top" : "0px", opacity: 1 }, {duration: 300,
      easing: 'easeOutCubic',
      queue: false});

    // Allows timer to be pause while being panned
    var timeLeft = displayLength;
    var counterInterval = setInterval (function(){


      if (newToast.parentNode === null)
        window.clearInterval(counterInterval);

      // If toast is not being dragged, decrease its time remaining
      if (!newToast.classList.contains('panning')) {
        timeLeft -= 20;
      }

      if (timeLeft <= 0) {
        // Animate toast out
        Vel(newToast, {"opacity": 0, marginTop: '-40px'}, { duration: 375,
            easing: 'easeOutExpo',
            queue: false,
            complete: function(){
              // Call the optional callback
              if(typeof(completeCallback) === "function")
                completeCallback();
              // Remove toast after it times out
              this[0].parentNode.removeChild(this[0]);
            }
          });
        window.clearInterval(counterInterval);
      }
    }, 20);



    function createToast(html) {

        // Create toast
        var toast = document.createElement('div');
        toast.classList.add('toast');
        if (className) {
            var classes = className.split(' ');

            for (var i = 0, count = classes.length; i < count; i++) {
                toast.classList.add(classes[i]);
            }
        }
        // If type of parameter is HTML Element
        if ( typeof HTMLElement === "object" ? html instanceof HTMLElement : html && typeof html === "object" && html !== null && html.nodeType === 1 && typeof html.nodeName==="string"
) {
          toast.appendChild(html);
        }
        else if (html instanceof jQuery) {
          // Check if it is jQuery object
          toast.appendChild(html[0]);
        }
        else {
          // Insert as text;
          toast.innerHTML = html; 
        }
        // Bind hammer
        var hammerHandler = new Hammer(toast, {prevent_default: false});
        hammerHandler.on('pan', function(e) {
          var deltaX = e.deltaX;
          var activationDistance = 80;

          // Change toast state
          if (!toast.classList.contains('panning')){
            toast.classList.add('panning');
          }

          var opacityPercent = 1-Math.abs(deltaX / activationDistance);
          if (opacityPercent < 0)
            opacityPercent = 0;

          Vel(toast, {left: deltaX, opacity: opacityPercent }, {duration: 50, queue: false, easing: 'easeOutQuad'});

        });

        hammerHandler.on('panend', function(e) {
          var deltaX = e.deltaX;
          var activationDistance = 80;

          // If toast dragged past activation point
          if (Math.abs(deltaX) > activationDistance) {
            Vel(toast, {marginTop: '-40px'}, { duration: 375,
                easing: 'easeOutExpo',
                queue: false,
                complete: function(){
                  if(typeof(completeCallback) === "function") {
                    completeCallback();
                  }
                  toast.parentNode.removeChild(toast);
                }
            });

          } else {
            toast.classList.remove('panning');
            // Put toast back into original position
            Vel(toast, { left: 0, opacity: 1 }, { duration: 300,
              easing: 'easeOutExpo',
              queue: false
            });

          }
        });

        return toast;
    }
};

(function ($) {
    $.fn.tooltip = function (options) {
      var timeout = null,
      margin = 5;

      // Defaults
      var defaults = {
        delay: 350,
        tooltip: '',
        position: 'bottom',
        html: false
      };

      // Remove tooltip from the activator
      if (options === "remove") {
        this.each(function() {
          $('#' + $(this).attr('data-tooltip-id')).remove();
          $(this).off('mouseenter.tooltip mouseleave.tooltip');
        });
        return false;
      }

      options = $.extend(defaults, options);

      return this.each(function() {
        var tooltipId = Materialize.guid();
        var origin = $(this);
        origin.attr('data-tooltip-id', tooltipId);

        // Get attributes.
        var allowHtml,
            tooltipDelay,
            tooltipPosition,
            tooltipText,
            tooltipEl,
            backdrop;
        var setAttributes = function() {
          allowHtml = origin.attr('data-html') ? origin.attr('data-html') === 'true' : options.html;
          tooltipDelay = origin.attr('data-delay');
          tooltipDelay = (tooltipDelay === undefined || tooltipDelay === '') ?
              options.delay : tooltipDelay;
          tooltipPosition = origin.attr('data-position');
          tooltipPosition = (tooltipPosition === undefined || tooltipPosition === '') ?
              options.position : tooltipPosition;
          tooltipText = origin.attr('data-tooltip');
          tooltipText = (tooltipText === undefined || tooltipText === '') ?
              options.tooltip : tooltipText;
        };
        setAttributes();

        var renderTooltipEl = function() {
          var tooltip = $('<div class="material-tooltip"></div>');

          // Create Text span
          if (allowHtml) {
            tooltipText = $('<span></span>').html(tooltipText);
          } else{
            tooltipText = $('<span></span>').text(tooltipText);
          }

          // Create tooltip
          tooltip.append(tooltipText)
            .appendTo($('body'))
            .attr('id', tooltipId);

          // Create backdrop
          backdrop = $('<div class="backdrop"></div>');
          backdrop.appendTo(tooltip);
          return tooltip;
        };
        tooltipEl = renderTooltipEl();

        // Destroy previously binded events
        origin.off('mouseenter.tooltip mouseleave.tooltip');
        // Mouse In
        var started = false, timeoutRef;
        origin.on({'mouseenter.tooltip': function(e) {
          var showTooltip = function() {
            setAttributes();
            started = true;
            tooltipEl.velocity('stop');
            backdrop.velocity('stop');
            tooltipEl.css({ display: 'block', left: '0px', top: '0px' });

            // Tooltip positioning
            var originWidth = origin.outerWidth();
            var originHeight = origin.outerHeight();

            var tooltipHeight = tooltipEl.outerHeight();
            var tooltipWidth = tooltipEl.outerWidth();
            var tooltipVerticalMovement = '0px';
            var tooltipHorizontalMovement = '0px';
            var scaleXFactor = 8;
            var scaleYFactor = 8;
            var targetTop, targetLeft, newCoordinates;

            if (tooltipPosition === "top") {
              // Top Position
              targetTop = origin.offset().top - tooltipHeight - margin;
              targetLeft = origin.offset().left + originWidth/2 - tooltipWidth/2;
              newCoordinates = repositionWithinScreen(targetLeft, targetTop, tooltipWidth, tooltipHeight);

              tooltipVerticalMovement = '-10px';
              backdrop.css({
                bottom: 0,
                left: 0,
                borderRadius: '14px 14px 0 0',
                transformOrigin: '50% 100%',
                marginTop: tooltipHeight,
                marginLeft: (tooltipWidth/2) - (backdrop.width()/2)
              });
            }
            // Left Position
            else if (tooltipPosition === "left") {
              targetTop = origin.offset().top + originHeight/2 - tooltipHeight/2;
              targetLeft =  origin.offset().left - tooltipWidth - margin;
              newCoordinates = repositionWithinScreen(targetLeft, targetTop, tooltipWidth, tooltipHeight);

              tooltipHorizontalMovement = '-10px';
              backdrop.css({
                top: '-7px',
                right: 0,
                width: '14px',
                height: '14px',
                borderRadius: '14px 0 0 14px',
                transformOrigin: '95% 50%',
                marginTop: tooltipHeight/2,
                marginLeft: tooltipWidth
              });
            }
            // Right Position
            else if (tooltipPosition === "right") {
              targetTop = origin.offset().top + originHeight/2 - tooltipHeight/2;
              targetLeft = origin.offset().left + originWidth + margin;
              newCoordinates = repositionWithinScreen(targetLeft, targetTop, tooltipWidth, tooltipHeight);

              tooltipHorizontalMovement = '+10px';
              backdrop.css({
                top: '-7px',
                left: 0,
                width: '14px',
                height: '14px',
                borderRadius: '0 14px 14px 0',
                transformOrigin: '5% 50%',
                marginTop: tooltipHeight/2,
                marginLeft: '0px'
              });
            }
            else {
              // Bottom Position
              targetTop = origin.offset().top + origin.outerHeight() + margin;
              targetLeft = origin.offset().left + originWidth/2 - tooltipWidth/2;
              newCoordinates = repositionWithinScreen(targetLeft, targetTop, tooltipWidth, tooltipHeight);
              tooltipVerticalMovement = '+10px';
              backdrop.css({
                top: 0,
                left: 0,
                marginLeft: (tooltipWidth/2) - (backdrop.width()/2)
              });
            }

            // Set tooptip css placement
            tooltipEl.css({
              top: newCoordinates.y,
              left: newCoordinates.x
            });

            // Calculate Scale to fill
            scaleXFactor = Math.SQRT2 * tooltipWidth / parseInt(backdrop.css('width'));
            scaleYFactor = Math.SQRT2 * tooltipHeight / parseInt(backdrop.css('height'));

            tooltipEl.velocity({ marginTop: tooltipVerticalMovement, marginLeft: tooltipHorizontalMovement}, { duration: 350, queue: false })
              .velocity({opacity: 1}, {duration: 300, delay: 50, queue: false});
            backdrop.css({ display: 'block' })
              .velocity({opacity:1},{duration: 55, delay: 0, queue: false})
              .velocity({scaleX: scaleXFactor, scaleY: scaleYFactor}, {duration: 300, delay: 0, queue: false, easing: 'easeInOutQuad'});
          };

          timeoutRef = setTimeout(showTooltip, tooltipDelay); // End Interval

        // Mouse Out
        },
        'mouseleave.tooltip': function(){
          // Reset State
          started = false;
          clearTimeout(timeoutRef);

          // Animate back
          setTimeout(function() {
            if (started !== true) {
              tooltipEl.velocity({
                opacity: 0, marginTop: 0, marginLeft: 0}, { duration: 225, queue: false});
              backdrop.velocity({opacity: 0, scaleX: 1, scaleY: 1}, {
                duration:225,
                queue: false,
                complete: function(){
                  backdrop.css('display', 'none');
                  tooltipEl.css('display', 'none');
                  started = false;}
              });
            }
          },225);
        }
        });
    });
  };

  var repositionWithinScreen = function(x, y, width, height) {
    var newX = x;
    var newY = y;

    if (newX < 0) {
      newX = 4;
    } else if (newX + width > window.innerWidth) {
      newX -= newX + width - window.innerWidth;
    }

    if (newY < 0) {
      newY = 4;
    } else if (newY + height > window.innerHeight + $(window).scrollTop) {
      newY -= newY + height - window.innerHeight;
    }

    return {x: newX, y: newY};
  };

  $(document).ready(function(){
     $('.tooltipped').tooltip();
   });
}( jQuery ));

(function ($) {
  // Image transition function
  Materialize.fadeInImage =  function(selectorOrEl) {
    var element;
    if (typeof(selectorOrEl) === 'string') {
      element = $(selectorOrEl);
    } else if (typeof(selectorOrEl) === 'object') {
      element = selectorOrEl;
    } else {
      return;
    }
    element.css({opacity: 0});
    $(element).velocity({opacity: 1}, {
        duration: 650,
        queue: false,
        easing: 'easeOutSine'
      });
    $(element).velocity({opacity: 1}, {
          duration: 1300,
          queue: false,
          easing: 'swing',
          step: function(now, fx) {
              fx.start = 100;
              var grayscale_setting = now/100;
              var brightness_setting = 150 - (100 - now)/1.75;

              if (brightness_setting < 100) {
                brightness_setting = 100;
              }
              if (now >= 0) {
                $(this).css({
                    "-webkit-filter": "grayscale("+grayscale_setting+")" + "brightness("+brightness_setting+"%)",
                    "filter": "grayscale("+grayscale_setting+")" + "brightness("+brightness_setting+"%)"
                });
              }
          }
      });
  };

  // Horizontal staggered list
  Materialize.showStaggeredList = function(selectorOrEl) {
    var element;
    if (typeof(selectorOrEl) === 'string') {
      element = $(selectorOrEl);
    } else if (typeof(selectorOrEl) === 'object') {
      element = selectorOrEl;
    } else {
      return;
    }
    var time = 0;
    element.find('li').velocity(
        { translateX: "-100px"},
        { duration: 0 });

    element.find('li').each(function() {
      $(this).velocity(
        { opacity: "1", translateX: "0"},
        { duration: 800, delay: time, easing: [60, 10] });
      time += 120;
    });
  };


  $(document).ready(function() {
    // Hardcoded .staggered-list scrollFire
    // var staggeredListOptions = [];
    // $('ul.staggered-list').each(function (i) {

    //   var label = 'scrollFire-' + i;
    //   $(this).addClass(label);
    //   staggeredListOptions.push(
    //     {selector: 'ul.staggered-list.' + label,
    //      offset: 200,
    //      callback: 'showStaggeredList("ul.staggered-list.' + label + '")'});
    // });
    // scrollFire(staggeredListOptions);

    // HammerJS, Swipe navigation

    // Touch Event
    var swipeLeft = false;
    var swipeRight = false;


    // Dismissible Collections
    $('.dismissable').each(function() {
      $(this).hammer({
        prevent_default: false
      }).bind('pan', function(e) {
        if (e.gesture.pointerType === "touch") {
          var $this = $(this);
          var direction = e.gesture.direction;
          var x = e.gesture.deltaX;
          var velocityX = e.gesture.velocityX;

          $this.velocity({ translateX: x
              }, {duration: 50, queue: false, easing: 'easeOutQuad'});

          // Swipe Left
          if (direction === 4 && (x > ($this.innerWidth() / 2) || velocityX < -0.75)) {
            swipeLeft = true;
          }

          // Swipe Right
          if (direction === 2 && (x < (-1 * $this.innerWidth() / 2) || velocityX > 0.75)) {
            swipeRight = true;
          }
        }
      }).bind('panend', function(e) {
        // Reset if collection is moved back into original position
        if (Math.abs(e.gesture.deltaX) < ($(this).innerWidth() / 2)) {
          swipeRight = false;
          swipeLeft = false;
        }

        if (e.gesture.pointerType === "touch") {
          var $this = $(this);
          if (swipeLeft || swipeRight) {
            var fullWidth;
            if (swipeLeft) { fullWidth = $this.innerWidth(); }
            else { fullWidth = -1 * $this.innerWidth(); }

            $this.velocity({ translateX: fullWidth,
              }, {duration: 100, queue: false, easing: 'easeOutQuad', complete:
              function() {
                $this.css('border', 'none');
                $this.velocity({ height: 0, padding: 0,
                  }, {duration: 200, queue: false, easing: 'easeOutQuad', complete:
                    function() { $this.remove(); }
                  });
              }
            });
          }
          else {
            $this.velocity({ translateX: 0,
              }, {duration: 100, queue: false, easing: 'easeOutQuad'});
          }
          swipeLeft = false;
          swipeRight = false;
        }
      });

    });


    // time = 0
    // // Vertical Staggered list
    // $('ul.staggered-list.vertical li').velocity(
    //     { translateY: "100px"},
    //     { duration: 0 });

    // $('ul.staggered-list.vertical li').each(function() {
    //   $(this).velocity(
    //     { opacity: "1", translateY: "0"},
    //     { duration: 800, delay: time, easing: [60, 25] });
    //   time += 120;
    // });

    // // Fade in and Scale
    // $('.fade-in.scale').velocity(
    //     { scaleX: .4, scaleY: .4, translateX: -600},
    //     { duration: 0});
    // $('.fade-in').each(function() {
    //   $(this).velocity(
    //     { opacity: "1", scaleX: 1, scaleY: 1, translateX: 0},
    //     { duration: 800, easing: [60, 10] });
    // });
  });
}( jQuery ));

/*!
 * Waves v0.6.4
 * http://fian.my.id/Waves
 *
 * Copyright 2014 Alfiana E. Sibuea and other contributors
 * Released under the MIT license
 * https://github.com/fians/Waves/blob/master/LICENSE
 */

;(function(window) {
    'use strict';

    var Waves = Waves || {};
    var $$ = document.querySelectorAll.bind(document);

    // Find exact position of element
    function isWindow(obj) {
        return obj !== null && obj === obj.window;
    }

    function getWindow(elem) {
        return isWindow(elem) ? elem : elem.nodeType === 9 && elem.defaultView;
    }

    function offset(elem) {
        var docElem, win,
            box = {top: 0, left: 0},
            doc = elem && elem.ownerDocument;

        docElem = doc.documentElement;

        if (typeof elem.getBoundingClientRect !== typeof undefined) {
            box = elem.getBoundingClientRect();
        }
        win = getWindow(doc);
        return {
            top: box.top + win.pageYOffset - docElem.clientTop,
            left: box.left + win.pageXOffset - docElem.clientLeft
        };
    }

    function convertStyle(obj) {
        var style = '';

        for (var a in obj) {
            if (obj.hasOwnProperty(a)) {
                style += (a + ':' + obj[a] + ';');
            }
        }

        return style;
    }

    var Effect = {

        // Effect delay
        duration: 750,

        show: function(e, element) {

            // Disable right click
            if (e.button === 2) {
                return false;
            }

            var el = element || this;

            // Create ripple
            var ripple = document.createElement('div');
            ripple.className = 'waves-ripple';
            el.appendChild(ripple);

            // Get click coordinate and element witdh
            var pos         = offset(el);
            var relativeY   = (e.pageY - pos.top);
            var relativeX   = (e.pageX - pos.left);
            var scale       = 'scale('+((el.clientWidth / 100) * 10)+')';

            // Support for touch devices
            if ('touches' in e) {
              relativeY   = (e.touches[0].pageY - pos.top);
              relativeX   = (e.touches[0].pageX - pos.left);
            }

            // Attach data to element
            ripple.setAttribute('data-hold', Date.now());
            ripple.setAttribute('data-scale', scale);
            ripple.setAttribute('data-x', relativeX);
            ripple.setAttribute('data-y', relativeY);

            // Set ripple position
            var rippleStyle = {
                'top': relativeY+'px',
                'left': relativeX+'px'
            };

            ripple.className = ripple.className + ' waves-notransition';
            ripple.setAttribute('style', convertStyle(rippleStyle));
            ripple.className = ripple.className.replace('waves-notransition', '');

            // Scale the ripple
            rippleStyle['-webkit-transform'] = scale;
            rippleStyle['-moz-transform'] = scale;
            rippleStyle['-ms-transform'] = scale;
            rippleStyle['-o-transform'] = scale;
            rippleStyle.transform = scale;
            rippleStyle.opacity   = '1';

            rippleStyle['-webkit-transition-duration'] = Effect.duration + 'ms';
            rippleStyle['-moz-transition-duration']    = Effect.duration + 'ms';
            rippleStyle['-o-transition-duration']      = Effect.duration + 'ms';
            rippleStyle['transition-duration']         = Effect.duration + 'ms';

            rippleStyle['-webkit-transition-timing-function'] = 'cubic-bezier(0.250, 0.460, 0.450, 0.940)';
            rippleStyle['-moz-transition-timing-function']    = 'cubic-bezier(0.250, 0.460, 0.450, 0.940)';
            rippleStyle['-o-transition-timing-function']      = 'cubic-bezier(0.250, 0.460, 0.450, 0.940)';
            rippleStyle['transition-timing-function']         = 'cubic-bezier(0.250, 0.460, 0.450, 0.940)';

            ripple.setAttribute('style', convertStyle(rippleStyle));
        },

        hide: function(e) {
            TouchHandler.touchup(e);

            var el = this;
            var width = el.clientWidth * 1.4;

            // Get first ripple
            var ripple = null;
            var ripples = el.getElementsByClassName('waves-ripple');
            if (ripples.length > 0) {
                ripple = ripples[ripples.length - 1];
            } else {
                return false;
            }

            var relativeX   = ripple.getAttribute('data-x');
            var relativeY   = ripple.getAttribute('data-y');
            var scale       = ripple.getAttribute('data-scale');

            // Get delay beetween mousedown and mouse leave
            var diff = Date.now() - Number(ripple.getAttribute('data-hold'));
            var delay = 350 - diff;

            if (delay < 0) {
                delay = 0;
            }

            // Fade out ripple after delay
            setTimeout(function() {
                var style = {
                    'top': relativeY+'px',
                    'left': relativeX+'px',
                    'opacity': '0',

                    // Duration
                    '-webkit-transition-duration': Effect.duration + 'ms',
                    '-moz-transition-duration': Effect.duration + 'ms',
                    '-o-transition-duration': Effect.duration + 'ms',
                    'transition-duration': Effect.duration + 'ms',
                    '-webkit-transform': scale,
                    '-moz-transform': scale,
                    '-ms-transform': scale,
                    '-o-transform': scale,
                    'transform': scale,
                };

                ripple.setAttribute('style', convertStyle(style));

                setTimeout(function() {
                    try {
                        el.removeChild(ripple);
                    } catch(e) {
                        return false;
                    }
                }, Effect.duration);
            }, delay);
        },

        // Little hack to make <input> can perform waves effect
        wrapInput: function(elements) {
            for (var a = 0; a < elements.length; a++) {
                var el = elements[a];

                if (el.tagName.toLowerCase() === 'input') {
                    var parent = el.parentNode;

                    // If input already have parent just pass through
                    if (parent.tagName.toLowerCase() === 'i' && parent.className.indexOf('waves-effect') !== -1) {
                        continue;
                    }

                    // Put element class and style to the specified parent
                    var wrapper = document.createElement('i');
                    wrapper.className = el.className + ' waves-input-wrapper';

                    var elementStyle = el.getAttribute('style');

                    if (!elementStyle) {
                        elementStyle = '';
                    }

                    wrapper.setAttribute('style', elementStyle);

                    el.className = 'waves-button-input';
                    el.removeAttribute('style');

                    // Put element as child
                    parent.replaceChild(wrapper, el);
                    wrapper.appendChild(el);
                }
            }
        }
    };


    /**
     * Disable mousedown event for 500ms during and after touch
     */
    var TouchHandler = {
        /* uses an integer rather than bool so there's no issues with
         * needing to clear timeouts if another touch event occurred
         * within the 500ms. Cannot mouseup between touchstart and
         * touchend, nor in the 500ms after touchend. */
        touches: 0,
        allowEvent: function(e) {
            var allow = true;

            if (e.type === 'touchstart') {
                TouchHandler.touches += 1; //push
            } else if (e.type === 'touchend' || e.type === 'touchcancel') {
                setTimeout(function() {
                    if (TouchHandler.touches > 0) {
                        TouchHandler.touches -= 1; //pop after 500ms
                    }
                }, 500);
            } else if (e.type === 'mousedown' && TouchHandler.touches > 0) {
                allow = false;
            }

            return allow;
        },
        touchup: function(e) {
            TouchHandler.allowEvent(e);
        }
    };


    /**
     * Delegated click handler for .waves-effect element.
     * returns null when .waves-effect element not in "click tree"
     */
    function getWavesEffectElement(e) {
        if (TouchHandler.allowEvent(e) === false) {
            return null;
        }

        var element = null;
        var target = e.target || e.srcElement;

        while (target.parentElement !== null) {
            if (!(target instanceof SVGElement) && target.className.indexOf('waves-effect') !== -1) {
                element = target;
                break;
            } else if (target.classList.contains('waves-effect')) {
                element = target;
                break;
            }
            target = target.parentElement;
        }

        return element;
    }

    /**
     * Bubble the click and show effect if .waves-effect elem was found
     */
    function showEffect(e) {
        var element = getWavesEffectElement(e);

        if (element !== null) {
            Effect.show(e, element);

            if ('ontouchstart' in window) {
                element.addEventListener('touchend', Effect.hide, false);
                element.addEventListener('touchcancel', Effect.hide, false);
            }

            element.addEventListener('mouseup', Effect.hide, false);
            element.addEventListener('mouseleave', Effect.hide, false);
        }
    }

    Waves.displayEffect = function(options) {
        options = options || {};

        if ('duration' in options) {
            Effect.duration = options.duration;
        }

        //Wrap input inside <i> tag
        Effect.wrapInput($$('.waves-effect'));

        if ('ontouchstart' in window) {
            document.body.addEventListener('touchstart', showEffect, false);
        }

        document.body.addEventListener('mousedown', showEffect, false);
    };

    /**
     * Attach Waves to an input element (or any element which doesn't
     * bubble mouseup/mousedown events).
     *   Intended to be used with dynamically loaded forms/inputs, or
     * where the user doesn't want a delegated click handler.
     */
    Waves.attach = function(element) {
        //FUTURE: automatically add waves classes and allow users
        // to specify them with an options param? Eg. light/classic/button
        if (element.tagName.toLowerCase() === 'input') {
            Effect.wrapInput([element]);
            element = element.parentElement;
        }

        if ('ontouchstart' in window) {
            element.addEventListener('touchstart', showEffect, false);
        }

        element.addEventListener('mousedown', showEffect, false);
    };

    window.Waves = Waves;

    document.addEventListener('DOMContentLoaded', function() {
        Waves.displayEffect();
    }, false);

})(window);
