// create an IAM Lambda role with access to dynamodb
// Launch Lambda in the same region as your dynamodb region
// (here: us-east-1)
// dynamodb table with hash key = user and range key = datetime

console.log('Loading event');
var AWS = require('aws-sdk');
var dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

function validateEvent(event){
    console.log(JSON.stringify({function: "validateEvent", data:event}));
    const errors = [];
    if(!event.movieId || event.movieId.length === 0) errors.push({invalidProperty: 'movieId'});
    if(!event.movieTitle || event.movieTitle.length === 0) errors.push({invalidProperty: 'movieTitle'});
    if(!validateEmail(event.userEmail))  errors.push({invalidProperty: 'userEmail', value: event.userEmail});
    if(!event.rating || parseInt(event.rating) < 0 || parseInt(event.rating) > 5) errors.push({invalidProperty: 'rating', value: event.rating });
    return errors;
}
/*
sends the rating onto the SNS Topic
*/
function sendRatingToTopic(rating, callback){
    var sns = new AWS.SNS();
     console.log({message: 'Send sending rating to topic: arn:aws:sns:us-east-1:950922144292:RatingPostedTopic.',rating });
    sns.publish({
      TopicArn: "arn:aws:sns:us-east-1:950922144292:RatingPostedTopic",
      Subject: "From cdPostRating",
      Message: JSON.stringify(rating)
      }, callback);
}

exports.handler = function(event, context) {
    console.log({function:"handler", data:event});
    const tableName = "Ratings";
    const ratingId = context.awsRequestId;
    const errors = validateEvent(event);
    const rating = {
            "movieId": {"S": event.movieId },
            "movieTitle": {"S":event. movieTitle },
            "userEmail": {"S": event.userEmail},
            "rating": {"N": event.rating},
            "ratingId": {"S": ratingId},
        };
        
    if(errors.length > 0){
        console.log({validationError: errors});
        context.done(JSON.stringify({validationError: errors}));
    }
    dynamodb.putItem({
        "TableName": tableName,
        "Item" : rating
    },
    function(err, data) {
        if (err) {
            context.done('error','putting item into dynamodb failed: '+ err);
        }
        else {
            console.log({message: 'Data written.',rating });
            sendRatingToTopic(rating, function(err, data){
                if (err) {
                console.log({message: 'Post to topic failed',rating, err });
                context.fail(JSON.stringify({message: 'Post to topic failed',rating, err}));
        }
            })
            context.done(null,{ratingId});
        }
    });
};
