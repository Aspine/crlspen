'use client'

import React, { useState, useEffect } from "react";
import NavBar from "@/components/navBar";
import calculateGpa from "@/utils/getGpa";
import { Assignment, Class } from "@/types";
import getCredits from "@/utils/getCredits";
import LoadingScreen from "@/components/loadingScreen";

export default function Home() {
	const [classData, setClassData] = useState<Class[]>([]);
	const [assignmentData, setAssignmentData] = useState<Assignment[][]>([]);
	const [loading, setLoading] = useState(true);
	const [loadingAssignment, setLoadingAssignment] = useState(true);
	const [assignmentsTableContent, setAssignmentsTableContent] = useState<JSX.Element[]>([
		<p className="placeholder-text">click on a class to show assignments</p>
	]);

	useEffect(() => {
		setClassData(JSON.parse(
			decodeURIComponent(document.cookie.split(';').find(cookie => cookie.trim().startsWith("classDataQ3="))?.split('=')[1] || "[]")
		));

		setLoading(false);
	}, [setClassData]);

	const gpaInput = classData.map((data) => {
		return {
			grade: data.grade,
			credits: getCredits(data.name),
			ap: data.name.startsWith("AP"),
		};
	});

	const hUnweightedGpa = calculateGpa(gpaInput, "hUnweighted");
	const fUnweightedGpa = calculateGpa(gpaInput, "fUnweighted");
	const fWeightedGpa = calculateGpa(gpaInput, "fWeighted");

	useEffect(() => {
		async function backgroundScrape() {
			await fetch("/api/get_schedule_data", {
				method: "GET",
			});

			const assignmentDataQ3 = await fetch("/api/get_assignments_current", {
				method: "GET",
			}).then(res => res.json());

			setAssignmentData(assignmentDataQ3);
			setLoadingAssignment(false);
		}

		backgroundScrape();
	}, ["/api/get_schedule_data/", "/api/get_assignments_current/", setAssignmentData])

	function handleRowClick(index: number) {
		const assignments = assignmentData[index] || [];

		if (assignments) {
		setAssignmentsTableContent(
			[
				<table className="assignments-table">
					<tbody>
						{assignments.map((assignment, index) => (
							<tr key={index}>
								<td>{assignment.name}</td>
								<td>{assignment.gradeCategory}</td>
								<td>{assignment.earned} / {assignment.points}</td>
							</tr>
						))}
					</tbody>
				</table>
			]
		);
	} else {
		<p className="placeholder-text">no assignments in this class</p>
	}
	}

	return (
		loading ? <LoadingScreen loadText="Parsing Grades..." /> :
			<main>
				<NavBar />
				<div className="page-main">
					<div className="gpa-container">
						<div className="gpa-box hUnweightedGpa">
							<p>Q4 100 Scale: {hUnweightedGpa.toFixed(2)}</p>
						</div>
						<div className="gpa-box fWeightedGpa">
							<p>Q4 Weighted: {fWeightedGpa.toFixed(2)}</p>
						</div>
						<div className="gpa-box fUnweightedGpa">
							<p>Q4 Unweighted: {fUnweightedGpa.toFixed(2)}</p>
						</div>
					</div>
					<table className="grades-table">
						<tbody>
							<tr>
								<th>TEACHERS</th>
								<th>CLASS</th>
								<th>GRADE</th>
								<th>RM.</th>
							</tr>
							{classData.map((data, index) => (
								<>
									<tr key={index} className="class-row" id={`c${index}`} onClick={() => handleRowClick(index)}
										style={!loadingAssignment ? {
											cursor: "pointer"
										} : {}}
									>
										<td>{data.teacher}</td>
										<td>{data.name}</td>
										<td className={data.grade !== null ? (data.grade >= 100 ? "hGrade" : "") : ""}>
											{data.grade !== null ? data.grade.toFixed(2) : "-"}
										</td>
										<td>{data.room}</td>
									</tr>
								</>
							))}
						</tbody>
					</table>
					<table className="assignments-table">
						{loadingAssignment ? (<p className="placeholder-text">fetching assignments...</p>) : assignmentsTableContent}
					</table>
				</div>
			</main>
	);
}
