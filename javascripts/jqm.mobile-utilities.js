var MobileUtilities = {

  cache: {},

  /**
   * Get the dimensions of the current environment. This
   * is how big we should make our view, including chrome
   * and controls.
   */
  dimensions: function()
  {
    // See http://mobile-utils.pagodabox.com/sizing.php
    return dims = {
      width:  window.innerWidth,
      height: window.innerHeight
    };
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
