/**
 * Custom Events
 * Copyright 2011, Jason Ardell
 * Licensed under the MIT license.
 *
 * TODO: Convert to jQuery.event.special, see:
 * http://blog.threedubmedia.com/2008/08/eventspecialdrag.html
 *
 * Each CustomEvent has:
 * - triggers: an array of events that can trigger the
 *             custom event. Note: CustomEvents can
 *             use triggers to cascade.
 * - detector: a function used to detect whether the
 *             event has been fulfilled.
 *
 * Existing CustomEvents:
 * - TouchAndHold
 * - Pan
 * - HardwarePan
 * - Drag
 * - SimpleTap
 * - CustomOrientationChange
 */
CustomEvents = {};

/**
 * TouchAndHold event: Triggered when a user
 * touches (iOS) or clicks (desktop) and holds
 * for $timeout milliseconds without releasing
 * in between, and without moving more than
 * $threshold pixels before the timeout
 * expires.
 *
 * TODO: Add resumable option?
 */
CustomEvents.TouchAndHold = {

  triggers: [
    'touchstart',
    'touchmove',
    'touchend',
    'mousedown',
    'mousemove',
    'mouseup'
  ].join(' '),

  create: function(options) {
    var touchAndHoldEventObj = {
      timeout:           500,
      _timer:            null,
      _isHeld:           false,
      resumeTimeout:     null,
      _resumeTimer:      null,
      _isPaused:         false,
      preHoldThreshold:  20,               // in pixels
      postHoldThreshold: Number.MAX_VALUE, // in pixels
      _startPosition:    {},

      init: function(options)
      {
        if (!options)
        {
          options = {};
        }
        if (typeof(options.timeout) != 'undefined')
        {
          this.timeout = options.timeout;
        }
        if (typeof(options.resumeTimeout) != 'undefined')
        {
          this.resumeTimeout = options.resumeTimeout;
        }
        if (typeof(options.preHoldThreshold) != 'undefined')
        {
          this.preHoldThreshold = options.preHoldThreshold;
        }
        if (typeof(options.postHoldThreshold) != 'undefined')
        {
          this.postHoldThreshold = options.postHoldThreshold;
        }
        return this;
      },

      detector: function(event) {
        var coords      = this._getCoords(event);
        if (['touchstart', 'mousedown'].indexOf(event.type) >= 0)
        {
          // If event is isPaused: resume, otherwise: start timer
          if (this._isHeld && this._isPaused)
          {
            // Resume from paused state
            this._isPaused = false;
            clearTimeout(this._resumeTimer);
            this._recordPosition(event);

            var customEvent = jQuery.Event("touchAndHoldResume");
            customEvent.x   = coords.x;
            customEvent.y   = coords.y;
            jQuery(event.currentTarget).trigger(customEvent);
          } else if (!this._isHeld && !this._isPaused) {
            // Record the starting position so we can detect
            // later whether we are inside threshold.
            this._recordPosition(event);

            // Set a timer that will mark the completion of the touchAndHold timeout
            this._timer = setTimeout(function() {
              this._isHeld  = true;

              // Throw our custom event
              var customEvent = jQuery.Event("touchAndHoldStart");
              customEvent.x   = coords.x;
              customEvent.y   = coords.y;
              jQuery(event.currentTarget).trigger(customEvent);
            }.bind(this), this.timeout);

            var customEvent = jQuery.Event("touchAndHoldInitialize");
            customEvent.x   = coords.x;
            customEvent.y   = coords.y;
            jQuery(event.currentTarget).trigger(customEvent);
          }
        } else if (['touchend', 'mouseup'].indexOf(event.type) >= 0) {
          this._pauseOrEnd(event, 'touch released');
        } else if (['touchmove', 'mousemove'].indexOf(event.type) >= 0) {
          var currentPosition = this._getCoords(event);
          var xDiff = Math.abs(this._startPosition.x - currentPosition.x);
          var yDiff = Math.abs(this._startPosition.y - currentPosition.y);

          // Cancel the timer if the user moves outside the threshold
          var currentThreshold = this._getThreshold();
          if (xDiff > currentThreshold || yDiff > currentThreshold)
          {
            this._isHeld   = false;
            this._isPaused = false;
            this._pauseOrEnd(event, 'moved outside threshold');
          }
        }

        // If we're held at the end then go ahead and fire
        if (this._isHeld && !this._isPaused)
        {
          jQuery(event.currentTarget).trigger('touchAndHoldContinue', {});
        }

        return true;
      },

      _recordPosition: function(event)
      {
        if (event.type == 'touchstart')
        {
          this._startPosition = { x: event.pageX, y: event.pageY };
        } else if (event.type == 'mousedown') {
          this._startPosition = { x: event.clientX, y: event.clientY };
        }
      },

      _pauseOrEnd: function(event, reason)
      {
        if (!this._isHeld)
        {
          if (this._timer) clearTimeout(this._timer);
          var customEvent    = jQuery.Event("touchAndHoldCancel");
          customEvent.reason = reason;
          jQuery(event.currentTarget).trigger(customEvent);
          return;
        }

        if (typeof(this.resumeTimeout) == 'undefined')
        {
          // If there's no resumeTimeout, fire touchAndHoldEnd immediately
          this._isPaused = false;
          this._isHeld   = false;
          jQuery(event.currentTarget).trigger('touchAndHoldEnd', { reason: 'touch released' });
        } else {
          // There is a resumeTimeout
          // 1) Throw touchAndHoldPause and
          this._isPaused = true;
          jQuery(event.currentTarget).trigger('touchAndHoldPause', { reason: reason });

          // 2) Set a timer for touchAndHoldEnd
          this._resumeTimer = setTimeout(function() {
            this._isPaused = false;
            this._isHeld   = false;
            jQuery(event.currentTarget).trigger('touchAndHoldEnd', { reason: reason });
          }.bind(this), this.resumeTimeout);
        }
      },

      _getThreshold: function()
      {
        if (this._isHeld)
        {
          return this.postHoldThreshold;
        }

        return this.preHoldThreshold;
      },

      _getCoords: function(event)
      {
        var coords = {};

        // If it's a touch event we'll use touches[0].pageX/Y
        // Event type is touchmove, but it has no touches; why!?
        if (event.originalEvent && event.originalEvent.touches && event.originalEvent.touches[0])
        {
          var touch = event.originalEvent.touches[0];
          return { x: touch.pageX, y: touch.pageY };
        }

        // Otherwise use clientX/Y
        return { x: event.clientX, y: event.clientY };
      }
    };

    return touchAndHoldEventObj.init(options);
  }
};

