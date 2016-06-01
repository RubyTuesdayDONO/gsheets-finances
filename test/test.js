// https://www.codementor.io/nodejs/tutorial/unit-testing-nodejs-tdd-mocha-sinon

// tests/part1/cart-summary-test.js
var chai = require('chai');
var expect = chai.expect; // we are using the "expect" style of Chai

var accumifs=require.main.require('impl/accumifs.js');

describe('legacyTest', function() {
    it('legacyTest', function() {
	var accum_range=[[1], [2], [3]];
	var accumulator='sum';
	var cond_range=[['include'], ['exclude'], ['include â¦ joost keeding!']];
	var cond='/clude$/';
	var expected=3;
	var retval;
	expect(accumifs.ACCUMIFS(accum_range, accumulator, cond_range, cond)).to.equal(expected);
    });
});
