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

jQuery.event.special.fullScreenAppDimensionsChanged = {
  add: function(handleObj) {
    var elem     = this, $elem = jQuery(elem);
    var _handler = function(event) {
      // There's a race condition--bigDiv hasn't caused
      // the dom to lay out by the time we get to here.
      setTimeout(function() {
        // Scroll to top
        jQuery('body').scrollTop(0);
        if (MobileUtilities.isAndroid())
        {
          window.scrollTo(0, 1);
        } else {
          window.scrollTo(0, 0);
        }

        setTimeout(function() {
          // Trigger event
          var customEvent = jQuery.Event("fullScreenAppDimensionsChanged");
          $window.trigger(customEvent);
        }, 5000); // There seems to be a race condition here on Android, 100ms doesn't work on Android, 1000ms works on Android
      }, 1);
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
