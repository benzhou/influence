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
                accountBusiness = {
                    findAdminAccountByUsername: function(){}
                },
                authDataHandler = {
                    createAdminAuthToken : function () {}
                },
                findAdminAccountByUsernameStub = sinon.stub(accountBusiness, "findAdminAccountByUsername"),
                createAdminLoginTokenStub = sinon.stub(authDataHandler, "createAdminAuthToken");

            findAdminAccountByUsernameStub.returns(true);
            createAdminLoginTokenStub.returns({
                token : 'test'
            });

            var authBusiness = require('../business/authBusiness')(helpers, util, console, appConfig.app, accountBusiness, authDataHandler);
            var promise = authBusiness.adminAccountLogin('fakeAppKey', 'fakeUsername');

            return promise.should.eventually.be.rejected;
        }),

        it('Admin login do not pass required parameters, should be rejected', function(){
            var
                accountBusiness = {
                    findAdminAccountByUsername: function(){}
                },
                authDataHandler = {
                    createAdminAuthToken : function () {}
                },
                authBusiness = require('../business/authBusiness')(helpers, util, console, appConfig.app, accountBusiness, authDataHandler),
                promise = authBusiness.adminAccountLogin();

            return promise.should.eventually.be.rejected;
        }),

        it('Admin login pass case: ', function(done){
            var
                accountBusiness = {
                    findAdminAccountByUsername: function(){}
                },
                authDataHandler = {
                    createAdminAuthToken : function () {}
                },
                findAdminAccountByUsernameStub = sinon.stub(accountBusiness, "findAdminAccountByUsername"),
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

            findAdminAccountByUsernameStub.returns(df1.promise);
            createAdminAuthTokenStub.returns(df2.promise);

            var authBusiness = require('../business/authBusiness')( helpers, util, console, appConfig.app, accountBusiness, authDataHandler);
            var promise = authBusiness.adminAccountLogin(appKey, username, password);

            Q.all([
                promise.should.eventually.have.property('token')
            ]).should.notify(done);

        });
    });
})