/**
 * Pan event: Triggered when a user touches
 * and holds, then moves.
 */
CustomEvents.Pan = {

  triggers: [
    'touchAndHoldStart',
    'touchAndHoldPause',
    'touchAndHoldResume',
    'mousemove',
    'touchmove',
    'touchAndHoldEnd'
  ].join(' '),

  create: function(options) {
    var panEventObj = {
      _isPanning: false,
      _isPaused:  false,

      init: function(options)
      {
        if (!options)
        {
          options = {};
        }
        return this;
      },

      detector: function(event) {
        var coords      = this._getCoords(event);
        if (event.type == 'touchAndHoldStart')
        {
          this._isPanning = true;
          this._isPaused  = false;
          var customEvent = jQuery.Event("panStart");
          customEvent.x   = event.x;
          customEvent.y   = event.y;
          jQuery(event.currentTarget).trigger(customEvent);
        } else if (event.type == 'touchAndHoldPause') {
          this._isPaused = true;
          var customEvent = jQuery.Event("panPause");
          customEvent.x   = event.x;
          customEvent.y   = event.y;
          jQuery(event.currentTarget).trigger(customEvent);
        } else if (event.type == 'touchAndHoldResume') {
          this._isPaused = false;
          var customEvent = jQuery.Event("panResume");
          customEvent.x   = event.x;
          customEvent.y   = event.y;
          jQuery(event.currentTarget).trigger(customEvent);
        } else if (event.type == 'touchAndHoldEnd') {
          if (this._isPanning)
          {
            this._isPanning = false;
            this._isPaused  = false;
            var customEvent = jQuery.Event("panEnd");
            customEvent.x   = event.x;
            customEvent.y   = event.y;
            customEvent.reason = 'touch released';
            jQuery(event.currentTarget).trigger(customEvent);
          }
        }

        // If we're held at the end then go ahead and fire
        if (this._isPanning && !this._isPaused)
        {
          // If it's a move event, stop propagation
          if (['touchmove', 'mousemove'].indexOf(event.type) >= 0)
          {
            event.stopPropagation();
            event.preventDefault();
          }

          // Throw our custom event
          var coords      = this._getCoords(event);
          var customEvent = jQuery.Event("panMove");
          customEvent.x   = coords.x;
          customEvent.y   = coords.y;
          jQuery(event.currentTarget).trigger(customEvent);
        }

        return true;
      },

      _getCoords: function(event)
      {
        var coords = {};

        // If it's a touch event we'll use touches[0].pageX/Y
        // Event type is touchmove, but it has no touches; why!?
        if (event.originalEvent && event.originalEvent.touches && event.originalEvent.touches[0])
        {
          var touch = event.originalEvent.touches[0];
          return { x: touch.pageX, y: touch.pageY };
        }

        // Otherwise use clientX/Y
        return { x: event.clientX, y: event.clientY };
      }
    };

    return panEventObj.init(options);
  }
};

