import Organization from '../models/organization.js';

class OrganizationController {
    constructor(organizationModel = Organization) {
        this.organizationModel = organizationModel;
    }

    async createOrganization(req, res) {
        try {
            const organizationData = req.body;
            const newOrganization = await this.organizationModel.create(organizationData);
            res.status(201).json(newOrganization);
        } catch (error) {
            res.status(500).json({ message: 'Error creating organization', error });
        }
    }

    async getOrganization(req, res) {
        try {
            const { id } = req.params;
            const organization = await this.organizationModel.findByPk(id);
            if (!organization) {
                return res.status(404).json({ message: 'Organization not found' });
            }
            res.status(200).json(organization);
        } catch (error) {
            res.status(500).json({ message: 'Error retrieving organization', error });
        }
    }

    async updateOrganization(req, res) {
        try {
            const { id } = req.params;
            const organizationData = req.body;
            const organization = await this.organizationModel.findByPk(id);
            if (!organization) {
                return res.status(404).json({ message: 'Organization not found' });
            }
            await organization.update(organizationData);
            res.status(200).json(organization);
        } catch (error) {
            res.status(500).json({ message: 'Error updating organization', error });
        }
    }

    async deleteOrganization(req, res) {
        try {
            const { id } = req.params;
            const organization = await this.organizationModel.findByPk(id);
            if (!organization) {
                return res.status(404).json({ message: 'Organization not found' });
            }
            await organization.destroy();
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ message: 'Error deleting organization', error });
        }
    }

    async listOrganizations(req, res) {
        try {
            const organizations = await this.organizationModel.findAll();
            res.status(200).json(organizations);
        } catch (error) {
            res.status(500).json({ message: 'Error retrieving organizations', error });
        }
    }
}

export default OrganizationController;
