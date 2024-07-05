const nodemailer = require('nodemailer');
const Holidays = require('date-holidays')
const sqlite3 = require('sqlite3').verbose();
require('dotenv').config({path: process.env.ENV_PATH});
const db = new sqlite3.Database(process.env.SQLITE);
CreateTableIfNotExists(db);
LogAppStart(db);

var hd = new Holidays()

hd = new Holidays('US', 'ca')
var holidays = hd.getHolidays(2024)

var today = new Date();
today.setDate(today.getDate() + 1);
var upcomingHolidays = holidays.filter(holiday => {
	var holidayAsDate = new Date(holiday.date);
	if(
		today.getDate() === holidayAsDate.getDate() &&
		today.getMonth() === holidayAsDate.getMonth()
	) {
		return true;
	}
	return false;
});	
if(upcomingHolidays.length > 0) {
	SendEmail(upcomingHolidays[0], db);
}

function SendEmail(holiday, db) {

// Create a transporter object with SMTP server details
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_SERVER,
    port: 587,
    auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD
    }
});

// Send an HTML email
transporter.sendMail({
    from: process.env.SENDER,
    to: process.env.RECIPIENT,
    subject: 'Upcoming Holiday',
    html: `<h1>Upcoming Holiday</h1><h2>Holiday: ${holiday.name}, ${holiday.date}</h2>`
}).then(res => {
	LogEmailSent(db);
}).
catch(error => {
	console.log(`Error: ${error}`);
});
}


function CreateTableIfNotExists(db) {
	db.run("CREATE TABLE IF NOT EXISTS Log(id integer PRIMARY KEY, createdAt datetime default current_timestamp, message text NOT NULL)", (err) => {
		if(err) {
			console.error("error creating table: " + err.message)
		}
	});
}

function LogAppStart(db) {
	db.run("INSERT INTO Log (message)  values ('Running app')", (err) => {
		if(err) {
			console.error("error inserting data: " + err.message)
		} 
	});
}

function LogEmailSent(db) {
	db.run("INSERT INTO Log (message)  values ('Email sent to recipient')", (err) => {
		if(err) {
			console.error("error inserting data: " + err.message)
		} 
	});
}
