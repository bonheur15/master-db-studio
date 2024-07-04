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

const rows: GridRowsProp = [
  {
    id: 1,
    col1: "72db33e0-7bf8-4de0-8299-c9072202434f",
    col2: "bonheur15",
    col3: "rumanzibonheur@gmail.com",
    col4: null,
    col5: "https://www.google.com",
  },
  {
    id: 2,
    col1: "ydfsf3e0-7bf8-4de0-sdf9-c9dfsf2434yf",
    col2: "bonheur16",
    col3: "rumanzibonheur@gmail.com",
    col4: null,
    col5: "https://www.google.com",
  },
  {
    id: 3,
    col1: "dfdsf-7sdhfhsffsfdfd0-c9072202434fff",
    col2: "bonheur17",
    col3: "rumanzibonheur@gmail.com",
    col4: null,
    col5: "https://www.google.com",
  },
];

const columns: GridColDef[] = [
  { field: "col1", headerName: "id", width: 150, editable: true },
  { field: "col2", headerName: "name", width: 150, editable: true },
  {
    field: "col3",
    headerName: "email",
    width: 150,
    editable: true,
  },
  {
    field: "col4",
    headerName: "emailVerified",
    width: 150,
    editable: true,
  },
  {
    field: "col5",
    headerName: "image",
    width: 150,
    editable: true,
  },
];

export default function page() {
  return (
    <>
      <div className="fixed inset-0 w-[100vw] h-[100vh] p-[30px] gap-[20px] flex">
        <Card className="h-[100%] w-[300px] flex flex-col dark:bg-[#030711] p-[15px]">
          <div className="grid grid-rows-2 gap-[10px]">
            <Card className="flex gap-[10px] p-[10px] cursor-pointer">
              <Database />
              <div>SQL Runner</div>
            </Card>
            <Card className="flex gap-[10px] p-[10px] cursor-pointer opacity-[0.4]">
              <Database />
              <div>
                Master runner <sub className="text-xs">(coming soon)</sub>
              </div>
            </Card>
          </div>
          <div className="py-[40px] h-[100%]">
            <Input
              type="search"
              placeholder="Search tables"
              className="w-[100%]"
            />
            <div className="py-[10px] flex flex-col gap-[5px]">
              <div className="flex p-[10px] justify-between cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 rounded-[5px]">
                <div className="flex gap-[10px]">
                  <Table2Icon />
                  <div>account</div>
                </div>
                <div className="px-[5px]">5</div>
              </div>
              <div className="flex p-[10px] justify-between cursor-pointer dark:bg-gray-900 bg-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-[5px]">
                <div className="flex gap-[10px]">
                  <Table2Icon />
                  <div>user</div>
                </div>
                <div className="px-[5px]">5</div>
              </div>
              <div className="flex p-[10px] justify-between cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 rounded-[5px]">
                <div className="flex gap-[10px]">
                  <Table2Icon />
                  <div>sessions</div>
                </div>
                <div className="px-[5px]">5</div>
              </div>
              <div className="flex p-[10px] justify-between cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 rounded-[5px]">
                <div className="flex gap-[10px]">
                  <Table2Icon />
                  <div>authenticator</div>
                </div>
                <div className="px-[5px]">1</div>
              </div>
              <div className="flex p-[10px] justify-between cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 rounded-[5px]">
                <div className="flex gap-[10px]">
                  <Table2Icon />
                  <div>countries</div>
                </div>
                <div className="px-[5px]">5</div>
              </div>
              <div className="flex p-[10px] justify-between cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 rounded-[5px]">
                <div className="flex gap-[10px]">
                  <Table2Icon />
                  <div>cities</div>
                </div>
                <div className="px-[5px]">20</div>
              </div>
            </div>
          </div>
          <div className="">
            <div>
              <ThemeToggle />
            </div>
          </div>
        </Card>
        <Card className="h-[100%] w-[calc(100%_-_320px)] dark:bg-[#030711] p-[10px]">
          <DataGrid checkboxSelection rows={rows} columns={columns} />
        </Card>
      </div>
    </>
  );
}
