var chai = require('chai');
var chaiHttp = require('chai-http');
var expect = require("chai").expect;
var server = require('../server/server');

chai.use(chaiHttp);

describe('TestSuite', function () {
    it('should return web app', function () {
        chai.request(server)
            .get('/')
            .end(function (err, res) {
                res.should.have.status(200);
                done();
            });
    });

    it('should return a list of services', function () {
        chai.request(server)
            .get('/getServices')
            .end(function (err, res) {
                res.should.have.status(200);
                res.should.be.json;
                done();
            });
    });

    it('should return a list of bus stops', function () {
        chai.request(server)
            .get('/getServices')
            .end(function (err, res) {
                res.should.have.status(200);
                res.should.be.json;
                done();
            });
    });
    it('should return a list of active buses', function () {
        chai.request(server)
            .get('/getServices')
            .end(function (err, res) {
                res.should.have.status(200);
                res.should.be.json;
                done();
            });
    });
    it('should return a list of route plotting details', function () {
        chai.request(server)
            .get('/getServices')
            .end(function (err, res) {
                res.should.have.status(200);
                res.should.be.json;
                done();
            });
    });

});