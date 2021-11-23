import serverless from 'serverless-http'
import app from './app.js'

const handler = serverless(app)

// Lambda can't consume ES6 exports
module.exports.handler = async (evt, ctx) => {
  console.log(evt)

  evt.path = evt.path.substr(3)

  const res = await handler(evt, ctx)

  console.log(res)

  return res
}
