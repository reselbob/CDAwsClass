var AWS = require('aws-sdk');
var dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'})

exports.handler = (event, context) => {
    dynamodb.scan({
        TableName : 'Ratings',
        Limit : 50
    }, function(err, data) {
        if (err) { 
            console.log(err);
            context.done(err); 
        }
        context.done(null, data.Items)
    });
};
