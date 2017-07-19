var AWS = require("aws-sdk");

AWS.config.update({
    region: "us-west-2",
    endpoint: "https://dynamodb.us-west-2.amazonaws.com",
    accessKeyId: process.env.AWS_ACCESS_KEY_ID, 
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

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
