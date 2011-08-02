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

      // Append really big div so scrollTo works?
      var callback = function() {
        // There's a race condition--bigDiv hasn't caused
        // the dom to lay out by the time we get to here.

        // scrollTo (0,0) on iOS, (0,1) on Android
        if (MobileUtilities.isAndroid())
        {
          scrollTo(0, 1);
          console.log("scrolledTo 0,1");
        } else {
          scrollTo(0, 0);
          console.log("scrolledTo 0,0");
        }

        // Record dimensions
        var dimensions = MobileUtilities.dimensions();
        console.log("got dimensions: " + dimensions.width + ":" + dimensions.height);

        // Trigger event
        var customEvent        = jQuery.Event("fullScreenAppDimensionsChanged");
        customEvent.dimensions = dimensions;
        $window.trigger(customEvent);
        console.log("triggered fsadc dimensions");

        setTimeout(function() {
          // Clean up
          bigDiv.remove();
          console.log("removed div");
        }, 1000);
      };
      var timer = setInterval(function() {
        var bigDivElement = jQuery('.bigDiv');
        var $document = jQuery(document);
        if (bigDivElement.length < 1) return;
        if ($document.width() < 2000) return;
        if ($document.height() < 2000) return;
        clearTimeout(timer);
        callback();
      }, 100);
      var bigDiv = jQuery('<div class="bigDiv"></div>').css({
        width: 2000,
        height: 2000,
        display: 'inline-block'
      });
      jQuery('body').append(bigDiv);
      console.log("appended bigDiv");
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
