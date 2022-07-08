


submitqueuelambda is the deployed lambda file for the audio generation queue.  It sets up the queue, as well as the lambda that processes it.  

There are a number of customizations currently not represented in the deployment.

Lambda needs to be running Node16.x in order to use the new AbortController stuff
Lambda needs to be configured to have a batch size and delay of 1
Lambda needs to be added to the VPC and the private subnet.

This stuff needs to be checked every time you do an update.

