var Q = require("q"),
    util = require("util"),
    errorCodes    = require('../error/errorCodes'),
    InfluenceError = require('../error/influenceError'),
    constants       = require('../constants/constants');

module.exports = function(helpers, logger, locationApiConfig, tenantsBusiness, requestQ){
    //Location
    var searchLocationByCoordinates = function(lan, long){
        var df = Q.defer();

        Q.when((function(){
            if(!lan || !long){
                throw new InfluenceError(errorCodes.C_400_030_001.code);
            }

            var locationApiUrl = [
                locationApiConfig.URL, locationApiConfig.methods.searchVenue.endPoint,
                "?client_id=", locationApiConfig.clientId,
                "&client_secret=", locationApiConfig.clientSecrect,
                "&v=", locationApiConfig.version,
                "&ll=",lan,",",long,
                "&radius=", locationApiConfig.methods.searchVenue.radius,
                "&limit=", locationApiConfig.methods.searchVenue.limit,
                "&categoryId=", locationApiConfig.methods.searchVenue.categoryId
            ].join('');

            logger.log("locationApiBusiness, searchLocationByCoordinates: locationApiUrl %s", locationApiUrl);

            return requestQ.makeRequest({url: locationApiUrl, method: "GET", timeout: locationApiConfig.timeoutMS, json:true}).then(
                function(result){
                    if(result.body.meta.code !== 200){
                        throw new InfluenceError(errorCodes.C_400_030_002.code);
                    }else{
                        //df.resolve(body.response.venues);
                        var venues = result.body && result.body.response && result.body.response.venues;

                        if(!venues || !util.isArray(venues)){
                            throw new InfluenceError(errorCodes.C_400_030_003.code);
                        }

                        if(venues.length === 0){
                            df.resolve(venues);
                            return;
                        }

                        var venueId = [],
                            filter = {};
                        result.body.response.venues.forEach(function(venue){
                            venueId.push(venue.id);
                        });

                        filter.venueId = venueId;
                        filter.exLinkType = constants.AFFILIATE_EX_LINK_TYPE.FOURSQUARE;

                        return tenantsBusiness.loadAffiliates(filter, 100, 1).then(
                            function(affiliates){
                                logger.log("locationApiBusiness searchLocationByCoordinates tenantsBusiness.loadAffiliates promise fulfilled!");
                                logger.log(affiliates);

                                if(!affiliates || !util.isArray(affiliates) || affiliates.length === 0){
                                    df.resolve(venues);
                                    return;
                                }

                                var affDic = {};
                                affiliates.forEach(function(aff){
                                    aff.externalLink.forEach(function(externalLink){
                                        if(externalLink.type === constants.AFFILIATE_EX_LINK_TYPE.FOURSQUARE){
                                            affDic["VENUE_ID_" + externalLink.venueId] = aff;
                                        }
                                    });
                                });

                                venues.forEach(function(venue){
                                    var aff = affDic["VENUE_ID_" + venue.id];
                                    if(aff){
                                        venue.influence = {
                                            affiliate : {
                                                id : aff._id,
                                                name : aff.name
                                            }
                                        };
                                    }
                                });

                                df.resolve(venues);
                            }
                        );
                    }
                }
            );
        })()).catch(
            function(err){
                logger.log("locationApiBusiness searchLocationByCoordinates caught an error!");
                logger.log(err);
                err = err instanceof InfluenceError ? err : new InfluenceError(err);
                logger.log(err.stack);

                df.reject(err);
            }
        ).finally();

        return df.promise;
    },

        findVenueDetailsById = function(venueId){
            var df = Q.defer();

            Q.when((function(){
                    if(!venueId){
                        throw new InfluenceError(errorCodes.C_400_031_001.code);
                    }

                    var filter = {
                        venueId : [venueId],
                        exLinkType  : constants.AFFILIATE_EX_LINK_TYPE.FOURSQUARE
                    };

                    return tenantsBusiness.loadAffiliates(filter);
                })()
            ).then(
                function(affiliates){
                    logger.log("locationApiBusiness.js findVenueDetailsById tenantsBusiness.loadAffiliates promise fulfilled!");
                    logger.log(affiliates);

                    if(affiliates && affiliates.length > 0){
                        //Found venue already exist in our system
                        affiliateId = affiliates[0]._id;

                        df.resolve({
                            type : "linked",
                            affiliate : affiliates[0]
                        });
                    }else{
                        //Go to locationApi to lookup the venue
                        var locationApiUrl = [
                            locationApiConfig.URL, locationApiConfig.methods.venue.endPoint,
                            '/',venueId,
                            "?client_id=", locationApiConfig.clientId,
                            "&client_secret=", locationApiConfig.clientSecrect,
                            "&v=", locationApiConfig.version
                        ].join('');

                        logger.log("locationApiBusiness.js findVenueDetailsById: locationApiUrl");
                        logger.log(locationApiUrl);

                        return requestQ.makeRequest({url: locationApiUrl, method: "GET", timeout: locationApiConfig.timeoutMS, json:true}).then(
                            function(result){
                                logger.log("locationApiBusiness.js findVenueDetailsById, requestQ.makeRequest fulfilled!");
                                logger.log(result);

                                if(!result.body || result.body.meta.code !== 200 || !result.body.response || helpers.isEmptyObject(result.body.response)){
                                    throw new InfluenceError(errorCodes.C_400_031_003.code);
                                }

                                var venue = result.body.response && result.body.response.venue;

                                if(!venue || helpers.isEmptyObject(venue)){
                                    throw new InfluenceError(errorCodes.C_400_031_002.code);
                                }

                                df.resolve({
                                    type    : "unlinked",
                                    venue   : venue
                                });
                            }
                        );
                    }
                }
            ).catch(
                function(err){
                    logger.log("locationApiBusiness findVenueDetailsById caught an error!");
                    logger.log(err);
                    err = err instanceof InfluenceError ? err : new InfluenceError(err);
                    logger.log(err.stack);

                    df.reject(err);
                }
            ).finally();

            return df.promise;
        };

    return {
        searchLocationByCoordinates         : searchLocationByCoordinates,
        findVenueDetailsById                : findVenueDetailsById
    };
};
