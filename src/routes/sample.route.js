import { Router } from 'express';
import { SampleResponse } from '../controllers/samplke.controller.js';


const routes = new Router();

// Add routes
// routes.get('/', SessionController.store);
// routes.post('/', SessionController.store);
// routes.put('/', SessionController.store);
// routes.delete('/', SessionController.store);

routes.route("/Test").post(SampleResponse)


export default routes
