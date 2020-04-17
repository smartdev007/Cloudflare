addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  let res = await fetch("https://cfw-takehome.developers.workers.dev/api/variants")
  let data = await res.json()
  let variants = data["variants"]
  let variantNum = Math.random() < 0.5 ? 0 : 1
  
  let variantOne = await fetch(variants[0])
  let variantTwo = await fetch(variants[1])

  // Replace HTML elements
  const rewriter = new HTMLRewriter()
  .on('title', new ElementHandler('Jenish Intern@Cloudflare'))
  .on('h1#title', new ElementHandler('My favourite TV Show/Game'))
  .on('p#description', new ElementHandler(variantsMsg[variantNum]))
  .on('a#url', new ElementHandler('Check out my codepen!', 'href'))

  let COOKIE_NAME = 'url'

  let cookie = request.headers.get('cookie')

  // If cookie exists and matches 0 then return first variant
  if (cookie && cookie.includes(`${COOKIE_NAME}=0`)) {
    return rewriter.transform(variantOne)
  }
  // If cookie exists and matches 1 then return second variant
  else if (cookie && cookie.includes(`${COOKIE_NAME}=1`)) {
    return rewriter.transform(variantTwo)
  }
  // If cookie doesn't exist i.e. user is visiting the client for the first time then create a new cookie and return the random variant
  else {
    let response = (variantNum === 0 ? variantOne : variantTwo)
    response = new Response(response.body, response)
    response.headers.append('Set-Cookie', `${COOKIE_NAME}=${variantNum}; path=/`)
    return rewriter.transform(response)
  }
}

// Handle the HTML elements
class ElementHandler {
  constructor(content, attributeName='') {
    this.content = content;
    this.attributeName = attributeName;
  }

  element(element) {
    const attribute = element.getAttribute(this.attributeName)

    if (attribute) {
      element.setAttribute(
        this.attributeName,
        attribute.replace("https://cloudflare.com", "https://codepen.io/collection/XRVKeJ")
      )
    }

    element.setInnerContent(this.content);
  }
}


//Replace inner content of variant's <p> element with one of the strings
const variantsMsg = [
  'Game: Life Is Strange',
  'TV Show: Westworld'
]