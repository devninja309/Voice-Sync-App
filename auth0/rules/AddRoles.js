function (user, context, callback) {
    const namespace = 'https://industryacademy.com/';
    const assignedRoles = (context.authorization || {}).roles;
  
    let idTokenClaims = context.idToken || {};
    let accessTokenClaims = context.accessToken || {};
  
    idTokenClaims[`${namespace}/roles`] = assignedRoles;
    accessTokenClaims[`${namespace}/roles`] = assignedRoles;
  
    context.idToken = idTokenClaims;
    context.accessToken = accessTokenClaims;
  
    callback(null, user, context);
  }