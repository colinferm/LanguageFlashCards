/* ==========================================================================
   VocabMenuView – Level selection screen
   Lets the user choose A1, A2, or B1 before starting flashcards.
   ========================================================================== */

var VocabMenuView = Backbone.View.extend({

  className: 'vocab-menu-view d-flex flex-column',

  template: null,

  events: {
    'click #js-back':      'onBack',
    'click [data-level]':  'onLevel'
  },

  initialize: function () {
    this.template = _.template(Templates['vocab-menu']);
  },

  render: function () {
    this.$el.html(this.template());
    this.$el.attr('style', 'min-height:100vh');
    return this;
  },

  onBack: function () {
    Backbone.history.navigate('', { trigger: true });
  },

  onLevel: function (e) {
    var level = $(e.currentTarget).data('level');
    Backbone.history.navigate('vocabulary/' + level, { trigger: true });
  }

});
