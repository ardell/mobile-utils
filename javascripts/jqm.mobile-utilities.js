var MobileUtilities = {

  cache: {},

  /**
   * Get the dimensions of the current environment. This
   * is how big we should make our view, including chrome
   * and controls.
   */
  dimensions: function()
  {
    // Default
    var dims = {
      width:  jQuery(window).width(),
      height: jQuery(window).height()
    };

    // iOS
    if (MobileUtilities.isIphone() || MobileUtilities.isIpod())
    {
      if (MobileUtilities.isSafari())
      {
        // If the user is on an iPhone or iPod Touch AND they're
        // using Mobile Safari, we'll take into account the
        // address bar which will be hidden on scroll.
        // jQuery(window).height() doesn't count the height of the
        // address bar so it makes our window too short.
        dims = {
          width:  jQuery(window).width(),
          height: jQuery(window).height() + 60
        };
      } else {
        // They're probably in a UI Web View (e.g. a QR Code scanner)
        dims = {
          width:  jQuery(window).width(),
          height: jQuery(window).height()
        };
      }
    }

    // Android
    if(MobileUtilities.isAndroid())
    {
      scrollTo(0, 1); // Need this, otherwise Android doesn't return correct dimensions and has a huge gap at the$
      dims = {
        width:  screen.availWidth,
        height: screen.availHeight
        // After a ton of research I determined that it is likely impossible to fill height
        // on all devices in order to remove the address bar. We'll just have to be fine with
        // showing the address bar on Android devices for now.
        //            Width Height PxRatio Dimensions
        // Comet:     240px 320px  1       333x410
        // Nexus One: 480px 800px  1.5     440x699
        // window.outerHeight gives us a fixed height of the window, including empty space
        // screen.height and jQuery(window).height tells us how tall the element is, not including empty space
        // window.innerHeight works perfectly on Nexus One, but does not remove the address bar on comet.
        // screen.availHeight does not include the address bar on Android (not tested on iOS)
        // height: window.outerHeight - 62 // Nexus One (to remove address bar)
        // height: window.outerHeight + 115 // Comet (to remove address bar)
      };
    }

    return dims;
  },

  orientation: function()
  {
    var dims = MobileUtilities.dimensions();
    var orientation = 'portrait';
    if (dims.width > dims.height) orientation = 'landscape';
    return orientation;
  },

  isIphone: function()
  {
    var cacheKey = 'isIphone';

    // Try first to pull from the cache
    if (MobileUtilities.cache[cacheKey] != null) return MobileUtilities.cache[cacheKey];

    // Otherwise populate the cache
    var value = false;
    if (navigator.userAgent.match(/iPhone/i)) value = true;
    MobileUtilities.cache[cacheKey] = value;
    return MobileUtilities.cache[cacheKey];
  },

  isIpod: function()
  {
    var cacheKey = 'isIpod';

    // Try first to pull from the cache
    if (MobileUtilities.cache[cacheKey] != null) return MobileUtilities.cache[cacheKey];

    // Otherwise populate the cache
    var value = false;
    if (navigator.userAgent.match(/iPod/i)) value = true;
    MobileUtilities.cache[cacheKey] = value;
    return MobileUtilities.cache[cacheKey];
  },

  isIpad: function()
  {
    var cacheKey = 'isIpad';

    // Try first to pull from the cache
    if (MobileUtilities.cache[cacheKey] != null) return MobileUtilities.cache[cacheKey];

    // Otherwise populate the cache
    var value = false;
    if (navigator.userAgent.match(/iPad/i)) value = true;
    MobileUtilities.cache[cacheKey] = value;
    return MobileUtilities.cache[cacheKey];
  },

  isIos: function()
  {
    var cacheKey = 'isIos';

    // Try first to pull from the cache
    if (MobileUtilities.cache[cacheKey] != null) return MobileUtilities.cache[cacheKey];

    // Otherwise populate the cache
    var value = false;
    if (navigator.userAgent.match(/iPhone|iPod|iPad/i)) value = true;
    MobileUtilities.cache[cacheKey] = value;
    return MobileUtilities.cache[cacheKey];
  },

  /**
   * Is the current browser the Safari App on iOS?
   * (as opposed to a UI Web View, for instance within
   * a QR Code Scanning app).
   */
  isSafari: function()
  {
    var cacheKey = 'isSafari';

    // Try first to pull from the cache
    if (MobileUtilities.cache[cacheKey] != null) return MobileUtilities.cache[cacheKey];

    // Otherwise populate the cache
    var value = false;
    if (navigator.userAgent.match(/Safari/i)) value = true;
    MobileUtilities.cache[cacheKey] = value;
    return MobileUtilities.cache[cacheKey];
  },

  isAndroid: function()
  {
    var cacheKey = 'isAndroid';

    // Try first to pull from the cache
    if (MobileUtilities.cache[cacheKey] != null) return MobileUtilities.cache[cacheKey];

    // Otherwise populate the cache
    var isAndroid = false;
    if (navigator.userAgent.match(/Android/i)) isAndroid = true;
    MobileUtilities.cache[cacheKey] = isAndroid;
    return MobileUtilities.cache[cacheKey];
  },

  isTouchDevice: function()
  {
    try {
      document.createEvent("TouchEvent");
      return true;
    } catch (e) {
    }
    return false;
  },

  canonicalTapEventType: function()
  {
    if (MobileUtilities.isTouchDevice()) return 'tap';
    return 'click';
  },

  /**
   * Prefer orientationchange event if the device supports it and the
   * device is not Android.
   * Binding to resize on iOS causes "maximum call stack exceeded"
   * Orientationchange on Android fires before the dom is resized so
   * we have to watch for resize on Android.
   */
  canonicalResizeEvent: function()
  {
    return 'customOrientationChange';
  },

  deviceInfo: function()
  {
    var cacheKey = 'deviceInfo';

    // Try first to pull from the cache
    if (MobileUtilities.cache[cacheKey] != null) return MobileUtilities.cache[cacheKey];

    // Otherwise populate the cache
    var dimensions = MobileUtilities.dimensions();
    var deviceInfo = {
      userAgent:          navigator.userAgent,
      isIos:              MobileUtilities.isIos(),
      isIphone:           MobileUtilities.isIphone(),
      isIpod:             MobileUtilities.isIpod(),
      isIpad:             MobileUtilities.isIpad(),
      isAndroid:          MobileUtilities.isAndroid(),
      hasTouch:           Modernizr.touch,
      hasGyroscope:       Modernizr.gyroscope,
      hasAccelerometer:   Modernizr.accelerometer,
      hasCssTransforms3d: Modernizr.csstransforms3d,
      hasCssTransitions:  Modernizr.csstransitions,
      width:              dimensions.width,
      height:             dimensions.height,
      orientation:        MobileUtilities.orientation(),
      devicePixelRatio:   window.devicePixelRatio
    };
    MobileUtilities.cache[cacheKey] = deviceInfo;

    return MobileUtilities.cache[cacheKey];
  },

};
