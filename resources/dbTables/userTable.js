var AWS = require("aws-sdk");
var settings = require("../../settings.js")

AWS.config.update(settings);

var dynamodb = new AWS.DynamoDB();



//Table parameters for Users
var params = {
    TableName : "Users",
    KeySchema: [       
    	  //Partition key = Email
        { AttributeName: "email", KeyType: "HASH"},  
        //Sort key = type of information
        { AttributeName: "type", KeyType: "RANGE" }  
    ],
    AttributeDefinitions: [ 
        //String expeceted for both keys.      
        { AttributeName: "email", AttributeType: "S" },
        { AttributeName: "type", AttributeType: "S" }
    ],
    ProvisionedThroughput: {       
        ReadCapacityUnits: 500, 
        WriteCapacityUnits: 1000
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
