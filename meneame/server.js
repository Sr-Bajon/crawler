var express = require('express');
var fs      = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();

function getMeneame() {

  var url = 'http://www.meneame.net';

  request(url, function (error, response, html) {
    if (!error) {
      var cheerio = require('cheerio'),
          $       = cheerio.load(html);

      var titulares = $('.news-summary h2 a');

      var json = {titulares: []};
      titulares.each(function (index, item) {
        json.titulares.push(item.children[0].data);
      });
    }

    fs.writeFile('output.json', JSON.stringify(json, null, 4), function (err) {
      console.log('File successfully written! - Check your project directory for the output.json file');
    });

  });

}

getMeneame();
