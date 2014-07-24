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
    constants       = require('../constants/constants');

describe('Authorization Related tests', function(){
    describe('adminAuthenticationMiddleware', function(){
        describe('convertPermsTable Method', function(){

            it("Should only have affiliate Level actions", function () {
                var perms = {
                        "_id" : "53d00fe57a7e6a672f2a8baf",
                        "adminId" : "53bc1866a28c2dfe1fb7d0b6",
                        "createdBy" : "53bc05cd7f7847e21faab5d2",
                        "createdOn" : new Date("2014-07-23T19:41:25.145Z"),
                        "updatedBy" : "53bc05cd7f7847e21faab5d2",
                        "updatedOn" : new Date("2014-07-24T19:45:16.427Z"),
                        "actions" : [ ],
                        "roles" : [ ],
                        "tenants" : [
                            {
                                "tenantId" : "53bc07aba28c2dfe1fb7d043",
                                "actions" : [ ],
                                "roles" : [ ],
                                "affiliates" : [
                                    {
                                        "affiliateId" : "53bc0f5ca28c2dfe1fb7d079",
                                        "actions" : [
                                            "EDIT_AFFILIATE",
                                            "VIEW_AFFILIATE"
                                        ]
                                    },
                                    {
                                        "affiliateId" : "53bc0f7aa28c2dfe1fb7d07f",
                                        "actions" : [
                                            "VIEW_AFFILIATE",
                                            "EDIT_AFFILIATE"
                                        ]
                                    },
                                    {
                                        "affiliateId" : "53bc1811a28c2dfe1fb7d0ab",
                                        "actions" : [
                                            "VIEW_AFFILIATE",
                                            "EDIT_AFFILIATE"
                                        ]
                                    }
                                ]
                            }
                        ]
                    },
                    authBusiness = {},
                    adminAuthenticationMiddleware = require("../middleware/adminAuthenticationMiddleware")(console, authBusiness),
                    permTable = adminAuthenticationMiddleware.convertPermsTable(perms);

                permTable.should.deep.have.property('all').to.be.empty;
                permTable.should.deep.have.property('actions').to.be.empty;
                permTable.should.deep.have.property('roles').to.be.empty;

                permTable.should.deep.have.property('tenants.TENANT_ID_53bc07aba28c2dfe1fb7d043.all').that.to.be.empty;
                permTable.should.deep.have.property('tenants.TENANT_ID_53bc07aba28c2dfe1fb7d043.actions').that.to.be.empty;
                permTable.should.deep.have.property('tenants.TENANT_ID_53bc07aba28c2dfe1fb7d043.roles').that.to.be.empty;

                permTable.should.deep.have.property('tenants.TENANT_ID_53bc07aba28c2dfe1fb7d043.affiliates.AFFILIATE_ID_53bc0f5ca28c2dfe1fb7d079.roles').that.to.be.empty;
                permTable.should.deep.have.property('tenants.TENANT_ID_53bc07aba28c2dfe1fb7d043.affiliates.AFFILIATE_ID_53bc0f5ca28c2dfe1fb7d079.actions.VIEW_AFFILIATE').that.to.be.true;
                permTable.should.deep.have.property('tenants.TENANT_ID_53bc07aba28c2dfe1fb7d043.affiliates.AFFILIATE_ID_53bc0f5ca28c2dfe1fb7d079.actions.EDIT_AFFILIATE').that.to.be.true;

                permTable.should.deep.have.property('tenants.TENANT_ID_53bc07aba28c2dfe1fb7d043.affiliates.AFFILIATE_ID_53bc0f7aa28c2dfe1fb7d07f.roles').that.to.be.empty;
                permTable.should.deep.have.property('tenants.TENANT_ID_53bc07aba28c2dfe1fb7d043.affiliates.AFFILIATE_ID_53bc0f7aa28c2dfe1fb7d07f.actions.VIEW_AFFILIATE').that.to.be.true;
                permTable.should.deep.have.property('tenants.TENANT_ID_53bc07aba28c2dfe1fb7d043.affiliates.AFFILIATE_ID_53bc0f7aa28c2dfe1fb7d07f.actions.EDIT_AFFILIATE').that.to.be.true;

                permTable.should.deep.have.property('tenants.TENANT_ID_53bc07aba28c2dfe1fb7d043.affiliates.AFFILIATE_ID_53bc1811a28c2dfe1fb7d0ab.roles').that.to.be.empty;
                permTable.should.deep.have.property('tenants.TENANT_ID_53bc07aba28c2dfe1fb7d043.affiliates.AFFILIATE_ID_53bc1811a28c2dfe1fb7d0ab.actions.VIEW_AFFILIATE').that.to.be.true;
                permTable.should.deep.have.property('tenants.TENANT_ID_53bc07aba28c2dfe1fb7d043.affiliates.AFFILIATE_ID_53bc1811a28c2dfe1fb7d0ab.actions.EDIT_AFFILIATE').that.to.be.true;

            });
        });
    });

    describe('AuthBusiness -- AuthorizationHelper', function() {
        describe('Method: getAffiliatesWithActions', function () {

            it("Passed in Tenant has two affiliates with requested permission", function () {
                var authorizationHelper = require('../business/authorizationHelper'),
                    permTable = {
                        "actions": {},
                        "all": {},
                        "roles": {},
                        "tenants": {
                            "TENANT_ID_53bc07aba28c2dfe1fb7d043": {
                                "actions": {},
                                "affiliates": {
                                    "AFFILIATE_ID_53bc0f5ca28c2dfe1fb7d079": {
                                        "actions": {
                                            "EDIT_AFFILIATE": true,
                                            "VIEW_AFFILIATE": true
                                        },
                                        "affiliateId": "53bc0f5ca28c2dfe1fb7d079",
                                        "all": {},
                                        "roles": {}
                                    },
                                    "AFFILIATE_ID_53bc0f7aa28c2dfe1fb7d07f": {
                                        "actions": {
                                            "EDIT_AFFILIATE": true,
                                            "VIEW_AFFILIATE": true
                                        },
                                        "affiliateId": "53bc0f7aa28c2dfe1fb7d07f",
                                        "all": {},
                                        "roles": {}
                                    },
                                    "AFFILIATE_ID_53bc1811a28c2dfe1fb7d0ab": {
                                        "actions": {
                                            "VIEW_AFFILIATE": true
                                        },
                                        "affiliateId": "53bc1811a28c2dfe1fb7d0ab",
                                        "all": {},
                                        "roles": {}
                                    }
                                },
                                "all": {},
                                "roles": {},
                                "tenantId": "53bc07aba28c2dfe1fb7d043"
                            }
                        }
                    };

                var result = authorizationHelper.getAffiliatesWithActions(permTable, constants.ACTIONS.EDIT_AFFILIATE, "53bc07aba28c2dfe1fb7d043");

                return result.should.be.length(2);
            });
        });
        describe('Method: hasPermissionForTenant', function () {

            it("Admin doesn't have permission for the tenant", function () {
                var authorizationHelper = require('../business/authorizationHelper'),
                    permTable = {
                        "actions": {},
                        "all": {},
                        "roles": {},
                        "tenants": {
                            "TENANT_ID_53bc07aba28c2dfe1fb7d043": {
                                "actions": {},
                                "affiliates": {
                                    "AFFILIATE_ID_53bc0f5ca28c2dfe1fb7d079": {
                                        "actions": {
                                            "EDIT_AFFILIATE": true,
                                            "VIEW_AFFILIATE": true
                                        },
                                        "affiliateId": "53bc0f5ca28c2dfe1fb7d079",
                                        "all": {},
                                        "roles": {}
                                    },
                                    "AFFILIATE_ID_53bc0f7aa28c2dfe1fb7d07f": {
                                        "actions": {
                                            "EDIT_AFFILIATE": true,
                                            "VIEW_AFFILIATE": true
                                        },
                                        "affiliateId": "53bc0f7aa28c2dfe1fb7d07f",
                                        "all": {},
                                        "roles": {}
                                    },
                                    "AFFILIATE_ID_53bc1811a28c2dfe1fb7d0ab": {
                                        "actions": {
                                            "VIEW_AFFILIATE": true
                                        },
                                        "affiliateId": "53bc1811a28c2dfe1fb7d0ab",
                                        "all": {},
                                        "roles": {}
                                    }
                                },
                                "all": {},
                                "roles": {},
                                "tenantId": "53bc07aba28c2dfe1fb7d043"
                            }
                        }
                    };

                var result = authorizationHelper.hasPermissionForTenant(permTable, "53bc07aba28c2dfe1fb7d043", constants.ACTIONS.VIEW_PERMISSION_ADMIN);

                return result.should.not.be.true;
            });
        });
        describe('Method: getTenantsIfHasAffiliateAction', function () {
            it("Tenant Does not has a action but one of affiliates has", function () {
                var authorizationHelper = require('../business/authorizationHelper'),
                    permTable = {
                        "actions": {},
                        "all": {},
                        "roles": {},
                        "tenants": {
                            "TENANT_ID_53bc07aba28c2dfe1fb7d043": {
                                "actions": {},
                                "affiliates": {
                                    "AFFILIATE_ID_53bc0f5ca28c2dfe1fb7d079": {
                                        "actions": {
                                            "EDIT_AFFILIATE": true,
                                            "VIEW_AFFILIATE": true
                                        },
                                        "affiliateId": "53bc0f5ca28c2dfe1fb7d079",
                                        "all": {},
                                        "roles": {}
                                    },
                                    "AFFILIATE_ID_53bc0f7aa28c2dfe1fb7d07f": {
                                        "actions": {
                                            "EDIT_AFFILIATE": true,
                                            "VIEW_AFFILIATE": true
                                        },
                                        "affiliateId": "53bc0f7aa28c2dfe1fb7d07f",
                                        "all": {},
                                        "roles": {}
                                    },
                                    "AFFILIATE_ID_53bc1811a28c2dfe1fb7d0ab": {
                                        "actions": {
                                            "VIEW_AFFILIATE": true
                                        },
                                        "affiliateId": "53bc1811a28c2dfe1fb7d0ab",
                                        "all": {},
                                        "roles": {}
                                    }
                                },
                                "all": {},
                                "roles": {},
                                "tenantId": "53bc07aba28c2dfe1fb7d043"
                            }
                        }
                    };

                var result = authorizationHelper.getTenantsIfHasAffiliateAction(permTable, constants.ACTIONS.EDIT_AFFILIATE);

                //Only 1 tenants even though multiple affiliates has the edit_affiliate permission
                return result.should.be.length(1);
            });
            it("Tenant Does not has a action but one of affiliates has, multiple tenants", function () {
                var authorizationHelper = require('../business/authorizationHelper'),
                    permTable = {
                        "actions": {},
                        "all": {},
                        "roles": {},
                        "tenants": {
                            "TENANT_ID_53bc07aba28c2dfe1fb7d043": {
                                "actions": {},
                                "affiliates": {
                                    "AFFILIATE_ID_53bc0f5ca28c2dfe1fb7d079": {
                                        "actions": {
                                            "EDIT_AFFILIATE": true,
                                            "VIEW_AFFILIATE": true
                                        },
                                        "affiliateId": "53bc0f5ca28c2dfe1fb7d079",
                                        "all": {},
                                        "roles": {}
                                    },
                                    "AFFILIATE_ID_53bc0f7aa28c2dfe1fb7d07f": {
                                        "actions": {
                                            "EDIT_AFFILIATE": true,
                                            "VIEW_AFFILIATE": true
                                        },
                                        "affiliateId": "53bc0f7aa28c2dfe1fb7d07f",
                                        "all": {},
                                        "roles": {}
                                    },
                                    "AFFILIATE_ID_53bc1811a28c2dfe1fb7d0ab": {
                                        "actions": {
                                            "VIEW_AFFILIATE": true
                                        },
                                        "affiliateId": "53bc1811a28c2dfe1fb7d0ab",
                                        "all": {},
                                        "roles": {}
                                    }
                                },
                                "all": {},
                                "roles": {},
                                "tenantId": "53bc07aba28c2dfe1fb7d043"
                            },
                            "TENANT_ID_xxxxxxx": {
                                "actions": {},
                                "affiliates": {
                                    "AFFILIATE_ID_ooooooo": {
                                        "actions": {
                                            "EDIT_AFFILIATE": true,
                                            "VIEW_AFFILIATE": true
                                        },
                                        "affiliateId": "ooooooo",
                                        "all": {},
                                        "roles": {}
                                    }
                                },
                                "all": {},
                                "roles": {},
                                "tenantId": "xxxxxxx"
                            }
                        }
                    };

                var result = authorizationHelper.getTenantsIfHasAffiliateAction(permTable, constants.ACTIONS.EDIT_AFFILIATE);

                //Only 1 tenants even though multiple affiliates has the edit_affiliate permission
                return result.should.be.length(2);
            });
        });
    });

});
