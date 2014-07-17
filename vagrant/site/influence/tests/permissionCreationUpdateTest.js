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

        it("Test deepEqual", function(){
            var obj1 = {
                    prop1 : "abc",
                    prop2 : ["test1","test2","test3","test4"],
                    prop3 : {
                        p1 : "xyc",
                        p2 : null,
                        p3 : 123,
                        p4 : [1,2,3,4]
                    }
                },
                obj2 = {
                    prop1 : "abc",
                    prop2 : ["test1","test2","test3","test4"],
                    prop3 : {
                        p1 : "xyc",
                        p2 : null,
                        p3 : 123,
                        p4 : [1,2,3,4]
                    }
                },
                obj3 = {
                    prop1 : "abc",
                    prop2 : ["test1","test2","test3"],
                    prop3 : {
                        p1 : "xyc",
                        p2 : null,
                        p3 : 123,
                        p4 : [1,2,3,4]
                    }
                },
                obj4 = {
                    actions : ["test1","test2","test3","test4"],
                    roles : ["test1","test2","test3","test4"],
                    tenants : [
                        {
                            tenantId : "xyz",
                            actions : ["test1","test2"],
                            roles : ["test1"],
                            affiliates : [
                                {
                                    affiliateId : "xxx",
                                    actions : ["test1"],
                                    roles : ["test1","test2"]
                                }
                            ]
                        }
                    ]
                },
                obj5 = helpers.clone(obj4),
                obj6 = {
                    prop1 : "abc",
                    prop2 : ["test1","test2","test3","test4"],
                    prop3 : {
                        p1 : "xyc",
                        p2 : false,
                        p3 : 123,
                        p4 : [1,2,3,4]
                    }
                },
                obj7 = {
                    prop1 : "abc",
                    prop2 : ["test1","test2","test3","test5"],
                    prop3 : {
                        p1 : "xyc",
                        p2 : false,
                        p3 : 123,
                        p4 : [1,2,3,4]
                    }
                },
                obj8 = {
                    prop1 : "abc",
                    prop2 : ["test1","test2","test3","test5"],
                    prop3 : {
                        p1 : "xyc",
                        p2 : false,
                        p3 : 123,
                        p4 : [1,2,3,4],
                        p5 : {

                        }
                    }
                };

            var result = helpers.deepEqual(obj1, obj2),
                result2 = helpers.deepEqual(obj1, obj3),
                result3 = helpers.deepEqual(obj4, obj5),
                result4 = helpers.deepEqual(obj1, obj6),
                result5 = helpers.deepEqual(obj7, obj6),
                result6 = helpers.deepEqual(obj7, obj8),
                r1 = helpers.deepEqualFast(obj1, obj2),
                r2 = helpers.deepEqualFast(obj1, obj3),
                r3 = helpers.deepEqualFast(obj4, obj5),
                r4 = helpers.deepEqualFast(obj1, obj6),
                r5 = helpers.deepEqualFast(obj7, obj6),
                r6 = helpers.deepEqualFast(obj7, obj8);

            expect(result).to.be.true;
            result2.should.not.be.true;
            expect(result3).to.be.true;
            result4.should.not.be.true;
            result5.should.not.be.true;
            result6.should.not.be.true;

            expect(r1).to.be.true;
            r2.should.not.be.true;
            expect(r3).to.be.true;
            r4.should.not.be.true;
            r6.should.not.be.true;
            r6.should.not.be.true;
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

        describe("Editing Existing Permissions", function(){
            var
                assertWithError = function(promise, updateAdminPermissionsSpy, satisfyFuc, errorCode){
                    return promise.should.eventually.be.rejected.and.eql(new InfluenceError(errorCode));
                },
                assertFulfilled = function(promise, updateAdminPermissionsSpy, satisfyFuc, errorCode){
                    return Q.when(promise).then(function(){
                        var args = updateAdminPermissionsSpy.getCall(0).args;
                        args.should.have.deep.that.is.satisfy(satisfyFuc);
                    });
                },
                setupFuc = function(perms, existingPerms, admin, currentAdmin, satisfyFuc, assertFuc, errorCode){
                    var
                        accountBusiness = {
                            getAdminAccountById: function(){}
                        },
                        authDataHandler = {
                            updateAdminPermissions : function(){},
                            findAdminAuthorizationsByAdminId : function(){}
                        },
                        getAdminAccountByIdStub = sinon.stub(accountBusiness, "getAdminAccountById"),
                        updateAdminPermissionsSpy = sinon.spy(authDataHandler, "updateAdminPermissions"),
                        findAdminAuthorizationsByAdminIdSub = sinon.stub(authDataHandler, "findAdminAuthorizationsByAdminId"),

                        df = Q.defer(),
                        df2 = Q.defer();

                    df.resolve(admin);
                    df2.resolve(existingPerms);
                    getAdminAccountByIdStub.withArgs(admin._id).returns(df.promise);
                    findAdminAuthorizationsByAdminIdSub.returns(df2.promise);

                    var authBusiness = require('../business/authBusiness')(helpers, util, console, appConfig.app, accountBusiness, authDataHandler),
                        promise = authBusiness.createOrUpdateAdminPermissions(admin._id, perms, currentAdmin.id);

                    return assertFuc(promise, updateAdminPermissionsSpy, satisfyFuc, errorCode);
                },
                currentAdmin = {
                    id: "currentAdminId"
                },
                admin = {
                    _id : "123456"
                };

            it('Edit Existing permission, Simple case only add app level permission and should FULFILLED!', function(){
                return setupFuc(
                    {
                        actions : ["READ_ACTIONS","Action_2"]
                    },
                    {
                        "_id" : "53c58dcf6f530b325c38d33e",
                        "adminId" : "53bc05cd7f7847e21faab5d2",
                        "createdBy" : "53bc05cd7f7847e21faab5d2",
                        "createdOn" : new Date("2014-07-15T20:23:43.982Z"),
                        "updatedBy" : "53bc05cd7f7847e21faab5d2",
                        "updatedOn" : new Date("2014-07-15T20:23:43.982Z"),
                        "actions" : [
                            "READ_ACTIONS"
                        ],
                        "roles" : [ ],
                        "tenants" : [ ]
                    },
                    admin,
                    currentAdmin,
                    function(args){
                        var adminId = args[0],
                            updateObj = args[1];

                        //Todo, Add check for admin created on date time should be within the range of few million secs.
                        return adminId === admin._id &&
                            updateObj.updatedBy === currentAdmin.id &&
                            updateObj.actions.length === 2 &&
                            updateObj.roles.length === 0 &&
                            updateObj.tenants.length === 0;

                    },
                    assertFulfilled
                );
            });
            it('Edit Existing permission, When pass empty array it should remove the actions, when pass not pass anything, it should remain the same', function(){
                return setupFuc(
                    {
                        actions : [],
                        tenants : [
                            {
                                tenantId : "fakeTenantId1",
                                actions : [],
                                affiliates : [
                                    {
                                        affiliateId : "fakeAffilaiteId1",
                                        actions : []
                                    },
                                    {
                                        affiliateId : "fakeAffilaiteId2",
                                        roles : []
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "_id" : "53c58dcf6f530b325c38d33e",
                        "adminId" : "53bc05cd7f7847e21faab5d2",
                        "createdBy" : "53bc05cd7f7847e21faab5d2",
                        "createdOn" : new Date("2014-07-15T20:23:43.982Z"),
                        "updatedBy" : "53bc05cd7f7847e21faab5d2",
                        "updatedOn" : new Date("2014-07-15T20:23:43.982Z"),
                        actions : ["ACTION_1"],
                        roles : ["Role_1"],
                        tenants : [
                            {
                                tenantId : "fakeTenantId1",
                                actions : ["ACTION_2"],
                                roles : ["Role_2"],
                                affiliates : [
                                    {
                                        affiliateId : "fakeAffilaiteId1",
                                        actions : ["ACTION_3"],
                                        roles : ["Role_3"]
                                    },
                                    {
                                        affiliateId : "fakeAffilaiteId2",
                                        actions : ["ACTION_4"],
                                        roles : ["Role_4"]
                                    }
                                ]
                            }
                        ]
                    },
                    admin,
                    currentAdmin,
                    function(args){
                        var adminId = args[0],
                            updateObj = args[1];

                        //Todo, Add check for admin created on date time should be within the range of few million secs.
                        return adminId === admin._id &&
                            updateObj.updatedBy === currentAdmin.id &&
                            updateObj.actions.length === 0 &&
                            updateObj.roles.length === 1 &&
                            updateObj.tenants.length === 1 &&
                            updateObj.tenants[0].actions.length === 0 &&
                            updateObj.tenants[0].roles.length === 1 &&
                            updateObj.tenants[0].affiliates.length === 2 &&
                            updateObj.tenants[0].affiliates[0].actions.length === 0 &&
                            updateObj.tenants[0].affiliates[0].roles.length === 1 &&
                            updateObj.tenants[0].affiliates[1].actions.length === 1 &&
                            updateObj.tenants[0].affiliates[1].roles.length === 0;

                    },
                    assertFulfilled
                );
            });
            it('Edit Existing permission, Existing actions are not array.', function(){
                return setupFuc(
                    {
                        actions : ["READ_ACTIONS","Action_2"]
                    },
                    {
                        "_id" : "53c58dcf6f530b325c38d33e",
                        "adminId" : "53bc05cd7f7847e21faab5d2",
                        "createdBy" : "53bc05cd7f7847e21faab5d2",
                        "createdOn" : new Date("2014-07-15T20:23:43.982Z"),
                        "updatedBy" : "53bc05cd7f7847e21faab5d2",
                        "updatedOn" : new Date("2014-07-15T20:23:43.982Z"),
                        "actions" : "*",
                        "roles" : [ ],
                        "tenants" : [ ]
                    },
                    admin,
                    currentAdmin,
                    function(args){
                        var adminId = args[0],
                            updateObj = args[1];

                        //Todo, Add check for admin created on date time should be within the range of few million secs.
                        return adminId === admin._id &&
                            updateObj.updatedBy === currentAdmin.id &&
                            updateObj.actions.length === 2 &&
                            updateObj.roles.length === 0 &&
                            updateObj.tenants.length === 0;

                    },
                    assertFulfilled
                );
            });
            it('Edit Existing permission, Existing roles/tenants are not array, new permissions don\'t specify roles/tenants, they should remain the same', function(){
                return setupFuc(
                    {
                        actions : ["READ_ACTIONS","Action_2"]
                    },
                    {
                        "_id" : "53c58dcf6f530b325c38d33e",
                        "adminId" : "53bc05cd7f7847e21faab5d2",
                        "createdBy" : "53bc05cd7f7847e21faab5d2",
                        "createdOn" : new Date("2014-07-15T20:23:43.982Z"),
                        "updatedBy" : "53bc05cd7f7847e21faab5d2",
                        "updatedOn" : new Date("2014-07-15T20:23:43.982Z"),
                        "actions" : "*",
                        "roles" : "*",
                        "tenants" : "*"
                    },
                    admin,
                    currentAdmin,
                    function(args){
                        var adminId = args[0],
                            updateObj = args[1];

                        //Todo, Add check for admin created on date time should be within the range of few million secs.
                        return adminId === admin._id &&
                            updateObj.updatedBy === currentAdmin.id &&
                            updateObj.actions.length === 2 &&
                            updateObj.roles  === "*" &&
                            updateObj.tenants === "*";

                    },
                    assertFulfilled
                );
            });
            it('Edit Existing permission, Duplicated actions, should be dedupped.', function(){
                return setupFuc(
                    {
                        actions : ["READ_ACTIONS","READ_ACTIONS","Action_2"]
                    },
                    {
                        "_id" : "53c58dcf6f530b325c38d33e",
                        "adminId" : "53bc05cd7f7847e21faab5d2",
                        "createdBy" : "53bc05cd7f7847e21faab5d2",
                        "createdOn" : new Date("2014-07-15T20:23:43.982Z"),
                        "updatedBy" : "53bc05cd7f7847e21faab5d2",
                        "updatedOn" : new Date("2014-07-15T20:23:43.982Z"),
                        "actions" : [
                            "EDIT_ACTIONS"
                        ],
                        "roles" : [ ],
                        "tenants" : [ ]
                    },
                    admin,
                    currentAdmin,
                    function(args){
                        var adminId = args[0],
                            updateObj = args[1];

                        //Todo, Add check for admin created on date time should be within the range of few million secs.
                        return adminId === admin._id &&
                            updateObj.updatedBy === currentAdmin.id &&
                            updateObj.actions.length === 2 &&
                            updateObj.roles.length === 0 &&
                            updateObj.tenants.length === 0;

                    },
                    assertFulfilled
                );
            });
            it('Edit Existing permission, _id, adminId, createdBy, createdOn props should be removed when update', function(){
                return setupFuc(
                    {
                        actions : ["READ_ACTIONS","READ_ACTIONS","Action_2"]
                    },
                    {
                        "_id" : "53c58dcf6f530b325c38d33e",
                        "adminId" : "53bc05cd7f7847e21faab5d2",
                        "createdBy" : "53bc05cd7f7847e21faab5d2",
                        "createdOn" : new Date("2014-07-15T20:23:43.982Z"),
                        "updatedBy" : "53bc05cd7f7847e21faab5d2",
                        "updatedOn" : new Date("2014-07-15T20:23:43.982Z"),
                        "actions" : [
                            "EDIT_ACTIONS"
                        ],
                        "roles" : [ ],
                        "tenants" : [ ]
                    },
                    admin,
                    currentAdmin,
                    function(args){
                        var adminId = args[0],
                            updateObj = args[1];

                        //Todo, Add check for admin created on date time should be within the range of few million secs.
                        return adminId === admin._id &&
                            updateObj.updatedBy === currentAdmin.id &&
                            updateObj.actions.length === 2 &&
                            updateObj.roles.length === 0 &&
                            updateObj.tenants.length === 0 &&
                            !updateObj._id &&
                            !updateObj.adminId &&
                            !updateObj.createdOn &&
                            !updateObj.createdBy;

                    },
                    assertFulfilled
                );
            });
            it('Edit Existing permission, Multiple tenants can be added', function(){
                return setupFuc(
                    {
                        actions : ["READ_ACTIONS","READ_ACTIONS","Action_2"],
                        tenants : [
                            {
                                tenantId : "fakeTenantId_1",
                                actions : ["ACTION_1", "ACTION_2"]
                            },
                            {
                                tenantId : "fakeTenantId_2",
                                actions : ["ACTION_1", "ACTION_3"]
                            }
                        ]
                    },
                    {
                        "_id" : "53c58dcf6f530b325c38d33e",
                        "adminId" : "53bc05cd7f7847e21faab5d2",
                        "createdBy" : "53bc05cd7f7847e21faab5d2",
                        "createdOn" : new Date("2014-07-15T20:23:43.982Z"),
                        "updatedBy" : "53bc05cd7f7847e21faab5d2",
                        "updatedOn" : new Date("2014-07-15T20:23:43.982Z"),
                        "actions" : [
                            "EDIT_ACTIONS"
                        ],
                        "roles" : [ ],
                        "tenants" : [ ]
                    },
                    admin,
                    currentAdmin,
                    function(args){
                        var adminId = args[0],
                            updateObj = args[1];

                        //Todo, Add check for admin created on date time should be within the range of few million secs.
                        return adminId === admin._id &&
                            updateObj.updatedBy === currentAdmin.id &&
                            updateObj.actions.length === 2 &&
                            updateObj.roles.length === 0 &&
                            updateObj.tenants.length === 2 &&
                            updateObj.tenants[0].tenantId === "fakeTenantId_1" &&
                            updateObj.tenants[1].tenantId === "fakeTenantId_2";
                    },
                    assertFulfilled
                );
            });
            it('Edit Existing permission, duplicated tenants IDs, should rejected with ERROR: C_400_023_008', function(){
                return setupFuc(
                    {
                        actions : ["READ_ACTIONS","READ_ACTIONS","Action_2"],
                        tenants : [
                            {
                                tenantId : "fakeTenantId_1",
                                actions : ["ACTION_1", "ACTION_2"]
                            },
                            {
                                tenantId : "fakeTenantId_1",
                                actions : ["ACTION_1", "ACTION_3"],
                                roles : ["Role_1"]
                            }
                        ]
                    },
                    {
                        "_id" : "53c58dcf6f530b325c38d33e",
                        "adminId" : "53bc05cd7f7847e21faab5d2",
                        "createdBy" : "53bc05cd7f7847e21faab5d2",
                        "createdOn" : new Date("2014-07-15T20:23:43.982Z"),
                        "updatedBy" : "53bc05cd7f7847e21faab5d2",
                        "updatedOn" : new Date("2014-07-15T20:23:43.982Z"),
                        "actions" : [
                            "EDIT_ACTIONS"
                        ],
                        "roles" : [ ],
                        "tenants" : [ ]
                    },
                    admin,
                    currentAdmin,
                    null,
                    assertWithError,
                    errorCodes.C_400_023_008.code
                );
            });
            it('Edit Existing permission, duplicated affiliate IDs, should rejected with ERROR: C_400_023_009', function(){
                return setupFuc(
                    {
                        actions : ["READ_ACTIONS","READ_ACTIONS","Action_2"],
                        tenants : [
                            {
                                tenantId : "fakeTenantId_1",
                                actions : ["ACTION_1", "ACTION_2"],
                                affiliates : [
                                    {
                                        affiliateId : "fakeAffilaiteId_1",
                                        actions : ["ACTION_1", "ACTION_2"]
                                    },
                                    {
                                        affiliateId : "fakeAffilaiteId_1",
                                        actions : ["ACTION_1", "ACTION_3"]
                                    }
                                ]
                            },
                            {
                                tenantId : "fakeTenantId_2",
                                actions : ["ACTION_4", "ACTION_3"],
                                roles : ["Role_1"]
                            }
                        ]
                    },
                    {
                        "_id" : "53c58dcf6f530b325c38d33e",
                        "adminId" : "53bc05cd7f7847e21faab5d2",
                        "createdBy" : "53bc05cd7f7847e21faab5d2",
                        "createdOn" : new Date("2014-07-15T20:23:43.982Z"),
                        "updatedBy" : "53bc05cd7f7847e21faab5d2",
                        "updatedOn" : new Date("2014-07-15T20:23:43.982Z"),
                        "actions" : [
                            "EDIT_ACTIONS"
                        ],
                        "roles" : [ ],
                        tenants : [
                            {
                                tenantId : "fakeTenantId_1",
                                actions : ["ACTION_1", "ACTION_3"]
                            },
                            {
                                tenantId : "fakeTenantId_2",
                                actions : ["ACTION_5"],
                                roles : ["Role_1"]
                            }
                        ]
                    },
                    admin,
                    currentAdmin,
                    null,
                    assertWithError,
                    errorCodes.C_400_023_009.code
                );
            });
            it('Edit Existing permission, Only Edit partial of existing permission', function(){
                return setupFuc(
                    {
                        tenants : [
                            {
                                tenantId : "fakeTenantId_1",
                                affiliates : [
                                    {
                                        affiliateId: "fakeAffID_1",
                                        actions : ["ACTION_1"]
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "_id" : "53c58dcf6f530b325c38d33e",
                        "adminId" : "53bc05cd7f7847e21faab5d2",
                        "createdBy" : "53bc05cd7f7847e21faab5d2",
                        "createdOn" : new Date("2014-07-15T20:23:43.982Z"),
                        "updatedBy" : "53bc05cd7f7847e21faab5d2",
                        "updatedOn" : new Date("2014-07-15T20:23:43.982Z"),
                        "actions" : [
                            "EDIT_ACTIONS"
                        ],
                        "roles" : ["Role_1","Role_2","Role_3"],
                        "tenants" : [
                            {
                                tenantId : "fakeTenantId_1",
                                actions : ["ACTION_3", "ACTION_4"],
                                affiliates : [
                                    {
                                        affiliateId: "fakeAffID_1",
                                        actions : ["ACTION_4", "ACTION_6"],
                                        roles : ["Role_1"]
                                    },
                                    {
                                        affiliateId: "fakeAffID_2",
                                        actions : ["ACTION_4", "ACTION_5"],
                                        roles : ["Role_2"]
                                    }
                                ]
                            },
                            {
                                tenantId : "fakeTenantId_2",
                                actions : ["ACTION_1", "ACTION_3"],
                                roles : ["Role_1"]
                            }
                        ]
                    },
                    admin,
                    currentAdmin,
                    function(args){
                        var adminId = args[0],
                            updateObj = args[1];

                        //Todo, Add check for admin created on date time should be within the range of few million secs.
                        return adminId === admin._id &&
                            updateObj.updatedBy === currentAdmin.id &&
                            updateObj.actions.length === 1 &&
                            updateObj.roles.length === 3 &&
                            updateObj.tenants.length === 2 &&
                            updateObj.tenants[0].tenantId === "fakeTenantId_1" &&
                            updateObj.tenants[0].affiliates.length === 2 &&
                            updateObj.tenants[0].affiliates[0].affiliateId === "fakeAffID_1" &&
                            updateObj.tenants[0].affiliates[0].actions.length === 1 &&
                            updateObj.tenants[0].affiliates[0].actions.indexOf("ACTION_1") > -1 &&
                            updateObj.tenants[0].affiliates[1].affiliateId === "fakeAffID_2" &&
                            updateObj.tenants[0].affiliates[1].actions.length === 2 &&
                            updateObj.tenants[1].tenantId === "fakeTenantId_2" &&
                            !updateObj.tenants[1].affiliates;

                    },
                    assertFulfilled
                );
            });
        });
    });
});