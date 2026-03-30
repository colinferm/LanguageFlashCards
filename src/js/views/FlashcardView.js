/* ==========================================================================
   FlashcardView – Flashcard study screen
   Handles:
     • Rendering the current card from the collection
     • Tap / click  → flip the card (reveal English meaning)
     • Left swipe   → advance to the next card
     • Back button  → return to the vocabulary level menu
   ========================================================================== */

var FlashcardView = Backbone.View.extend({

  className: 'flashcard-view d-flex flex-column',

  template: null,

  events: {
    'click  #js-back':    'onBack',
    'click  #js-next-btn':'onNextBtn',
    'click  #js-card':    'onCardClick',
    'touchstart #js-card': 'onTouchStart',
    'touchmove  #js-card': 'onTouchMove',
    'touchend   #js-card': 'onTouchEnd'
  },

  // -----------------------------------------------------------------------
  // Lifecycle
  // -----------------------------------------------------------------------

  initialize: function () {
    this.template = _.template(Templates.flashcard);

    // Touch state
    this._touchStartX  = 0;
    this._touchStartY  = 0;
    this._isSwiping    = false;

    // Prevent double-advance when a swipe also triggers a click
    this._swipeHandled = false;
  },

  render: function () {
    var card = this.collection.currentCard();
    var data = {
      de:      card.get('de'),
      en:      card.get('en'),
      level:   this.collection.level,
      current: this.collection.currentIndex + 1,
      total:   this.collection.length
    };

    this.$el.html(this.template(data));
    this.$el.attr('style', 'min-height:100vh');
    return this;
  },

  // -----------------------------------------------------------------------
  // Navigation
  // -----------------------------------------------------------------------

  onBack: function () {
    Backbone.history.navigate('vocabulary', { trigger: true });
  },

  // Right-edge click zone – desktop / non-touch devices only
  onNextBtn: function (e) {
    e.stopPropagation();   // prevent the click bubbling to #js-card and flipping
    this._advanceCard();
  },

  // -----------------------------------------------------------------------
  // Card flip
  // -----------------------------------------------------------------------

  _flip: function () {
    this.$('#js-card').toggleClass('flipped');
  },

  // Click handler – used on desktop (mouse); suppressed on mobile via
  // e.preventDefault() called in onTouchEnd.
  onCardClick: function () {
    if (this._swipeHandled) {
      this._swipeHandled = false;
      return;
    }
    this._flip();
  },

  // -----------------------------------------------------------------------
  // Touch / swipe handling
  // -----------------------------------------------------------------------

  onTouchStart: function (e) {
    var touch       = e.originalEvent.touches[0];
    this._touchStartX  = touch.clientX;
    this._touchStartY  = touch.clientY;
    this._isSwiping    = false;
    this._swipeHandled = false;
  },

  onTouchMove: function (e) {
    var dx = Math.abs(e.originalEvent.touches[0].clientX - this._touchStartX);
    var dy = Math.abs(e.originalEvent.touches[0].clientY - this._touchStartY);

    // Treat as a horizontal swipe only when x movement dominates
    if (dx > dy && dx > 8) {
      this._isSwiping = true;
      e.preventDefault();   // stop page scroll during horizontal swipe
    }
  },

  onTouchEnd: function (e) {
    var touchEndX = e.originalEvent.changedTouches[0].clientX;
    var diff      = this._touchStartX - touchEndX;   // positive = right-to-left

    // Prevent the synthetic click event from firing after any touch
    e.preventDefault();

    if (this._isSwiping && diff > 50) {
      // Right-to-left swipe – advance to next card
      this._swipeHandled = true;
      this._advanceCard();
    } else if (!this._isSwiping) {
      // Short tap – flip the card
      this._flip();
    }

    this._isSwiping = false;
  },

  // -----------------------------------------------------------------------
  // Advance to next card with a brief slide-out / slide-in animation
  // -----------------------------------------------------------------------

  _advanceCard: function () {
    var self    = this;
    var $card   = this.$('#js-card');

    $card.addClass('swipe-out-left');

    setTimeout(function () {
      self.collection.advance();
      self.render();

      // Trigger enter animation on the freshly rendered card
      var $newCard = self.$('#js-card');
      $newCard.addClass('swipe-in-right');

      setTimeout(function () {
        $newCard.removeClass('swipe-in-right');
      }, 320);

    }, 280);
  }

});
