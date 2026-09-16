import express from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles} from './util/util.js';

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

    app.get('/filteredimage', async (req, res) => {
  const imageUrl = req.query.image_url;

  console.log('URL:', imageUrl);

  // 1. Validate image_url
  if (!imageUrl) {
    return res.status(400).send({
      message: 'image_url query parameter is required'
    });
  }

  try {
    // 2. Filter image
    const filteredPath = await filterImageFromURL(imageUrl);

    // 4. Delete file after response finishes
    res.on('finish', () => {
      deleteLocalFiles([filteredPath]);
    });

    // 3. Send filtered image
    return res.sendFile(filteredPath);

  } catch (error) {
      console.error(error);

    return res.status(422).send({
      message: error.message
    });
  }
});
  
  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async (req, res) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
