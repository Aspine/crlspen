'use client'

import React from "react";
import LoadingScreen from "@/components/loadingScreen";

export default function Logout() {
    React.useEffect(() => {
        
        const logout = async () => {
            const res = await fetch("/api/logout", {
                method: "GET",
            }); // clears the cookie
            window.location.href = "/"; // redirects back to the base page so that dashboard wont throw an error

            return res;
        };

        logout();

    }, []);
    return (
        <LoadingScreen loadText="Logging Out..." />
    );
}