function fetchNearestDrivers(db, coordinates, callback) {
    db.collection('driverData').createIndex({
        'location': '2dsphere'
    }, function() {
        db.collection('driverData').find({
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: coordinates
                    },
                    $maxDistance: 2000
                }
            }
        }).toArray(function(err, results) {
            if(err) {
                console.log(err)
            } else {
                callback(results);
            }
        });
    });
}

function fetchDriverDetails(db, userId, callback) {
    db.collection('driverData').findOne({
        userId: userId
    }, function(err, results){
        if(err) console.log(err);
        else callback({
            driverId: results.userId,
            displayName: results.displayName,
            phone: results.phone,
            location: results.location
        });
    });
}

function saveRequest(db, issueId, requestTime, location, riderId, status, callback) {
    db.collection('requestsData').insert({
        '_id': issueId,
        'requestTime': requestTime,
        'location': location,
        'riderId': riderId,
        'status': status
    }, function(err, results) {
        if(err) console.log(err);
        else callback(results);
    });
}

function updateRequest(db, requestId, driverId, status, callback) {
    db.collection('requestsData').update({
        '_id': requestId
    }, {
        $set: {
            'status': status,
            'driverId': driverId
        }
    }, function(err, results) {
        if (err) console.log(err);
        else callback('Issue updated');
    });
}

function fetchRequests(db, callback) {
    var collection = db.collection('requestsData');
    var stream = collection.find({}, {
        requestTime: true,
        status: true,
        location: true
    }).stream();

    var requestsData = [];
    
    stream.on('error', function (err) {
        console.error(err);
    });

    stream.on('data', function(request) {
        requestsData.push(request);
    });

    stream.on('end', function() {
        callback(requestsData);
    });
}

exports.fetchNearestDrivers = fetchNearestDrivers;
exports.fetchDriverDetails = fetchDriverDetails;
exports.saveRequest = saveRequest;
exports.updateRequest = updateRequest;
exports.fetchRequests = fetchRequests;