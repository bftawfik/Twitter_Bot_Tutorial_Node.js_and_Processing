module.exports = {
  searchForTweetsByHashtag: (hashtag='freeCodeCamp', count=1) => {
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
  },
  searchForTweetByIdStr: id => {
    console.log('searchForTweetByIdStr');
    T.get('statuses/show', { 'id': id}, function(err, data, response) {
      err ? console.log('error') : null;
      // console.log({ 'tweet': { 'id': data.id_str, 'text': data.text, owner: { 'id': data.user.id_str, 'name': data.user.name, 'screen_name': data.user.screen_name } } });
    });
  },
  tweetMsg: msg => {
    console.log('tweetMsg');
    T.post('statuses/update', { status: msg }, function(err, data, response) {
      err ? console.log('error') : null;
      // console.log(data)
    })
  },
  retweetByTweetIdStr: id => {
    console.log('retweetByTweetIdStr');
    T.post('statuses/retweet/:id', { 'id': id }, function (err, data, response) {
      err ? console.log('error') : null;
      // console.log(data);
    });
  },
  followUser: user_id => {
    console.log('followUser');
    T.post('friendships/create', { 'user_id': user_id, 'follow': false }, function(err, data, response) {
      err ? console.log('error') : null;
      // console.log(data);
    });
  },
  unfollowUser: user_id => {
    console.log('unfollowUser');
    T.post('friendships/destroy', { 'user_id': user_id}, function(err, data, response) {
      err ? console.log('error') : null;
      // console.log(data);
    });
  },
}
