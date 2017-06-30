var mongodb=require("mongodb");
module.exports = function(callback) {

    var MongoClient = mongodb.MongoClient;
    var url = 'mongodb://localhost:27017/shopping_network';
    MongoClient.connect(url, callback)
}