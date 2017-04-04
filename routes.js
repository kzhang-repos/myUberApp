var dbOperations = require('./db-operations');

function initialize(app, db, socket, io) {
    app.get('/drivers', function(req, res){
        var latitude = Number(req.query.lat);
        var longitude = Number(req.query.lng);

        dbOperations.fetchNearestDrivers(db, [longitude, latitude], function(results) {
            res.json({
                drivers: results
            });
        });
    });

    app.get('/drivers/info', function(req, res) {
        var userId = req.query.userId;
        dbOperations.fetchDriverDetails(db, userId, function(results) {
            res.json({
                driverDetails: results
            });
        });
    });

    socket.on('request-for-car', function(eventData) {
        var requestTime = new Date();
        var ObjectID = require('mongodb').ObjectID;
        var requestId = new ObjectID;
        var location = {
            coordinates: [
                eventData.location.longitude,
                eventData.location.latitude
            ],
            address: eventData.location.address
        };
        dbOperations.saveRequest(db, requestId, requestTime, location, eventData.riderId, 'waiting', function(results) {
            dbOperations.fetchNearestDrivers(db, location.coordinates, function(results){
                eventData.requestId = requestId;
                for (var i = 0; i < results.length; i++) {
                    io.sockets.in(results[i].userId).emit('request-for-car', eventData);
                }
            });
        });
    });

    socket.on('request-accepted', function(eventData) {
        var ObjectID = require('mongodb').ObjectID;
        var requestId = new ObjectID(eventData.requestDetails.requestId);

        dbOperations.updateRequest(db, requestId, eventData.driverDetails.driverId, 'engaged', function(results) {
            io.sockets.in(eventData.requestDetails.riderId).emit('request-accepted', eventData.driverDetails);
        });
    });

    app.get('/requests/info', function(req, res) {
        dbOperations.fetchRequests(db, function(results) {
            var features = [];

            for (var i = 0; i < results.length; i++) {
                features.push({
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: results[i].location.coordinates
                    },
                    properties: {
                        status: results[i].status,
                        requestTime: results[i].requestTime,
                        address: results[i].location.address
                    }
                });
            }
            var geoJsonData = {
                type: 'FeatureCollection',
                features: features
            }

            res.json(geoJsonData);
        });
    });
};

exports.initialize = initialize;