exports.handler = (event, context, callback) => {
    const obj = {};
    obj.firstName = event.params.querystring.firstName.toUpperCase();
    obj.lastName = event.params.querystring.lastName.toUpperCase();
    obj.status = event.params.querystring.status.toUpperCase();
    console.log({data: obj});
    callback(null, {data: obj});
};
