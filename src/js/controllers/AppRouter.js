/* ==========================================================================
   AppRouter – Backbone Router (Controller)
   Maps URL hash fragments to the correct view and manages the active view
   lifecycle so that event listeners are always cleaned up on navigation.

   Routes:
     #              → MenuView      (main menu)
     #vocabulary    → VocabMenuView (level selection)
     #vocabulary/A1 → FlashcardView (cards for that level)
     #vocabulary/A2
     #vocabulary/B1
     #test          → TestView      (quiz mode)
   ========================================================================== */

var AppRouter = Backbone.Router.extend({

  routes: {
    '':                   'home',
    'vocabulary':         'vocabulary',
    'vocabulary/:level':  'flashcards',
    'test':               'test',
    'test-reverse':       'testReverse',
    'settings':           'settings',
    'missed':             'missed'
  },

  initialize: function () {
    this._currentView = null;
  },

  // -----------------------------------------------------------------------
  // Route handlers
  // -----------------------------------------------------------------------

  home: function () {
    this._show(new MenuView());
  },

  vocabulary: function () {
    this._show(new VocabMenuView());
  },

  flashcards: function (level) {
    var collection = new FlashcardCollection();

    if (level === 'missed') {
      collection.buildMissedDeck();
      // If nothing is missed yet, fall back to the vocab menu
      if (collection.length === 0) {
        Backbone.history.navigate('vocabulary', { trigger: true });
        return;
      }
    } else {
      var validLevels = ['A1', 'A2', 'B1'];
      var safeLevel   = validLevels.indexOf(level.toUpperCase()) !== -1
                        ? level.toUpperCase()
                        : 'A1';
      collection.buildDeck(safeLevel);
    }

    this._show(new FlashcardView({ collection: collection }));
  },

  test: function () {
    this._show(new TestView({ mode: 'en-to-de' }));
  },

  testReverse: function () {
    this._show(new TestView({ mode: 'de-to-en' }));
  },

  settings: function () {
    this._show(new SettingsView());
  },

  missed: function () {
    this._show(new MissedView());
  },

  // -----------------------------------------------------------------------
  // Helpers
  // -----------------------------------------------------------------------

  // Tear down the previous view (unbind its events without removing the
  // shared #app element) then mount the new view.
  _show: function (view) {
    if (this._currentView) {
      this._currentView.undelegateEvents();
      this._currentView.stopListening();
    }

    this._currentView = view;
    $('#app').html(view.render().el);
  }

});
