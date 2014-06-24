var assert = require("assert");
var InfluenceError = require('../error/influenceError');
var sinon = require("sinon");
var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);

var
    Q = require("q"),
    util = require("util"),
    helpers = require('../lib/helpers'),
    console = require("./testLogger"),
    appConfig           = require('../config'),
    errCodes            = require('../error/errorCodes');

describe('AuthBusiness', function(){
    describe('#adminAccountLogin()', function(){
        it('Admin login pass no password, should be rejected', function(){

            var accountDataHandler = {},
                findAdminAccountByTenantAndUsernameStub = sinon.stub(accountDataHandler, "findAdminAccountByTenantAndUsername"),
                createAdminLoginTokenStub = sinon.stub(accountDataHandler, "createAdminLoginToken");

            findAdminAccountByTenantAndUsernameStub.withArgs(1, 'fakeUsername').return();

            var authBusiness = require('../business/authBusiness')(Q, helpers, util, console, appConfig, errCodes, accountDataHandler);
            var promise = authBusiness.adminAccountLogin('fakeAppKey', 1, 'fakeUsername');

            return chai.expect(promise).should.be.rejected;
            //promise.catch(function(err){assert.equal(err.code, errCodes.C_400_002_001.code);}).done();
        });
    });
})