/**
 * HardwarePan event: Triggered by movements
 * of the gyroscope or accelerometer.
 */
CustomEvents.HardwarePan = {

  triggers: [
    'deviceorientation',
    'devicemotion'
  ].join(' '),

  create: function(options) {
    var hardwarePanEventObj = {
      _detectGyroscope:     true,
      _detectAccelerometer: true,
      _currentPosition:     0,
      _mode:                false,

      init: function(options)
      {
        if (!options)
        {
          options = {};
        }
        if (options.gyroscope == false)
        {
          this._detectGyroscope = false;
        }
        if (options.accelerometer == false)
        {
          this._detectAccelerometer = false;
        }
        if (options.initialPosition != null)
        {
          this._currentPosition = options.initialPosition;
        }
        return this;
      },

      detector: function(event) {
        if (event.type == 'deviceorientation' && !this._detectGyroscope) return true;
        if (event.type == 'devicemotion' && !this._detectAccelerometer) return true;

        // Compute euler angles from alpha/beta/gamma
        // see: http://stackoverflow.com/questions/5420986/converting-g-force-data-to-rotation
        // see: https://github.com/fieldOfView/krpano_gyro/blob/master/krpanogyro.js
        var angles = null;
        if (event.type == 'deviceorientation') {
          var originalEvent = event.originalEvent;
          var degRad = Math.PI/180;
          var angles = this._rotateEuler({
            yaw:   originalEvent.alpha * degRad,
            pitch: originalEvent.beta * degRad,
            roll:  originalEvent.gamma * degRad
          });

          // Correct from radians back to degrees
          angles.yaw   /= degRad;
          angles.pitch /= degRad;
          angles.roll  /= degRad;
        }

        // If we have both an accelerometer and a gyroscope we'll do
        // rotate-to-pan if the user is looking horizontally, otherwise
        // we'll to tilt-to-pan.
        var orientation  = MobileUtilities.orientation();
        var previousMode = this._mode;
        if (this._detectGyroscope && this._detectAccelerometer && event.type == 'deviceorientation') {
          var pitch = angles.pitch;
          if (pitch > 45) this._mode = 'tilt-to-pan';
          if (pitch < 25) this._mode = 'rotate-to-pan';
        }
        if (this._detectAccelerometer && !this._detectGyroscope) {
          this._mode = 'tilt-to-pan';
        }

        // Throw a mode change event if we've changed modes
        if (previousMode != this._mode)
        {
          var customEvent          = jQuery.Event("hardwarePanModeChange");
          customEvent.previousMode = previousMode;
          customEvent.mode         = this._mode;
          jQuery(event.currentTarget).trigger(customEvent);
        }

        // If the current mode doesn't match the event type then ignore the event
        if (this._mode == 'tilt-to-pan' && event.type != 'devicemotion') return true;
        if (this._mode == 'rotate-to-pan' && event.type != 'deviceorientation') return true;

        // Throw the proper event
        if (event.type == 'deviceorientation') {
          if (event.originalEvent.alpha == undefined) return true;
          if (event.originalEvent.beta  == undefined) return true;
          if (event.originalEvent.gamma == undefined) return true;

          var customEvent       = jQuery.Event("hardwarePanMove");
          customEvent.hardware  = 'gyroscope';
          customEvent.angle     = -angles.yaw;
          customEvent.alpha     = event.originalEvent.alpha;
          customEvent.beta      = event.originalEvent.beta;
          customEvent.gamma     = event.originalEvent.gamma;
          customEvent.roll      = angles.roll;
          customEvent.pitch     = angles.pitch;
          customEvent.yaw       = angles.yaw;
          jQuery(event.currentTarget).trigger(customEvent);
        } else if (event.type == 'devicemotion') {
          var acceleration = null;
          if (orientation == 'landscape')
          {
            acceleration = -event.originalEvent.accelerationIncludingGravity.y;
          } else {
            acceleration = event.originalEvent.accelerationIncludingGravity.x;
          }
          var angle = acceleration / 9.8 * 90;

          var customEvent                          = jQuery.Event("hardwarePanMove");
          customEvent.hardware                     = 'accelerometer';
          customEvent.angle                        = angle;
          customEvent.accelerationIncludingGravity = event.originalEvent.accelerationIncludingGravity;
          jQuery(event.currentTarget).trigger(customEvent);
        }

        return true;
      },

      _rotateEuler: function(euler) {
        // based on http://www.euclideanspace.com/maths/geometry/rotations/conversions/eulerToMatrix/index.htm
        // and http://www.euclideanspace.com/maths/geometry/rotations/conversions/matrixToEuler/index.htm

        var heading, bank, attitude,
          ch = Math.cos(euler.yaw),
          sh = Math.sin(euler.yaw),
          ca = Math.cos(euler.pitch),
          sa = Math.sin(euler.pitch),
          cb = Math.cos(euler.roll),
          sb = Math.sin(euler.roll);

        // note: includes 90 degree rotation around z axis
        matrix = new Array(
          sh*sb - ch*sa*cb,   -ch*ca,    ch*sa*sb + sh*cb,
          ca*cb,              -sa,      -ca*sb,
          sh*sa*cb + ch*sb,    sh*ca,   -sh*sa*sb + ch*cb
        );

        /* [m00 m01 m02] 0 1 2
         * [m10 m11 m12] 3 4 5
         * [m20 m21 m22] 6 7 8 */

        if (matrix[3] > 0.9999) { // singularity at north pole
          heading = Math.atan2(matrix[2],matrix[8]);
          attitude = Math.PI/2;
          bank = 0;
        } else if (matrix[3] < -0.9999) { // singularity at south pole
          heading = Math.atan2(matrix[2],matrix[8]);
          attitude = -Math.PI/2;
          bank = 0;
        } else {
          heading = Math.atan2(-matrix[6],matrix[0]);
          bank = Math.atan2(-matrix[5],matrix[4]);
          attitude = Math.asin(matrix[3]);
        }

        return {
          yaw:   heading,
          pitch: attitude,
          roll:  bank
        };
      }
    };

    return hardwarePanEventObj.init(options);
  }
};

