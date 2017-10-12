const readlineSync = require("readline-sync");
const request = require("request");
const cheerio = require("cheerio");
const rp = require('request-promise');


var movieName = process.argv[2];
var time = process.argv[3];

if(!movieName) {
    movieName = readlineSync.question("Please enter the movie name");
}

if(!time) {
    time = readlineSync.question("Please enter wait time for spoiler(in seconds)");
}


var imdbApiKey = "6b41a668e25ec6c8670df1fc29641a7d";
var imdbRequestUrl = "https://api.themoviedb.org/3/search/movie?api_key=" + imdbApiKey + "&query=" + movieName;
var googleRequestUrl = "https://www.google.ca/search?q="+ movieName;
var timeInMS = parseInt(time)*1000;


var warning = (movieName, time) => {
    return "**spoiler warning** we will be spoiling the plot of "+ movieName + " in " + time + " seconds";
}



function Plot(title, details) {
    this.title = title;
    this.details = details;
}

rp(imdbRequestUrl)
            .then(function (response) {
                let results = JSON.parse(response).results;
                spoiler = new Plot(results[0].title, results[0].overview);
                //After getting results display spoiler
                console.log(warning(movieName, time));
                //wait for given time before giving google
                setTimeout(function(){
                    console.log(spoiler);
                  }, timeInMS);

            })
            .catch(function (error) {
                console.log(error);
            });


request(googleRequestUrl, function (error, response, body) {
    if(!error) {
        var $ = cheerio.load(body);
        
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