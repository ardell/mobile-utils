/**
 * Add a Modernizr test for whether the gyroscope is firing
 * events with alpha, beta, and gamma defined. Note: testing
 * for DeviceOrientationEvent is insufficient here because
 * devices can support DeviceOrientationEvents without ever
 * actually firing them.
 */
if (typeof(ModernizrCustomChecks) == 'undefined') ModernizrCustomChecks = {};
ModernizrCustomChecks.detectGyroscope = function() {
  if (window.DeviceOrientationEvent == undefined)
  {
    Modernizr.addTest('gyroscope', false);
  }

  // Watch for an event and see whether it has alpha, beta, and gamma
  if (window.addEventListener)
  {
    var listener = window.addEventListener('deviceorientation', function(e) {
      window.removeEventListener('deviceorientation', listener);
      var eventHasVectors = (e.alpha != undefined && e.beta != undefined && e.gamma != undefined);
      Modernizr.addTest('gyroscope', eventHasVectors);
    }, false);
  }
};
