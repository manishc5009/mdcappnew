import { sequelize } from './sequelize.js';
import User from '../models/user.js';
import AuthToken from '../models/authToken.js';
import Organization from '../models/organization.js';
import UserOrganization from '../models/userOrganization.js';
import Notebook from '../models/notebook.js';

const models = {
    User,
    AuthToken,
    Organization,
    UserOrganization,
    Notebook
};

Object.values(models)
    .filter(model => typeof model.associate === 'function')
    .forEach(model => model.associate(models));

async function connect() {
    try {
        await sequelize.authenticate();
        await sequelize.sync();
        console.log('Database connected and synced successfully');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        throw error;
    }
}

async function testConnection() {
    try {
        console.log('Testing database connection...');
        await connect();
        const [result] = await sequelize.query('SELECT 1 as test');
        console.log('✅ Database connection test successful');
        console.log('Query result:', result);
        return true;
    } catch (error) {
        console.error('❌ Database connection test failed:', error.message);
        return false;
    }
}

export {
    sequelize,
    User,
    AuthToken,
    Organization,
    UserOrganization,
    Notebook,
    connect,
    testConnection
};
