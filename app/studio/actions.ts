"use server";


import mysql from 'mysql2/promise';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

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

let connection: mysql.Connection | null = null;

export async function getConnection(): Promise<mysql.Connection | null> {
    const cookieStore = cookies();
    if (!connection) {
        try {
            connection = await mysql.createConnection({
                uri: cookieStore.get("connection_string")?.value
            });
        } catch (error) {
            return null;
        }

    }
    return connection;
}

export async function closeConnection(): Promise<void> {
    if (connection) {
        await connection.end();
        connection = null;
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

export async function GetTables(): Promise<string[]> {

    const connection = await getConnection();
    if (!connection) return [];
    const [tables]: [any[], any] = await connection.query('SHOW TABLES');
    return tables.map((item: { [x: string]: any; }) => item['Tables_in_' + connectionParameters.databaseName]);


}
interface TableRowCount {
    name: string;
    count: number;
}
export async function getTablesAndRowCounts(): Promise<TableRowCount[]> {
    const connection = await getConnection();
    if (!connection) return [];
    const result: TableRowCount[] = [];

    try {
        const [tables]: [any[], any] = await connection.query("SHOW TABLES");
        const tableNames: string[] = tables.map(row => Object.values(row)[0]) as string[];
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

export async function getColumnsData(tableName?: string): Promise<ColumnInfo[]> {
    const connection = await getConnection();
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
    }
}

interface RowData {
    [columnName: string]: any;
}

export async function getRowsData(tableName?: string): Promise<RowData[]> {
    const connection = await getConnection();
    if (!connection) return [];
    try {
        const [rows]: [any[], any] = await connection.query(`SELECT * FROM \`${tableName}\``);
        return rows as RowData[];
    } catch (error) {
        console.error(`Error fetching data for table ${tableName}:`, error);
        return [];
    }
}
export async function storeConnectionParameters(formData: FormData) {
    const cookieStore = cookies();
    cookieStore.set({ name: "connection_string", value: formData.get("connection_string")?.toString() ?? "" });
    closeConnection();
    revalidatePath("/studio");
}
export async function IsDatabaseConnected() {
    const connection = await getConnection();
    if (connection) {
        return true;
    }
    return false;
}