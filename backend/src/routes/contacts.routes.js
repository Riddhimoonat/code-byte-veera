import { Router } from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import { getContacts, addContact, deleteContact } from '../controller/contacts.controller.js';

const router = Router();

router.use(authMiddleware); // all contact routes need auth

router.get('/', getContacts);
router.post('/', addContact);
router.delete('/:id', deleteContact);

export default router;
