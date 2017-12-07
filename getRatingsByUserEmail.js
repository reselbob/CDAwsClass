var AWS = require('aws-sdk');
var dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

exports.handler = (event, context) => {
    if(!event.userEmail){
        context.done(new Error('No userEmail provided. userEmail is required.'));
    }
    
    const keyConditionalExp = "#userEmail = :userEmail";
    
    const attrNames = {'#userEmail': 'userEmail' };
    const attrVals = {':userEmail': { S: event.userEmail }};
    const filters = [];

    if(event.rating){
        attrNames['#rating'] = "rating";
        attrVals[':rating'] = { N: event.rating };
        filters.push('#rating = :rating');
    }
    
    if(event.movieId){
        attrNames['#movieId'] = "movieId";
        attrVals[':movieId'] = { S: event.movieId };
        filters.push('#movieId = :movieId');
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
    IndexName :'userEmail-index',
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
