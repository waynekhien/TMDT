const mysql = require('mysql2/promise');

async function addSolanaColumns() {
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

        // Check if columns already exist
        const [columns] = await connection.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = 'ecommerce_db' 
            AND TABLE_NAME = 'Orders' 
            AND COLUMN_NAME IN ('solanaSignature', 'solanaReference')
        `);

        const existingColumns = columns.map(col => col.COLUMN_NAME);
        
        // Add solanaSignature column if it doesn't exist
        if (!existingColumns.includes('solanaSignature')) {
            await connection.query(`
                ALTER TABLE Orders 
                ADD COLUMN solanaSignature VARCHAR(255) NULL
            `);
            console.log('Added solanaSignature column');
        } else {
            console.log('solanaSignature column already exists');
        }

        // Add solanaReference column if it doesn't exist
        if (!existingColumns.includes('solanaReference')) {
            await connection.query(`
                ALTER TABLE Orders 
                ADD COLUMN solanaReference VARCHAR(255) NULL
            `);
            console.log('Added solanaReference column');
        } else {
            console.log('solanaReference column already exists');
        }

        console.log('Migration completed successfully');

    } catch (error) {
        console.error('Error during migration:', error);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Run if this file is run directly
if (require.main === module) {
    addSolanaColumns()
        .then(() => {
            console.log('Migration script completed');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Migration script failed:', error);
            process.exit(1);
        });
}

module.exports = addSolanaColumns;
