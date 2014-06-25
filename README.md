Influence Documentations
===

- Setup
---

1. Software to download before you start:
    - [Vagrant](http://www.vagrantup.com/downloads.html)
      - We use Vagrant as our virtual envrionment tool for ease of collaboration. Details about vagrant setup is not in the scope of this document, please refer to [Vagrant Documentaion](http://docs.vagrantup.com/v2/) to see details.
      - In the VagrantFile, we had several configurations worth mention here:
        1. You virutal machine's port 80 is mapped to your work station's port 8888, you can change it if you want to.
        2. We mapped the site_available folder of Nginx to the Vagrant/site-available folder, therefore, the detail Nginx configuration is used by Nginx from that location. This setup does created an issue at this moment: during the Vagrant up process, bootstrap.sh has be configured to install Nginx and it would fail due to a question asked during the installation process. You might want to reinstall Nginx once you can Vagrant ssh into the virtual box. See the bootstrap.sh file for the command if you are not familar with it.
    - [VirtualBox](https://www.virtualbox.org/wiki/Downloads)
    - IDE ([Webstorm](http://www.jetbrains.com/webstorm/download/) if you don't have a preference, however, webstorm only offers a trial version, you can use sublime text 3 if you don't have a lisence or prefer that better anyway.)
        - markdown plugin
    - [Chrome Canary](http://www.google.com/intl/en/chrome/browser/canary.html) (Not required, you can use anyone that you like)
    - Git (Github tool) [See here](https://help.github.com/articles/set-up-git)
    
2. Setup Github access so you can download all the files that includes VagrantFile for the environment and the source code 
3. Setup your workspace
    - Find the place you want to get the remote repo, say ~dev\
    - Run `github clone git@github.com:benzhou/influence.git` to get the remote repository downloaded
    - Run `Vagrant up` to start the process of building up your development environment, essentially this process will 
        1. Download the virtual machine that is defined in the VagrantFile
        2. the bootstrap.sh is the Vagrant provision file we defined in the VagrantFile, therefore, it will be executed as well. 
    - In VagrantFile, because we've configured as 'config.vm.synced_folder "sites-available", "/etc/nginx/sites-available"', therefore default nginx site configuration will point to the 
      site-available folder in the vagrant folder. This prevents in the 'vagrant up' step, nginx being able to installed successfully. If you have this issue, please run 'vagrant ssh' to connect
      the virtual box just installed by 'vagrant up' and run 'sudo apt-get install nginx' again. You will be asked if use the sites-availabel folder defined by you.  
    - Once the above steps are completed, Congratulations, you've completed the setup process pretty much.
    
- Topics
---
- Flow Control with promises and Q library. 
    In the influence application, we use Q library for defer and promises. What is a promise or how actually it works is not talked here in this 
    documentation, if you are not familiar with it, please read more on the [Q's documentation site](http://documentup.com/kriskowal/q/)
    
    Because the nature of asynchronous, a lot of times, we need to wait a callback to continue the execute code blocks. A good example is
    When admin tryies to login, we will:
    
    - First, lookup the database for an admin document. (asynchronous)
    - Second, calculate the passwordHash, if doesn't match the from-the-db admin's passwordHash, reject the request. (synchronous)
    - Third, If all passes, create admin authentication token. (asynchronous)
    - Finally, return the response.
     
    When this process happen, we have a put a callback in each asynchronous call(The first and third step). it creates a lot of nested,
     hard to read code. With promise and Q, we can do it in a cleaner manner.
        
        adminAccountLogin = function(appKey, tenantId, username, password){
                    var df = Q.defer();
        
                    //validation
                    //required fields
                    if(!appKey || !tenantId || !username || !password){
                        df.reject(
                            new InfluenceError(
                                errCodes.C_400_002_001.code,
                                "Missing parameters"
                            ));
        
                        return df.promise;
                    }
        
                    logger.log("adminAccountLogin, tenantId: %s, username %s, password %s", tenantId, username, password);
                    tenantId = parseInt(tenantId);
        
        
                    //TODO: Validates AppKey is authorized for this method
        
                    Q.when(accountDataHandler.findAdminAccountByTenantAndUsername(tenantId, username)).then(
                        //
                        function(admin){
                            logger.log("authBusiness.js adminAccountLogin: findAdminAccountByTenantAndUsername promise resolved");
                            logger.log("here is the admin object");
                            logger.log(admin);
        
                            if(!admin){
                                //if admin is false value, means we didn't find the admin by the tenantId and username
                                throw new InfluenceError(
                                    errCodes.C_400_002_002.code,
                                    "Invalid Username/Password"
                                );
                            }
        
                            //Validate retrieved admin has passwordHash and passwordSalt
                            var calculatedHash = helpers.sha256Hash(password + '.' + admin.passwordSalt);
                            logger.log("admin's saved password hash is %s", admin.passwordHash);
                            logger.log("calculated hash is %s", calculatedHash);
        
                            if(admin.passwordHash !== calculatedHash){
                                throw new InfluenceError(
                                    errCodes.C_400_002_003.code,
                                    "Invalid Username/Password"
                                );
                            }
        
                            createAdminAuthToken(appKey, admin._id).then(
                                function(token){
                                    logger.log("authBusiness.js adminAccountLogin createAdminAuthToken promise resolved!");
        
                                    if(!token || !token.token){
                                        throw new InfluenceError(
                                            errCodes.C_400_002_004.code,
                                            "Unexpected error when retrieve admin auth token."
                                        );
                                    }
        
                                    admin.token = token;
        
                                    df.resolve(admin);
                                }
                            ).catch(function(err){
                                    throw new InfluenceError(
                                        errCodes.C_400_002_005.code,
                                        "Unable to create admin auth token."
                                    );
                                }).done();
                        }
                    ).catch(function(err){
                            logger.log("authBusiness.js adminAccountLogin catch an error!");
                            logger.log(err);
        
                            df.reject(err);
                        }).done(function(){
                            logger.log("authBusiness.js adminAccountLogin done!");
                    });
        
                    return df.promise;
                }


- Error Handling
    Influence created a custom error object call InfluenceError. It is simply extended the nodejs Error object with several properties.
    It is used throughout the application, either being used as typical "throw" syntax or rejected with a promise object. 
        
        var df = Q.defer();
        
        //validation
        //required fields
        if(!appKey || !tenantId || !username || !password){
            df.reject(
                new InfluenceError(
                    errCodes.C_400_002_001.code,
                    "Missing parameters"
                ));
    
            return df.promise;
        }
    as you can see in the above code example, the new InfluenceError object is passing in when rejecting a promise. 
    You can *also* use the InfluenceError to wrap an Error object, which creates a system error. See the example below:
        
        function(err){
            logger.log("Failed when call accountBusiness.createAppAccount in postAppAccount");
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
    
   
- Unit Test frameworks
    * [Mocha](http://visionmedia.github.io/mocha/) Test running
    * [Sinon.js](http://sinonjs.org/docs) Stub/Spy/Mock library
    * [Chai.js](http://chaijs.com/api/) Assertion syntax
    * [Chai-as-promised](https://github.com/domenic/chai-as-promised/) Chai add-on for promises
    
- Layers in the applications and their responsibilities:
    - Application
    - Routes
    - Middleware
    - Controller
    - Business Logic
    - Data Access
        
