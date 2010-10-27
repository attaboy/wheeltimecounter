jQuery.fn.extend({
  tickCounter: function(params) {
    var that = this;
    var $container = $('<span/>').addClass('tickCounterDigitContainer');

    var getValue = function() {
      return Number(that.text());
    };

    var setValueForDigit = function(digitNumber, value) {
      var className = 'tickCounterDigit' + digitNumber;
      var $digit = $container.find('.' + className);
      if (!$digit.length) {
        $digit = $('<span/>').addClass('tickCounterDigit ' + className);
        $container.prepend($digit);
      }
      $digit.empty().append(value);
    };

    var setValue = function(value) {
      that.each(function() {
        var $this = $(this);
        var asString = String(value);
        var numDigits = asString.length;
        $container.empty();
        for (var i = numDigits; i > 0; i--) {
          setValueForDigit(i, asString.charAt(i - 1));
        }
      });
    };

    var initialValue = getValue();
    that.empty().append($container);

    setValue(initialValue);
    var updateWith = params.updateWith || function() {
      return ++initialValue;
    };
    var frequency = params.updateFrequency || 5000; // poll every 5 seconds
    var animationDelay = params.animationDelay || 100; // animate every 0.1 seconds
    var onUpdate = params.onUpdate || function() {};

    var active = false;

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
        if (amount < end && lastUpdate < numUpdates) {
          window.setTimeout(increment, animationDelay);
        } else {
          update();
        }
      };
      window.setTimeout(increment, animationDelay);
    };

    var update = function() {
      if (active) {
        animator(getValue(), updateWith());
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