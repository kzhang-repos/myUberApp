var http = require('http');
var express = require('express');
var consolidate = require('consolidate');
var _ = require('underscore');
var bodyParser = require('body-parser');

var routes = require('./routes');
var mongoClient = require('mongodb').MongoClient;

var app = express();
app.use(bodyParser.urlencoded({
    extended: true,
}));

app.use(bodyParser.json({limit: '5mb'}));

app.set('views', 'views');
app.use(express.static('./public'));

app.set('view engine', 'html');
app.engine('html', consolidate.underscore);

var server = http.Server(app);
var portNumber = 8000;

var io = require('socket.io')(server);

server.listen(portNumber, function() {
    console.log('server listening at port ' + portNumber);
    if (app.get('env') === 'development') var url = 'mongodb://localhost:27017/myUberApp';
    else if (app.get('env') === 'production') var url = $PROD_MONGODB;
    mongoClient.connect(url, function(err, db) {
        console.log('Connected to database');
        
        app.get('/rider.html', function(req, res) {
            res.render('rider.html', {
                userId: req.query.userId
            });
        });

        app.get('/driver.html', function(req, res) {
            res.render('driver.html', {
                userId: req.query.userId
            });
        });

        app.get('/data.html', function(req, res) {
            res.render('data.html');
        });

        io.on('connection', function(socket) {
            console.log('A user just connected');

            socket.on('join', function(data) {
                socket.join(data.userId);
                console.log('User joined room: ' + data.userId);
            });

            routes.initialize(app, db, socket, io);
        });
    });
});