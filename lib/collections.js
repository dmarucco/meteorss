Sources = new Mongo.Collection('sources');
Feeds = new Mongo.Collection('feeds');

/**
*
*/
Source = function( url ){
  return {
    url: url,
    title:'Loading ...'
  }
}
