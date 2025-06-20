"use server";


import mysql from 'mysql2/promise';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

export interface ConnectionString {
  name: string;
  connection_string: string;
}

// Removed all direct localStorage manipulation functions:
// saveConnectionStrings, getConnectionStrings, getActiveConnectionStringName, setActiveConnectionStringName (server-side versions)
// These are now handled client-side in page.tsx.

// This object might be used for default DB name extraction if not present in URI.
// const connectionParameters = {
//     host: "mysql-superhost.alwaysdata.net",
//     password: "ggds55sds3x",
//     username: "superhost_photos",
//     databaseType: "mysql",
//     databaseName: "superhost_photos"
// };
const connectionParameters = {
    host: "localhostD",
    password: "",
    username: "root",
    databaseType: "mysql",
    databaseName: "testdb1"
};

// The global 'connection' variable is removed. Connection management will be per-function or per-request.

// Server action, primarily for revalidation. Client handles actual localStorage update.
export async function setActiveConnectionStringName(name: string): Promise<void> {
  'use server';
  console.log(`Server Action: setActiveConnectionStringName called for ${name}. Revalidating /studio.`);
  revalidatePath("/studio");
}

// Server action, primarily for revalidation. Client handles actual localStorage update.
export async function deleteConnectionString(name: string): Promise<void> {
  'use server';
  console.log(`Server Action: deleteConnectionString called for ${name}. Revalidating /studio.`);
  // In a real scenario, if there were server-side resources tied to this name,
  // they would be cleaned up here.
  revalidatePath("/studio");
}

export async function getConnection(connectionString?: string, name?: string): Promise<mysql.Connection | null> {
  'use server';
  let connectionStringValue: string | undefined | null = connectionString;
  const connectionIdentifier = name || 'Unnamed Connection';

  if (!connectionStringValue) {
    // Fallback to cookie if no direct connectionString is provided
    const cookieCs = cookies().get('connection_string');
    if (cookieCs && cookieCs.value) {
      connectionStringValue = cookieCs.value;
      console.log(`getConnection: Using connection string from cookie for ${connectionIdentifier}.`);
    } else {
      console.log(`getConnection: No connection string provided or found in cookies for ${connectionIdentifier}.`);
      return null;
    }
  }

  try {
    const newConnection = await mysql.createConnection(connectionStringValue);
    console.log(`数据库连接成功: ${connectionIdentifier}`);
    return newConnection;
  } catch (error) {
    console.error(`数据库连接失败 (${connectionIdentifier}):`, error);
    return null;
  }
}

export async function closeConnection(connectionToClose: mysql.Connection | null): Promise<void> { // This helper remains useful
    if (connectionToClose) {
        try {
            await connectionToClose.end();
            console.log("数据库连接已关闭。");
        } catch (error) {
            console.error("关闭数据库连接时出错:", error);
        }
    }
}


// export async function GetTables() {
//     // let connection = await mysql.createConnection({
//     //     host: connectionParameters.host,
//     //     user: connectionParameters.username,
//     //     password: connectionParameters.password,
//     //     database: connectionParameters.databaseName
//     // });
//     return ((await connection.query('SHOW TABLES'))[0] as any).map((item: { [x: string]: any; }) => {
//         return item['Tables_in_' + connectionParameters.databaseName]
//     })
// }

