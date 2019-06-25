const express = require('express');
const app = express();

const { Pool } = require("pg"); //db connection module

const connectionString = process.env.DATABASE_URL;

//establish new connection to the data source specified
const pool = new Pool({connectionString: connectionString});

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));

app.get('/getPerson', getPerson);

app.listen(app.get('port'), function() {
	console.log('Node app is running on port', app.get('port'));
});

//handles requests to the /getPerson endpoint
function getPerson(request, response) {
	const id = request.query.id;

	getPersonFromDb(id, function(error, result) {
		if(error || result == null || result.length != 1) {
			response.status(500).json({success: false, data: error});
		} else {
			const person = result[0];
			response.status(200).json(person);
		}
	});
}

//gets a person from the DB
function getPersonFromDb(id, callback) {
	console.log("Getting person from DB with id: " + id);

	const sql = "SELECT id, first, last, birthdate FROM person WHERE id = $1::int";

	const params = [id];

	pool.query(sql, params, function(err, result) {
		if(err) {
			console.log("Error in query: ");
			console.log(err);
			callback(err, null);
		}

		console.log("Found result: " + JSON.stringify(result.rows));

		callback(null, result.rows);
	});
}