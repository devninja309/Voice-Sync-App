//This should be added as a rule to the Auth0 platform to ensure that the email is included so that the backend can get the username (i.e. email) for logging

function addEmailToAccessToken(user, context, callback) {
    // This rule adds the authenticated user's email address to the access token.
  
    context.accessToken['email'] = user.email;
    return callback(null, user, context);
  }