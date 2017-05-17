Direction for using DynamoDB

Download DynamoDB for use
Move DynamoDBLocal.jar to DB folder of application.
Extract Dynamo jar file to application directory using jar xf DynamoDBLocal.jar 
Run DynamoDB using java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -sharedDb -inMemory on the directory extracted at.
