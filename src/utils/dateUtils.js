export const isSameDay = (date1, date2) => {
    return date1.year === date2.year && 
           date1.month === date2.month && 
           date1.day === date2.day;
}; 