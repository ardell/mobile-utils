window.doScroll = function() {
  // Things that don't work:
  // - document.body.scrollTop
  // - window.pageYOffset
  // - document.body.parentElement.scrollTop
  // - jQuery(window).scrollTop()
  // - jQuery('html').scrollTop()
  // - jQuery(document).scrollTop()
  // - jQuery('body').scrollTop()
  // For both:
  // - jQuery(window).scrollTop(3);
  // - window.scrollTo(0, 3);
  if (MobileUtilities.isAndroid())
  {
    setTimeout(function() {
      jQuery('html,body').scrollTop(3);
      console.log("reallyBigDiv: " + jQuery('.reallyBigDiv').width() + "x" + jQuery('.reallyBigDiv').height());
      window.scrollTo(0, 3);
      console.log("begin doScroll from: " + window.pageYOffset + " at: " + (+new Date()));
      console.log("html scrolltop is: " + jQuery('html').scrollTop());
      console.log("body scrolltop is: " + jQuery('body').scrollTop());
      window.scrollTo(0, 1);
      console.log("end doScroll at: " + window.pageYOffset + " at: " + (+new Date()));
    }, 5000);
  } else {
    console.log("begin doScroll from: " + window.pageYOffset + " at: " + (+new Date()));
    window.scrollTo(0, 0);
    console.log("end doScroll at: " + window.pageYOffset + " at: " + (+new Date()));
  }
};

var $window = jQuery(window);
jQuery.event.special.deviceIndependentOrientationChange = {
  _currentOrientation: null,
  add: function(handleObj) {
    jQuery(document).ready(function() {
      var elem     = this, $elem = jQuery(elem);
      var _handler = function(event) {
        var customEvent = jQuery.Event("deviceIndependentOrientationChange");
        $window.trigger(customEvent);
      };

      // Initialize _currentOrientation
      _currentOrientation = MobileUtilities.orientation();

      if (MobileUtilities.isIos())
      {
        // iOS throws orientationchange events correctly
        // (i.e. after window dimensions have changed)
        $elem.bind(
          'orientationchange',
          _handler
        );
      } else if (!Modernizr.touch) {
        $elem.bind(
          'resize',
          _handler
        );
      } else {
        // Android throws orientationchange events BEFORE
        // window.innerHeight has changed, so we have to
        // watch resize events and track whether the
        // orientation has changed.
        $elem.bind(
          'resize',
          function(event) {
            // Don't fire duplicates
            var newOrientation = MobileUtilities.orientation();
            if (newOrientation == _currentOrientation) return;
            _currentOrientation = newOrientation;

            // Run the handler
            _handler(event);
          }
        );
      }

      _handler();
    });
  },

  teardown: function(namespaces) {
    jQuery(this).unbind('orientationchange resize', _handler);
  }
};

jQuery.event.special.fullScreenAppDimensionsChanged = {
  add: function(handleObj) {
    var elem     = this, $elem = jQuery(elem);
    var _handler = function(event) {
      // Scroll to top
      // NOTE: This always _says_ it worked, but does not always work.
      window.doScroll();

      // Trigger event
      var customEvent = jQuery.Event("fullScreenAppDimensionsChanged");
      $window.trigger(customEvent);
    }

    // Wire up to trigger on CustomOrientationChange
    $window.bind(
      'deviceIndependentOrientationChange',
      _handler
    );
  },

  teardown: function(namespaces) {
    var elem = this, $elem = jQuery(elem);
    $window.unbind('deviceIndependentOrientationChange');
  },
};
