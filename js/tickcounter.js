jQuery.fn.extend({
  tickCounter: function(params) {
    var frequency = params.updateFrequency || 5000; // poll every 5 seconds
    var animationDelay = params.animationDelay || 100; // animate every 0.1 seconds
    var onUpdate = params.onUpdate || function() {};
    var active = false;
    var animating = false;
    var $that = this;
    var initialValue;
    var currentRealValue;
    var targetValue;

    var now = function() {
      return (new Date().getTime());
    };

    var getInitialValue = function() {
      var n = Number($that.text());
      return n;
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
      var asString = String(value);
      var numDigits = asString.length;
      var digitDiff = String(currentRealValue).length - asString.length;
      if (digitDiff > 0) {
        $that.find('.tickCounterDigitContainer').slice(0, digitDiff).remove();
      }
      $that.each(function() {
        var $this = $(this);
        for (var i = numDigits; i > 0; i--) {
          setValueForDigit(numDigits - i + 1, asString.charAt(i - 1));
        }
      });
    };

    var initialValue = currentRealValue = getInitialValue();
    $that.empty().append($container);

    setValue(initialValue);

    var animate = function() {
      animating = true;
      var currentValue = currentRealValue;
      var runningTotal = currentValue;

      var increment = function() {
        if (now() < endMoment && currentValue != targetValue) {
          var timeToFill = endMoment - now();
          var diff = targetValue - currentValue;
          var incrementAmount = diff / (timeToFill / animationDelay);
          runningTotal += incrementAmount;
          if (currentValue < targetValue) {
            if (runningTotal >= currentValue + 1) {
              currentValue = Math.min(targetValue, Math.round(runningTotal));
              setValue(currentValue);
            }
          } else {
            if (runningTotal <= currentValue - 1) {
              currentValue = Math.max(targetValue, Math.round(runningTotal));
              setValue(currentValue);
            }
          }
          window.setTimeout(increment, animationDelay);
        } else {
          if (currentValue != targetValue) {
            setValue(targetValue);
          }
          currentRealValue = targetValue;
          animating = false;
        }
      }
      increment();
    };

    return {
      updateAndWait: function(newValue, delay) {
        endMoment = new Date(now() + delay);
        targetValue = newValue;
        if (!animating) {
          animate();
        }
      }
    };
  }
});
