const dynamodb = require('../dbTables/userTable');

//TODO: Change format so that you get and then set data for adding templates.
var AWS = require("aws-sdk");

AWS.config.update({
    region: "us-west-2",
    endpoint: "https://dynamodb.us-west-2.amazonaws.com",
    accessKeyId: process.env.AWS_ACCESS_KEY_ID, 
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

var docClient = new AWS.DynamoDB.DocumentClient();
/*
Template object should look as follows:

Template can have multiple exercises
{
	id: number,
	name: name,
	img: image,
	info: array of exercises,
}
an exercise looks like this

exercise: {
   name: name
	set: number,
	rep: number,
	weight: depends on whether we want to include different units of weight or not. Always pounds or have kg as a possbility?
	}
}
*/

/*
For adding a template (trainer only), the request object should look as follows:

{
	email: trainer email,
	info: template object
}

*/
exports.addTemplate = function(req, res, callback) {
 	var params = {
  	   TableName: "Users",
  	   Key:{
  	       "type": "Templates",
  	       "email": req.body.email
  	   }
  	}

   docClient.get(params, function(err, data) {
   	if (err) {
   	   console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
   	} else {
   		var template = req.body.template;
   		var date = new Date();
   	   template.id = date.toString();
   		data.Item.info.push(template);
   		var templates = data.Item.info;
   		var index = templates.length - 1;
   		var params = {
   		   TableName: "Users",
   		   Key:{
   		       "type": "Templates",
   		       "email": req.body.email
   		   },
   		   UpdateExpression: "set info = :i",
   		   ExpressionAttributeValues:{
   		      ":i":templates,
   		   },
   		   ReturnValues:"UPDATED_NEW"
   		};
   		docClient.update(params, function(err, data) {

   			if (err) {
   			   console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
   			} else {
   				console.log("template added", data.Attributes.info);
   				callback(JSON.stringify(data.Attributes.info[index]));
   			}
   		});	
   	}
   });
};

/*
For applying a template to a client, the request object should look as follows:

{
	email: trainer string,
	client: client email
	template: template object
}

*/

exports.applyTemplate = function(req,res,callback) {
	//Trainer sends client template.
	var params = {
		TableName: "Users",
		Key: {
			"email" : req.body.email,
			"type" : "Templates"
		}
	}

	docClient.get(params, function(err, data) {
		if(err) {
			console.log("Template acquisition error")
		} else {
				var params = {
			 	   TableName: "Users",
			 	   Key:{
			 	       "type": "Templates",
			 	       "email": req.body.client // client's email
			 	   }
			 	}

			  docClient.get(params, function(err, data) {
			  	if (err) {
			  	   console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
			  	} else {
			  		data.Item.info.push(req.body.template)
			  		var templates = data.Item.info;
			  		var params = {
			  		   TableName: "Users",
			  		   Key:{
			  		       "type": "Templates",
			  		       "email": req.body.email
			  		   },
			  		   UpdateExpression: "set info = :i",
			  		   ExpressionAttributeValues:{
			  		      ":i":templates,
			  		   },
			  		   ReturnValues:"UPDATED_NEW"
			  		}
			  		docClient.update(params, function(err, data) {

			  			if (err) {
			  			   console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
			  			} else {
			  				console.log("template added", data)
			  				callback("template added");
			  			}
			  		})	
			  	}
			  })			
		}
	})
}

exports.getAllTemplates = function(req, res, callback) {
	var params = {
		TableName: "Users",
		Key: {
			"email": req.body.email,
			"type": "Templates"
		}
	}

	docClient.get(params, function(err,data) {
		if(err) {
			console.error("Unable to get all templates. Error JSON:", JSON.stringify(err, null, 2))
		} else {
			console.log("got all clients");
			callback(JSON.stringify(data.Item.info))
		}
	})
}
/*
For deleting a template, the object should look as follows
{
	
}

*/

exports.deleteTemplate = function(req,res,callback) {
	var params = {
  	   TableName: "Users",
  	   Key:{
  	       "type": "Templates",
  	       "email": req.body.email
  	   }
  	}

   docClient.get(params, function(err, data) {
   	if (err) {
   	   console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
   	} else {
   		var templates = data.Item.info
   		console.log(typeof templates);


   		templates.forEach(function(template, index) {
   			if(template.id === req.body.template.id) {
   				templates.splice(index, 1);
   			}
   		})
   		var params = {
   		   TableName: "Users",
   		   Key:{
   		       "type": "Templates",
   		       "email": req.body.email
   		   },
   		   UpdateExpression: "set info = :i",
   		   ExpressionAttributeValues:{
   		      ":i":templates,
   		   },
   		   ReturnValues:"UPDATED_NEW"
   		}
   		docClient.update(params, function(err, data) {

   			if (err) {
   			   console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
   			} else {
   				console.log("template deleted")
   				callback("template deleted");
   			}
   		})	
   	}
   })

}


/*
This function allows for updating of a specific template. Works for either trainer or client.
However, client templates may want to add a field for showing progress or completion. This update function allows
for any type of update, so long as we are consistent in the field across all templates.

Client template may look like this after update:
{
	name: name,
	img: img,
	exercises: [
		{
			name: name,
			img: img,
			set: set,
			rep: rep,
			weight: weight,
			setsCompleted: half,
			completed: ?
		},
		{
			name: name1,
			img: img1,
			set: set1,
			rep: rep1,
			weight: weight1,
			setsCompleted: done,
			completed: yes
		}
	]
}

The front-end developer can add any number of properties to each exercise/template object, and the db will store them all. 

*/
exports.updateTemplate = function(req,res,callback) {
		var params = {
	  	   TableName: "Users",
	  	   Key:{
	  	       "type": "Templates",
	  	       "email": req.body.email
	  	   }
	  	}

	   docClient.get(params, function(err, data) {
	   	if (err) {
	   	   console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
	   	} else {
	   		var templates = data.Item.info
	   		templates.forEach(function(template, index) {
	   			if(template.id === req.body.template.id) {
	   				templates.splice(index, 1);
	   			}
	   		})
	   		var params = {
	   		   TableName: "Users",
	   		   Key:{
	   		       "type": "Templates",
	   		       "email": req.body.email
	   		   },
	   		   UpdateExpression: "set info = :i",
	   		   ExpressionAttributeValues:{
	   		      ":i":templates,
	   		   },
	   		   ReturnValues:"UPDATED_NEW"
	   		}
	   		docClient.update(params, function(err, data) {

	   			if (err) {
	   			   console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
	   			} else {
	   				console.log("template added")
	   				callback("template added");
	   			}
	   		})	
	   	}
	   })
}





