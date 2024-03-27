'use client'

import React from "react";
import NavBar from "@/components/navBar";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Image from "next/image";
import falconImage from "@/../public/falcon.png";

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
            <div className="loading-screen">
                <h1>Clearing Cookies...</h1>
                <Image
                    src={falconImage}
                    alt="loading"
                    width={100}
                    height={100}
                    className="loading-image"
                />
        </div>
        </main>
    );
}