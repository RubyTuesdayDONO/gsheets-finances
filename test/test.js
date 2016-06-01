// https://www.codementor.io/nodejs/tutorial/unit-testing-nodejs-tdd-mocha-sinon

// tests/part1/cart-summary-test.js
var chai = require('chai');
var expect = chai.expect; // we are using the "expect" style of Chai

//var basicTest = require.main.require('impl/test.js');

//var CartSummary = require('./../../src/part1/cart-summary');

describe('alwaysSucceeds', function() {
    it('alwaysSucceeds() should always suceed', function() {
	expect(true).to.equal(true);
    });
});
