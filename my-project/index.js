const Twit = require('twit');
const fetch = require('node-fetch');
const parser = require('xml2json');

const twitConfig = require('./config/twitConfig');
const writeModule = require('./funcions/writeModule');

const getArticle = require('./funcions/getArticle');


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


getArticle.findArticle('./db/db.json')
.then(function(res){
  let publicationsData = JSON.parse(res);
  let publication = publicationsData.publicationsList[publicationsData.publicationsRoundNumber];
  console.log(publication.name);
  fetch('https://medium.com/feed/'+publication.name)
  .then(res => res.text())
  .then(body => {
    let data_json = parser.toJson(body, {object: true});
    let data = {
      title: data_json.rss.channel.item[0].title,
      link: data_json.rss.channel.item[0].link,
      publication: publication
    };
    console.log(data);
    return data;
  });
})
