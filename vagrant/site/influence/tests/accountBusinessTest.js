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
    errorCodes            = require('../error/errorCodes'),
    constants       = require('../constants/constants'),
    stubMethodWithPromiseReturn = function(ObjectContainMethods, methodName, resolvedObject){
        var df = Q.defer(),
            stubMethod = sinon.stub(ObjectContainMethods, methodName);

        df.resolve(resolvedObject);
        stubMethod.returns(df.promise);
    };

describe('AccountBusiness.js Test', function() {
    describe('Method: updateAdminAccount', function () {
        /*
        *                                               Email/Username same on profile      Email/Username different on profile
        *
        * Email/Username same, Updated                  1                                   2 (Email Already Exists) 3(Username already exists)
        * Email/Username different, Update Email        4                                   5 (Email Already Exists) 6(Username already exists)
        * Email/Username different, Update Username     5                                   6
        *
        *
        * */

        it("Case 1: Update Admin's Email and Username (Email and Username are the same both on profile and in the object used for update), and they already exists by another admin, Should Reject", function () {
            var
                updatedByAdminId = "fakeUpdatedByAdminId",
                newAdminData = {
                    adminId : "fakeAdminId",
                    username : "test@email.com",
                    email:"test@email.com",
                    firstName : "newFirstName",
                    lastName: "newLastName",
                    displayName : "newDisplayName"
                },
                adminFromDB = {
                    _id : "fakeAdminId",
                    username : "test1@email.com",
                    email:"test1@email.com",
                    firstName : "existingFirstName",
                    lastName: "existingLastName",
                    displayName : "existingDisplayName"
                },
                accountDataHandler = {
                    findAdminAccountByEmail : function(){},
                    findAdminAccountByUsername : function(){},
                    updateAdminAccount : function(){},
                    getAdminAccountById : function(){}
                },
                updateAdminAccountSpy = sinon.spy(accountDataHandler, "updateAdminAccount"),
                accountBusiness = require('../business/accountBusiness')(helpers, util, console, accountDataHandler);

            stubMethodWithPromiseReturn(accountDataHandler, "getAdminAccountById", adminFromDB);
            stubMethodWithPromiseReturn(accountDataHandler, "findAdminAccountByEmail", {_id : "anotherAdmin"});
            stubMethodWithPromiseReturn(accountDataHandler, "findAdminAccountByUsername", {_id : "anotherAdmin"});

            var result = accountBusiness.updateAdminAccount(
                newAdminData.adminId,
                newAdminData.username,
                newAdminData.email,
                newAdminData.firstName,
                newAdminData.lastName,
                newAdminData.displayName,
                updatedByAdminId
            );

            return result.should.eventually.be.rejected.and.eql(new InfluenceError(errorCodes.C_400_013_003.code));
        });
        it("Case 2: Update Admin's Update to same Email and Username, and on profile they are different. Email is updated to a new email, it already exists.Should reject", function () {
            var
                updatedByAdminId = "fakeUpdatedByAdminId",
                newAdminData = {
                    adminId : "fakeAdminId",
                    username : "test@email.com",
                    email:"test@email.com",
                    firstName : "newFirstName",
                    lastName: "newLastName",
                    displayName : "newDisplayName"
                },
                adminFromDB = {
                    _id : "fakeAdminId",
                    username : "test@email.com",
                    email:"test1@email.com",
                    firstName : "existingFirstName",
                    lastName: "existingLastName",
                    displayName : "existingDisplayName"
                },
                accountDataHandler = {
                    findAdminAccountByEmail : function(){},
                    findAdminAccountByUsername : function(){},
                    updateAdminAccount : function(){},
                    getAdminAccountById : function(){}
                },
                updateAdminAccountSpy = sinon.spy(accountDataHandler, "updateAdminAccount"),
                accountBusiness = require('../business/accountBusiness')(helpers, util, console, accountDataHandler);

            stubMethodWithPromiseReturn(accountDataHandler, "getAdminAccountById", adminFromDB);
            stubMethodWithPromiseReturn(accountDataHandler, "findAdminAccountByEmail", {_id : "anotherAdmin"});
            stubMethodWithPromiseReturn(accountDataHandler, "findAdminAccountByUsername", {_id : "anotherAdmin"});

            var result = accountBusiness.updateAdminAccount(
                newAdminData.adminId,
                newAdminData.username,
                newAdminData.email,
                newAdminData.firstName,
                newAdminData.lastName,
                newAdminData.displayName,
                updatedByAdminId
            );

            return result.should.eventually.be.rejected.and.eql(new InfluenceError(errorCodes.C_400_013_003.code));
        });
        it("Case 3: Update Admin's Update to same Email and Username, and on profile they are different. Username is updated to a new Username, it already exists.Should reject", function () {
            var
                updatedByAdminId = "fakeUpdatedByAdminId",
                newAdminData = {
                    adminId : "fakeAdminId",
                    username : "test1@email.com",
                    email:"test1@email.com",
                    firstName : "newFirstName",
                    lastName: "newLastName",
                    displayName : "newDisplayName"
                },
                adminFromDB = {
                    _id : "fakeAdminId",
                    username : "test@email.com",
                    email:"test1@email.com",
                    firstName : "existingFirstName",
                    lastName: "existingLastName",
                    displayName : "existingDisplayName"
                },
                accountDataHandler = {
                    findAdminAccountByEmail : function(){},
                    findAdminAccountByUsername : function(){},
                    updateAdminAccount : function(){},
                    getAdminAccountById : function(){}
                },
                updateAdminAccountSpy = sinon.spy(accountDataHandler, "updateAdminAccount"),
                accountBusiness = require('../business/accountBusiness')(helpers, util, console, accountDataHandler);

            stubMethodWithPromiseReturn(accountDataHandler, "getAdminAccountById", adminFromDB);
            stubMethodWithPromiseReturn(accountDataHandler, "findAdminAccountByEmail", {_id : "anotherAdmin"});
            stubMethodWithPromiseReturn(accountDataHandler, "findAdminAccountByUsername", {_id : "anotherAdmin"});

            var result = accountBusiness.updateAdminAccount(
                newAdminData.adminId,
                newAdminData.username,
                newAdminData.email,
                newAdminData.firstName,
                newAdminData.lastName,
                newAdminData.displayName,
                updatedByAdminId
            );

            return result.should.eventually.be.rejected.and.eql(new InfluenceError(errorCodes.C_400_013_003.code));
        });
        it("Case 4: Update Admin's email that is already exists", function () {
            var
                updatedByAdminId = "fakeUpdatedByAdminId",
                newAdminData = {
                    adminId : "fakeAdminId",
                    username : "test@email.com",
                    email:"test1@email.com",
                    firstName : "newFirstName",
                    lastName: "newLastName",
                    displayName : "newDisplayName"
                },
                adminFromDB = {
                    _id : "fakeAdminId",
                    username : "test@email.com",
                    email:"test@email.com",
                    firstName : "existingFirstName",
                    lastName: "existingLastName",
                    displayName : "existingDisplayName"
                },
                accountDataHandler = {
                    findAdminAccountByEmail : function(){},
                    findAdminAccountByUsername : function(){},
                    updateAdminAccount : function(){},
                    getAdminAccountById : function(){}
                },
                updateAdminAccountSpy = sinon.spy(accountDataHandler, "updateAdminAccount"),
                accountBusiness = require('../business/accountBusiness')(helpers, util, console, accountDataHandler);

            stubMethodWithPromiseReturn(accountDataHandler, "getAdminAccountById", adminFromDB);
            stubMethodWithPromiseReturn(accountDataHandler, "findAdminAccountByEmail", {_id : "anotherAdmin"});
            stubMethodWithPromiseReturn(accountDataHandler, "findAdminAccountByUsername", {_id : "anotherAdmin"});

            var result = accountBusiness.updateAdminAccount(
                newAdminData.adminId,
                newAdminData.username,
                newAdminData.email,
                newAdminData.firstName,
                newAdminData.lastName,
                newAdminData.displayName,
                updatedByAdminId
            );

            return result.should.eventually.be.rejected.and.eql(new InfluenceError(errorCodes.C_400_013_003.code));
        });
        it("Case 5: Update Admin's email that is already exists", function () {
            var
                updatedByAdminId = "fakeUpdatedByAdminId",
                newAdminData = {
                    adminId : "fakeAdminId",
                    username : "test@email.com",
                    email:"test1@email.com",
                    firstName : "newFirstName",
                    lastName: "newLastName",
                    displayName : "newDisplayName"
                },
                adminFromDB = {
                    _id : "fakeAdminId",
                    username : "test@email.com",
                    email:"test2@email.com",
                    firstName : "existingFirstName",
                    lastName: "existingLastName",
                    displayName : "existingDisplayName"
                },
                accountDataHandler = {
                    findAdminAccountByEmail : function(){},
                    findAdminAccountByUsername : function(){},
                    updateAdminAccount : function(){},
                    getAdminAccountById : function(){}
                },
                updateAdminAccountSpy = sinon.spy(accountDataHandler, "updateAdminAccount"),
                accountBusiness = require('../business/accountBusiness')(helpers, util, console, accountDataHandler);

            stubMethodWithPromiseReturn(accountDataHandler, "getAdminAccountById", adminFromDB);
            stubMethodWithPromiseReturn(accountDataHandler, "findAdminAccountByEmail", {_id : "anotherAdmin"});
            stubMethodWithPromiseReturn(accountDataHandler, "findAdminAccountByUsername", {_id : "anotherAdmin"});

            var result = accountBusiness.updateAdminAccount(
                newAdminData.adminId,
                newAdminData.username,
                newAdminData.email,
                newAdminData.firstName,
                newAdminData.lastName,
                newAdminData.displayName,
                updatedByAdminId
            );

            return result.should.eventually.be.rejected.and.eql(new InfluenceError(errorCodes.C_400_013_003.code));
        });
        it("Case 6: Update Admin's email that is already exists", function () {
            var
                updatedByAdminId = "fakeUpdatedByAdminId",
                newAdminData = {
                    adminId : "fakeAdminId",
                    username : "test@email.com",
                    email:"test1@email.com",
                    firstName : "newFirstName",
                    lastName: "newLastName",
                    displayName : "newDisplayName"
                },
                adminFromDB = {
                    _id : "fakeAdminId",
                    username : "test@email.com",
                    email:"test2@email.com",
                    firstName : "existingFirstName",
                    lastName: "existingLastName",
                    displayName : "existingDisplayName"
                },
                accountDataHandler = {
                    findAdminAccountByEmail : function(){},
                    findAdminAccountByUsername : function(){},
                    updateAdminAccount : function(){},
                    getAdminAccountById : function(){}
                },
                updateAdminAccountSpy = sinon.spy(accountDataHandler, "updateAdminAccount"),
                accountBusiness = require('../business/accountBusiness')(helpers, util, console, accountDataHandler);

            stubMethodWithPromiseReturn(accountDataHandler, "getAdminAccountById", adminFromDB);
            stubMethodWithPromiseReturn(accountDataHandler, "findAdminAccountByEmail", null);
            stubMethodWithPromiseReturn(accountDataHandler, "findAdminAccountByUsername", {_id : "anotherAdmin"});

            var result = accountBusiness.updateAdminAccount(
                newAdminData.adminId,
                newAdminData.username,
                newAdminData.email,
                newAdminData.firstName,
                newAdminData.lastName,
                newAdminData.displayName,
                updatedByAdminId
            );

            return result.should.eventually.be.rejected.and.eql(new InfluenceError(errorCodes.C_400_013_003.code));
        });
        it("Update Admin's email that is already exists", function () {
            var
                updatedByAdminId = "fakeUpdatedByAdminId",
                newAdminData = {
                    adminId : "fakeAdminId",
                    username : "testUsername",
                    email:"test@email.com",
                    firstName : "newFirstName",
                    lastName: "newLastName",
                    displayName : "newDisplayName"
                },
                adminFromDB = {
                    _id : "fakeAdminId",
                    username : "testUsername",
                    email:"test1@email.com",
                    firstName : "existingFirstName",
                    lastName: "existingLastName",
                    displayName : "existingDisplayName"
                },
                accountDataHandler = {
                    findAdminAccountByEmail : function(){},
                    findAdminAccountByUsername : function(){},
                    updateAdminAccount : function(){},
                    getAdminAccountById : function(){}
            },
                updateAdminAccountSpy = sinon.spy(accountDataHandler, "updateAdminAccount"),
                accountBusiness = require('../business/accountBusiness')(helpers, util, console, accountDataHandler);

            stubMethodWithPromiseReturn(accountDataHandler, "getAdminAccountById", adminFromDB);
            stubMethodWithPromiseReturn(accountDataHandler, "findAdminAccountByEmail", {_id : "anotherAdmin"});
            stubMethodWithPromiseReturn(accountDataHandler, "findAdminAccountByUsername", adminFromDB);

            var result = accountBusiness.updateAdminAccount(
                newAdminData.adminId,
                newAdminData.username,
                newAdminData.email,
                newAdminData.firstName,
                newAdminData.lastName,
                newAdminData.displayName,
                updatedByAdminId
                );

            return result.should.eventually.be.rejected.and.eql(new InfluenceError(errorCodes.C_400_013_003.code));
        });
        it("Update Admin's Username that is already exists", function () {
            var
                updatedByAdminId = "fakeUpdatedByAdminId",
                newAdminData = {
                    adminId : "fakeAdminId",
                    username : "testUsername",
                    email:"test@email.com",
                    firstName : "newFirstName",
                    lastName: "newLastName",
                    displayName : "newDisplayName"
                },
                adminFromDB = {
                    _id : "fakeAdminId",
                    username : "testUsername1",
                    email:"test@email.com",
                    firstName : "existingFirstName",
                    lastName: "existingLastName",
                    displayName : "existingDisplayName"
                },
                accountDataHandler = {
                    findAdminAccountByEmail : function(){},
                    findAdminAccountByUsername : function(){},
                    updateAdminAccount : function(){},
                    getAdminAccountById : function(){}
                },
                updateAdminAccountSpy = sinon.spy(accountDataHandler, "updateAdminAccount"),
                accountBusiness = require('../business/accountBusiness')(helpers, util, console, accountDataHandler);

            stubMethodWithPromiseReturn(accountDataHandler, "getAdminAccountById", adminFromDB);
            //stubMethodWithPromiseReturn(accountDataHandler, "findAdminAccountByEmail", {_id : "anotherAdmin"});
            stubMethodWithPromiseReturn(accountDataHandler, "findAdminAccountByUsername", {_id : "anotherAdmin"});

            var result = accountBusiness.updateAdminAccount(
                newAdminData.adminId,
                newAdminData.username,
                newAdminData.email,
                newAdminData.firstName,
                newAdminData.lastName,
                newAdminData.displayName,
                updatedByAdminId
            );

            return result.should.eventually.be.rejected.and.eql(new InfluenceError(errorCodes.C_400_013_003.code));
        });

    });
});