var moment = require('moment');

var Item = function(itemRow){
  this.uuid = itemRow.id;
  this.shortId = itemRow.attributes.id;

  this.title = itemRow.title;
  this.body_text = itemRow.body_text;
  this.body = this.body_text;
  this.postedAt = itemRow.attributes.postedAt;

  this.attributes = itemRow.attributes;
  
  this.datePosted = this.getPostedDate();
  this.permalink = this.getPermalink();
};

Item.prototype.getPermalink = function(){
  return "/posts/" + this.uuid;
};

Item.prototype.toJSON = function(){
  JSON.stringify(this);
};

Item.prototype.postedAtToMoment = function(){
  return moment(this.postedAt);
};

Item.prototype.getPostedDate = function(){
  return this.postedAtToMoment().format("dddd, MMMM Do YYYY");
};

// Class methods

Item.makeShortIDString = function(){
  var crypto = require('crypto');
  var current_date = (new Date()).valueOf().toString();
  var random = Math.random().toString();
  var hash = crypto.createHash('sha1').update(current_date + random).digest('hex');
  return hash.substring(0,10);
};

Item.initializeNewItem = function(params){
  params.id = Item.makeShortIDString();
  params.postedAt = moment().toISOString();
  return params;
};

module.exports = Item;