exports.handler = (event, context, callback) => {
    // TODO implement
    const dt = new Date();
    let msg = `Hello from AwsClassFunction() at ${dt.toString()}`;
    msg += ` From ${event.firstName} ${event.lastName} ... ${event.status}`;
    const obj = {};
    obj.firstName = event.params.querystring.firstName.toUpperCase();
    obj.lastName = event.params.querystring.lastName.toUpperCase();
    obj.status = event.params.querystring.status.toUpperCase();
    console.log({data: obj});
    callback(null, {data: obj});
};
