import express from 'express';
import bodyParser from 'body-parser';
import { filterImageFromURL, deleteLocalFiles } from './util/util';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;

  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  app.get("/filteredimage", async (req, res) => {
    let image_url = req.query.image_url as string;

    if (!checkUrl(image_url )) {
      return res.status(400).send({ error: 'wrong url!' })
    }

    if (!checkImage(image_url)) {
      return res.status(422).send({ error: 'not an image - must be jpg or png!' })
    }

    try {
      const img = await filterImageFromURL(image_url)
      return res.sendFile(img, async () => {
        await deleteLocalFiles([img])
      })
    } catch (e) {
      return res.status(422).send({ error: 'image_url could not be processed' })
    }
  });

  // Root Endpoint
  // Displays a simple message to the user
  app.get("/", async (req, res) => {
    res.send("try GET /filteredimage?image_url={{}}")
  });


  // Start the Server
  const server = app.listen(port, () => {
    console.log(`server running http://localhost:${port}`);
    console.log(`press CTRL+C to stop server`);
  });

  // check the image file extension 
  const checkImage = (imageUrl: string) => {
    return imageUrl.match(/\.(jpeg|jpg|png)$/);
  }

  const checkUrl = (imageUrl: string) => {
    // source https://www.regextester.com/98055
    return imageUrl.match(/(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/);
  }

  
  module.exports = server
})();


