const mysql = require('mysql2/promise');

async function cleanupSolanaColumns() {
    let connection;
    try {
        // Create connection to the database
        connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '123456',
            database: 'ecommerce_db'
        });

        console.log('Connected to database');

        // Check current columns
        const [columns] = await connection.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = 'ecommerce_db' 
            AND TABLE_NAME = 'Orders' 
            AND COLUMN_NAME LIKE '%solana%'
        `);

        console.log('Current Solana-related columns:');
        columns.forEach(col => console.log('- ' + col.COLUMN_NAME));

        // Drop the camelCase columns we added manually (keep the snake_case ones)
        try {
            await connection.query(`
                ALTER TABLE Orders 
                DROP COLUMN solanaSignature
            `);
            console.log('Dropped solanaSignature column');
        } catch (error) {
            console.log('solanaSignature column does not exist or already dropped');
        }

        try {
            await connection.query(`
                ALTER TABLE Orders 
                DROP COLUMN solanaReference
            `);
            console.log('Dropped solanaReference column');
        } catch (error) {
            console.log('solanaReference column does not exist or already dropped');
        }

        // Rename the existing snake_case columns to match our model
        try {
            await connection.query(`
                ALTER TABLE Orders 
                CHANGE COLUMN solana_transaction_signature solana_signature VARCHAR(255)
            `);
            console.log('Renamed solana_transaction_signature to solana_signature');
        } catch (error) {
            console.log('Column rename failed or already correct:', error.message);
        }

        // Check final columns
        const [finalColumns] = await connection.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = 'ecommerce_db' 
            AND TABLE_NAME = 'Orders' 
            AND COLUMN_NAME LIKE '%solana%'
        `);

        console.log('Final Solana-related columns:');
        finalColumns.forEach(col => console.log('- ' + col.COLUMN_NAME));

        console.log('Cleanup completed successfully');

    } catch (error) {
        console.error('Error during cleanup:', error);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Run if this file is run directly
if (require.main === module) {
    cleanupSolanaColumns()
        .then(() => {
            console.log('Cleanup script completed');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Cleanup script failed:', error);
            process.exit(1);
        });
}

module.exports = cleanupSolanaColumns;
