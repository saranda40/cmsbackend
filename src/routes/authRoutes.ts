import { Router } from 'express'; // Importa el Router
import { registerUser, loginUser } from '../controllers/authController';

const router = Router(); // Crea una instancia de Router
router.post('/auth/register', registerUser); 
router.post('/auth/login', loginUser);

export default router; // Exporta la instancia del Router