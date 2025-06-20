'use client';
import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { CopyIcon, Database, DatabaseIcon, Table2Icon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DataGrid, GridRowsProp, GridColDef } from "@mui/x-data-grid";
import {
  GetTables,
} from "./actions";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
// cookies import is for server-side only, remove if not used after refactor
// import { cookies } from "next/headers";
import {
    ConnectionString,
    // We will call these server actions from client event handlers
    // getConnectionStrings, (this will be client-side)
    // getActiveConnectionStringName, (this will be client-side)
    IsDatabaseConnected,
    storeConnectionParameters,
    deleteConnectionString,
    setActiveConnectionStringName,
    getTablesAndRowCounts,
    getColumnsData,
    getRowsData,
} from "./actions";


// Client-side localStorage keys (should match actions.ts but used client-side here)
const CONNECTION_STRINGS_LOCAL_STORAGE_KEY = 'connection_strings';
const ACTIVE_CONNECTION_STRING_NAME_LOCAL_STORAGE_KEY = 'active_connection_string_name';

// Client-side helper to get connection strings from localStorage
const getClientConnectionStrings = (): ConnectionString[] => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(CONNECTION_STRINGS_LOCAL_STORAGE_KEY);
    try {
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error("Error parsing connection strings from localStorage:", e);
      return [];
    }
  }
  return [];
};

// Client-side helper to get active connection string name from localStorage
const getClientActiveConnectionStringName = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(ACTIVE_CONNECTION_STRING_NAME_LOCAL_STORAGE_KEY);
  }
  return null;
};

// Client-side helper to save connection strings to localStorage
const saveClientConnectionStrings = (connectionStrings: ConnectionString[]): void => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(CONNECTION_STRINGS_LOCAL_STORAGE_KEY, JSON.stringify(connectionStrings));
    } catch (e) {
      console.error("Error saving connection strings to localStorage:", e);
    }
  }
};

// Client-side helper to save active connection string name to localStorage
const saveClientActiveConnectionStringName = (name: string | null): void => {
  if (typeof window !== 'undefined') {
    try {
      if (name === null) {
        localStorage.removeItem(ACTIVE_CONNECTION_STRING_NAME_LOCAL_STORAGE_KEY);
      } else {
        localStorage.setItem(ACTIVE_CONNECTION_STRING_NAME_LOCAL_STORAGE_KEY, name);
      }
    } catch (e) {
      console.error("Error saving active connection name to localStorage:", e);
    }
  }
};