/**
 * Drag event: Triggered when a user clicks
 * then moves at least one pixel. Fires
 * dragMove events whenever the user moves
 * within a drag, and dragEnd event when the
 * user releases touch/mouse.
 */
CustomEvents.Drag = {

  triggers: [
    'touchstart',
    'touchmove',
    'touchend',
    'mousedown',
    'mousemove',
    'mouseup'
  ].join(' '),

  create: function(options) {
    var dragEventObj = {
      _isClicked:     false, // Have they passed the first stage of clicking before moving 1px or more?
      _isDragging:    false,
      _startPosition: {},

      init: function(options)
      {
        if (!options)
        {
          options = {};
        }
        return this;
      },

      detector: function(event) {
        if (['touchstart', 'mousedown'].indexOf(event.type) >= 0)
        {
          this._startPosition = this._getPosition(event);
          this._isClicked     = true;
        } else if (['touchend', 'mouseup'].indexOf(event.type) >= 0) {
          if (this._isDragging)
          {
            var position              = this._getPosition(event);
            var customEvent           = jQuery.Event('dragEnd');
            customEvent.x             = position.x;
            customEvent.y             = position.y;
            customEvent.xDisplacement = this._startPosition.x - position.x;
            customEvent.yDisplacement = this._startPosition.y - position.y;
            jQuery(event.currentTarget).trigger(customEvent);
            this._startPosition = null;
          }
          this._isClicked  = false;
          this._isDragging = false;
        } else if (['touchmove', 'mousemove'].indexOf(event.type) >= 0) {
          var position    = this._getPosition(event);

          // First look for a dragStart event
          if (this._isClicked && !this._isDragging && this._startPosition)
          {
            var amountMoved = Math.abs(position.x - this._startPosition.x) + Math.abs(position.y - this._startPosition.y);
            if (amountMoved > 0)
            {
              this._isDragging = true;
              var customEvent  = jQuery.Event('dragStart');
              customEvent.x    = position.x;
              customEvent.y    = position.y;
              jQuery(event.currentTarget).trigger(customEvent);
            }
          }

          // Next fire a dragMove event
          if (this._isDragging)
          {
            var customEvent           = jQuery.Event('dragMove');
            customEvent.xDisplacement = this._startPosition.x - position.x;
            customEvent.yDisplacement = this._startPosition.y - position.y;
            customEvent.x             = position.x;
            customEvent.y             = position.y;
            jQuery(event.currentTarget).trigger(customEvent);
          }
        }

        event.preventDefault();
        return true;
      },

      _getPosition: function(event)
      {
        var coords = {};

        // If it's a touch event we'll use touches[0].pageX/Y
        // Event type is touchmove, but it has no touches; why!?
        if (event.originalEvent && event.originalEvent.touches && event.originalEvent.touches[0])
        {
          var touch = event.originalEvent.touches[0];
          return { x: touch.pageX, y: touch.pageY };
        }

        // Otherwise use clientX/Y
        return { x: event.clientX, y: event.clientY };
      }

    };

    return dragEventObj.init(options);
  }
};

