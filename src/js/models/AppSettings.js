/* ==========================================================================
   AppSettings – persistent user preferences
   Stores to localStorage; falls back to defaults if storage is unavailable.

   Usage:
     AppSettings.load();           // call once at boot (app.js)
     AppSettings.get('deckSize');  // 10 – 140
     AppSettings.get('level');     // 'A1' | 'A2' | 'B1' | 'B2' | 'C1'
     AppSettings.set('level', 'B1');
     AppSettings.save();
   ========================================================================== */

var AppSettings = (function () {

  var STORAGE_KEY = 'german-flashcards-settings';
  var VALID_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1'];

  var _data = {
    deckSize: 100,
    level:    'A1'
  };

  function _clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function _sanitise(raw) {
    var size  = _clamp(parseInt(raw.deckSize, 10) || 100, 10, 140);
    var level = VALID_LEVELS.indexOf(raw.level) !== -1 ? raw.level : 'A1';
    return { deckSize: size, level: level };
  }

  return {

    load: function () {
      try {
        var stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          _data = _sanitise(JSON.parse(stored));
        }
      } catch (e) { /* localStorage blocked or JSON corrupt – use defaults */ }
    },

    save: function () {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(_data));
      } catch (e) { /* storage full or blocked – silently ignore */ }
    },

    get: function (key) {
      return _data[key];
    },

    set: function (key, value) {
      _data[key] = value;
    },

    validLevels: VALID_LEVELS
  };

})();
