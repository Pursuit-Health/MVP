var AWS = require("aws-sdk");
var settings = require("./settings.js")

AWS.config.update(settings);

var dynamodb = new AWS.DynamoDB();



//Table parameters for Events
var params = {
    TableName : "Events",
    KeySchema: [       
    	  //Partition key = email
        { AttributeName: "id", KeyType: "HASH"},  
        //Sort key = Template Name 
        { AttributeName: "event", KeyType: "RANGE" }  
    ],
    AttributeDefinitions: [ 
        //String expeceted for both keys.      
        { AttributeName: "id", AttributeType: "N" },
        { AttributeName: "event", AttributeType: "S" }
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
