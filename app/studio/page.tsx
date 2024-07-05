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
import { Database, Table2Icon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DataGrid, GridRowsProp, GridColDef } from "@mui/x-data-grid";
import {
  GetTables,
  getColumnsData,
  getRowsData,
  getTablesAndRowCounts,
} from "./actions";
import Link from "next/link";

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
  return (
    <>
      <div className="fixed inset-0 w-[100vw] h-[100vh] p-[30px] gap-[20px] flex">
        <Card className="h-[100%] w-[300px] flex flex-col dark:bg-[#030711] p-[15px]">
          <div className="grid grid-rows-2 gap-[10px]">
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
            // getRowId={(row) => {
            //   return RowsData[0][Object.keys(RowsData[0])[0].toString()];
            // }}
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
