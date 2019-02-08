const Twit = require('twit');
const fetch = require('node-fetch');
const parser = require('xml2json');


const twitConfig = require('./config/twitConfig');
const readModule = require('./funcions/readModule');
const writeModule = require('./funcions/writeModule');

const databasePath = './db/db0.json';


let T = new Twit(twitConfig);

// search for tweets using hashtag
const searchForTweetsByHashtag = (hashtag='freeCodeCamp', count=1) => {
  hashtag = hashtag.indexOf('#') === 0 ? hashtag.slice(hashtag.indexOf('#')+1, hashtag.length) : hashtag;
  T.get('search/tweets', { 'q': '#'+hashtag, 'count': count }, function(err, data, response) {
    if(err){
      console.log('error');
    }else{
      // console.log('*********************************************');
      // console.log(data.statuses);
      // console.log('*********************************************');
      // console.log(count, data.statuses.length);
      console.log(data.statuses.map(s => ({ 'tweet': { 'id': s.id_str, 'text': s.text, owner: { 'id': s.user.id_str, 'name': s.user.name, 'screen_name': s.user.screen_name } } })));
    }
  });
}

// search for a tweet using id_str
const searchForTweetByIdStr = id => {
  T.get('statuses/show', { 'id': id}, function(err, data, response) {
    err ? console.log('error') : console.log({ 'tweet': { 'id': data.id_str, 'text': data.text, owner: { 'id': data.user.id_str, 'name': data.user.name, 'screen_name': data.user.screen_name } } });
  });
}

const tweetMsg= msg => {
  console.log(msg)
  T.post('statuses/update', { status: msg }, function(err, data, response) {
    err ? console.log('error') : console.log(data)
  })
}

// retweet a tweet using tweet id_str
const retweetByTweetIdStr = id => {
  T.post('statuses/retweet/:id', { 'id': id }, function (err, data, response) {
    err ? console.log('error') : console.log(data);
  });
}


// follow a user by user_id without notification
const followUser = user_id => {
  T.post('friendships/create', { 'user_id': user_id, 'follow': false }, function(err, data, response) {
    err ? console.log('error') : console.log(data);
  });
}

// unfollow a user by user_id
const unfollowUser = user_id => {
  T.post('friendships/destroy', { 'user_id': user_id}, function(err, data, response) {
    err ? console.log('error') : console.log(data);
  });
}

// searchForTweetsByHashtag('freeCodeCamp', 5);
// searchForTweetByIdStr('1093111413248352256');
// retweetByTweetIdStr('1093111413248352256');
// followUser('249699949');
// unfollowUser('249699949');

// var stream = T.stream('statuses/filter', {track: '#freeCodeCamp'})
//
// stream.on('tweet', function (tweet) {
//   writeModule.writeJSON('fileSystem/tweet.json', JSON.stringify(tweet, null, 2));
// });

// var xml = "<foo attr=\"value\">bar</foo>";
// console.log("input -> %s", xml)
// var json = parser.toJson(xml);
// console.log("to json -> %s", json);


const laodDatabase = (path, callback, tweet=true) => {
  console.log('laodDatabase');
  readModule.readJSON(path)
  .then(function(res){
    let publicationsData = JSON.parse(res);
    callback(publicationsData, saveDatabase, tweet)
  })
}


const laodRssFeed = (publicationsData, callback, tweet=true) => {
  // console.log(publicationsData);
  let publicationName = publicationsData.publicationsList[publicationsData.publicationsRoundNumber].name;
  fetch('https://medium.com/feed/'+publicationName)
  .then(res => res.text())
  .then(body => {
    if(body.indexOf("<?xml") === 0){
      let data_json = parser.toJson(body, {object: true});
      let data = {
        title: data_json.rss.channel.item[0].title,
        tags: publicationsData.tags.join(" "),
        link: data_json.rss.channel.item[0].link.slice(0, data_json.rss.channel.item[0].link.indexOf("?")),
      };
      console.log(data.title)
      if(tweet){
        tweetMsg(data.title+" "+data.tags+" "+data.link)
      }
      callback(publicationsData, data);
      return;
    }
    callback(publicationsData);
  });
}

const saveDatabase = (publicationsData, fetchData) => {
  // console.log(fetchData);
  if(fetchData){
    if(publicationsData.publicationsList[publicationsData.publicationsRoundNumber].lastArticle !== fetchData.link){
      publicationsData.publicationsList[publicationsData.publicationsRoundNumber].lastArticle = fetchData.link;
    }
  }
  publicationsData.publicationsRoundNumber++;
  publicationsData.publicationsRoundNumber = publicationsData.publicationsRoundNumber % publicationsData.publicationsList.length;
  writeModule.writeJSON('./db/db0.json', JSON.stringify(publicationsData, null, 2));
}

//****************************************************************
setInterval(laodDatabase, 10*1000, databasePath, laodRssFeed);
// setInterval(laodDatabase, 24*60*60*1000, databasePath, laodRssFeed);
