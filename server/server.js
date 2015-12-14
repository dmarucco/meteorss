
Meteor.startup(function(){});

Meteor.methods({

  /**
  */
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

  /**
  *
  */
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
