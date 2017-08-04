var AWS = require("aws-sdk");

AWS.config.update({
    region: "us-west-2",
    endpoint: "arn:aws:dynamodb:us-east-1:399707203552:table/Events",
    accessKeyId: process.env.AWS_ACCESS_KEY_ID, 
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

var dynamodb = new AWS.DynamoDB();



//Table parameters for Events
var params = {
    TableName : "Events",
    KeySchema: [       
    	  //Partition key = email
        { AttributeName: "email", KeyType: "HASH"},  
        //Sort key = Template Name 
    ],
    AttributeDefinitions: [ 
        //String expeceted for both keys.      
        { AttributeName: "email", AttributeType: "S" },
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
