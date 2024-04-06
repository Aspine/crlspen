import React from "react";
import { cookies } from "next/headers";
import NavBar from "@/components/navBar";
import { Period } from "@/types";

export default function Schedule() {
	const scheduleCookie = cookies().get("scheduleData");
	const scheduleData: Period[] = scheduleCookie ? JSON.parse(scheduleCookie.value) : [];

	if (scheduleData.length == 0) {
		return (
			<main>
				<NavBar />
				<div className="page-main">
					<h1 className="schedule-error">
						School is not in session today.
					</h1>
				</div>
			</main>
		);
	}
	else {
		return (
			<main>
				<NavBar />
				<div className="page-main">
					<table className="schedule-table">
						<tbody>
							{scheduleData.map((data, index) => (
								<tr key={index} style={{
									backgroundColor: data.color ? data.color : "white",
									color: "black",
								}}>
									<td>
										<p>{data.startTime}</p>
										<p>{data.endTime}</p>
									</td>
									<td>
										{data.name}
										<br />
										{data.teacher}
										<br />
										RM. {data.room}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</main>
		);
	}
}