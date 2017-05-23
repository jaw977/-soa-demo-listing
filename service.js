const service = require('./listing.js');

service.clients();

if (process.argv[2] == '--listen') service.listen();

module.exports = service;