/**
 * SimpleTap event: Triggered when a user simply
 * taps/clicks once without moving their finger
 * or mouse more than threshold pixels.
 */
CustomEvents.SimpleTap = {

  triggers: [
    'touchstart',
    'touchmove',
    'touchend',
    'mousedown',
    'mousemove',
    'mouseup'
  ].join(' '),

  create: function(options) {
    var simpleTapEventObj = {
      timeout:           250,
      _timer:            null,
      threshold:         20,
      _startPosition:    {},
      _isStarted:        false,
      _isExpired:        false,

      init: function(options)
      {
        if (!options)
        {
          options = {};
        }
        if (typeof(options.timeout) != 'undefined')
        {
          this.timeout = options.timeout;
        }
        if (typeof(options.threshold) != 'undefined')
        {
          this.threshold = options.threshold;
        }
        return this;
      },

      detector: function(event) {
        if (['touchstart', 'mousedown'].indexOf(event.type) >= 0)
        {
          // Set a timer that will expire the event
          this._isStarted     = true;
          this._isExpired     = false;
          this._startPosition = this._getPosition(event);
          var ste             = this;
          this._timer         = setTimeout(function() {
            ste._cancel();
          }, this.timeout);
        } else if (['touchmove', 'mousemove'].indexOf(event.type) >= 0) {
          if (this._isStarted && !this._isExpired)
          {
            // Get the current position and differences
            var currentPosition = this._getPosition(event);
            if (Math.abs(currentPosition.x - this._startPosition.x) > this.threshold) this._cancel();
            if (Math.abs(currentPosition.y - this._startPosition.y) > this.threshold) this._cancel();
          }
        } else if (['touchend', 'mouseup'].indexOf(event.type) >= 0) {
          if (!this._isExpired)
          {
            var customEvent = jQuery.Event('simpleTap');
            jQuery(event.currentTarget).trigger(customEvent);
            this._isExpired = true;
          }
        }

        return true;
      },

      _cancel: function()
      {
        this._isStarted = false;
        this._isExpired = true;
        clearTimeout(this._timer);
      },

      _getPosition: function(event)
      {
        var coords = {};

        // If it's a touch event we'll use touches[0].pageX/Y
        // Event type is touchmove, but it has no touches; why!?
        if (event.originalEvent && event.originalEvent.touches && event.originalEvent.touches[0])
        {
          var touch = event.originalEvent.touches[0];
          return { x: touch.pageX, y: touch.pageY };
        }

        // Otherwise use clientX/Y
        return { x: event.clientX, y: event.clientY };
      }

    };

    return simpleTapEventObj.init(options);
  }
};

/**
 * CustomOrientationChange event: Triggered when the
 * user changes orientations.
 *
 * Android hasn't redrawn by the time they throw
 * regular orientationchange event so we watch
 * resize and see whether the window size has
 * changed yet.
 *
 * iOS fires orientationchange event correctly.
 */
CustomEvents.CustomOrientationChange = {

  triggers: [
    'resize',
    'orientationchange'
  ].join(' '),

  create: function(options) {
    var customOrientationChangeEventObj = {
      _currentOrientation: null, // Only used by Android

      init: function(options)
      {
        if (!options)
        {
          options = {};
        }
        return this;
      },

      detector: function(event) {
        if (MobileUtilities.isAndroid())
        {
          if (event.type != 'resize') return;

          // Calculate the new orientation
          var orientation = MobileUtilities.orientation();
          this._currentOrientation = orientation;

          // Fire a custom orientation change event
          var customEvent = jQuery.Event('customOrientationChange');
          jQuery(event.currentTarget).trigger(customEvent);
          return;
        }

        if (!Modernizr.touch)
        {
          // It's a real browser masquerading its user agent!
          // Trigger on resize events
          // if (event.type != 'resize') return;
          var customEvent = jQuery.Event('customOrientationChange');
          jQuery(event.currentTarget).trigger(customEvent);
          return;
        }

        if (event.type != 'orientationchange') return;
        var customEvent = jQuery.Event('customOrientationChange');
        jQuery(event.currentTarget).trigger(customEvent);

        return true;
      }
    };

    return customOrientationChangeEventObj.init(options);
  }
};
