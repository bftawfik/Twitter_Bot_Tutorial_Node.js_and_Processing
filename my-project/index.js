require('dotenv').config();

const Twit = require('twit');
const fetch = require('node-fetch');
const parser = require('xml2json');


const twitConfig = require('./config/twitConfig');
const dataAccessModules = require('./funcions/dataAccessModules');
const twitterFunction = require('./funcions/twitFunction');

const databasePath = './db/db.json';
const streamHashtags = ['#freeCodeCamp', '#100DaysOfCode', '#301DaysOfCode', '#CodeNewbie', "#linkedInLearning"];

let T = new Twit(twitConfig);

//**************************************************************************************************
//**************************************************************************************************
//**************************************************************************************************

// load the json database from the database path
const laodDatabase = (path, callback, tweet=true) => {
  dataAccessModules.readJSON(path)
  .then(function(res){
    let publicationsData = JSON.parse(res);
    callback(publicationsData, saveDatabase, tweet)
  })
}

// load RSS feed from Medium.com and tweet the 1st link
const laodRssFeed = (publicationsData, callback, tweet=true) => {
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
        twitterFunction.tweetMsg(T, data.title+" "+data.tags+" "+data.link)
      }
      callback(publicationsData, data);
      return;
    }
    callback(publicationsData);
  });
}

// save to the json database from after changing the data
const saveDatabase = (publicationsData, fetchData) => {
  if(fetchData){
    if(publicationsData.publicationsList[publicationsData.publicationsRoundNumber].lastArticle !== fetchData.link){
      publicationsData.publicationsList[publicationsData.publicationsRoundNumber].lastArticle = fetchData.link;
    }
  }
  publicationsData.publicationsRoundNumber++;
  publicationsData.publicationsRoundNumber = publicationsData.publicationsRoundNumber % publicationsData.publicationsList.length;
  dataAccessModules.writeJSON(databasePath, JSON.stringify(publicationsData, null, 2));
}

//**************************************************************************************************
//**************************************************************************************************
//**************************************************************************************************

console.log('started');

twitterFunction.followHashtagsAndMyMention(T, streamHashtags);
setInterval(laodDatabase, 24*60*60*1000, databasePath, laodRssFeed);
