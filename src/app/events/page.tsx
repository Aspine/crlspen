'use client'

import NavBar from "@/components/navBar";
import React, { useEffect, useState } from "react";
import csvtojson from "csvtojson";
import { json } from "stream/consumers";

export default function Home() {
    const [jsonData, setJsonData] = useState<any[]>([]);

    useEffect(() => {
        fetch('https://docs.google.com/spreadsheets/d/10Xq9PAlwjl_sQoiAGjPp6Ixu6FtU69i0p_f0Qv8_jy4/gviz/tq?tqx=out:csv&sheet=Form1')
            .then(response => response.text())
            .then(csvData => {
                csvtojson()
                    .fromString(csvData)
                    .then(json => {
                        setJsonData(json);
                    });
            });
    }, []);

    return (
        <main>
            <NavBar />
            <div className="page-main">
                <table className="events-table">
                    <tbody>
                        <tr>
                            <th>Event</th>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Grades</th>
                        </tr>
                        {jsonData.map((data, index) => (
                            <tr key={index}>
                                <td>{data.eventName}</td>
                                <td>{data.date}</td>
                                <td>{data.time}</td>
                                <td>{data.grades}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </main>
    )
}