export default function StudioPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTable = searchParams.get('table');

  const [connectionStrings, setConnectionStrings] = useState<ConnectionString[]>([]);
  const [activeConnectionStringName, setActiveConnectionNameState] = useState<string | null>(null);
  const [isDbConnected, setIsDbConnected] = useState<boolean | null>(null);
  const [isLoadingDbStatus, setIsLoadingDbStatus] = useState<boolean>(false);

  const [tablesAndRowsCounts, setTablesAndRowsCounts] = useState<Awaited<ReturnType<typeof getTablesAndRowCounts>>>([]);
  const [columnsData, setColumnsData] = useState<Awaited<ReturnType<typeof getColumnsData>>>([]);
  const [rowsData, setRowsData] = useState<Awaited<ReturnType<typeof getRowsData>>>([]);
  const [isLoadingTableData, setIsLoadingTableData] = useState(false);

  const [newConnectionStringInput, setNewConnectionStringInput] = useState('');
  const [newConnectionNameInput, setNewConnectionNameInput] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [isSavingConnection, setIsSavingConnection] = useState(false);
  const [isSwitchingConnection, setIsSwitchingConnection] = useState<string | null>(null); // Store name of connection being switched
  const [isDeletingConnection, setIsDeletingConnection] = useState<string | null>(null); // Store name of connection being deleted

  // Effect to load initial connection data from localStorage
  useEffect(() => {
    const storedConnections = getClientConnectionStrings();
    const storedActiveName = getClientActiveConnectionStringName();
    setConnectionStrings(storedConnections);
    setActiveConnectionNameState(storedActiveName);
  }, []);

  // Effect to check DB status when active connection name changes
  useEffect(() => {
    const activeConnection = connectionStrings.find(cs => cs.name === activeConnectionStringName);
    if (activeConnection) {
      setIsLoadingDbStatus(true);
      IsDatabaseConnected(activeConnection.connection_string).then(status => {
        setIsDbConnected(status);
        setIsLoadingDbStatus(false);
      }).catch(() => {
        setIsDbConnected(false);
        setIsLoadingDbStatus(false);
      });
    } else {
      setIsDbConnected(null);
    }
  }, [activeConnectionStringName, connectionStrings]);

  // Effect to fetch table data when active connection or currentTable changes
  const fetchTableData = useCallback(async () => {
    const activeConnection = connectionStrings.find(cs => cs.name === activeConnectionStringName);
    if (!activeConnection) {
        setTablesAndRowsCounts([]);
        setColumnsData([]);
        setRowsData([]);
        return;
    }
    setIsLoadingTableData(true);
    try {
        const tables = await getTablesAndRowCounts(activeConnection.connection_string);
        setTablesAndRowsCounts(tables);

        if (currentTable) {
            const cols = await getColumnsData(activeConnection.connection_string, currentTable);
            setColumnsData(cols);
            const rData = await getRowsData(activeConnection.connection_string, currentTable);
            setRowsData(rData);
        } else {
            setColumnsData([]);
            setRowsData([]);
        }
    } catch (error) {
        console.error("Error fetching table data:", error);
        setTablesAndRowsCounts([]);
        setColumnsData([]);
        setRowsData([]);
    } finally {
        setIsLoadingTableData(false);
    }
  }, [activeConnectionStringName, currentTable, connectionStrings]);

  useEffect(() => {
    fetchTableData();
  }, [fetchTableData]);

  const handleStoreConnectionString = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSavingConnection(true);

    const newName = newConnectionNameInput;
    const newString = newConnectionStringInput;
    const newCsObject: ConnectionString = { name: newName, connection_string: newString };

    const currentStrings = getClientConnectionStrings();
    const updatedStrings = [...currentStrings.filter(cs => cs.name !== newName), newCsObject];
    saveClientConnectionStrings(updatedStrings);
    saveClientActiveConnectionStringName(newName);

    setConnectionStrings(updatedStrings);
    setActiveConnectionNameState(newName);

    const formData = new FormData(); // Create FormData for server action
    formData.append('connection_name', newName);
    // formData.append('connection_string', newString); // Not strictly needed by server action anymore

    try {
      await storeConnectionParameters(formData); // Server action for revalidation
      setNewConnectionStringInput('');
      setNewConnectionNameInput('');
      setIsDialogOpen(false);
      // router.refresh(); // Revalidation might be enough, or keep for explicit refresh
    } catch (error) {
      console.error("Error calling storeConnectionParameters action:", error);
      alert(`Error saving connection (action): ${error instanceof Error ? error.message : String(error)}`);
      // Potentially revert localStorage changes if server action fails critically
    } finally {
      setIsSavingConnection(false);
    }
  };

  const handleSetActiveConnectionString = async (name: string) => {
    setIsSwitchingConnection(name);
    saveClientActiveConnectionStringName(name); // Update localStorage first
    setActiveConnectionNameState(name); // Update React state

    try {
      await setActiveConnectionStringName(name); // Server action for revalidation
      // router.refresh(); // Revalidation might be enough
    } catch (error) {
      console.error(`Error calling setActiveConnectionStringName action for ${name}:`, error);
      alert(`Error setting active connection (action): ${error instanceof Error ? error.message : String(error)}`);
      // Potentially revert localStorage changes if server action fails
    } finally {
      setIsSwitchingConnection(null);
    }
  };

  const handleDeleteConnectionString = async (name: string) => {
    setIsDeletingConnection(name);

    const currentStrings = getClientConnectionStrings();
    const updatedStrings = currentStrings.filter(cs => cs.name !== name);
    saveClientConnectionStrings(updatedStrings);
    setConnectionStrings(updatedStrings);

    if (activeConnectionStringName === name) {
      saveClientActiveConnectionStringName(null);
      setActiveConnectionNameState(null);
    }

    try {
      await deleteConnectionString(name); // Server action for revalidation
      // router.refresh(); // Revalidation might be enough
    } catch (error) {
      console.error(`Error calling deleteConnectionString action for ${name}:`, error);
      alert(`Error deleting connection (action): ${error instanceof Error ? error.message : String(error)}`);
      // Potentially revert localStorage changes
    } finally {
      setIsDeletingConnection(null);
    }
  };


  // Initial data loading (replacing getServerSideProps-like logic)
  // This is now handled by useEffect(() => { fetchTableData(); }, [fetchTableData]);

  const dbStatusText = isLoadingDbStatus ? "Checking..." : (isDbConnected === null ? "No Active Connection" : (isDbConnected ? "Connected" : "Disconnected"));
  const dbStatusColor = isDbConnected ? "bg-green-400" : "bg-red-400";
  const displayedConnectionName = activeConnectionStringName || "None";

  return (
    <>
      <div className="fixed inset-0 w-[100vw] h-[100vh] p-[30px] gap-[20px] flex">
        {/* Removed dark:bg-[#030711] from Card, it will use themed --card now */}
        <Card className="h-[100%] w-[300px] flex flex-col p-[15px] relative pt-[70px]">
          {/* The py-[10px] class on this div acts as padding for the content within this custom header area. */}
          <div
            className={`flex-col flex justify-center items-center text-card-foreground w-[100%] absolute rounded-t-[var(--radius)] left-0 right-0 font-bold h-fit top-[0px] mx-auto p-3 ${
              isLoadingDbStatus ? "bg-yellow-500/80" : (isDbConnected === null ? "bg-muted/80" : (isDbConnected ? "bg-green-500/80" : "bg-red-500/80"))
            }`}
            // Added backdrop blur to status header as well for consistency if it overlays anything, or just for style.
            // style={{backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)'}}
          >
            <div>{dbStatusText}</div>
            <div className="flex text-xs max-w-[80%] h-fit items-center mt-1">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  {/* Updated background to use theme variables, made it more subtle */}
                  <div className="truncate ... px-[10px] py-[1.5px] bg-secondary/70 hover:bg-secondary rounded-[var(--radius)] font-normal transition-all cursor-pointer">
                    {displayedConnectionName}
                  </div>
                </DialogTrigger>
                {/* DialogContent will use its own styling from dialog.tsx - usually bg-background.
                    If DialogContent itself needs to be glassmorphic, dialog.tsx needs an update.
                    The form and lists inside will be on Dialog's background.
                */}
                <DialogContent className="sm:max-w-[525px]"> {/* Example: Set width for dialog */}
                  <DialogHeader className="pb-4"> {/* Add padding to header bottom */}
                    <DialogTitle>Manage Connections</DialogTitle>
                  </DialogHeader>
                  {/* Saved Connections List */}
                  <div className="my-4">
                    <h3 className="font-semibold mb-2">Saved Connections:</h3>
                    {connectionStrings.length === 0 ? (
                      <p className="text-sm text-gray-500">No saved connections.</p>
                    ) : (
                      <ul className="space-y-2 max-h-40 overflow-y-auto">
                        {connectionStrings.map((cs) => (
                          <li key={cs.name} className={`flex justify-between items-center p-2 rounded ${activeConnectionStringName === cs.name ? 'bg-blue-100 dark:bg-blue-800' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                            <span className="truncate w-full" title={cs.name}>{cs.name} {activeConnectionStringName === cs.name && "(Active)"}</span>
                            <div className="flex gap-1">
                              <Button variant="outline" size="sm" onClick={() => handleSetActiveConnectionString(cs.name)} disabled={activeConnectionStringName === cs.name || isSwitchingConnection === cs.name || isDeletingConnection === cs.name || isSavingConnection}>
                                {isSwitchingConnection === cs.name ? "Selecting..." : "Select"}
                              </Button>
                              <Button variant="destructive" size="sm" onClick={() => handleDeleteConnectionString(cs.name)} disabled={isDeletingConnection === cs.name || isSwitchingConnection === cs.name || isSavingConnection}>
                                {isDeletingConnection === cs.name ? "Deleting..." : "Delete"}
                              </Button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <hr/>
                  {/* Form for New Connection */}
                  {/* <DialogDescription asChild>  Removed asChild, form directly inside DialogContent for better structure */}
                    <form onSubmit={handleStoreConnectionString} className="mt-4 space-y-4">
                      <div>
                        <h3 className="font-semibold">Add New Connection</h3>
                        {/* Database Type Selector - Cards inside dialog. These will be glassmorphic due to card.tsx change. */}
                        <div className="flex gap-[10px] items-center mb-4">
                          <Card className="p-[10px] flex flex-col items-center w-fit h-fit cursor-pointer hover:bg-accent/50">
                            <DatabaseIcon size={18}/>
                            <div className="text-xs mt-1">Mysql</div>
                          </Card>
                           <Card className="p-[10px] flex flex-col items-center w-fit h-fit opacity-50 cursor-not-allowed">
                            <DatabaseIcon size={18}/>
                            <div className="text-xs mt-1">Mongo</div>
                          </Card>
                           <Card className="p-[10px] flex flex-col items-center w-fit h-fit opacity-50 cursor-not-allowed">
                            <DatabaseIcon size={18}/>
                            <div className="text-xs mt-1">Postgres</div>
                          </Card>
                           <Card className="p-[10px] flex flex-col items-center w-[100%] opacity-50 cursor-not-allowed">
                            <div className="text-xs mt-1">More (soon)</div>
                          </Card>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="connection_name_form_input">Connection Name</Label> {/* Ensure CardHeader with p-6 or CardContent is used if padding is desired around this section */}
                        <Input
                          type="text"
                          id="connection_name_form_input" // Changed ID to avoid conflict if Label's htmlFor was "connection_name"
                          name="connection_name"
                          value={newConnectionNameInput}
                          onChange={(e) => setNewConnectionNameInput(e.target.value)}
                          placeholder="My Awesome DB"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="connection_string_form_input">Connection String</Label>
                        <Input
                          type="text"
                          id="connection_string_form_input" // Changed ID
                          name="connection_string"
                          value={newConnectionStringInput}
                          onChange={(e) => setNewConnectionStringInput(e.target.value)}
                          placeholder="mysql://user:pass@host:port/db_name"
                          required
                        />
                      </div>
                      <div className="flex gap-[20px] justify-center">
                        <Button type="submit" disabled={isSavingConnection || isLoadingDbStatus}>
                          {isSavingConnection ? "Saving..." : "Save & Connect"}
                        </Button>
                        {/* Test Connection button can be implemented later */}
                      </div>
                    </form>
                  {/* </DialogDescription> */}
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <div className="grid grid-rows-2 gap-[10px] pt-[10px]">
            <Card className="flex gap-[10px] p-[10px] cursor-pointer opacity-[0.4]">
              <Database />
              <div>
                SQL Runner <sub className="text-xs">(coming soon)</sub>
              </div>
            </Card>
            <Card className="flex gap-[10px] p-[10px] cursor-pointer opacity-[0.4]">
              <Database />
              <div>
                Master Runner <sub className="text-xs">(coming soon)</sub>
              </div>
            </Card>
          </div>
          <div className="py-[40px] px-[5px] h-[100%] flex flex-col relative overflow-hidden gap-[20px]">
            <Input
              type="search"
              placeholder="Search tables"
              className="w-[100%]"
            />
            <div className="py-[10px] flex flex-col gap-[5px] overflow-auto h-[100%] relative">
              {isLoadingTableData && <p>Loading tables...</p>}
              {!isLoadingTableData && tablesAndRowsCounts.map((table) => {
                return (
                  <Link
                    href={{
                      pathname: '/studio',
                      query: {
                        table: table.name,
                      },
                    }}
                    key={table.name}
                    className={`flex p-2.5 relative justify-between cursor-pointer rounded-[var(--radius)] transition-colors ${
                      table.name === currentTable
                        ? "bg-primary/10 text-primary hover:bg-primary/20" // Example: using primary with opacity
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex gap-[10px] items-center">
                      <Table2Icon size={16} />
                      <div>{table.name}</div>
                    </div>
                    <div className="px-[5px] text-xs text-muted-foreground">{table.count}</div>
                  </Link>
                );
              })}
            </div>
          </div>
          {/* Footer area of the sidebar card, p-4 for padding */}
          <div className="mt-auto p-4 border-t border-border/50">
            <div>
              <ThemeToggle />
            </div>
          </div>
        </Card>
        {/* Removed dark:bg-[#030711] from Card, it will use themed --card now */}
        {/* The p-[10px] here acts as the CardContent padding essentially for the DataGrid */}
        <Card className="h-[100%] w-[calc(100%_-_320px)] p-[10px]">
          <DataGrid
            // sx={{
            //   '& .MuiDataGrid-root': {
            //     border: 'none', // Remove default border if needed
            //     backgroundColor: 'transparent', // Make datagrid background transparent
            //   },
            //   '& .MuiDataGrid-columnHeaders': {
            //     // backgroundColor: 'hsl(var(--muted) / 0.5)', // Example for semi-transparent header
            //     // backdropFilter: 'blur(8px)',
            //   },
            //   '& .MuiDataGrid-cell': {
            //     // color: 'hsl(var(--foreground))',
            //   },
            // }}
            checkboxSelection
            rows={rowsData.map((row, i) => {
              if (Object.keys(row).find((p) => p == "id")) {
                return {
                  ...row,
                };
              } else {
                return {
                  ...row,
                  id: i,
                };
              }
            })}
            columns={columnsData.map((column) => { // Use state variable
              return {
                field: column.name,
                headerName: column.name,
                editable: true, // Keep editable, or manage edit state
              };
            })}
          />
        </Card>
      </div>
    </>
  );
}
