
import Router from 'koa-router';
import jwt from 'koa-jwt';

import {getClip} from './voicesynthapi/WellSaidLabs.js';


//Non-real test endpoints

export function addTests(router) {
    router.post('/testAudio', async (ctx) => {
            const abortController = new AbortController();
            const avatarId = ctx.request.avatarId;
            const text = ctx.request.text;
          
            ctx.request.on('aborted', () => {
              // Graceful end of the TTS stream when a client connection is aborted
              abortController.abort()
            })
        console.log('Request to create test audio');
        console.log(ctx.request);
        console.log(text);
        console.log(avatarId);

       
        ctx.response.body = getClip(avatarId, text, abortController);
  
      })
      router.post('/stream', async (ctx) => {
        const abortController = new AbortController();
        const avatarId = ctx.request.body.avatarId;
        const text = ctx.request.body.text;
      
        req.on('aborted', () => {
          // Graceful end of the TTS stream when a client connection is aborted
          abortController.abort()
        })
      
        /**
         * Should this request fail, make sure to check the response headers
         * to try to find a root cause.
         * 
         * Rate-limiting headers:
         * x-quota-limit: 200
         * x-quota-remaining: 191
         * x-quota-reset: 1622226323630
         * x-rate-limit-limit: 5
         * x-rate-limit-remaining: 4
         * x-rate-limit-reset: 1619635874002
         */
        const ttsResponse = await fetch(ttsEndPoint, {
          signal: abortController.signal,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Api-Key': process.env.WELLSAID_API_KEY,
          },
          body: JSON.stringify({
            speaker_id: avatarId,
            text,
          }),
        });
        
        ctx.res.writeHead(ttsResponse.status, ttsResponse.headers.raw());
        ctx.res.flushHeaders();
      
        ttsResponse.body.pipe(ctx.body)
      });


      return router;
}