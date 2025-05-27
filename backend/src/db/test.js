import sql from 'mssql';
import { DefaultAzureCredential } from '@azure/identity';

async function connectToAzureSql() {
  const credential = new DefaultAzureCredential();

  // Replace with your actual SQL Server host
  const serverName = 'c5imdc.database.windows.net';

  // Get access token for Azure SQL
  const accessTokenResponse = await credential.getToken('https://database.windows.net/');
  const accessToken = accessTokenResponse.token;

  const config = {
    server: serverName,
    database: 'c5imdcdb',
    port: 1433,
    options: {
      encrypt: true,
      trustServerCertificate: false,
    },
    authentication: {
      type: 'azure-active-directory-access-token',
      options: {
        token: accessToken,
      },
    },
  };

  try {
    const pool = await sql.connect(config);
    console.log('✅ Connected to Azure SQL Database');

    // Example query
    const result = await pool.request().query('SELECT TOP 1 * FROM YourTableName');
    console.log(result.recordset);

    await pool.close();
  } catch (err) {
    console.error('❌ SQL Connection Error:', err);
  }
}

connectToAzureSql();
