/* ==========================================================================
   FlashcardCollection
   Builds a randomised deck of Flashcard models according to the mixing rules
   for each CEFR level:

     A1  → 100 % A1 words
     A2  →  80 % A2 words  +  20 % random A1 words
     B1  →  80 % B1 words  +  20 % random A1 & A2 words (equal share)

   When the deck is exhausted, buildDeck() is called again automatically to
   create a fresh randomised set so the user always has cards to study.
   ========================================================================== */

var FlashcardCollection = Backbone.Collection.extend({

  model: Flashcard,

  initialize: function () {
    this.level        = null;
    this.currentIndex = 0;
  },

  // -------------------------------------------------------------------------
  // buildDeck(level)
  // Populate the collection with a freshly shuffled deck for the given level.
  // -------------------------------------------------------------------------
  buildDeck: function (level) {
    this.level        = level;
    this.currentIndex = 0;

    var deck = this._assembleDeck(level);

    this.reset(deck.map(function (word) {
      return _.extend({}, word, { level: level });
    }));
  },

  // -------------------------------------------------------------------------
  // currentCard() – return the Flashcard at the current position
  // -------------------------------------------------------------------------
  currentCard: function () {
    return this.at(this.currentIndex);
  },

  // -------------------------------------------------------------------------
  // buildMissedDeck() – populate with words whose WordStats count > 0,
  //                     sorted by miss count descending, capped at 50.
  // -------------------------------------------------------------------------
  buildMissedDeck: function () {
    this.level        = 'missed';
    this.currentIndex = 0;

    var allWords = [];
    AppSettings.validLevels.forEach(function (l) {
      if (VocabularyData[l]) {
        allWords = allWords.concat(VocabularyData[l].map(function (w) {
          return _.extend({}, w, { level: l });
        }));
      }
    });

    var missed = _.filter(allWords, function (w) {
      return WordStats.get(w.de) > 0;
    });

    missed = _.sortBy(missed, function (w) { return -WordStats.get(w.de); });

    this.reset(missed.slice(0, 50));
  },

  // -------------------------------------------------------------------------
  // advance() – move to the next card, rebuilding the deck when exhausted.
  //             Returns the new current Flashcard.
  // -------------------------------------------------------------------------
  advance: function () {
    this.currentIndex += 1;

    if (this.currentIndex >= this.length) {
      if (this.level === 'missed') {
        this.buildMissedDeck();
      } else {
        this.buildDeck(this.level);
      }
    }

    return this.currentCard();
  },

  // -------------------------------------------------------------------------
  // Private helpers
  // -------------------------------------------------------------------------

  // Returns a shuffled array of plain objects ready to be used as model attrs.
  _assembleDeck: function (level) {
    var src = VocabularyData;

    if (level === 'A1') {
      return _.shuffle(src.A1.slice());
    }

    if (level === 'A2') {
      return this._mix(src.A2, [src.A1], 0.80);
    }

    if (level === 'B1') {
      var mixPool = src.A1.concat(src.A2);
      return this._mix(src.B1, [mixPool], 0.80);
    }

    return [];
  },

  // Build a deck where `primaryPool` makes up `primaryRatio` of the total
  // and the remaining fraction is drawn equally from each array in `fillPools`.
  _mix: function (primaryPool, fillPools, primaryRatio) {
    var shuffledPrimary = _.shuffle(primaryPool.slice());
    var total           = shuffledPrimary.length;
    var primaryCount    = Math.round(total * primaryRatio);
    var fillCount       = total - primaryCount;

    var fillWords = [];
    fillPools.forEach(function (pool) {
      var perPool = Math.round(fillCount / fillPools.length);
      fillWords   = fillWords.concat(_.sample(pool, perPool));
    });

    return _.shuffle(
      shuffledPrimary.slice(0, primaryCount).concat(fillWords)
    );
  }

});
