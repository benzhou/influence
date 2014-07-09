(function(){
    module.exports = function(){

        var
            AffiliatePerm = function(affiliateId, actions, roles){
                this.affiliateId = affiliateId;

                this.actions = actions || [];
                this.roles = roles || [];
            },
            TenantPerm = function(tenantId, actions, roles, affiliates){
                this.tenantId = tenantId;

                this.actions = actions || [];
                this.roles = roles || [];
                this.affilaites = affiliates || [];
            },
            AppPerm = function(actions, roles, tenants){
                this.actions = actions;
                this.roles = roles;
                this.tenants = tenants;
            };

        return {
            AffiliatePerm   : AffiliatePerm,
            TenantPerm      : TenantPerm,
            AppPerm         : AppPerm
        };
    };
})();