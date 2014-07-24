var
    Q               = require('q'),
    util            = require('util'),
    InfluenceError  = require('../error/influenceError'),
    errorCodes      = require('../error/errorCodes'),
    constants       = require('../constants/constants');

module.exports = function(logger, authBusiness){

    var
        _convertPermArrayToObject = function(perms, typeName, attachTo){
            if(perms[typeName]){
                if(perms[typeName] === "*"){
                    attachTo.all[typeName] = true;
                }else{
                    if(util.isArray(perms[typeName])){
                        perms[typeName].forEach(function(item){
                            attachTo[typeName][item] = true;
                        });
                    }
                }
            }
        },
        convertPermsTable = function(perms){
            var table = {
                all : {},
                actions : {},
                roles   : {},
                tenants : {}
            };

            _convertPermArrayToObject(perms, "actions", table);
            _convertPermArrayToObject(perms, "roles", table);
            if(perms.tenants){
                if(perms.tenants === "*"){
                    table.all.tenants = true;
                }else{
                    if(util.isArray(perms.tenants)){
                        perms.tenants.forEach(function(tenant){
                            var tenantTable = {
                                tenantId : tenant.tenantId,
                                all : {},
                                actions : {},
                                roles : {},
                                affiliates : {}
                            };

                            _convertPermArrayToObject(tenant, "actions", tenantTable);
                            _convertPermArrayToObject(tenant, "roles", tenantTable);

                            if(tenant.affiliates){
                                if(tenant.affiliates === "*"){
                                    tenantTable.all.affiliates = true;
                                }else{
                                    if(util.isArray(tenant.affiliates)){
                                        tenant.affiliates.forEach(function(affiliate){
                                            var affiliateTable = {
                                                affiliateId : affiliate.affiliateId,
                                                all : {},
                                                actions : {},
                                                roles : {}
                                            };
                                            _convertPermArrayToObject(affiliate, "actions", affiliateTable);
                                            _convertPermArrayToObject(affiliate, "roles", affiliateTable);
                                            tenantTable.affiliates["AFFILIATE_ID_" + affiliate.affiliateId] = affiliateTable;
                                        });
                                    }
                                }
                            }

                            table.tenants["TENANT_ID_" + tenant.tenantId] = tenantTable;
                        });
                    }
                }
            }

            return table;
        },
        adminTokenAuth = function(req, res, next, authorizationRequirements){
            var
                token = req.query.token;

            if(!token){
                var err = new InfluenceError(errorCodes.C_401_001_001.code);
                res.json(
                    err.httpStatus,
                    {
                        code : err.code,
                        message : err.message
                    }
                );
                return;
            }

            //retrieve token info and validate
            Q.when(authBusiness.validateAdminAuthToken(token)).then(
                function(tokenObj){
                    if(!tokenObj){
                        throw new InfluenceError(errorCodes.C_401_001_002.code);
                    }

                    req[constants.reqParams.PROP_AUTHTOKEN] = tokenObj;

                    return authBusiness.findAdminAuthorizationsByAdminId(tokenObj.adminId);
                }
            ).then(
                function(permissions){
                    logger.log("adminAuthenticationMiddleware authBusiness.findAdminAuthorizationsByAdminId promise fulfilled ");
                    logger.log(permissions);
                    permissions = permissions || {};
                    req[constants.reqParams.PROP_AUTHORIZATION] = permissions;
                    req[constants.reqParams.PROP_AUTHORIZATION_TABLE] = convertPermsTable(permissions);

                    next();
                }
            ).catch(
                function(err){
                    logger.log("Catch an error!");
                    logger.log(err);

                    var resObj = err instanceof InfluenceError ? err : new InfluenceError(err);
                    res.json(
                        resObj.httpStatus,
                        {
                            code : resObj.code,
                            message : resObj.message
                        }
                    );
                }
            ).done();
        };

    return {
        adminTokenAuth : adminTokenAuth,
        convertPermsTable   : convertPermsTable

    }
};
