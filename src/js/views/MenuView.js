/* ==========================================================================
   MenuView – Main landing screen
   Shows the top-level category selection.
   ========================================================================== */

var MenuView = Backbone.View.extend({

  className: 'menu-view d-flex flex-column',

  initialize: function () {
    this.template = _.template(Templates.menu);
  },

  events: {
    'click [data-action="vocabulary"]':   'onVocabulary',
    'click [data-action="test"]':         'onTest',
    'click [data-action="test-reverse"]': 'onTestReverse',
    'click [data-action="settings"]':     'onSettings',
    'click [data-action="missed"]':       'onMissed'
  },

  render: function () {
    this.$el.html(this.template({
      deckSize: AppSettings.get('deckSize'),
      level:    AppSettings.get('level')
    }));
    this.$el.attr('style', 'min-height:100vh');
    return this;
  },

  onVocabulary: function () {
    Backbone.history.navigate('vocabulary', { trigger: true });
  },

  onTest: function () {
    Backbone.history.navigate('test', { trigger: true });
  },

  onTestReverse: function () {
    Backbone.history.navigate('test-reverse', { trigger: true });
  },

  onSettings: function () {
    Backbone.history.navigate('settings', { trigger: true });
  },

  onMissed: function () {
    Backbone.history.navigate('missed', { trigger: true });
  }

});
