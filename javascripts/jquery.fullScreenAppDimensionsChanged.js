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
    console.log("setting up");

    var elem     = this, $elem = jQuery(elem);
    var _handler = function(event) {
      console.log("inside the handler");

      // There's a race condition--bigDiv hasn't caused
      // the dom to lay out by the time we get to here.
      setTimeout(function() {
        // scrollTo (0,0) on iOS, (0,1) on Android
        if (MobileUtilities.isAndroid())
        {
          jQuery('html,body').scrollTop(100);
          console.log("scrolledTo 0,100");
        } else {
          jQuery('html,body').scrollTop(100);
          console.log("scrolledTo 0,100");
        }

        setTimeout(function() {
          // Record dimensions
          var dimensions = MobileUtilities.dimensions();
          console.log("got dimensions: " + dimensions.width + ":" + dimensions.height);

          // Trigger event
          var customEvent        = jQuery.Event("fullScreenAppDimensionsChanged");
          customEvent.dimensions = dimensions;
          $window.trigger(customEvent);
          console.log("triggered fsadc dimensions");
        }, 1000);
      }, 1000);
    }

    // Wire up to trigger on CustomOrientationChange
    $window.bind(
      'deviceIndependentOrientationChange',
      _handler
    );

    // Fire once the first time
    console.log("firing the handler");
    setTimeout(_handler, 100);
  },

  teardown: function(namespaces) {
    var elem = this, $elem = jQuery(elem);
    $window.unbind('deviceIndependentOrientationChange');
  },
};
