var Utility = Utility || {};

Utility.Logger = (function () {
  var _log = function (data) {
    Logger.log(data);
  };

  return {
    log: _log,
  };
})();

Utility.Debugger = (function () {
  var debugEnabled = false;

  var _debug = function (data) {
    if (debugEnabled) {
      Logger.log('DEBUG: ' + data);
    }
  };

  return {
    debug: _debug,
  };
})();
