jQuery.fn.extend({
  tickCounter: function(params) {
    var frequency = params.updateFrequency || 5000; // poll every 5 seconds
    var animationDelay = params.animationDelay || 100; // animate every 0.1 seconds
    var onUpdate = params.onUpdate || function() {};
    var active = false;
    var $that = this;
    var initialValue;
    var currentRealValue;

    var $container = $('<span/>').addClass('tickCounterContainer');

    var getValue = function() {
      var n = Number($that.text());
      return n;
    };

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
      $that.each(function() {
        var $this = $(this);
        var asString = String(value);
        var numDigits = asString.length;
        for (var i = numDigits; i > 0; i--) {
          setValueForDigit(numDigits - i + 1, asString.charAt(i - 1));
        }
      });
    };

    var initialValue = currentRealValue = getValue();
    $that.empty().append($container);

    setValue(initialValue);
    var updateWith = params.updateWith || function() {
      return ++initialValue;
    };

    var animator = function(start, end) {
      var amount = start;
      var currentValue = start;
      var diff = end - start;
      var numUpdates = Math.round(frequency / animationDelay);
      var lastUpdate = 0;
      var incrementAmount = diff / numUpdates;
      var increment = function() {
        amount += incrementAmount;
        if (amount >= currentValue + 1) {
          currentValue = Math.min(end, Math.round(amount));
          setValue(currentValue);
        }
        if (lastUpdate < numUpdates) {
          window.setTimeout(increment, animationDelay);
          lastUpdate++;
        } else {
          if (currentValue < end) {
            setValue(end);
          }
          update();
        }
      };
      window.setTimeout(increment, animationDelay);
    };

    var update = function() {
      if (active) {
        var newValue = updateWith();
        animator(currentRealValue, newValue);
        currentRealValue = newValue;
        onUpdate();
      }
    };

    return {
      start: function() {
        if (!active) {
          active = true;
          update();
        }
      },
      stop: function() {
        active = false;
      }
    };
  }
});