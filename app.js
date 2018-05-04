const express = require('express');
const parseurl = require('parseurl');
const bodyParser = require('body-parser');
const path = require('path');
const expressValidator = require('express-validator');
const mongoose = require('mongoose');
const Game = require('./models/game.js')
const Team = require('./models/team.js')
const app = express();
const url = 'mongodb://nu-worldcupadmin:2018@ds257579.mlab.com:57579/nu-worldcup';
const axios = require('axios');

// For cors
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// For parsing application/x-www-form-urlencoded 
app.use(bodyParser.urlencoded({ extended: true }));


//====ROOT DIRECTORY===//
app.get('/', function(req, res) {
  res.json('you are at the nu world cup server!');
  console.log('A GET request was made');
});


//====GET GROUP STAGE GAMES===//
app.get('/api/games', function(req, res) {
	var params = req.query;
	var team1 = "";
	var team2 = "";
	var gameNum = 0;
	if (params.team1 !== null) {
		team1 = params.team1;
	}
	if (params.team2 !== null) {
		team2 = params.team2;
	}
	if (params.game) {
		gameNum = parseInt(params.game);
	}
	var tournament = params.tournament;

  	Game.findOne({ $or:[{'team1': team1, 'team2': team2, 'tournament': tournament}, {'team1': team2, 'team2': team1, 'tournament': tournament}, {'tournament': tournament, 'game': gameNum}]}).then(game => {
    	res.json(game);
    })
 });

//====GET GROUP STAGE POINTS===//
app.get('/api/points', function(req, res) {
	var params = req.query;
	var name = params.name;
	var tournament = params.tournament;

  	Team.findOne({'name': name, 'tournament': tournament}).then(team => {
    	res.json(team);
    })
 });









// UPDATE GROUP STAGE POINTS FROM SLACK
app.post('/slack/updatepoints', function (req, res) {
	// team points tournament

	var params = req.body.text;
	text = params.split(" ");
	var name = text[0];
	var points = parseInt(text[1]);
	var tournament = text[2];

	// Need to put this into the database now

	Team.findOne({'name': name, 'tournament' : tournament}, (err, team) => {
		if (err) {
			console.log("Error in finding Team", err)
		}
		if (team) {
			var beforePoints = team.points;
			team.points = points;
			team.save((err) => {
				if (err) {
			  		console.log("Error updating the team with the new points from slack", err);
			  	}
			  	else {
			  		// If all goes well respond with below. Otherwise respond saying there was an error and return what they put in
					var response = "Points have been updated from " + beforePoints + " to " + points + " for " + name + "!";
					axios.post('https://hooks.slack.com/services/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', 
						{"text":response});
			  	}
			});
		}
		else {
			// If all goes well respond with below. Otherwise respond saying there was an error and return what they put in
			var response = "There was an error updating points on the website :( Please check what you sent:\n\n";
			response = response + params;
			axios.post('https://hooks.slack.com/services/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', 
				{"text":response});
		}
	});
});

// UPDATE GROUP AND KNOCKOUT STAGE GAMES FROM SLACK
app.post('/slack/addscore', function(req, res) {

	var params = req.body.text;
	text = params.split(" ");
	var team1 = text[0];
	var score1 = parseInt(text[1]);
	var team2 = text[2];
	var score2 = parseInt(text[3]);
	var tournament = text[4];
	var type = text[5];

	// Need to put this into the database now

	Game.findOne({ $or:[ {'team1':team1, 'team2': team2, 'tournament': tournament, 'type': type}, {'team1':team2, 'team2': team1, 'tournament': tournament, 'type': type} ]}, (err, game) => {
		if (err) {
			console.log("Error in finding Game", err)
		}
		if (game) {
			if (game.team1 == team1) {
				game.score1 = score1;
				game.score2 = score2;
			}
			else {
				game.score1 = score2;
				game.score2 = score1;
			}
			game.save((err) => {
				if (err) {
			  		console.log("Error updating the game with the new scores from slack", err);
			  	}
			  	else {
			  		// If all goes well respond with below. Otherwise respond saying there was an error and return what they put in
					var response = "A new score has been added!\n\n";
					if (score1 > score2) {
						response = response + team1 + " beat " + team2 + " " + score1 + "-" + score2 + "!";
					}
					else if (score1 < score2) {
						response = response + team2 + " beat " + team1 + " " + score2 + "-" + score1 + "!";
					}
					else {
						response = response + team1 + " and " + team2 + " tied!";
					}
					axios.post('https://hooks.slack.com/services/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', 
						{"text":response});
			  	}
			});
		}
		else {
			// If all goes well respond with below. Otherwise respond saying there was an error and return what they put in
			var response = "There was an error adding the score to the website :( Please check what you sent:\n\n";
			response = response + params;
			axios.post('https://hooks.slack.com/services/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', 
				{"text":response});
		}
	});
});


