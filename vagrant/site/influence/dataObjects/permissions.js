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
                this.affiliates = affiliates || [];
            },
            AppPerm = function(adminId, createdBy, actions, roles, tenants){
                this.adminId = adminId;
                this.createdBy = createdBy;
                this.createdOn = new Date();
                this.updatedBy = createdBy;
                this.updatedOn = new Date();
                this.actions = actions || [];
                this.roles = roles || [];
                this.tenants = tenants || [];
            };

        return {
            AffiliatePerm   : AffiliatePerm,
            TenantPerm      : TenantPerm,
            AppPerm         : AppPerm
        };
    }();
})();