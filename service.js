const service = require('./listing.js');

service.clients('cmd');

if (process.argv[2] == '--listen') service.listen();

module.exports = service;
