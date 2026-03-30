/* ==========================================================================
   SettingsView – user preferences screen
   Reads from AppSettings on render; writes back and saves on submit.
   ========================================================================== */

var SettingsView = Backbone.View.extend({

  className: 'settings-view d-flex flex-column',

  initialize: function () {
    this._template = _.template(Templates['settings']);
  },

  events: {
    'click #js-settings-back':   'onBack',
    'input #js-deck-size':       'onSliderInput',
    'click #js-settings-save':   'onSave'
  },

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  render: function () {
    this.$el.html(this._template({
      deckSize:    AppSettings.get('deckSize'),
      level:       AppSettings.get('level'),
      validLevels: AppSettings.validLevels
    }));
    this.$el.attr('style', 'min-height:100vh');
    return this;
  },

  // -----------------------------------------------------------------------
  // Handlers
  // -----------------------------------------------------------------------

  // Update the live badge next to the slider label as the thumb moves
  onSliderInput: function (e) {
    this.$('#js-deck-size-display').text($(e.currentTarget).val());
  },

  onSave: function () {
    AppSettings.set('deckSize', parseInt(this.$('#js-deck-size').val(), 10));
    AppSettings.set('level',    this.$('#js-level').val());
    AppSettings.save();
    Backbone.history.navigate('', { trigger: true });
  },

  onBack: function () {
    Backbone.history.navigate('', { trigger: true });
  }

});
