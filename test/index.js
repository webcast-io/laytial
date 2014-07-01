
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

	it('should error if view is missing', function(done) {
		request(app)
		.get('/missing-view')
		.expect(500, done);
	})

	it('should error if layout is missing', function(done) {
		request(app)
		.get('/missing-layout')
		.expect(500, done);
	})

	it('should load partials from body', function(done) {
		request(app)
		.get('/partial')
		.expect('Layout. Partial.', done);
	})

});

