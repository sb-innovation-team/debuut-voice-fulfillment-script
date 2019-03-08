// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';

var https = require ('https');
const requestNative = require('request-promise-native');

const functions = require('firebase-functions');
const { WebhookClient } = require('dialogflow-fulfillment');
const requestLib = require('request');


//var number = Math.random();
//number.toString(36);
//var ID = number.toString(36).substr(2, 9);
//ID.length >= 9; 


// initialise DB connection
const admin = require('firebase-admin');
admin.initializeApp();

process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements 

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));

  function welcome(agent) {
    agent.add(`Goedendag!`);
  }

  function fallback(agent) {
    agent.add(`Excuus, ik versta je niet`);
    agent.add(`Excuus, kan je het nog een keer proberen?`);
  }

  function createBooking(agent) {
    let gasten = agent.parameters.gasten;
    let restaurant = agent.parameters.restaurant;
    let achternaam = agent.parameters.achternaam;
    let time = new Date(agent.parameters.time);
    let date = new Date(agent.parameters.datum);
    let mail = agent.parameters.mail;
    let bookingDate = new Date(date);
    let telefoon = agent.parameters.telefoon;
    
    console.log ("een");
    
    //let userId = ID;

    bookingDate.setHours(time.getHours());
    bookingDate.setMinutes(time.getMinutes());
    let now = new Date();

    console.log ("een twee");
    
    if (gasten < 1) {
      agent.add(`Je moet voor minimaal 1 gast reserveren!`);
    } else if (bookingDate < now) {
      agent.add(`Je kan geen reservering plaatsen in het verleden`);
    } else {
    //Check
    
    console.log ("eentweedrie");
      
    var feest = false;

    var options = {
      method: 'POST',
      uri: 'http://142.93.225.137/restaurants/reservation',
      body: {
        name: achternaam,
        surname: achternaam,
        email: mail,
        party_size: gasten,
        local_date: date,
        local_time: time,
        notes: 'Nvt',
        phone: telefoon,
        restaurant_id: restaurant
      },
      json: true // Automatically stringifies the body to JSON
    };

    console.log ("eentweedrievier");
      
    const urlString = "http://142.93.225.137/restaurants/reservation";
   
    requestNative({
        url: urlString,
        method: 'POST',
       body: {
        name: achternaam,
        surname: achternaam,
        email: mail,
        party_size: gasten,
        local_date: date,
        local_time: time,
        comment: 'Nvt',
        phone: telefoon,
        restaurant_id: restaurant
      },
      json: true // Automatically stringifies the body to JSON
   
    }).then(function(resp) {
        console.log(resp);
        agent.add ("feest");
    }).catch(function(error) {
        console.log(error.message);
        agent.add ("niet feest");
    });

      //Check if reservation is possible. 
      let timezone = parseInt(agent.parameters.time.toString().slice(19, 22));
      bookingDate.setHours(bookingDate.getHours());
      agent.add(`Super, de reservering voor ${date}, met ${gasten} personen om ${time}, onder de naam ${achternaam} is bevestigd, er wordt een bevestiging verstuurd naar ${mail}`);
      agent.add(`We zien je graag bij ${restaurant}`);
      agent.add(`Fijne dag verder!`);
    }
  }
  
  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('restaurant.reservering.maken', createBooking);
  agent.handleRequest(intentMap);
});