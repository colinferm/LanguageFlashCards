/* ==========================================================================
   MissedView – "Commonly Missed Words" screen
   Shows the top 50 vocabulary entries by net miss count (count > 0 only).
   ========================================================================== */

var MissedView = Backbone.View.extend({

  className: 'missed-view d-flex flex-column',

  initialize: function () {
    this._template = _.template(Templates['missed']);
  },

  events: {
    'click #js-missed-back': 'onBack'
  },

  render: function () {
    var allWords = [];
    AppSettings.validLevels.forEach(function (l) {
      if (VocabularyData[l]) { allWords = allWords.concat(VocabularyData[l]); }
    });

    this.$el.html(this._template({
      words: WordStats.topMissed(allWords, 50)
    }));
    this.$el.attr('style', 'min-height:100vh');
    return this;
  },

  onBack: function () {
    Backbone.history.navigate('', { trigger: true });
  }

});
