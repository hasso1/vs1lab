/**
 * Template für Übungsaufgabe VS1lab/Aufgabe3
 * Das Skript soll die Serverseite der gegebenen Client Komponenten im
 * Verzeichnisbaum implementieren. Dazu müssen die TODOs erledigt werden.
 */

/**
 * Definiere Modul Abhängigkeiten und erzeuge Express app.
 */

var http = require('http');
//var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var express = require('express');

var app;
app = express();
app.use(logger('dev'));
app.use(bodyParser.urlencoded({
    extended: false
}));

// Setze ejs als View Engine
app.set('view engine', 'ejs');

/**
 * Konfiguriere den Pfad für statische Dateien.
 * Teste das Ergebnis im Browser unter 'http://localhost:3000/'.
 */

// TODO: CODE ERGÄNZEN
app.use(express.static('public')); //statische Dateien (CSS, Bilder, ..) werden mit express.static('verzeichnis') bereitsgestellt

/**
 * Konstruktor für GeoTag Objekte.
 * GeoTag Objekte sollen min. alle Felder des 'tag-form' Formulars aufnehmen.
 */

// TODO: CODE ERGÄNZEN

function GeoTag(latitude, longitude, name, hashtag, id){
    this.latitude = latitude;
    this.longitude = longitude;
    this.name = name;
    this.hashtag = hashtag;
    this.id = id;

    this.getLatitude = function () {
        return this.latitude;
    };
    this.getLongitude = function () {
        return this.longitude;
    };
    this.getName = function() {
        return this.name;
    };
    this.getHashtag = function() {
        return this.hashtag;
    };
    this.getId = function() {
        return this.id;
    }
}



/**
 * Modul für 'In-Memory'-Speicherung von GeoTags mit folgenden Komponenten:
 * - Array als Speicher für Geo Tags.
 * - Funktion zur Suche von Geo Tags in einem Radius um eine Koordinate.
 * - Funktion zur Suche von Geo Tags nach Suchbegriff.
 * - Funktion zum Hinzufügen eines Geo Tags.
 * - Funktion zum Löschen eines Geo Tags.
 */
s
// TODO: CODE ERGÄNZEN
var InMemory = (function () { //InMemory-Modul
    var tagList = []; //Arrayliste als Speicher für Tags
    var id = 0;

    return {
        searchRadius: function (latitude, longitude, radius) { //Suche von GeoTags in einem Radius um eine Koordinate
            let result = tagList.filter(function (input) { //input = was gesucht wird, "filter", um neues Array anhand der Results zu erstellen
                return (
                    Math.sqrt(Math.pow(input.getLatitude()) - latitude) <= radius &&
                    Math.sqrt(Math.pow(input.getLongitude()) - longitude)   <= radius //Latitude und Longitude um Radius der Koordinate
                );
            });

            return result;
        },
        searchTerm: function (term) { //Suche von GeoTags nach Suchbegriff
                let result = tagList.filter(function (input)
            {
                    return (
                        input.getName().contains(term) || //Name oder Hashtag erhalten
                        input.getHashtag().contains(term)

                    );
                })
            return result;
        },

        add: function (latitude, longitude, name, hashtag){ //Hinzufügen eines GeoTags
            let newTag = GeoTag(latitude, longitude, name, hashtag, this.id);
            this.id++;
            tagList.push(newTag);
        },

        remove: function (id){ //Löschen eines GeoTags
            tagList.splice(GeoTag.getCurrentPosition(), 1);
        }
    }

}) ();

/**
 * Route mit Pfad '/' für HTTP 'GET' Requests.
 * (http://expressjs.com/de/4x/api.html#app.get.method)
 *
 * Requests enthalten keine Parameter
 *
 * Als Response wird das ejs-Template ohne Geo Tag Objekte gerendert.
 */

app.get('/', function(req, res) {

    res.render('gta', {
        taglist: []
    });
});

/**
 * Route mit Pfad '/tagging' für HTTP 'POST' Requests.
 * (http://expressjs.com/de/4x/api.html#app.post.method)
 *
 * Requests enthalten im Body die Felder des 'tag-form' Formulars.
 * (http://expressjs.com/de/4x/api.html#req.body)
 *
 * Mit den Formulardaten wird ein neuer Geo Tag erstellt und gespeichert.
 *
 * Als Response wird das ejs-Template mit Geo Tag Objekten gerendert.
 * Die Objekte liegen in einem Standard Radius um die Koordinate (lat, lon).
 */

// TODO: CODE ERGÄNZEN START

app.post('/tagging', function (req, res) {
let lat = req.body.latitude;
let lon = req.body.longitude;
let name = req.body.name;
let hashtag = req.body.hashtag;

InMemory.add(lat, lon, name, hashtag); //neuer GeoTag erstellt und gespeichert

    res.render('gta', {
        taglist: InMemory.searchRadius(lat,lon,10), //Objekte liegen in einem Radius von 10 um die Koordinate
        lat: lat,
        lon: lon,
        name: name,
        hashtag: hashtag,
        datatags: JSON.stringify(InMemory.searchRadius(lat, lon, 10))
    });
})


/**
 * Route mit Pfad '/discovery' für HTTP 'POST' Requests.
 * (http://expressjs.com/de/4x/api.html#app.post.method)
 *
 * Requests enthalten im Body die Felder des 'filter-form' Formulars.
 * (http://expressjs.com/de/4x/api.html#req.body)
 *
 * Als Response wird das ejs-Template mit Geo Tag Objekten gerendert.
 * Die Objekte liegen in einem Standard Radius um die Koordinate (lat, lon).
 * Falls 'term' vorhanden ist, wird nach Suchwort gefiltert.
 */

// TODO: CODE ERGÄNZEN

app.post('/discovery', function (req, res) {
    let lat = req.body.latitude;
    let lon = req.body.longitude;
    let term = req.body.searchterm;

    if (term) {
       var resultTerm = InMemory.searchTerm(term);
        res.render('gta', {
            taglist: resultTerm,
            lat: lat,
            lon: lon,
            datatags: JSON.stringify(resultTerm)
        })
    } else {
        var resultRadius =  InMemory.searchRadius(lat, lon, 10);
        res.render('gta', {
            taglist: resultRadius,
            lat: lat,
            lon: lon,
            datatags: JSON.stringify(resultRadius)


        })}
});