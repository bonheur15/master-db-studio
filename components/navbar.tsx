"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { ThemeToggle } from "./theme-toggle";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <header className={`flex w-full items-center bg-white dark:bg-dark`}>
        <div className="container">
          <div className="relative -mx-4 flex items-center justify-between">
            <div className="w-60 max-w-full px-4">
              <a href="/#" className="block w-full py-5">
                <img src="/logo.png" alt="logo" className="dark:hidden" />
                <img
                  src="/logo.png"
                  alt="logo"
                  className="hidden dark:block invert"
                />
              </a>
            </div>
            <div className="flex w-full items-center justify-between px-4">
              <div>
                <button
                  onClick={() => setOpen(!open)}
                  id="navbarToggler"
                  className={` ${
                    open && "navbarTogglerActive"
                  } absolute right-12 top-1/2 block -translate-y-1/2 rounded-lg px-3 py-[6px] ring-primary focus:ring-2 lg:hidden`}
                >
                  <span className="relative my-[6px] block h-[2px] w-[30px] bg-body-color dark:bg-white"></span>
                  <span className="relative my-[6px] block h-[2px] w-[30px] bg-body-color dark:bg-white"></span>
                  <span className="relative my-[6px] block h-[2px] w-[30px] bg-body-color dark:bg-white"></span>
                </button>
                <nav
                  // :className="!navbarOpen && 'hidden' "
                  id="navbarCollapse"
                  className={`absolute right-4 top-full w-full max-w-[250px] rounded-lg bg-white px-6 py-5 shadow dark:bg-dark-2 lg:static lg:block lg:w-full lg:max-w-full lg:shadow-none lg:dark:bg-transparent ${
                    !open && "hidden"
                  } `}
                >
                  <ul className="block lg:flex">
                    <ListItem NavLink="/#">Home</ListItem>
                    <ListItem NavLink="/#">Payment</ListItem>
                    <ListItem NavLink="/#">About</ListItem>
                    <ListItem NavLink="/#">Blog</ListItem>
                  </ul>
                </nav>
              </div>
              <div className="hidden justify-end pr-16 sm:flex lg:pr-0 gap-[20px]">
                <Button
                  variant={"outline"}
                  className="px-7 py-3 text-base font-medium"
                >
                  Sign in
                </Button>

                <Button className="rounded-md  px-7 py-3 text-base font-medium">
                  Sign Up
                </Button>
              </div>
            </div>
            <div>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>
    </>
  );
}

const ListItem = ({
  children,
  NavLink,
}: {
  children: React.ReactNode;
  NavLink: string;
}) => {
  return (
    <>
      <li>
        <a
          href={NavLink}
          className="flex py-2 text-base font-medium text-body-color hover:text-dark dark:text-dark-6 dark:hover:text-white lg:ml-12 lg:inline-flex"
        >
          {children}
        </a>
      </li>
    </>
  );
};
