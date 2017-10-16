const readlineSync = require("readline-sync");
const request = require("request");
const cheerio = require("cheerio");
const rp = require('request-promise');
const clear = require('./clear');

var movieName = process.argv[2];
var time = process.argv[3];
var imdbApiKey = "6b41a668e25ec6c8670df1fc29641a7d";

//clear console before execution
clear();


//if required parameters are missing
if (!movieName) {
    movieName = readlineSync.question("Please enter the movie name: ");
}

if (!time) {
    time = readlineSync.question("Please enter wait time for spoiler(in seconds): ");
}

//create globals on the basis of user arguments
var imdbRequestUrl = "https://api.themoviedb.org/3/search/movie?api_key=" + imdbApiKey + "&query=" + movieName;
var googleRequestUrl = "https://www.google.ca/search?q=" + movieName +"+film";
var timeInMS = secToMS(time);

/**
 * @summary Returns Spoiler warning for user.
 */
var warning = (movieName, time) => {
    return "**spoiler warning** we will be spoiling the plot of " + movieName + " in " + timeInMS + " seconds: \n";
}

/**
 * @summary Constructor function for movie plot.
 */
function Plot(title, details) {
    this.title = title;
    this.details = details;
}

/**
 * @summary Checks if the user input for time is valid and converts it into ms.
 */
function secToMS(time) {
    timeInMS = parseInt(time) * 1000
    if (isNaN(timeInMS)) {
        time = readlineSync.question("Please enter valid wait time for spoiler(in seconds): ");
        timeInMS = secToMS(time);
    }
    return timeInMS;
}


/**
 * @summary Fetch and disply the movie spoler.
 */
rp(imdbRequestUrl)
    .then(function (response) {
        let results = JSON.parse(response).results;
        //After getting results display spoiler
        console.log('\n\x1b[33m%s\x1b[0m', warning(movieName, time));
        setTimeout(function () {
            if (results.length) {
                spoiler = new Plot(results[0].title, results[0].overview);
                console.log('\x1b[32m%s\x1b[0m', "Spoiler for the movie - " + movieName);
                console.log('\x1b[32m%s\x1b[0m', "================================================\n")
                console.log("Name: " + spoiler.title + "\n");
                console.log("Plot: " + spoiler.details + "\n");
            } else {
                console.log("Please enter a valid movie name")
            }
        }, timeInMS);
    })
    .catch(function (error) {
        console.log(error);
    });


/**
 * @summary Fetch and display the google results for the movie.
 */
request(googleRequestUrl, function (error, response, body) {
    if (!error) {
        var $ = cheerio.load(body);
        console.log('\x1b[32m%s\x1b[0m', "Google results for the search term - " + movieName);
        console.log('\x1b[32m%s\x1b[0m', "================================================\n")
        let links = $(".r a");
        links.each(function (i, link) {
            // get the href attribute of each link
            var url = $(link).attr("href");
            // strip out unnecessary junk
            url = url.replace("/url?q=", "").split("&")[0];

            if (url.charAt(0) === "/") {
                return;
            }
            console.log($(link).text());
            console.log(url);
            console.log("");
        });

    }
})