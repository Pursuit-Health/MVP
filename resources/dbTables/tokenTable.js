var AWS = require("aws-sdk");
var settings = require("../../settings.js");

AWS.config.update(settings);

var dynamodb = new AWS.DynamoDB();



//Table parameters for Users
var params = {
    TableName : "Tokens",
    KeySchema: [       
    	  //Partition key = Account type(Trainer,Client, Gym, Admin,etc)
        { AttributeName: "token", KeyType: "HASH"},  
        //Sort key = Username 
        { AttributeName: "type", KeyType: "RANGE" }  
    ],
    AttributeDefinitions: [ 
        //String expeceted for both keys.      
        { AttributeName: "token", AttributeType: "S" },
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
        // let ttl = {
        //       TableName: 'Token', /* required */
        //       TimeToLiveSpecification: { /* required */
        //         AttributeName: 'ttl', /* required */
        //         Enabled: true /* required */
        //       }
        // }
        // dynamodb.updateTimeToLive(params, function(err, data) {
        //   if (err) {
        //   console.log(err, err.stack);
        //   } else {
        //     console.log("Created table. Table description JSON:", JSON.stringify(data));
        //   }     
        // });
        console.log("Created table. Table description JSON:", JSON.stringify(data));
    }
});




module.exports = dynamodb; 
