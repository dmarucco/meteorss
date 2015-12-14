  Session.set('selectedSource', '');

  Template.stream.helpers({
    feeds: function(){
      return Feeds.find({source: Session.get('selectedSource')});
    }
  });

  Template.newFeedSource.events({
    /**
    *
    */
    'submit .newFeedSource':function(event){
      var source = Source(event.target.url.value);
      source._id = Sources.insert(source);
      Meteor.call('addSource', source);
      event.preventDefault();
      event.target.url.value = "";
    }
  });

  Template.sources.helpers({
    sources: function(){
      return Sources.find();
    }
  })

  Template.source.events({
    'submit .remove-source': function(event){
      console.log(event.target);
      Sources.remove( event.target.id.value );
      event.preventDefault();
    },

    'click .source-link': function(event){
      Session.set('selectedSource', event.target.id);
      Meteor.call('fetch',event.target.id);
      event.preventDefault();
    }
  });
