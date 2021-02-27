const { loadNuxt, build } = require("nuxt");

const FAKE_DOMAIN = 'http://localhost/';

async function handler(event) {
  const nuxt = await loadNuxt('start');

  const route = new URL(event.path,FAKE_DOMAIN);

  Object.keys(event.queryStringParameters).forEach((e) => {
    route.searchParams.append(e, event.queryStringParameters[e]);
  });
  const {html, error, redirected} = await nuxt.renderRoute(route.href.slice(FAKE_DOMAIN.length-1));
  if(error){
    return {
      statusCode: error.statusCode,
      body: error.message,
    }
  }
  if(redirected){
    const location = new URL(redirected.path, FAKE_DOMAIN);
    Object.keys(redirected.query).forEach((e)=>{
      location.searchParams.append(e, redirected.query[e])
    })
    return {
      statusCode: redirected.status,
      headers:{
        location: location.href.slice(FAKE_DOMAIN.length-1),
      }
    }
  }

  return {
    statusCode:200,
    headers:{
      contentType:'text/html',
    },
    body:html,
  }
}

exports.handler = handler;
