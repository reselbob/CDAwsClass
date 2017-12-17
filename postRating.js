console.log('Loading event');
var AWS = require('aws-sdk');
var dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

function validateEvent(event){
    const errors = [];
    if(!event.movieId || event.movieId.length === 0) errors.push({invalidProperty: 'movieId'});
    if(!event.movieTitle || event.movieTitle.length === 0) errors.push({invalidProperty: 'movieTitle'});
    if(!validateEmail(event.userEmail))  errors.push({invalidProperty: 'userEmail', value: event.userEmail});
    if(!event.rating || parseInt(event.rating) < 0 || parseInt(event.rating) > 5) errors.push({invalidProperty: 'rating', value: event.rating });
    
    return errors;
}


exports.handler = function(event, context) {
    const tableName = "Ratings";
    const ratingId = context.awsRequestId;
    console.log({message:'accepting data', data:event});
    const errors = validateEvent(event);
   
    if(errors.length > 0){
        console.log({validationError: errors})
        context.fail(new Error(JSON.stringify({validationError: errors})));
    }
    
    const  itm = {
            "movieId": {"S": event.movieId },
            "movieTitle": {"S":event. movieTitle },
            "userEmail": {"S": event.userEmail},
            "rating": {"N": event.rating},
            "ratingId": {"S": ratingId},
        };
    console.log({message: 'Before Submit', data:itm});
    
    dynamodb.putItem({
        "TableName": tableName,
        "Item" : itm
    }, function(err, data) {
        if (err) {
            context.fail(new Error('putting item into dynamodb failed: '+ err));
        }
        else {
            const msg = 'great success: '+JSON.stringify(data);
            console.log({ratingId});
            context.done(null,{ratingId});
        }
    });
};
