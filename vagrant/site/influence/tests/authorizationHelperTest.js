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

describe('AuthBusiness', function() {
    describe('Method: getTenantsIfHasAffiliateAction', function () {
        it("Tenant Does not has a action but one of affiliates has", function () {
            var authorizationHelper = require('../business/authorizationHelper'),
                permTable = {
                    all : {},
                    actions : {},
                    roles : {},
                    tenants : {
                        "TENANT_ID_53bc07aba28c2dfe1fb7d043" : {
                            tenantId : "53bc07aba28c2dfe1fb7d043",
                            all : {},
                            actions : {
                                EDIT_ADMIN : true
                            },
                            roles:{},
                            affiliates : {
                                "AFFILIATE_ID_53bc0f5ca28c2dfe1fb7d079" : {
                                    affiliateId : "53bc0f5ca28c2dfe1fb7d079",
                                    all : {},
                                    actions : {
                                        "VIEW_AFFILIATE" : true,
                                        "EDIT_AFFILIATE" : true
                                    },
                                    roles :{}
                                }
                            }
                        }
                    }
                };

            var result = authorizationHelper.getTenantsIfHasAffiliateAction(permTable, constants.ACTIONS.EDIT_AFFILIATE);

            return result.should.be.length(1);
        });
    });
});