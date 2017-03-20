var AWS = require("aws-sdk");
var settings = require("./settings.js")

AWS.config.update(settings);

var dynamodb = new AWS.DynamoDB();



//Table parameters for Users
var params = {
    TableName : "Tokens",
    KeySchema: [       
    	  //Partition key = Account type(Trainer,Client, Gym, Admin,etc)
        { AttributeName: "account", KeyType: "HASH"},  
        //Sort key = Username 
        { AttributeName: "token", KeyType: "RANGE" }  
    ],
    AttributeDefinitions: [ 
        //String expeceted for both keys.      
        { AttributeName: "account", AttributeType: "S" },
        { AttributeName: "token", AttributeType: "S" }
    ],
    ProvisionedThroughput: {       
        ReadCapacityUnits: 10, 
        WriteCapacityUnits: 10
    }
};


//Creating table
dynamodb.createTable(params, function(err, data) {
    if (err) {
        console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("Created table. Table description JSON:", JSON.stringify(data));
    }
});




module.exports = dynamodb; 
