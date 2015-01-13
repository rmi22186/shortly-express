//figure this out tomorrow

Shortly.loginView = Backbone.View.extend({
  className: 'login',

  template: Templates['login'],

  events: {
    'submit': 'shortenUrl'
  },


  render: function() {
    this.$el.html( this.template() );
    return this;
  },

});
