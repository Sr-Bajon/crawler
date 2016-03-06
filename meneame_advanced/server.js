var express = require('express');
var fs      = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var Promise = require('bluebird');
var app     = express();

var $;
var requestMeneame = new Promise(function (resolve, reject) {
  var url = 'http://www.meneame.net';

  request(url, function (error, response, html) {
    if (error) reject(error);

    $ = cheerio.load(html);

    var noticias = $('.news-summary');

    resolve(noticias);
  });
});

function parseNoticias(noticias) {
  return new Promise(function (resolve, reject) {
    var noticiasObj = [];
    try {
      noticias.each(function (index, noticia) {
        noticiasObj.push({
          titular    : $(noticia).find('h2 a').text(),
          comentarios: $(noticia).find('.comments-counter a').attr('href')
        });
      });
      resolve(noticiasObj);
    } catch (err) {
      reject(err);
    }
  });
}

function getComments(noticias) {
  return new Promise(function (resolve, reject) {
    try {
      Object.keys(noticias);
      var comentPromises = [];

      noticias.forEach(function (noticia) {

        comentPromises.push(new Promise(function (resolve, reject) {
          try {
            request('http://www.meneame.net' + noticia.comentarios, function (error, response, html) {
              var $coment = cheerio.load(html);

              var comentarios     = [];
              $coment('.comment-body').each(function (index, comentario) {
                comentarios.push($coment(comentario).text());
              });
              noticia.comentarios = comentarios;

              resolve(noticia);
            });
          } catch (err) {
            reject(err);
          }
        }));
      });

      resolve(comentPromises);

    } catch (err) {
      reject(err);
    }
  });
}

requestMeneame
  .then(parseNoticias)
  .then(getComments)
  .catch(error)
  .then(function (promsesas) {
    Promise.all(promsesas)
      .then(function (response) {
        fs.writeFile('output.json', JSON.stringify(response, null, 4), function (err) {
          console.log('File successfully written! - Check your project directory for the output.json file');
        });
      })
      .catch(error);
  });


function error(err) {
  console.log(err);
}
