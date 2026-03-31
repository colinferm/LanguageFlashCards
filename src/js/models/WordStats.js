/* ==========================================================================
   WordStats – per-word miss/correct counter
   Counts are stored as a plain object keyed by the German word string (de).
   Positive = net misses; negative = net correct answers.

   Usage:
     WordStats.load();               // call once at boot (app.js)
     WordStats.increment('das Haus');
     WordStats.decrement('das Haus');
     WordStats.get('das Haus');      // integer, default 0
     WordStats.save();               // persist to localStorage
     WordStats.reset();              // zero all counts (does not save)
     WordStats.topMissed(allWords, 50); // [{de, en, count}, ...] count > 0, sorted desc
   ========================================================================== */

var WordStats = (function () {

  var STORAGE_KEY = 'german-flashcards-word-stats';
  var _counts = {};

  return {

    load: function () {
      try {
        var stored = localStorage.getItem(STORAGE_KEY);
        if (stored) { _counts = JSON.parse(stored) || {}; }
      } catch (e) { _counts = {}; }
    },

    save: function () {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(_counts));
      } catch (e) { /* storage full or blocked */ }
    },

    increment: function (de) {
      _counts[de] = (_counts[de] || 0) + 1;
    },

    decrement: function (de) {
      _counts[de] = (_counts[de] || 0) - 1;
    },

    get: function (de) {
      return _counts[de] || 0;
    },

    // Zero all counters in memory; caller must call save() to persist.
    reset: function () {
      _counts = {};
    },

    // Returns up to `limit` vocabulary entries (from allWords) whose count > 0,
    // sorted by count descending.  Words not in allWords are silently ignored.
    topMissed: function (allWords, limit) {
      var results = [];
      allWords.forEach(function (word) {
        var count = _counts[word.de] || 0;
        if (count > 0) {
          results.push({ de: word.de, en: word.en, count: count });
        }
      });
      results.sort(function (a, b) { return b.count - a.count; });
      return results.slice(0, limit || 50);
    }

  };

})();
