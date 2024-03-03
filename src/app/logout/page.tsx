'use client'

import React from "react";
import NavBar from "@/components/navBar";
import { cookies } from "next/headers";

export default function Logout() {
    React.useEffect(() => {
        
        const logout = async () => {
            const res = await fetch("/api/logout", {
                method: "GET",
            }); // clears the cookie
            window.location.href = "/"; // redirects back to the base page so that dashboard wont throw an error

            return res;
        };

        console.log(logout());
    }, []);
    return (
        <main>
            <h1>Logging Out...</h1>
        </main>
    );
}