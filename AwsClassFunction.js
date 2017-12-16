exports.handler = function(event, context) {
    // TODO implement
        const obj = {};
    obj.firstName = event.firstName.toUpperCase();
    obj.lastName = event.lastName.toUpperCase();
    obj.status = event.status.toUpperCase();
    console.log({data: obj});
    context.done(null, 'Hello from Lambda');
};
