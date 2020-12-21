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
app.use(express.static('public'));

/**
 * Konstruktor für GeoTag Objekte.
 * GeoTag Objekte sollen min. alle Felder des 'tag-form' Formulars aufnehmen.
 */

// TODO: CODE ERGÄNZEN
function GeoTag(latitude, longitude, name, hashtag) {
    this.latitude = latitude;
    this.longitude = longitude;
    this.name = name;
    this.hashtag = hashtag;

    this.getLatitude = function () {
        return this.latitude;
    };
    this.getLongitude = function () {
        return this.longitude;
    };
    this.getName = function () {
        return this.name;
    };
    this.getHashtag = function () {
        return this.hashtag;
    };
}

/**
 * Modul für 'In-Memory'-Speicherung von GeoTags mit folgenden Komponenten:
 * - Array als Speicher für Geo Tags.
 * - Funktion zur Suche von Geo Tags in einem Radius um eine Koordinate.
 * - Funktion zur Suche von Geo Tags nach Suchbegriff.
 * - Funktion zum hinzufügen eines Geo Tags.
 * - Funktion zum Löschen eines Geo Tags.
 */

// TODO: CODE ERGÄNZEN
var Memory = (function () {

    var MyTags = [];

    var last_lon;
    var last_lat;

    return {
        add: function (GeoTag) {
            MyTags.push(GeoTag);
        },

        delete: function (GeoTag){
            const index = MyTags.indexOf(GeoTag);
            if (index > -1) {
                MyTags.splice(index, 1);
            }
        },

        searchByRadius: function (latitude, longitude, radius) {
            var foundTags = MyTags.filter(function (tag) {
                return (
                    (Math.abs(tag.getLatitude() - latitude) < radius) &&
                    (Math.abs(tag.getLongitude() - longitude) < radius)
                );
            });
            return foundTags;
        },

        searchByTerm: function (searchterm) {
            var foundTags = MyTags.filter(function (tag) {
                return (
                    tag.getName().toString().includes(searchterm) ||
                    tag.getHashtag().toString().includes(searchterm)
                );
            });
            return foundTags;
        },

        saveLastGeoTag: function (latitude, longitude){
            if(latitude !== undefined && longitude !== undefined)
            {
                last_lat = latitude;
                last_lon = longitude;
            }
        },

        getLastLon: function () {
            return last_lon;
        },

        getLastLat: function () {
            return last_lat;
        },

        getMyList: function () {
            return MyTags;
        }


    }
})();

/**
 * Route mit Pfad '/' für HTTP 'GET' Requests.
 * (http://expressjs.com/de/4x/api.html#app.get.method)
 *
 * Requests enthalten keine Parameter
 *
 * Als Response wird das ejs-Template ohne Geo Tag Objekte gerendert.
 */

app.get('/', function(req, res) {

    let lon = req.body.longitude;
    let lat = req.body.latitude;

    Memory.saveLastGeoTag(lat, lon);

    res.render('gta', {
        taglist: [],
        lat: Memory.getLastLat(),
        lon: Memory.getLastLon()
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

    var newTag = new GeoTag(lat, lon, name, hashtag);

    Memory.add(newTag);
    Memory.saveLastGeoTag(lat, lon);

    res.render('gta', {
        taglist: Memory.searchByRadius(lat, lon, 5),
        lat: lat,
        lon: lon,
        datatags: JSON.stringify(Memory.searchByRadius(lat, lon, 5))
    });
});

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
    var lat = req.body.hiddenlatitude;
    var lon = req.body.hiddenlongitude;
    var searchterm = req.body.searchterm;

    if (searchterm) {
        res.render('gta', {
            taglist: Memory.searchByTerm(searchterm),
            lat: lat,
            lon: lon,
            datatags: JSON.stringify(Memory.searchByTerm(searchterm))
        })
    } else {
        res.render('gta', {
            taglist: Memory.searchByRadius(lat, lon, 5),
            lat: lat,
            lon: lon,
            datatags: JSON.stringify(Memory.searchByRadius(lat, lon, 5))
        })
    }
});

/**
 * Setze Port und speichere in Express.
 */

var port = 3000;
app.set('port', port);

/**
 * Erstelle HTTP Server
 */

var server = http.createServer(app);

/**
 * Horche auf dem Port an allen Netzwerk-Interfaces
 */

server.listen(port);