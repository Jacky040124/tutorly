// Converts a time in hours (e.g., 14.5) to a formatted string (e.g., "14:30")
export function formatTime(time) {
    const hours = Math.floor(time);
    const minutes = (time % 1) * 60;
    return `${hours}:${minutes === 0 ? '00' : minutes}`;
}

// Converts a time string (e.g., "14:30") to a decimal (e.g., 14.5)
export function timeToDecimal(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours + minutes / 60;
}

// Checks if two time slots overlap
export function doTimeSlotsOverlap(slot1, slot2) {
    return slot1.startTime < slot2.endTime && slot1.endTime > slot2.startTime;
} 