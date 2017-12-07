var AWS = require('aws-sdk');
var dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

exports.handler = (event, context) => {
    if(!event.movieId){
        context.done(new Error('No movieId provided. movieId is required.'));
    }
    
    const keyConditionalExp = "#movieId = :movieId";
    const attrNames = {'#movieId': 'movieId' };
    const attrVals = {':movieId': { S: event.movieId }};
    const filters = [];

    if(event.rating){
        attrNames['#rating'] = "rating";
        attrVals[':rating'] = { N: event.rating };
        filters.push('#rating = :rating');
    }
    
    if(event.userEmail){
        attrNames['#userEmail'] = "userEmail";
        attrVals[':userEmail'] = { S: event.userEmail };
        filters.push('#userEmail = :userEmail');
    }
    
    
    let filterExp;
    for(let i = 0; i < filters.length; i++){
        if(i === 0){
          filterExp = filters[i];  
        }else{
            filterExp += ' AND ' + filters[i]
        }
    }
    console.log(filterExp);
    
    if(Object.keys(event).length === 0){
        attrNames = null;
        attrVals = null;
        filterExp = null;
    }
    
    dynamodb.query({
    KeyConditionExpression: keyConditionalExp,
    IndexName :'movieId-index',
    FilterExpression: filterExp,
    ExpressionAttributeNames: attrNames,
    ExpressionAttributeValues: attrVals, 
    TableName : 'Ratings',
    Limit : 50
    }, function(err, data) {
        if (err) { 
            console.log(err);
            context.done(err); 
        }
        context.done(null, data.Items);
    });

};
