/* ==========================================================================
   TestView – "Test Yourself" quiz screen
   Dataset: 100 words, 90 % B1 + 10 % random A1 & A2

   Each card shows an English word and four German choices (one correct,
   two random distractors, plus "Nichts des oben Genannten").  The none
   option is the correct answer 10 % of the time.  Selecting the correct
   answer highlights it green and advances automatically; selecting wrong
   highlights red and also advances.  At the end a summary screen is shown.
   ========================================================================== */

var TestView = Backbone.View.extend({

  className: 'test-view d-flex flex-column',

  PRIMARY_RATIO: 0.90,   // 90 % primary level, 10 % fill from lower levels
  ANSWER_DELAY:  700,    // ms before advancing after an answer
  NONE_RATIO:    0.10,   // 10 % chance the none option is correct

  // -----------------------------------------------------------------------
  // Lifecycle
  // -----------------------------------------------------------------------

  initialize: function (options) {
    this._template        = _.template(Templates['test']);
    this._summaryTemplate = _.template(Templates['test-summary']);

    // mode: 'en-to-de' (default) shows English → choose German
    //       'de-to-en'           shows German  → choose English
    this._mode = (options && options.mode === 'de-to-en') ? 'de-to-en' : 'en-to-de';

    this._promptField = this._mode === 'de-to-en' ? 'de' : 'en';
    this._answerField = this._mode === 'de-to-en' ? 'en' : 'de';
    this._promptLabel = this._mode === 'de-to-en'
      ? 'What is the English word for\u2026'
      : 'What is the German word for\u2026';
    this.NONE_ABOVE   = this._mode === 'de-to-en'
      ? 'None of the above'
      : 'Nichts des oben Genannten';

    this._deck         = [];
    this._currentIndex = 0;
    this._correct      = 0;
    this._seen         = 0;
    this._missed       = [];      // cards answered incorrectly
    this._answering    = false;   // lock while waiting to advance

    this._buildDeck();
  },

  events: {
    'click #js-back':           'onBack',
    'click .test-choice-btn':   'onChoice',
    'click #js-restart':        'onRestart',
    'click #js-home':           'onHome'
  },

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  render: function () {
    if (this._currentIndex >= this._deck.length) {
      return this._renderSummary();
    }

    var card    = this._deck[this._currentIndex];
    var choices = this._buildChoices(card);

    // Store the correct answer for the click handler
    this._correctAnswer = card[this._answerField];
    this._correctIsNone = choices.correctIsNone;
    this._answering     = false;

    this.$el.html(this._template({
      promptLabel: this._promptLabel,
      promptWord:  card[this._promptField],
      choices:     choices.list,
      correct: this._correct,
      seen:    this._seen,
      total:   this._deck.length
    }));
    this.$el.attr('style', 'min-height:100vh');
    return this;
  },

  _renderSummary: function () {
    this.$el.html(this._summaryTemplate({
      correct:   this._correct,
      incorrect: this._seen - this._correct,
      total:     this._deck.length,
      missed:    this._missed
    }));
    this.$el.attr('style', 'min-height:100vh');
    return this;
  },

  // -----------------------------------------------------------------------
  // Answer handling
  // -----------------------------------------------------------------------

  onChoice: function (e) {
    if (this._answering) return;
    this._answering = true;

    var $btn      = $(e.currentTarget);
    var chosen    = $btn.data('de');
    var isCorrect = this._correctIsNone
      ? (chosen === this.NONE_ABOVE)
      : (chosen === this._correctAnswer);

    // Disable all buttons while feedback is visible
    this.$('.test-choice-btn').prop('disabled', true).blur();

    if (isCorrect) {
      $btn.addClass('choice-correct');
      this._correct++;
    } else {
      $btn.addClass('choice-incorrect');
      this._missed.push(this._deck[this._currentIndex]);
      // Reveal the correct answer
      var correctValue = this._correctIsNone ? this.NONE_ABOVE : this._correctAnswer;
      this.$('.test-choice-btn').each(function () {
        if ($(this).data('de') === correctValue) {
          $(this).addClass('choice-correct');
        }
      });
    }

    this._seen++;

    var self = this;
    setTimeout(function () {
      self._currentIndex++;
      self.render();
    }, self.ANSWER_DELAY);
  },

  // -----------------------------------------------------------------------
  // Navigation
  // -----------------------------------------------------------------------

  onBack: function () {
    Backbone.history.navigate('', { trigger: true });
  },

  onRestart: function () {
    this._buildDeck();
    this._currentIndex = 0;
    this._correct      = 0;
    this._seen         = 0;
    this._missed       = [];
    this.render();
  },

  onHome: function () {
    Backbone.history.navigate('', { trigger: true });
  },

  // -----------------------------------------------------------------------
  // Deck & choice building
  // -----------------------------------------------------------------------

  // Build the deck using the level and size stored in AppSettings.
  //
  // Primary pool  = selected level (falls back to highest available level
  //                 if B2/C1 vocabulary hasn't been added yet).
  // Fill pool     = all vocabulary levels strictly below primary (~10 %).
  //
  // If the primary pool has fewer words than requested the deck is capped at
  // pool size rather than repeating words.
  _buildDeck: function () {
    var level    = AppSettings.get('level');
    var deckSize = AppSettings.get('deckSize');

    // Resolve the highest available level at or below the requested level
    var levelIndex   = AppSettings.validLevels.indexOf(level);
    var primaryLevel = null;
    for (var i = levelIndex; i >= 0; i--) {
      var candidate = AppSettings.validLevels[i];
      if (VocabularyData[candidate] && VocabularyData[candidate].length) {
        primaryLevel = candidate;
        break;
      }
    }
    if (!primaryLevel) { primaryLevel = 'B1'; } // ultimate fallback

    var primaryPool = _.shuffle(VocabularyData[primaryLevel].slice());

    // Collect all levels below the resolved primary
    var fillPool = [];
    var primeIdx = AppSettings.validLevels.indexOf(primaryLevel);
    for (var j = 0; j < primeIdx; j++) {
      var fillLevel = AppSettings.validLevels[j];
      if (VocabularyData[fillLevel] && VocabularyData[fillLevel].length) {
        fillPool = fillPool.concat(VocabularyData[fillLevel]);
      }
    }
    fillPool = _.shuffle(fillPool);

    var primaryCount = Math.round(deckSize * this.PRIMARY_RATIO);
    var fillCount    = deckSize - primaryCount;

    var primary = primaryPool.slice(0, Math.min(primaryCount, primaryPool.length));
    var fill    = fillPool.slice(0, Math.min(fillCount, fillPool.length));

    this._deck = _.shuffle(primary.concat(fill));
  },

  // Returns { list: [4 strings], correctIsNone: bool }
  //
  // 10 % of the time (NONE_RATIO) "Nichts des oben Genannten" is correct:
  //   list = [3 wrong German words, NONE_ABOVE]  (none option always last)
  //
  // Otherwise the correct German word is among the first three:
  //   list = shuffle([correct, wrong1, wrong2]) + [NONE_ABOVE]
  //
  // Wrong answers are selected from three candidate pools in priority order:
  //   1. Same part  AND same subject  (most confusable)
  //   2. Same part, different subject (same word-class, different topic)
  //   3. Anything else               (last-resort fallback)
  _buildChoices: function (card) {
    var answerField = this._answerField;
    var allWords = [];
    AppSettings.validLevels.forEach(function (l) {
      if (VocabularyData[l]) { allWords = allWords.concat(VocabularyData[l]); }
    });
    // Always exclude by German word to avoid duplicate entries regardless of mode
    var pool        = _.filter(allWords, function (w) { return w.de !== card.de; });

    var samePS = _.shuffle(_.filter(pool, function (w) {
      return w.part === card.part && w.subject === card.subject;
    }));
    var samePO = _.shuffle(_.filter(pool, function (w) {
      return w.part === card.part && w.subject !== card.subject;
    }));
    var other  = _.shuffle(_.filter(pool, function (w) {
      return w.part !== card.part;
    }));

    var correctIsNone = (Math.random() < this.NONE_RATIO);

    if (correctIsNone) {
      var wrong3 = samePS.concat(samePO).concat(other)
                     .slice(0, 3)
                     .map(function (w) { return w[answerField]; });
      return { list: _.shuffle(wrong3).concat([this.NONE_ABOVE]), correctIsNone: true };
    } else {
      var wrong2 = samePS.concat(samePO).concat(other)
                     .slice(0, 2)
                     .map(function (w) { return w[answerField]; });
      return { list: _.shuffle([card[answerField]].concat(wrong2)).concat([this.NONE_ABOVE]), correctIsNone: false };
    }
  }

});
