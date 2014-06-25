var assert = require("assert");
var InfluenceError = require('../error/influenceError');
var sinon = require("sinon");
var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);

var
    expect = chai.expect,
    should = chai.should(),

    Q = require("q"),
    util = require("util"),
    helpers = require('../lib/helpers'),
    console = require("./testLogger"),
    appConfig           = require('../config'),
    errCodes            = require('../error/errorCodes');

describe('AuthBusiness', function(){
    describe('#adminAccountLogin()', function(done){
        it('Admin login pass no password, should be rejected', function(){
            var
                accountDataHandler = {
                    findAdminAccountByTenantAndUsername: function(){},
                    createAdminLoginToken : function () {}
                },
                findAdminAccountByTenantAndUsernameStub = sinon.stub(accountDataHandler, "findAdminAccountByTenantAndUsername"),
                createAdminLoginTokenStub = sinon.stub(accountDataHandler, "createAdminLoginToken");

            findAdminAccountByTenantAndUsernameStub.withArgs(1, 'fakeUsername').returns(true);
            createAdminLoginTokenStub.returns({
                token : 'test'
            });

            var authBusiness = require('../business/authBusiness')(Q, helpers, util, console, appConfig.app, errCodes, accountDataHandler);
            var promise = authBusiness.adminAccountLogin('fakeAppKey', 1, 'fakeUsername');

            return promise.should.eventually.be.rejected;
        }),

        it('Admin login do not pass required parameters, should be rejected', function(){
            var
                accountDataHandler = {
                    findAdminAccountByTenantAndUsername: function(){},
                    createAdminLoginToken : function () {}
                };

            var authBusiness = require('../business/authBusiness')(Q, helpers, util, console, appConfig.app, errCodes, accountDataHandler);
            var promise = authBusiness.adminAccountLogin();

            return promise.should.eventually.be.rejected;
        }),

        it('Admin login pass case: ', function(done){
            var
                accountDataHandler = {
                    findAdminAccountByTenantAndUsername: function(){}
                },
                authDataHandler = {
                    createAdminAuthToken : function () {}
                },
                findAdminAccountByTenantAndUsernameStub = sinon.stub(accountDataHandler, "findAdminAccountByTenantAndUsername"),
                createAdminAuthTokenStub = sinon.stub(authDataHandler, "createAdminAuthToken"),
                df1 = Q.defer(),
                df2 = Q.defer(),
                appKey = "fakeAppKey",
                tenantId = 1,
                username = "ben",
                password = "1234",
                salt = "1234",
                hash = helpers.sha256Hash(password + '.' + salt);

            df1.resolve({
                _id:"12345",
                "username" : "ben",
                "passwordHash" : hash,
                "passwordSalt" : salt
            });

            df2.resolve({
                token : 'test'
            });

            findAdminAccountByTenantAndUsernameStub.returns(df1.promise);
            createAdminAuthTokenStub.returns(df2.promise);

            var authBusiness = require('../business/authBusiness')(Q, helpers, util, console, appConfig.app, errCodes, accountDataHandler, authDataHandler);
            var promise = authBusiness.adminAccountLogin(appKey, tenantId, username, password);

            Q.all([
                promise.should.eventually.have.property('token')
            ]).should.notify(done);

        });
    });
})