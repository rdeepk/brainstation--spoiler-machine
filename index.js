const readlineSync = require("readline-sync");
const request = require("request");
const cheerio = require("cheerio");
const rp = require('request-promise');
const clear = require('./clear');

clear();

var movieName = process.argv[2];
var time = process.argv[3];

if (!movieName) {
    movieName = readlineSync.question("Please enter the movie name: ");
}

if (!time) {
    time = readlineSync.question("Please enter wait time for spoiler(in seconds): ");
}


var imdbApiKey = "6b41a668e25ec6c8670df1fc29641a7d";
var imdbRequestUrl = "https://api.themoviedb.org/3/search/movie?api_key=" + imdbApiKey + "&query=" + movieName;
var googleRequestUrl = "https://www.google.ca/search?q=" + movieName;
var timeInMS = secToMS(time);

var warning = (movieName, time) => {
    return "**spoiler warning** we will be spoiling the plot of " + movieName + " in " + time + " seconds: \n";
}

//console.log('\x1b[31m%s\x1b[34m%s\x1b[0m', 'I am cyan','i am blue');

function Plot(title, details) {
    this.title = title;
    this.details = details;
}

function secToMS(time) {
    timeInMS = parseInt(time) * 1000
    if(isNaN(timeInMS)) {
        time = readlineSync.question("Please enter valid wait time for spoiler(in seconds)");
        timeInMS = secToMS(time);
    }
    return timeInMS;
}

rp(imdbRequestUrl)
    .then(function (response) {
        let results = JSON.parse(response).results;
        if (results.length) {
            spoiler = new Plot(results[0].title, results[0].overview);
            //After getting results display spoiler
            console.log('\n\x1b[33m%s\x1b[0m', warning(movieName, time));
            //wait for given time before giving google
            setTimeout(function () {
                console.log('\x1b[36m%s\x1b[0m',"Spoiler for the movie - " + movieName);
                console.log('\x1b[36m%s\x1b[0m',"================================================\n")
                console.log("Name: " + spoiler.title + "\n");
                console.log("Plot: " + spoiler.details + "\n");
            }, timeInMS);
        } else {
            console.log("Please enter a valid movie name")
        }

    })
    .catch(function (error) {
        console.log(error);
    });


request(googleRequestUrl, function (error, response, body) {
    if (!error) {
        var $ = cheerio.load(body);
        console.log('\x1b[36m%s\x1b[0m',"Google results for the search term - " + movieName);
        console.log('\x1b[36m%s\x1b[0m',"================================================\n")
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