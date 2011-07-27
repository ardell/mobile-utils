/**
 * Add a Modernizr test for whether the accelerometer
 * is firing events. Note: testing for DeviceMotionEvent
 * is insufficient here because devices can support
 * DeviceMotionEvents without ever actually firing them.
 */
if (typeof(ModernizrCustomChecks) == 'undefined') ModernizrCustomChecks = {};
ModernizrCustomChecks.detectAccelerometer = function() {
  if (window.DeviceMotionEvent == undefined)
  {
    Modernizr.addTest('accelerometer', false);
    return;
  }

  // Watch for an event and see whether it has accelerationIncludingGravity
  if (window.addEventListener)
  {
    var listener = window.addEventListener('devicemotion', function(e) {
      window.removeEventListener('devicemotion', listener);
      var eventHasAcceleration = (e.accelerationIncludingGravity != undefined);
      Modernizr.addTest('accelerometer', eventHasAcceleration);
    }, false);
  }
};
