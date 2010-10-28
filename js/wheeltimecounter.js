(function($) {
  $.fn.wheelTimeCounter = function() {
    var animationDelay = 100; // animate every 0.1 seconds by default
    var animating = false;
    var hasInitialized = false;
    var $that = this;
    var oldTargetValue = null;
    var newTargetValue;
    var oldDisplayString = '';
    var quantum;

    var now = function() {
      return (new Date().getTime());
    };

    var getInitialValue = function() {
      var n = Number($that.text());
      return n;
    };

    var formatter = function(value) { // can be replaced by setFormatter
      return value;
    };

    var endMoment = now();

    var $container = $('<span/>').addClass('tickCounterContainer');

    var setValueForDigit = function(digitNumber, value) {
      var className = 'tickCounterDigit' + digitNumber;
      var $digit = $container.find('.' + className);
      var $digitValue = $('<span/>').addClass('tickCounterDigitValue').html(value);
      if (!$digit.length) {
        var $outerDigit = $('<span/>').addClass('tickCounterDigitContainer');
        $digit = $('<span/>').addClass('tickCounterDigit ' + className);
        $digit.append($digitValue);
        $outerDigit.append($digit);
        $container.prepend($outerDigit);
      } else {
        var $previousDigit = $digit.find('.tickCounterDigitValue');
        if ($previousDigit.text() !== value) {
          var height = $digit.height();
          $digit.append($digitValue);
          $digit.animate({
            top: (-height)+'px'
          }, Math.max(20, animationDelay - 20), function() {
            $digit.children().eq(0).remove();
            $digit.css({ top: null });
          });
        }
      }
    };

    var setValue = function(value) {
      var asString = String(formatter(value));
      var numDigits = asString.length;
      var digitDiff = oldDisplayString.length - asString.length;
      if (digitDiff > 0) {
        $that.find('.tickCounterDigitContainer').slice(0, digitDiff).remove();
      }
      for (var i = numDigits; i > 0; i--) {
        setValueForDigit(numDigits - i + 1, asString.charAt(i - 1));
      }
      oldDisplayString = asString;
    };

    var poisson = function(lambda) {
      var L = Math.exp(-lambda);
      var p = Math.random();
      var k = 1;

      while (p > L) {
        k++;
        p *= Math.random();
      }

      return k - 1;
    };

    var animate = function() {
      animating = true;
      var currentDisplayValue = oldTargetValue;
      var runningTotal = currentDisplayValue;

      var increment = function() {
        if (now() < endMoment && currentDisplayValue != newTargetValue) {
          var timeToFill = endMoment - now();
          var diff = newTargetValue - currentDisplayValue;
          var incrementAmount = diff / (timeToFill / animationDelay);
          if (quantum) {
            incrementAmount = poisson(incrementAmount / quantum) * quantum;
          }
          runningTotal += incrementAmount;
          if (currentDisplayValue < newTargetValue) {
            if (runningTotal >= currentDisplayValue + 1) {
              currentDisplayValue = Math.min(newTargetValue, Math.round(runningTotal));
              setValue(currentDisplayValue);
            }
          } else {
            if (runningTotal <= currentDisplayValue - 1) {
              currentDisplayValue = Math.max(newTargetValue, Math.round(runningTotal));
              setValue(currentDisplayValue);
            }
          }
          window.setTimeout(increment, animationDelay);
        } else {
          if (currentDisplayValue != newTargetValue) {
            setValue(newTargetValue);
          }
          oldTargetValue = newTargetValue;
          animating = false;
        }
      };
      increment();
    };

    var self = {
      initialize: function() {
        if (!hasInitialized) {
          if (oldTargetValue === null) {
            oldTargetValue = getInitialValue();
          }
          $that.empty().append($container);
          setValue(oldTargetValue);
          hasInitialized = true;
        }
        return self;
      },
      setInitialValue: function(value) {
        oldTargetValue = value;
        return self;
      },
      setAnimationDelay: function(value) {
        animationDelay = value;
        return self;
      },
      setFormatter: function(callback) {
        formatter = callback;
        return self;
      },
      setQuantum: function(value) {
        quantum = value;
        return self;
      },
      updateAndWait: function(newValue, delay) {
        endMoment = new Date(now() + delay);
        newTargetValue = newValue;
        if (!animating) {
          animate();
        }
        return self;
      }
    };
    return self;
  };
})(jQuery);
