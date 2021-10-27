
import { router } from './routes';

const Koa = require('koa');



const app = new Koa();
const router = new Router();

const port = 3001

app.use(async ctx => {
  //ctx.body = 'Hello World';
});


app
  .use(router.routes())
  .use(router.allowedMethods());

console.log('Listening to ' + port)
app.listen(port);