app.post('/slack/addknockout', function(req, res) {

	var params = req.body.text;
	text = params.split(" ");
	var game = parseInt(text[0]);
	var team1 = text[1];
	var team2 = text[2];
	var tournament = text[3];

	// Need to put this into the database now 

	// Ewww these callbacks are not nice.... Need to change
	Team.findOne({'name': team1, 'tournament': tournament}, (err, teamone) => {
		if (err) {
			console.log("Error finding team 1", err);
		}
		if (teamone) {
			Team.findOne({'name': team2, 'tournament': tournament}, (err, teamtwo) => {
				if (err) {
					console.log("Error finding team 2", err);
				}
				if (teamtwo) {
					Game.findOne({'tournament': tournament, 'game': game}, (err, kogame) => {
						if (err) {
							console.log("Error in finding Game", err)
						}
						if (kogame) {
							kogame.team1 = team1;
							kogame.team2 = team2;
							kogame.save((err) => {
								if (err) {
									console.log("Error updating knockout game with teams from slack");
								}
								else {
									var response = "New teams have been added for a knockout game!\n\n";
									response = response + team1 + " and " + team2 + " are playing in game " + game + "!";
									axios.post('https://hooks.slack.com/services/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', 
										{"text":response});
								}
							});
						}
						else {
							var response = "There was an error adding the game :( Game " + game + " doesn't exist. Please check what you sent:\n\n";
							response = response + params;
							axios.post('https://hooks.slack.com/services/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', 
								{"text":response});
						}
					});
				}
				else {
					var response = "There was an error adding the game :( Team 2 doesn't exist. Please check what you sent:\n\n";
					response = response + params;
					axios.post('https://hooks.slack.com/services/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', 
						{"text":response});
				}
			});

		}
		else {
			var response = "There was an error adding the game :( Team 1 doesn't exist. Please check what you sent:\n\n";
			response = response + params;
			axios.post('https://hooks.slack.com/services/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', 
				{"text":response});
		}

	});
});


app.post('/slack/resetknockout', function(req, res) {

	var params = req.body.text;
	text = params.split(" ");
	var game = parseInt(text[0]);
	var tournament = text[1];

	Game.findOne({'game': game, 'tournament': tournament}, (err, kogame) => {
		if (err) {
			console.log("Error resetting kogame", err);
		}
		if (kogame) {
			kogame.team1 = "Tm 1";
			kogame.team2 = "Tm 2";
			kogame.score1 = 0;
			kogame.score2 = 0;
			kogame.save((err) => {
				if (err) {
					console.log("Error resetting knockout game from slack");
				}
				else {
					var response = "Knockout game " + game + " has been reset!";
					axios.post('https://hooks.slack.com/services/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', 
						{"text":response});
				}
			});
		}
	})



	
});

// EXAMPLES

// FOR A TEAM
// {
//     "_id": {
//         "$oid": "5ae78652734d1d133184096f"
//     },
//     "name": "Australia",
//     "flag": "au",
//     "points": 0,
//     "tournament": "women",
//     "abb": "AUS"
// }


// FOR A GAME
// {
//     "_id": {
//         "$oid": "5ae8aeb9734d1d1331848a12"
//     },
//     "team1": "Tm 1",
//     "score1": 0,
//     "team2": "Tm 2",
//     "score2": 0,
//     "type": "knockout",
//     "tournament": "co-rec",
//     "game": 19
// }


// KNOCKOUT GAME

// Find that game and update the teams



// Body sent like this from Slack:

// token=gIkuvaNzQIHg97ATvDxqgjtO
// team_id=T0001
// team_domain=example
// enterprise_id=E0001
// enterprise_name=Globular%20Construct%20Inc
// channel_id=C2147483705
// channel_name=test
// user_id=U2147483697
// user_name=Steve
// command=/addscore
// text=Mexico 2 Mozambique 2 co-rec group
// response_url=https://hooks.slack.com/commands/1234/5678
// trigger_id=13345224609.738474920.8088930838d88f008e0



//====MONGOOSE CONNECT===//
mongoose.connect(url, function (err, db) {
	if (err) {
		console.log('Unable to connect to the mongoDB server. Error:', err);
	} else {
		console.log('Connection established to', url);
	}
});

app.listen(process.env.PORT || 4000);
console.log('starting the application');