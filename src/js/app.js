/* ==========================================================================
   app.js – Application bootstrap
   Instantiates the router and starts Backbone's history API.
   ========================================================================== */

$(function () {

  // Guard: make sure the DOM mount point exists
  if (!$('#app').length) {
    console.error('German Flashcards: #app element not found.');
    return;
  }

  // Load persisted user preferences and word stats before any view is created
  AppSettings.load();
  WordStats.load();

  // Boot the router; Backbone.history.start() reads the current URL fragment
  // and fires the matching route handler immediately.
  var router = new AppRouter();

  Backbone.history.start();

});
