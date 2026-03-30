/* ==========================================================================
   Flashcard Model
   Represents a single vocabulary card with a German word and its English
   meaning, plus the CEFR level it belongs to.
   ========================================================================== */

var Flashcard = Backbone.Model.extend({

  defaults: {
    de:      '',   // German word / phrase
    en:      '',   // English meaning
    level:   '',   // 'A1' | 'A2' | 'B1'
    part:    '',   // grammatical / functional category  (noun, verb, adjective, pronoun,
                   //   adverb, number, modal, phrase)
    subject: ''    // thematic domain  (greeting, family, color, body, food, transport,
                   //   place, health, weather, time, day, month, home, clothing, work,
                   //   education, finance, action, state, description, question,
                   //   communication, identity, society, abstract, legal, community, sense)
  }

});
