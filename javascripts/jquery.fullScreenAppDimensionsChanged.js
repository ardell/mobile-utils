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
  // window.scrollTo(0, 3);
  // console.log("Really big div: " + jQuery('.reallyBigDiv').width() + "x" + jQuery('.reallyBigDiv').height());
  console.log("begin doScroll from: " + window.pageYOffset + " at: " + (+new Date()));
  if (MobileUtilities.isAndroid())
  {
    window.scrollTo(0, 1);
  } else {
    window.scrollTo(0, 0);
  }
  console.log("end doScroll at: " + window.pageYOffset + " at: " + (+new Date()));
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
