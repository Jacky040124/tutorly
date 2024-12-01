import { formatTime } from "@/lib/utils/timeUtils";
import { useUser, useBooking } from "@/components/providers";

export default function FutureBookings() {
  const { userType, teacherList, user } = useUser();
  const { futureBookings } = useBooking();

  if (!futureBookings || !Array.isArray(futureBookings) || futureBookings.length === 0) {
    return (
      <div className="mt-8 p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Upcoming futureBookings</h2>
        <p className="text-gray-500">No upcoming bookings</p>
      </div>
    );
  }

  const handleJoinMeeting = (link) => {
    if (!link) {
      alert("No meeting link available for this booking");
      return;
    }
    window.open(link, '_blank');
  };

  const getDisplayName = (booking) => {
    if (userType === 'teacher') {
      return `Student: ${booking.studentNickname || booking.studentId}`;
    } else {
      const teacher = teacherList[booking.teacherId];
      return `Teacher: ${teacher?.nickname || booking.teacherId}`;
    }
  };

  return (
    <div className="mt-8 p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Upcoming Bookings</h2>
      <div className="space-y-4">
        {futureBookings.map((booking, index) => (
          <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">
                  {booking.date.day}/{booking.date.month}/{booking.date.year}
                </p>
                <p className="text-gray-600">
                  {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                </p>
                {booking.bulkId && (
                  <p className="text-sm text-green-600">
                    Lesson {booking.lessonNumber} of {booking.totalLessons}
                  </p>
                )}
              </div>
              <div className="text-right flex flex-col items-end gap-2">
                <p className="text-sm text-gray-500">{getDisplayName(booking)}</p>
                <button
                  onClick={() => handleJoinMeeting(booking.link)}
                  className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  Join Meeting
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
