var Sources = new Mongo.Collection('sources');
var Feeds = new Mongo.Collection('feeds');



var Source = function( url ){
  return {
    url: url,
    title:'Loading ...'
  }
}

if (Meteor.isClient) {
  Session.set('selectedSource', '');
  Template.stream.helpers({
    feeds: function(){
      return Feeds.find({source: Session.get('selectedSource')});
    }
  });

  Template.newFeedSource.events({
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
}

if (Meteor.isServer) {

  Meteor.startup(function(){});

  Meteor.methods({

    addSource: function(source){
      HTTP.get( source.url, {}, function(error, rss){
        xml2js.parseString(rss.content, function(error, xml){
          var channel = xml.rss.channel[0];
          source.updatedAt = channel.lastBuildDate;
          source.title = channel.title;
          Sources.update(source._id, source);
        });
      });
    },

    fetch: function(id){
      var source = Sources.findOne(id);
      HTTP.get( source.url, {}, function(error, rss){
        xml2js.parseString(rss.content, function(error, xml){
          var channel = xml.rss.channel[0];
          source.updatedAt = channel.lastBuildDate;
          Sources.update(source._id, source);
          Feeds.remove({});
          _convertToFeedArray(error, channel, source._id);
        });
      });
    }
  });

  var  _convertToFeedArray = function(error, channel, source){

    var size  = channel.item.length;

    for(var i = 0; i < size; i++){
      var description = Helpers.convertHtmlToText(channel.item[i].description);
      Feeds.insert({
        title:channel.item[i].title,
        description: description,
        descriptionshort: description.substring(0,250),
        pubDate: channel.item[i].pubDate,
        author: channel.item[i]['dc:creator'],
        source: source,
        link: channel.item[i].link
      });


    }

  }

}



var Helpers = {

  convertHtmlToText: function(html) {
    var text = "" + html;

    //-- remove BR tags and replace them with line break
    text=text.replace(/<br>/gi, "\n");
    text=text.replace(/<br\s\/>/gi, "\n");
    text=text.replace(/<br\/>/gi, "\n");

    //-- remove P and A tags but preserve what's inside of them
    text=text.replace(/<p.*?>/gi, "\n");
    //text=text.replace(/<a.*href="(.*?)".*>(.*?)<\/a>/gi, " $2 ($1)");
    text=text.replace(/<a.*href="(.*?)".*>(.*?)<\/a>/gi, "");

    //-- remove all inside SCRIPT and STYLE tags
    text=text.replace(/<script.*>[\w\W]{1,}(.*?)[\w\W]{1,}<\/script>/gi, "");
    text=text.replace(/<style.*>[\w\W]{1,}(.*?)[\w\W]{1,}<\/style>/gi, "");
    //-- remove all else
    text=text.replace(/<(?:.|\s)*?>/g, "");

    //-- get rid of more than 2 multiple line breaks:
    text=text.replace(/(?:(?:\r\n|\r|\n)\s*){2,}/gim, "\n\n");

    //-- get rid of more than 2 spaces:
    text = text.replace(/ +(?= )/g,'');

    //-- get rid of html-encoded characters:
    text=text.replace(/&nbsp;/gi," ");
    text=text.replace(/&amp;/gi,"&");
    text=text.replace(/&quot;/gi,'"');
    text=text.replace(/&lt;/gi,'<');
    text=text.replace(/&gt;/gi,'>');

    //-- return
    return text;
  }
}
