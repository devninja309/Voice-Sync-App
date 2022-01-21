import serverless from 'serverless-http'
import app from './app.js'

const handler = serverless(app,{
  binary: ['audio/mpeg']
})

// Lambda can't consume ES6 exports
module.exports.handler = async (evt, ctx) => {
  ctx.callbackWaitsForEmptyEventLoop = false; 
  console.log('Request');
  console.log(evt)
  
  //return evt; //I return whatever is passed in when the lambda is called straight.

  //evt.path = evt.path.substr(3) //This was this issue.

  const res = await handler(evt, ctx)

  console.log('Response')
  console.log(res)

  return res
}
