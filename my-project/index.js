require('dotenv').config();

const Twit = require('twit');
const fetch = require('node-fetch');
const parser = require('xml2json');


const twitConfig = require('./config/twitConfig');
const dataAccessModules = require('./funcions/dataAccessModules');

const databasePath = './db/db0.json';
const streamHashtags = ['#freeCodeCamp', '#100DaysOfCode', '#301DaysOfCode', '#CodeNewbie', "#linkedInLearning"];

let T = new Twit(twitConfig);

// search for tweets using hashtag
const searchForTweetsByHashtag = (hashtag='freeCodeCamp', count=1) => {
  console.log('searchForTweetsByHashtag');
  hashtag = hashtag.indexOf('#') === 0 ? hashtag.slice(hashtag.indexOf('#')+1, hashtag.length) : hashtag;
  T.get('search/tweets', { 'q': '#'+hashtag, 'count': count }, function(err, data, response) {
    err ? console.log('error') : null;
    // console.log('*********************************************');
    // console.log(data.statuses);
    // console.log('*********************************************');
    // console.log(count, data.statuses.length);
    // console.log(data.statuses.map(s => ({ 'tweet': { 'id': s.id_str, 'text': s.text, owner: { 'id': s.user.id_str, 'name': s.user.name, 'screen_name': s.user.screen_name } } })));
  });
}

// search for a tweet using id_str
const searchForTweetByIdStr = id => {
  console.log('searchForTweetByIdStr');
  T.get('statuses/show', { 'id': id}, function(err, data, response) {
    err ? console.log('error') : null;
    // console.log({ 'tweet': { 'id': data.id_str, 'text': data.text, owner: { 'id': data.user.id_str, 'name': data.user.name, 'screen_name': data.user.screen_name } } });
  });
}




//**************************************************************************************************
//**************************************************************************************************
//**************************************************************************************************

// load the json database from the database path
const laodDatabase = (path, callback, tweet=true) => {
  console.log('laodDatabase');
  dataAccessModules.readJSON(path)
  .then(function(res){
    let publicationsData = JSON.parse(res);
    callback(publicationsData, saveDatabase, tweet)
  })
}

// load RSS feed from Medium.com and tweet the 1st link
const laodRssFeed = (publicationsData, callback, tweet=true) => {
  console.log('laodRssFeed');
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
      if(tweet){
        tweetMsg(data.title+" "+data.tags+" "+data.link)
      }
      callback(publicationsData, data);
      return;
    }
    callback(publicationsData);
  });
}

// save to the json database from after changing the data
const saveDatabase = (publicationsData, fetchData) => {
  console.log('saveDatabase');
  if(fetchData){
    if(publicationsData.publicationsList[publicationsData.publicationsRoundNumber].lastArticle !== fetchData.link){
      publicationsData.publicationsList[publicationsData.publicationsRoundNumber].lastArticle = fetchData.link;
    }
  }
  publicationsData.publicationsRoundNumber++;
  publicationsData.publicationsRoundNumber = publicationsData.publicationsRoundNumber % publicationsData.publicationsList.length;
  dataAccessModules.writeJSON('./db/db0.json', JSON.stringify(publicationsData, null, 2));
}
//**************************************************************************************************
//**************************************************************************************************
//**************************************************************************************************

// tweet using tweet message
const tweetMsg= msg => {
  console.log('tweetMsg');
  T.post('statuses/update', { status: msg }, function(err, data, response) {
    err ? console.log('error') : null;
    // console.log(data)
  })
}

// retweet a tweet using tweet id_str
const retweetByTweetIdStr = id => {
  console.log('retweetByTweetIdStr');
  T.post('statuses/retweet/:id', { 'id': id }, function (err, data, response) {
    err ? console.log('error') : null;
    // console.log(data);
  });
}

// follow a user by user_id without notification
const followUser = user_id => {
  console.log('followUser');
  T.post('friendships/create', { 'user_id': user_id, 'follow': false }, function(err, data, response) {
    err ? console.log('error') : null;
    // console.log(data);
  });
}

// unfollow a user by user_id
const unfollowUser = user_id => {
  console.log('unfollowUser');
  T.post('friendships/destroy', { 'user_id': user_id}, function(err, data, response) {
    err ? console.log('error') : null;
    // console.log(data);
  });
}

// search for hashtags and mentions and retweet or reply
const followHashtagsAndMyMention = (streamHashtags) => {
  let stream = T.stream('statuses/filter', {track: [...streamHashtags, process.env.SCREEN_NAME]});
  stream.on('tweet', function (tweet) {
    // console.log('...... found one!');
    // #freeCodeCamp  @2Bftawfik  Welcoming.
    if(!tweet.retweeted_status){
      let foundMe = [];
      if(tweet.entities.user_mentions.length > 0){
        foundMe = tweet.entities.user_mentions.filter(user => user.id_str === process.env.ID_STR);
      }
      if(foundMe.length > 0){
        tweetMsg('Many thanks @' + tweet.user.screen_name + ' for mentioning me, but i\'m useless without my creator. You may want to contact him @' + process.env.MAKER_SCREEN_NAME+'!');
      }else if(tweet.user.id_str !== process.env.ID_STR){
        retweetByTweetIdStr(tweet.id_str);
        followUser(tweet.user.id_str);
      }
    }
  });
}

//**************************************************************************************************
//**************************************************************************************************
//**************************************************************************************************

// searchForTweetsByHashtag('freeCodeCamp', 5);
// searchForTweetByIdStr('1093111413248352256');
// retweetByTweetIdStr('1093111413248352256');
// followUser('249699949');
// unfollowUser('249699949');

// laodDatabase(databasePath, laodRssFeed);
// laodRssFeed(publicationsData, saveDatabase);
// saveDatabase(publicationsData, fetchData);

//**************************************************************************************************
//**************************************************************************************************
//**************************************************************************************************

console.log('started');

followHashtagsAndMyMention(streamHashtags);

// setInterval(laodDatabase, 10*1000, databasePath, laodRssFeed);
// setInterval(laodDatabase, 24*60*60*1000, databasePath, laodRssFeed);
// #freeCodeCamp  @2Bftawfik  Welcoming.
