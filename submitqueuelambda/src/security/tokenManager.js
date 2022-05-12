// This is where all the Auth0 Token Management stuff lives, decoders, etc
//TODO move all the config items to the .env file
import jwt from 'koa-jwt';
import jwks from 'jwks-rsa';

export function GetJWTCheck(){
  const secret = jwks.koaJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: 'https://dev-l3ao-nin.us.auth0.com/.well-known/jwks.json'
})
var jwtCheck = jwt({
    secret: secret,
  passthrough: true,
});

let retFunc = (ctx, next) => {
  return jwtCheck(ctx, next);
}
return retFunc
}
