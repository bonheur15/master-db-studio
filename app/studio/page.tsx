import React from "react";
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
  IsDatabaseConnected,
  getColumnsData,
  getRowsData,
  getTablesAndRowCounts,
  storeConnectionParameters,
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
import { cookies } from "next/headers";

export default async function page({
  searchParams,
}: {
  searchParams: {
    table?: string;
  };
}) {
  const TablesAndRowsCounts = await getTablesAndRowCounts();
  const ColumnsData = await getColumnsData(searchParams.table);
  const RowsData = await getRowsData(searchParams.table);
  const cookieStore = cookies();
  const isDbConnected = await IsDatabaseConnected();
  return (
    <>
      <div className="fixed inset-0 w-[100vw] h-[100vh] p-[30px] gap-[20px] flex">
        <Card className="h-[100%] w-[300px] flex flex-col dark:bg-[#030711] p-[15px] relative pt-[70px]">
          <div
            className={`py-[10px] flex-col flex justify-center items-center text-white w-[100%] absolute rounded-t-[9px] left-0 right-0 font-bold h-fit top-[0px] mx-auto ${
              isDbConnected ? "bg-green-400" : "bg-red-400"
            }`}
          >
            <div> {isDbConnected ? "Connected" : "Disconnected"}</div>
            <div className="flex text-xs max-w-[80%] h-fit items-center">
              <Dialog>
                <DialogTrigger asChild>
                  <div className="truncate ... px-[10px] py-[5px] bg-[#08080828] rounded-[5px] font-normal hover:bg-[#08080850] transition-all cursor-pointer">
                    {cookieStore.get("connection_string")?.value}
                  </div>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Master Database Studio</DialogTitle>
                    <DialogDescription>
                      <form action={storeConnectionParameters}>
                        <div className="py-[10px]">Choose Database Type</div>
                        <div className="flex gap-[10px] items-center">
                          <Card className="p-[20px] flex flex-col items-center w-fit h-fit cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                            <DatabaseIcon />
                            <div className="">Mysql</div>
                          </Card>
                          <Card className="p-[20px] flex flex-col items-center opacity-[0.5] h-fit cursor-not-allowed">
                            <DatabaseIcon />
                            <div>Mongo</div>
                          </Card>
                          <Card className="p-[20px] flex flex-col items-center opacity-[0.5] h-fit cursor-not-allowed">
                            <DatabaseIcon />
                            <div>Postgres</div>
                          </Card>
                          <Card className="p-[20px] flex flex-col items-center w-[100%] opacity-[0.5] h-fit cursor-not-allowed">
                            <div>More (soon)</div>
                          </Card>
                        </div>
                        <div className="py-[20px]">
                          <div className="grid gap-[15px] w-full items-center ">
                            <Label htmlFor="connection_string">
                              Connection String
                            </Label>
                            <Input
                              type="text"
                              id="connection_string"
                              name="connection_string"
                              defaultValue={
                                cookieStore.get("connection_string")?.value
                              }
                              placeholder="mysql://root:password@localhost:3306/db_test"
                            />
                          </div>
                        </div>
                        <div className="flex gap-[20px] justify-center">
                          <Button type="submit">Connect</Button>
                          <Button variant={"outline"} disabled>
                            Test Connection
                          </Button>
                        </div>
                      </form>
                    </DialogDescription>
                  </DialogHeader>
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
              {TablesAndRowsCounts.map((table) => {
                return (
                  <Link
                    href={{
                      query: {
                        table: table.name,
                      },
                    }}
                    key={table.name}
                    className={`flex p-[10px] relative justify-between cursor-pointer rounded-[5px] ${
                      table.name == searchParams.table
                        ? "dark:bg-gray-900 bg-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700"
                        : "hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    <div className="flex gap-[10px]">
                      <Table2Icon />
                      <div>{table.name}</div>
                    </div>
                    <div className="px-[5px]">{table.count}</div>
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="">
            <div>
              <ThemeToggle />
            </div>
          </div>
        </Card>
        <Card className="h-[100%] w-[calc(100%_-_320px)] dark:bg-[#030711] p-[10px]">
          <DataGrid
            checkboxSelection
            rows={RowsData.map((row, i) => {
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
            columns={ColumnsData.map((column) => {
              return {
                field: column.name,
                headerName: column.name,
                editable: true,
              };
            })}
          />
        </Card>
      </div>
    </>
  );
}
