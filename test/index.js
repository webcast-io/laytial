
var request = require('supertest');
var app     = require('./app');

describe('Laytial', function() {

	it('should just render the body if locals.layout === false', function(done) {
		request(app)
		.get('/no-layout')
		.expect('Hello Ben', done);
	});

	it('should render default layout location with body', function(done) {	
		request(app)
		.get('/with-layout')
		.expect('Layout. Hello Ben', done);
	})

	it('should render specific layout location with body', function(done) {	
		request(app)
		.get('/specific-layout')
		.expect('Specific Layout. Hello Ben', done);
	})

});

