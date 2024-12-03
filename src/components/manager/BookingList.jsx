import { useBooking } from "@/components/providers";
import { ZoomService } from "@/services/zoom.service";
import { formatTime } from "@/lib/utils/timeUtils";

export default function BookingList() {
  const { futureBookings } = useBooking();

  const handleFetchArtifacts = async (meetingId) => {
    try {
      const artifacts = await ZoomService.fetchArtifact(meetingId);
      // Handle artifacts display (could add to state or show in modal)
      console.log("Fetched artifacts:", artifacts);
    } catch (error) {
      console.error("Failed to fetch artifacts:", error);
    }
  };

  if (!futureBookings?.length) {
    return <div className="p-6 text-center text-gray-500">Select a teacher to view their bookings</div>;
  }

  return (
    <div className="p-4 md:p-6 space-y-4" data-testid="bookings-container">
      {futureBookings.map((booking, index) => (
        <div key={index} className="bg-white rounded-lg shadow p-4 md:p-6" data-testid="booking-card">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div>
              <p className="font-medium text-lg">
                {booking.date.day}/{booking.date.month}/{booking.date.year}
              </p>
              <p className="text-gray-600">
                {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
              </p>
              <p className="text-sm text-gray-500">Student: {booking.studentNickname || booking.studentId}</p>
              {booking.bulkId && (
                <p className="text-sm text-green-600">
                  Lesson {booking.lessonNumber} of {booking.totalLessons}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              {booking.meetingId && (
                <button
                  onClick={() => handleFetchArtifacts(booking.meetingId)}
                  className="px-4 py-2 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                >
                  Fetch Recording
                </button>
              )}
              <a
                href={booking.link}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-center"
              >
                Join Meeting
              </a>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
