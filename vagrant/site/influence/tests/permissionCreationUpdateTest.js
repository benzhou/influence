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
    errorCodes            = require('../error/errorCodes');

describe('AuthBusiness', function(){
    describe('Method: createOrUpdateAdminPermissions', function(){
        it("Test Extend", function(){
            var orgiArray = ["1","2"],
                newArray = ["2", "3"];

            var result = helpers.dedupArray(orgiArray.concat(newArray));

            expect(result).to.have.length(3);
        });

        it('Missing required parameter: no params passed in, should be REJECTED', function(){
            var
                accountBusiness = {};

            var authBusiness = require('../business/authBusiness')(helpers, util, console, appConfig.app, accountBusiness, {});
            var promise = authBusiness.createOrUpdateAdminPermissions();

            return promise.should.eventually.be.rejected.and.eql(new InfluenceError(errorCodes.C_400_023_001.code));
        });
        it('Missing required parameter: one param passed in, should be REJECTED', function(){
            var
                accountBusiness = {};

            var authBusiness = require('../business/authBusiness')(helpers, util, console, appConfig.app, accountBusiness, {});
            var promise = authBusiness.createOrUpdateAdminPermissions('fakeId');

            return promise.should.eventually.be.rejected.and.eql(new InfluenceError(errorCodes.C_400_023_001.code));
        });
        it('Missing required parameter: two params passed in, should be REJECTED', function(){
            var
                accountBusiness = {};

            var authBusiness = require('../business/authBusiness')(helpers, util, console, appConfig.app, accountBusiness, {});
            var promise = authBusiness.createOrUpdateAdminPermissions('fakeAdminId', {});

            return promise.should.eventually.be.rejected.and.eql(new InfluenceError(errorCodes.C_400_023_001.code));
        });

        it('Invalid Admin ID, should be REJECTED with Error: C_400_023_004', function(){
            var
                accountBusiness = {
                    getAdminAccountById: function(){}
                },
                authDataHandler = {

                },
                getAdminAccountByIdStub = sinon.stub(accountBusiness, "getAdminAccountById"),
                df = Q.defer();

            df.resolve(null);
            getAdminAccountByIdStub.withArgs('fakeAdminId').returns(df.promise);

            var authBusiness = require('../business/authBusiness')(helpers, util, console, appConfig.app, accountBusiness, authDataHandler);
            var promise = authBusiness.createOrUpdateAdminPermissions('fakeAdminId', {},'fakeCreator');

            return promise.should.eventually.be.rejected.and.eql(new InfluenceError(errorCodes.C_400_023_004.code));
        });

        describe('Create New Permissions for admin', function(){
            var
                assertWithError = function(promise, createAdminPermissionsSpy, satisfyFuc, errorCode){
                    return promise.should.eventually.be.rejected.and.eql(new InfluenceError(errorCode));
                },
                assertFulfilled = function(promise, createAdminPermissionsSpy, satisfyFuc, errorCode){
                    return Q.when(promise).then(function(){
                        var processedPerms = createAdminPermissionsSpy.getCall(0).args[0];
                        processedPerms.should.have.deep.that.is.satisfy(satisfyFuc);
                    });
                },
                setupFuc = function(perms, admin, currentAdmin, satisfyFuc, assertFuc, errorCode){
                    var
                        accountBusiness = {
                            getAdminAccountById: function(){}
                        },
                        authDataHandler = {
                            createAdminPermissions : function(){},
                            findAdminAuthorizationsByAdminId : function(){}
                        },
                        getAdminAccountByIdStub = sinon.stub(accountBusiness, "getAdminAccountById"),
                        createAdminPermissionsSpy = sinon.spy(authDataHandler, "createAdminPermissions"),
                        findAdminAuthorizationsByAdminIdSub = sinon.stub(authDataHandler, "findAdminAuthorizationsByAdminId"),

                        df = Q.defer(),
                        df2 = Q.defer();

                    df.resolve(admin);
                    df2.resolve(null);
                    getAdminAccountByIdStub.withArgs(admin._id).returns(df.promise);
                    findAdminAuthorizationsByAdminIdSub.returns(df2.promise);

                    var authBusiness = require('../business/authBusiness')(helpers, util, console, appConfig.app, accountBusiness, authDataHandler),
                        promise = authBusiness.createOrUpdateAdminPermissions(admin._id, perms, currentAdmin.id);

                    return assertFuc(promise, createAdminPermissionsSpy, satisfyFuc, errorCode);
                },
                currentAdmin = {
                    id: "currentAdminId"
                },
                admin = {
                    _id : "123456"
                };

            it('Create New permission, Only saves action at the app level', function(){
                return setupFuc(
                    {
                        actions : ["Action_1","Action_2"]
                    },
                    admin,
                    currentAdmin,
                    function(obj){
                        //Todo, Add check for admin created on date time should be within the range of few million secs.
                        return obj.adminId === admin._id &&
                            obj.createdBy === currentAdmin.id &&
                            obj.updatedBy === currentAdmin.id &&
                            obj.createdOn.getTime() === obj.updatedOn.getTime() &&
                            obj.actions.length === 2 &&
                            obj.roles.length === 0 &&
                            obj.tenants.length === 0;

                    },
                    assertFulfilled
                );
            });
            it('Create New permission, Missing tenantId on tenants[i] object, should be REJECTED with Error: C_400_023_005', function(){
                return setupFuc(
                    {
                        tenants : [
                            {
                                actions : ["Action1", "Action2"]
                            }
                        ]
                    },
                    admin,
                    currentAdmin,
                    null,
                    assertWithError,
                    errorCodes.C_400_023_005.code
                );
            });
            it('Create New permission, Two Tenants permission but only one is valid, should be Fulfilled and only save one of them', function(){
                return setupFuc(
                    {
                        tenants : [
                            {
                                actions : ["Action1", "Action2"]
                            },
                            {
                                tenantId : "fakeId",
                                actions : ["Action3", "Action4"]
                            }
                        ]
                    },
                    admin,
                    currentAdmin,
                    function(permTobeSaved){
                        return permTobeSaved.adminId === admin._id &&
                            permTobeSaved.createdBy === currentAdmin.id &&
                            permTobeSaved.updatedBy === currentAdmin.id &&
                            permTobeSaved.createdOn.getTime() === permTobeSaved.updatedOn.getTime() &&
                            permTobeSaved.actions.length === 0 &&
                            permTobeSaved.roles.length === 0 &&
                            permTobeSaved.tenants.length === 1 &&
                            permTobeSaved.tenants[0].roles.length === 0 &&
                            permTobeSaved.tenants[0].affiliates.length === 0 &&
                            permTobeSaved.tenants[0].actions.length === 2 &&
                            permTobeSaved.tenants[0].actions.indexOf("Action3") > -1;

                    },
                    assertFulfilled
                );
            });
            it('Create New permission, tenants is some garbage data, should be REJECTED with Error: C_400_023_003', function(){
                return setupFuc(
                    {
                        tenants : {}
                    },
                    admin,
                    currentAdmin,
                    null,
                    assertWithError,
                    errorCodes.C_400_023_003.code
                );
            });
            it('Create New permission, affiliates is some garbage data, should be REJECTED with Error: C_400_023_002', function(){
                return setupFuc(
                    {
                        tenants : [
                            {
                                tenantId : "fakeId",
                                affiliates : {}
                            }
                        ]
                    },
                    admin,
                    currentAdmin,
                    null,
                    assertWithError,
                    errorCodes.C_400_023_002.code
                );
            });
            it('Create New permission, affiliates has no valid permissions, should be REJECTED with Error: C_400_023_005', function(){
                return setupFuc(
                    {
                        tenants : [
                            {
                                tenantId : "fakeId",
                                affiliates : [
                                    {
                                        affiliateId : "fakeId"
                                    }
                                ]
                            }
                        ]
                    },
                    admin,
                    currentAdmin,
                    null,
                    assertWithError,
                    errorCodes.C_400_023_005.code
                );
            });
            it('Create New permission, Only saves action at the app level', function(){
                return setupFuc(
                    {
                        actions : ["Action_1","Action_2"],
                        roles : ["Role_1", "Role_2"],
                        tenants : [
                            {
                                tenantId : "fakeTenantId",
                                actions : ["Action_3","Action_4","Action_4"],
                                roles : ["Role_3", "Role_4","Role_4","Role_5", "Role_6"],
                                affiliates : [
                                    {
                                        affiliateId : "fakeAffId1",
                                        actions : ["Action_5","Action_6","Action_6"],
                                        roles : ["Role_5", "Role_5", "Role_6","Role_7"]
                                    },
                                    {
                                        affiliateId : "fakeAffId2",
                                        actions : ["Action_6","Action_7","Action_8"],
                                        roles : ["Role_7", "Role_8"]
                                    }
                                ]
                            },
                            {
                                tenantId : "fakeTenantId_2",
                                actions : ["Action_2_3","Action_2_4"],
                                roles : ["Role_2_3", "Role_2_4"],
                                affiliates : [
                                    {
                                        affiliateId : "fakeAffId1",
                                        actions : ["Action_2_5","Action_2_6"],
                                        roles : ["Role_2_5", "Role_2_6"]
                                    },
                                    {
                                        affiliateId : "fakeAffId2",
                                        actions : ["Action_2_7","Action_2_8","Action_2_8"],
                                        roles : ["Role_2_7", "Role_2_8"]
                                    }
                                ]
                            }
                        ]
                    },
                    admin,
                    currentAdmin,
                    function(permTobeSaved){
                        //Todo, Add check for admin created on date time should be within the range of few million secs.
                        return permTobeSaved.adminId === admin._id &&
                            permTobeSaved.createdBy === currentAdmin.id &&
                            permTobeSaved.updatedBy === currentAdmin.id &&
                            permTobeSaved.createdOn.getTime() === permTobeSaved.updatedOn.getTime() &&
                            permTobeSaved.actions.length === 2 &&
                            permTobeSaved.roles.length === 2 &&
                            permTobeSaved.tenants.length === 2 &&
                            permTobeSaved.tenants[0].actions.length === 2 &&
                            helpers.containsArray(permTobeSaved.tenants[0].actions, ["Action_3","Action_4"]) &&
                            permTobeSaved.tenants[0].roles.length === 4 &&
                            helpers.containsArray(permTobeSaved.tenants[0].roles, ["Role_3", "Role_4","Role_5", "Role_6"]) &&
                            permTobeSaved.tenants[0].affiliates.length === 2 &&
                            permTobeSaved.tenants[0].affiliates[0].affiliateId === "fakeAffId1" &&
                            permTobeSaved.tenants[0].affiliates[0].actions.length === 2 &&
                            helpers.containsArray(permTobeSaved.tenants[0].affiliates[0].actions, ["Action_5","Action_6"]) &&
                            permTobeSaved.tenants[0].affiliates[0].roles.length === 3 &&
                            helpers.containsArray(permTobeSaved.tenants[0].affiliates[0].roles, ["Role_5", "Role_6","Role_7"]) &&
                            permTobeSaved.tenants[0].affiliates[1].affiliateId === "fakeAffId2";

                    },
                    assertFulfilled
                );
            });
        });
    });
});