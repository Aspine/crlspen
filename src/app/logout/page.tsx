import React from "react";
import NavBar from "@/components/navBar";
import { cookies } from "next/headers";

export default function Logout() {
    cookies().set("classData", "=;expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/"); // removes the classData cookie, so logs you out :/
    window.location.reload(); // reloads the page just to make sure the cookie gets cleared
    window.location.href = "/"; // redirects back to the base page so that dashboard wont throw an error
    return (
        <main>
            <h1>Logging Out...</h1>
        </main>
    );
}