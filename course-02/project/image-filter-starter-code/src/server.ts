import express from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles} from './util/util';
import {Response,Request} from 'express';
import {requireAuth} from './auth/auth.router'
import {authRouter} from './auth/auth.router'

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // @TODO1 IMPLEMENT A RESTFUL ENDPOINT
  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  // IT SHOULD
  //    1
  //    1. validate the image_url query
  //    2. call filterImageFromURL(image_url) to filter the image
  //    3. send the resulting file in the response
  //    4. deletes any files on the server on finish of the response
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]
  app.get('/filteredimage/', async (req:Request,res:Response)=> {
    let {image_url}: {image_url:string} = req.query;
    if (!image_url) {
      res.status(422)
         .send('please put a valid image_url');
    };
    try{
    let image_path: string = await filterImageFromURL(image_url);
    res.status(200).sendFile(image_path,async ()=> {
      await deleteLocalFiles([image_path]);
    });
    }catch (error){
      console.log('error: ' + error)
      }

  })
  // trying authorization
  app.get('/auth/filteredimage/',requireAuth,
   async (req:Request,res:Response)=> {
    console.log('given access')
    let {image_url}: {image_url:string}  = req.query;
    console.log(image_url)
    if (!image_url) {
      res.status(422)
         .send('please put a valid image_url');
    };
    try{
    let image_path: string = await filterImageFromURL(image_url);
    res.status(200).sendFile(image_path, async ()=>{
      await deleteLocalFiles([image_path]);
    });
    }catch (error){
      console.log('error: ' + error)
    }

  })

  app.use('/',authRouter)

  /**************************************************************************** */

  //! END @TODO1
  
  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req, res ) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();