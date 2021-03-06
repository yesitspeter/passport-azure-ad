/**
 * Copyright (c) Microsoft Corporation
 *  All Rights Reserved
 *  MIT License
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this
 * software and associated documentation files (the "Software"), to deal in the Software
 * without restriction, including without limitation the rights to use, copy, modify,
 * merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS
 * OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT
 * OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/* eslint-disable no-new */

'use strict';

const WsfedStrategy = require('../lib/index').WsfedStrategy;
const Wsfed = require('../lib/wsfederation');

/*
 ======== A Handy Little Nodeunit Reference ========
 https://github.com/caolan/nodeunit

 Test methods:
 test.expect(numAssertions)
 test.done()
 Test assertions:
 test.ok(value, [message])
 test.equal(actual, expected, [message])
 test.notEqual(actual, expected, [message])
 test.deepEqual(actual, expected, [message])
 test.notDeepEqual(actual, expected, [message])
 test.strictEqual(actual, expected, [message])
 test.notStrictEqual(actual, expected, [message])
 test.throws(block, [error], [message])
 test.doesNotThrow(block, [error], [message])
 test.ifError(value)
 */

function noop() {}

exports.wsfed = {

  'no args': (test) => {
    test.expect(1);

    test.throws(
      () => {
        new WsfedStrategy();
      },
      Error,
      'Should fail with no arguments)'
    );

    test.done();
  },
  'no verify function': (test) => {
    test.expect(1);

    test.throws(
      () => {
        new WsfedStrategy({}, null);
      },
      Error,
      'Should fail with no verify function (2nd argument)'
    );

    test.done();
  },

  'no options': (test) => {
    test.expect(1);

    test.throws(
      () => {
        new WsfedStrategy({}, noop);
      },
      Error,
      'Should fail with no WSFED config options'
    );

    test.done();
  },
  'with options': (test) => {
    test.expect(1);

    const config = {
      realm: 'http://localhost:3000',
      identityProviderUrl: 'https://login.windows.net/common/wsfed',
      logoutUrl: 'http://localhost:3000/',
      identityMetadata: 'https://login.windows.net/GraphDir1.OnMicrosoft.com/federationmetadata/2007-06/federationmetadata.xml',
      cert: 'xxxxxx',
    };

    test.doesNotThrow(
      () => {
        new WsfedStrategy(config, noop);
      },
      Error,
      'Should not fail with correct WSFED config options'
    );

    test.done();
  },
  'with missing option realm': (test) => {
    test.expect(1);

    const config = {
      identityProviderUrl: 'https://login.windows.net/xxxxxxx/wsfed', // replace the end of this URL with the WS-Fed endpoint from the Azure Portal
      logoutUrl: 'http://localhost:3000/',
      identityMetadata: 'https://login.windows.net/GraphDir1.OnMicrosoft.com/federationmetadata/2007-06/federationmetadata.xml', // replace with the Federation Metadata URL from the Azure Portal
      cert: 'xxxxxx',
    };

    test.throws(
      () => {
        new WsfedStrategy(config, noop);
      },
      Error,
      'Should fail with missing realm config options'
    );

    test.done();
  },
  'with missing option logoutUrl': (test) => {
    test.expect(1);

    const config = {
      realm: 'http://localhost:3000',
      identityProviderUrl: 'https://login.windows.net/xxxxxxx/wsfed', // replace the end of this URL with the WS-Fed endpoint from the Azure Portal
      identityMetadata: 'https://login.windows.net/GraphDir1.OnMicrosoft.com/federationmetadata/2007-06/federationmetadata.xml', // replace with the Federation Metadata URL from the Azure Portal
      cert: 'xxxxxx',
    };

    test.throws(
      () => {
        new WsfedStrategy(config, noop);
      },
      Error,
      'Should fail with missing realm config options'
    );

    test.done();
  },
  'with valid missing option identityMetadata': (test) => {
    test.expect(1);

    const config = {
      realm: 'http://localhost:3000', // replace with your APP URI from registration
      logoutUrl: 'http://localhost:3000/',
      identityProviderUrl: 'https://login.windows.net/xxxxxxx/wsfed ', // replace the end of this URL with the WS-Fed endpoint from the Azure Portal
      cert: 'xxxxxx',
    };

    test.doesNotThrow(
      () => {
        new WsfedStrategy(config, noop);
      },
      Error,
      'Should not fail with missing identityMetadata config option (other options are valid)'
    );

    test.done();
  },
  'with missing options identityMetadata and cert': (test) => {
    test.expect(1);

    const config = {
      realm: 'http://localhost:3000', // replace with your APP URI from registration
      logoutUrl: 'http://localhost:3000/',
      identityProviderUrl: 'https://login.windows.net/xxxxxxx/wsfed', // replace the end of this URL with the WS-Fed endpoint from the Azure Portal
    };

    test.throws(
      () => {
        new WsfedStrategy(config, noop);
      },
      Error,
      'Should fail with missing identityMetadata and cert options'
    );

    test.done();
  },
  'Validate extractToken using request body': (test) => {
    test.expect(1);
    const fakeReq = {
      body: {
        wresult: '<t:RequestSecurityTokenResponse xmlns:t="http://schemas.xmlsoap.org/ws/2005/02/trust"><t:RequestedSecurityToken><Assertion ID="12234" IssueInstant="2014-08-26T20:35:09.656Z" Version="2.0" xmlns="urn:oasis:names:tc:SAML:2.0:assertion"></Assertion></t:RequestedSecurityToken></t:RequestSecurityTokenResponse>',
      },
    };
    const expected = '<Assertion ID="12234" IssueInstant="2014-08-26T20:35:09.656Z" Version="2.0" xmlns="urn:oasis:names:tc:SAML:2.0:assertion"/>';
    const WSFED = new Wsfed({});

    const actual = WSFED.extractToken(fakeReq);
    test.equal(actual, expected, 'Extracted body from body wresult should equal the expected value');

    test.done();
  },
  'Validate extractToken using request params': (test) => {
    test.expect(1);
    const fakeReq = {
      params: {
        wresult: '<t:RequestSecurityTokenResponse xmlns:t="http://schemas.xmlsoap.org/ws/2005/02/trust"><t:RequestedSecurityToken><Assertion ID="12234" IssueInstant="2014-08-26T20:35:09.656Z" Version="2.0" xmlns="urn:oasis:names:tc:SAML:2.0:assertion"></Assertion></t:RequestedSecurityToken></t:RequestSecurityTokenResponse>',
      },
    };
    const expected = '<Assertion ID="12234" IssueInstant="2014-08-26T20:35:09.656Z" Version="2.0" xmlns="urn:oasis:names:tc:SAML:2.0:assertion"/>';
    const WSFED = new Wsfed({});

    const actual = WSFED.extractToken(fakeReq);
    test.equal(actual, expected, 'Extracted body from body wresult should equal the expected value');

    test.done();
  },
};
