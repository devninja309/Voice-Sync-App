import serverless from 'serverless-http'
import app from './app.js'

const handler = serverless(app,{
  binary: ['audio/mpeg']
})

// Lambda can't consume ES6 exports
module.exports.handler = async (evt, ctx) => {
  ctx.callbackWaitsForEmptyEventLoop = false; 

  try 
  {
    const res = await handler(evt, ctx)
    return res
  }
  catch (e)
  {
    console.log('Top level Lambda failure')
    console.log(e);
  }

}
