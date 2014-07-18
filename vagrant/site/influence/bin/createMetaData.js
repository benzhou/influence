print('==============');
db = db.getSiblingDB('influenceDb');

print('Current collections are:');
collections = db.getCollectionNames();
printjson(collections);

print('==============');
print('Creating Actions:');
db.Actions.drop();
db.Actions.insert({name : "View Admin",     key:"VIEW_ADMIN",       createdOn: new Date()});
db.Actions.insert({name : "Edit Admin",     key:"EDIT_ADMIN",       createdOn: new Date()});
db.Actions.insert({name : "View Tenant",    key:"VIEW_TENANT",      createdOn: new Date()});
db.Actions.insert({name : "Edit Tenant",    key:"EDIT_TENANT",      createdOn: new Date()});
db.Actions.insert({name : "View Affiliate", key:"VIEW_AFFILIATE",   createdOn: new Date()});
db.Actions.insert({name : "Edit Affiliate", key:"EDIT_AFFILIATE",   createdOn: new Date()});
db.Actions.insert({name : "View ACTIONS",   key:"VIEW_ACTIONS",     createdOn: new Date()});
db.Actions.insert({name : "EDIT ACTIONS",   key:"EDIT_ACTIONS",     createdOn: new Date()});
print('Actions all inserted');
print('==============');
