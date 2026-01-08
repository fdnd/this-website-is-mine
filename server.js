import 'dotenv/config'
import express from 'express'
import { Liquid } from 'liquidjs';

const app = express()
app.use(express.static('public'))
app.use(express.urlencoded({extended: true}))

const engine = new Liquid();
app.engine('liquid', engine.express()); 
app.set('views', './views')

app.get('/', async function (request, response) {

  response.render('index.liquid')

})

app.get('/all', async function (request, response) {

  // Doe een fetch naar de data die je nodig hebt
  const apiResponse = await fetch(process.env.API+'?sort=-date_created')
  const apiResponseJSON = await apiResponse.json()
  // console.log(apiResponseJSON)

  // Render all.liquid uit de Views map met JSON data
  response.render('all.liquid', {
    persons:apiResponseJSON.data
  })

})

app.get('/mywebsite/:id', async function (request, response) {

  // Doe een fetch naar de data die je nodig hebt
  // const my_id = "cfbc1833-8687-47f2-9ae9-13cdb8843bde"
  const siteID = request.params.id
  const apiResponse = await fetch(process.env.API+siteID)
  // console.log(my_id)`
  
  const apiResponseJSON = await apiResponse.json()
  // console.log(apiResponseJSON)

  // Render mywebsite.liquid uit de Views map
  // Geef hier data aan mee
  response.render('mywebsite.liquid', {
    person:apiResponseJSON.data
  })

})

app.post('/savewebsite', async function (request, response) {

  // console.log("post - save my website",request.body)

  try {
    const patchResponse = await fetch(process.env.API+request.body.id, {
    
      method: 'PATCH',
      body: JSON.stringify({
        name: request.body.from,
        title: request.body.title,
        bio: request.body.text,
        style: request.body.code
      }),
      headers: {
        'Content-Type': 'application/json;charset=UTF-8'
      }
  
    })
    
    console.log("STATUS", patchResponse.status)
    if (!patchResponse.ok) {
      throw new Error(`Response status: ${patchResponse.status}`);
    }

    const patchResponseJSON = await patchResponse.json();
    // console.log(patchResponseJSON);

  } catch (error) {
    console.error(error.message);
  }

  
  const siteID = request.body.id
  // const siteID = patchResponseJSON.id

  response.redirect(303, '/mywebsite/'+siteID)

})

app.post('/createwebsite', async function (request, response) {

  const postResponse = await fetch(process.env.API, {

    method: 'POST',
    body: JSON.stringify({
      name: request.body.from,
      title: request.body.title,
      bio: request.body.text,
      style: request.body.code
    }),
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }

  })

  const postResponseJSON = await postResponse.json();
  // console.log(postResponseJSON.data.id);
  const siteID = postResponseJSON.data.id

  response.redirect(303, '/mywebsite/'+siteID)
  
})






// Stel het poortnummer in waar Express op moet gaan luisteren
// Lokaal is dit poort 8000; als deze applicatie ergens gehost wordt, waarschijnlijk poort 80
app.set('port', process.env.PORT || 8000)

// Start Express op, gebruik daarbij het zojuist ingestelde poortnummer op
app.listen(app.get('port'), function () {
  // Toon een bericht in de console
  console.log(`click click click naar: http://localhost:${app.get('port')}/`)
})
