import calendar from "@/../public/schoolCal.json"

export default function daysLeft(): number {
    const today = new Date()
    let daysLeft;

    for (const day of calendar) {
        const date = new Date(day.date)
        if (date >= today) {
            daysLeft = 180 - day.count
        }
    }

    return daysLeft ? daysLeft : 0;
}