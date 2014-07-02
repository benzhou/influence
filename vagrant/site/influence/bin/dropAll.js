print('==============');
db = db.getSiblingDB('influenceDb');

print('Current collections are:');
collections = db.getCollectionNames();
printjson(collections);
print('Start to drop all:');
db.AdminAccount.drop();
db.Tenants.drop();
db.AppAccount.drop();
db.AdminAuthToken.drop();

print('Current collections are:');
collections = db.getCollectionNames();

//cursor = db.AdminAccount.find();
//while ( cursor.hasNext() ) {
//    printjson( cursor.next() );
//}