export async function GetTables(connectionString: string): Promise<string[]> {
    const connection = await getConnection(connectionString, "GetTables");
    if (!connection) return [];

    let dbName = connectionParameters.databaseName; // Default/fallback
    if (connection.config?.database) {
        dbName = connection.config.database;
    } else if (connection.config?.uri) { // Attempt to parse from URI
        const match = connection.config.uri.match(/\/([^?]+)(\?|$)/); // Ensure parsing stops at query string
        if (match && match[1]) dbName = decodeURIComponent(match[1]);
    }

    try {
        const [tables]: [any[], any] = await connection.query('SHOW TABLES');
        return tables.map((item: { [x: string]: any; }) => item[`Tables_in_${dbName}`]);
    } catch (error) {
        console.error("Error fetching tables:", error);
        return [];
    } finally {
        if (connection) await closeConnection(connection);
    }
}
interface TableRowCount {
    name: string;
    count: number;
}
export async function getTablesAndRowCounts(connectionString: string): Promise<TableRowCount[]> {
    const connection = await getConnection(connectionString, "getTablesAndRowCounts");
    if (!connection) return [];
    const result: TableRowCount[] = [];

    let dbName = connectionParameters.databaseName; // Default/fallback
    if (connection.config?.database) {
        dbName = connection.config.database;
    } else if (connection.config?.uri) { // Attempt to parse from URI
        const match = connection.config.uri.match(/\/([^?]+)(\?|$)/); // Ensure parsing stops at query string
        if (match && match[1]) dbName = decodeURIComponent(match[1]);
    }

    try {
        const [tables]: [any[], any] = await connection.query("SHOW TABLES");
        const tableNames: string[] = tables.map(row => row[`Tables_in_${dbName}`]) as string[];
        for (const tableName of tableNames) {
            const [rows]: [any[], any] = await connection.query(`SELECT COUNT(*) AS count FROM \`${tableName}\``);
            result.push({
                count: rows[0].count,
                name: tableName,
            });
        }
        return result;
    } catch (error) {
        console.error("Error fetching table information:", error);
        return result;
    } finally {
        if (connection) await closeConnection(connection);
    }
}

interface ColumnInfo {
    name: string;
    type: string;
    length: number | null;
    nullable: boolean;
    key: string;
    default: string | null;
    extra: string;
}

export async function getColumnsData(connectionString: string, tableName?: string): Promise<ColumnInfo[]> {
    if (!tableName) {
        console.warn("getColumnsData called without tableName");
        return [];
    }
    if (!connectionString) {
        console.warn("getColumnsData called without connectionString");
        return [];
    }
    const connection = await getConnection(connectionString, `getColumnsData for ${tableName}`);
    if (!connection) return [];
    try {
        const [columns]: [any[], any] = await connection.query(`SHOW COLUMNS FROM \`${tableName}\``);
        return columns.map(column => {
            const match = column.Type.match(/(\w+)(?:\((\d+)\))?/);
            const type = match ? match[1] : column.Type;
            const length = match && match[2] ? parseInt(match[2], 10) : null;
            return {
                name: column.Field,
                type: type,
                length: length,
                nullable: column.Null === 'YES',
                key: column.Key,
                default: column.Default,
                extra: column.Extra
            };
        });
    } catch (error) {
        console.error(`Error fetching column names for table ${tableName}:`, error);
        return [];
    } finally {
        if (connection) await closeConnection(connection);
    }
}

interface RowData {
    [columnName: string]: any;
}

export async function getRowsData(connectionString: string, tableName?: string): Promise<RowData[]> {
    if (!tableName) {
        console.warn("getRowsData called without tableName");
        return [];
    }
     if (!connectionString) {
        console.warn("getRowsData called without connectionString");
        return [];
    }
    const connection = await getConnection(connectionString, `getRowsData for ${tableName}`);
    if (!connection) return [];
    try {
        const [rows]: [any[], any] = await connection.query(`SELECT * FROM \`${tableName}\``);
        return rows as RowData[];
    } catch (error) {
        console.error(`Error fetching data for table ${tableName}:`, error);
        return [];
    } finally {
        if (connection) await closeConnection(connection);
    }
}

// Server action, primarily for revalidation. Client handles actual localStorage update.
export async function storeConnectionParameters(formData: FormData): Promise<void> {
  'use server';
  const connection_name = formData.get('connection_name') as string;
  // const connection_string = formData.get('connection_string') as string; // No longer needed server-side for saving
  console.log(`Server Action: storeConnectionParameters called for ${connection_name}. Revalidating /studio.`);
  revalidatePath("/studio");
}

export async function IsDatabaseConnected(connectionString?: string): Promise<boolean> {
  'use server';
  if (!connectionString) {
    console.warn("IsDatabaseConnected called without a connectionString.");
    return false;
  }
  const conn = await getConnection(connectionString, "IsDatabaseConnected Check"); // Explicit name for check
  if (!conn) {
    return false;
  }
  try {
    await conn.ping();
    return true;
  } catch (error) {
    // console.error("IsDatabaseConnected: Ping failed", error); // getConnection already logs connection errors
    return false;
  } finally {
    if (conn) {
      await closeConnection(conn);
    }
  }
}