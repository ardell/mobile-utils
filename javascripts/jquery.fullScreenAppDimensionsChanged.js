var $window = jQuery(window);
jQuery.event.special.deviceIndependentOrientationChange = {
  _currentOrientation: null,
  add: function(handleObj) {
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
  },

  teardown: function(namespaces) {
    jQuery(this).unbind('orientationchange resize', _handler);
  }
};

window.doScroll = function() {
  console.log("begin doScroll at: " + (+new Date()));
  if (MobileUtilities.isAndroid())
  {
    window.scrollTo(0, 1);
  } else {
    window.scrollTo(0, 0);
  }
  console.log("end doScroll at: " + (+new Date()));
};

jQuery.event.special.fullScreenAppDimensionsChanged = {
  add: function(handleObj) {
    var elem     = this, $elem = jQuery(elem);
    var _handler = function(event) {
      // There's a race condition--.reallyBigDiv hasn't caused
      // the dom to lay out by the time we get to here. This
      // is true both on Android and on iOS.
      // setTimeout(function() {
        // Scroll to top
        // jQuery('body').scrollTop(0);
        window.doScroll();

        // There seems to be a race condition here on Android
        // waiting for window.scrollTo to take effect.
        //  100ms: doesn't work
        // 1000ms: works sometimes
        // 5000ms: works consistently, but it's _5 SECONDS_!
        // setTimeout(function() {
          // Trigger event
          var customEvent = jQuery.Event("fullScreenAppDimensionsChanged");
          $window.trigger(customEvent);
        // }, 5000);
      // }, 1);
    }

    // Wire up to trigger on CustomOrientationChange
    $window.bind(
      'deviceIndependentOrientationChange',
      _handler
    );

    // Fire once the first time
    setTimeout(_handler, 100);
  },

  teardown: function(namespaces) {
    var elem = this, $elem = jQuery(elem);
    $window.unbind('deviceIndependentOrientationChange');
  },
};
