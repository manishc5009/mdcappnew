import express from 'express';
import OrganizationController from '../controllers/organizationController.js';

const router = express.Router();
const organizationController = new OrganizationController();

// Define routes for organizations
router.post('/', organizationController.createOrganization.bind(organizationController));
router.get('/', organizationController.listOrganizations.bind(organizationController));
router.get('/:id', organizationController.getOrganization.bind(organizationController));
router.put('/:id', organizationController.updateOrganization.bind(organizationController));
router.delete('/:id', organizationController.deleteOrganization.bind(organizationController));

export default router;
