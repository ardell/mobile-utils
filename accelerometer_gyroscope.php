<html>
<head>
<title>Orientation Tester</title>
<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.5.2/jquery.js"></script>
<script src="javascripts/modernizr-2.0.3.js"></script>
<script src="javascripts/modernizr.accelerometer.js"></script>
<script src="javascripts/modernizr.gyroscope.js"></script>
<script src='javascripts/jqm.mobile-utilities.js'></script>
<script src='javascripts/jquery.custom-events.js'></script>
<style type="text/css">
label {
  width: 8em;
  display: inline-block;
}
</style>
</head>
<body>

<h1>Accelerometer (<span id="accelerometer">disabled</span>)</h1>
<p>
  <label>X:</label>
  <span id="x"></span>
</p>
<p>
  <label>Y:</label>
  <span id="y"></span>
</p>

<h1>Gyroscope (<span id="gyroscope">disabled</span>)</h1>
<p>
  <label>Alpha:</label>
  <span id="alpha"></span>
</p>
<p>
  <label>Beta:</label>
  <span id="beta"></span>
</p>
<p>
  <label>Gamma:</label>
  <span id="gamma"></span>
</p>
<p>
  <label>Roll:</label>
  <span id="roll"></span>
</p>
<p>
  <label>Pitch:</label>
  <span id="pitch"></span>
</p>
<p>
  <label>Yaw:</label>
  <span id="yaw"></span>
</p>

<script>
$.noConflict();
jQuery(document).ready(function() {
  // Round values before outputting them
  var displayRoundedValue = function(selector, value) {
    var NUM_DECIMALS = 2;
    var multiplier = Math.pow(10, NUM_DECIMALS);
    var rounded = Math.round(value * multiplier) / multiplier;
    jQuery(selector).html(rounded);
  };

  // We have to throw custom orientation change events or MobileUtilities.orientation() never updates
  var customOrientationChange = CustomEvents.CustomOrientationChange.create();
  jQuery(window)
    .bind(
      CustomEvents.CustomOrientationChange.triggers,
      function() { customOrientationChange.detector.apply(customOrientationChange, arguments); }
    )
    ;

  var deviceMovement = CustomEvents.DeviceMovement.create({
    gyroscope:     true,
    accelerometer: true
  });
  jQuery(window)
    .bind(
      CustomEvents.DeviceMovement.triggers,
      function() { deviceMovement.detector.apply(deviceMovement, arguments); }
    )
    .bind('deviceMovement', function(e) {
      if (e.hardware == 'accelerometer') {
        jQuery('#accelerometer').html('enabled');
        var acc = e.accelerationIncludingGravity;
        if (acc)
        {
          if (acc.x) displayRoundedValue('#x', acc.x);
          if (acc.y) displayRoundedValue('#y', acc.y);
        }
      }

      if (e.hardware == 'gyroscope') jQuery('#gyroscope').html('enabled');
      if (e.alpha) displayRoundedValue('#alpha', e.alpha);
      if (e.beta)  displayRoundedValue('#beta',  e.beta);
      if (e.gamma) displayRoundedValue('#gamma', e.gamma);
      if (e.roll)  displayRoundedValue('#roll',  e.roll);
      if (e.pitch) displayRoundedValue('#pitch', e.pitch);
      if (e.yaw)   displayRoundedValue('#yaw',   e.yaw);
    })
    ;
});
</script>
</body>
</html>
