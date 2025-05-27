import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const {
    AZURE_SQL_HOST,
    AZURE_SQL_PORT,
    AZURE_SQL_DATABASE,
    AZURE_SQL_USER,
    AZURE_SQL_PASSWORD
} = process.env;

if (!AZURE_SQL_HOST || !AZURE_SQL_DATABASE || !AZURE_SQL_USER) {
    throw new Error('Azure SQL environment variables are not set in .env');
}

export const sequelize = new Sequelize(
    AZURE_SQL_DATABASE,
    AZURE_SQL_USER,
    AZURE_SQL_PASSWORD,
    {
        host: AZURE_SQL_HOST,
        port: AZURE_SQL_PORT ? parseInt(AZURE_SQL_PORT, 10) : 1433,
        dialect: 'mssql',
        dialectOptions: {
            options: {
                encrypt: true,
                trustServerCertificate: false,
            }
        },
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);
