// require('dotenv').config();

let twitterFunction = {
  randomizerFactor: 13,
  randomizerWorking: 1,
  searchForTweetsByHashtag: (Twit, hashtag='freeCodeCamp', count=1) => {
    hashtag = hashtag.indexOf('#') === 0 ? hashtag.slice(hashtag.indexOf('#')+1, hashtag.length) : hashtag;
    Twit.get('search/tweets', { 'q': '#'+hashtag, 'count': count }, function(err, data, response) {
      err ? console.log('searchForTweetsByHashtag error') : null;
    });
  },
  searchForTweetByIdStr: (Twit, id) => {
    Twit.get('statuses/show', { 'id': id}, function(err, data, response) {
      err ? console.log('searchForTweetByIdStr error') : null;
    });
  },
  tweetMsg: (Twit, msg) => {
    Twit.post('statuses/update', { status: msg }, function(err, data, response) {
      err ? console.log('tweetMsg error') : null;
    })
  },
  retweetByTweetIdStr: (Twit, id) => {
    Twit.post('statuses/retweet/:id', { 'id': id }, function (err, data, response) {
      err ? console.log('retweetByTweetIdStr error') : null;
    });
  },
  followUser: (Twit, user_id) => {
    Twit.post('friendships/create', { 'user_id': user_id, 'follow': false }, function(err, data, response) {
      err ? console.log('followUser error') : null;
    });
  },
  unfollowUser: (Twit, user_id) => {
    Twit.post('friendships/destroy', { 'user_id': user_id}, function(err, data, response) {
      err ? console.log('unfollowUser error') : null;
    });
  },
  followHashtagsAndMyMention: (Twit, streamHashtags) => {
    let stream = Twit.stream('statuses/filter', {track: [...streamHashtags, process.env.SCREEN_NAME]});
    stream.on('tweet', function (tweet) {
      let randomizer = Math.floor(Math.random() * twitterFunction.randomizerFactor) === twitterFunction.randomizerWorking;
      // console.log(randomizer);
      if(!tweet.retweeted_status){
        let foundMe = [];
        if(tweet.entities.user_mentions.length > 0){
          foundMe = tweet.entities.user_mentions.filter(user => user.id_str === process.env.ID_STR);
        }
        if(randomizer){
          if(foundMe.length > 0){
            twitterFunction.tweetMsg(Twit, 'Many thanks @' + tweet.user.screen_name + ' for mentioning me, but i\'m useless without my creator. You may want to contact him @' + process.env.MAKER_SCREEN_NAME+'!');
          }else if(tweet.user.id_str !== process.env.ID_STR){
            twitterFunction.retweetByTweetIdStr(Twit, tweet.id_str);
            twitterFunction.followUser(Twit, tweet.user.id_str);
          }
        }
      }
    });
  }
}
module.exports = twitterFunction;
