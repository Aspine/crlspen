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
		<tbody key={0}><tr><td><p className="placeholder-text">click on a class to show assignments</p></td></tr></tbody>
	]);

	useEffect(() => {
		async function getData() {
			const gradesResponse = await fetch("/api/get_grade_data_current/", {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				}
			});

			if (gradesResponse.ok) {
				setClassData((await gradesResponse.json()).text);
				setLoading(false);
			} else {
				console.error("Failed to fetch grades data");
				window.location.href = "/login";
			}

			await fetch("/api/get_schedule_data", {
				method: "GET",
			});

			const assignmentDataQ3 = await fetch("/api/get_assignments_current", {
				method: "GET",
			}).then(res => res.json());

			// const classInfoDataQ3 = await fetch("/api/get_class_info_current", {
			// 	method: "GET",
			// }).then(res => res.json());

			setAssignmentData(assignmentDataQ3);
			setLoadingAssignment(false);
		}

		getData();

	}, [setClassData, "/api/get_grade_data_current/", "/api/get_schedule_data/", "/api/get_assignments_current/", setAssignmentData]);

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

	function handleRowClick(classIndex: number) {
		const assignments = assignmentData[classIndex] || [];

		if (assignments && assignments.length != 0) {
			setAssignmentsTableContent(
				[
						<tbody key={classIndex}>
							{assignments.map((assignment, index) => (
								<tr key={index}>
									<td>{assignment.name}</td>
									<td>{assignment.gradeCategory}</td>
									<td className="fraction-grade">{`${assignment.earned || 0} / ${assignment.points || 0}`}</td>
								</tr>
							))}
						</tbody>
				]
			);
		} else {
			setAssignmentsTableContent(
				[
					<p className="placeholder-text" key={classIndex}>no assignments for this class</p>
				]
			);
		}
	}

	return (
		loading ? <LoadingScreen loadText="Loading..." /> :
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
							<tr key={0}>
								<th key={0}>TEACHERS</th>
								<th key={1}>CLASS</th>
								<th key={2}>GRADE</th>
								<th key={3}>RM.</th>
							</tr>
							{classData.map((data, index) => (
								<React.Fragment key={index+1}>
									<tr className="class-row" id={`c${index}`} onClick={() => handleRowClick(index)}
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
								</React.Fragment>
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
