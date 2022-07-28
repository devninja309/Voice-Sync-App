Overview
    VoiceSynth is a SPA app runnig primarly React on the frontend and Node 14 on the backend.  It's intended to be deployed to aws.  
    See GettingStarted.txt for installation instructions

CodeBase Overview
    aws contains external build files for deploying to aws
        aws\db\Scripts is where the db create script is
    backend is the API layer. index.js is the start, but lambda-index.js is wrapping that for AWS.
Getting Started
    run npm install / update in both frontend and backend.
    make sure you've got node 14 installed and set as the default.
    you'll need to set up a local MySQL DB to run as.  The create script in aws\db\scripts should get you started.

Local Build
    NPM start in both directories will get you running.

Deploying
    DB -> In aws\db run make deploy.  SQL updates are currently manual
    Backend -> Run make deploy
    Frontend -> in aws\hosting run make deploy for the setup of S3.
        code updates are currently TBD, but it's something like yarn build and then copying the files up manually.  TODO build a make file for that, I guess?

AWS Customizations:
Because of the way the AWS security works, the Lambda(backend) needs to be in the same subnet as the S3 bucket AND on a private subnet connected
to a public one via the NAT : https://aws.amazon.com/premiumsupport/knowledge-center/internet-access-lambda-function/
This isn't something that's set up in the YAML atm, so if you change the stack, you'll need to add it back in, or the database won't work.

Cloudfront :
We're using Legacy Cache settings.  for headers : Add Header: 'Authorization'
Response headers should be cors with preflight and security headers policy


