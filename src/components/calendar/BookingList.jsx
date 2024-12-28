import { useState } from "react";
import { useUser, useBooking } from "@/components/providers";
import { formatTime } from "@/lib/utils/timeUtils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, Clock, MapPin, User, FileText } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FeedbackOverlay from '../overlays/FeedbackOverlay';
import HomeworkLinkOverlay from '../overlays/HomeworkLinkOverlay';
import { useTranslation } from 'react-i18next';

export default function BookingList() {
  const { teacherList, user, fetchStudentData } = useUser();
  const { bookings, setBookings } = useBooking();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showFeedbackOverlay, setShowFeedbackOverlay] = useState(false);
  const [showHomeworkOverlay, setShowHomeworkOverlay] = useState(false);
  const { t } = useTranslation('common');
  const currentDate = new Date();

  // Guard against undefined/null bookings
  if (!Array.isArray(bookings)) {
    return (
      <div className="w-full max-w-3xl mx-auto text-center py-8 text-muted-foreground">
        {t('bookings.noBookings')}
      </div>
    );
  }

  const sortedBookings = [...bookings].sort((a, b) => {
    const dateA = new Date(a.date.year, a.date.month - 1, a.date.day);
    const dateB = new Date(b.date.year, b.date.month - 1, b.date.day);
    return dateA - dateB;
  });

  const upcomingBookings = sortedBookings.filter(booking => {
    const bookingDate = new Date(booking.date.year, booking.date.month - 1, booking.date.day);
    return bookingDate >= currentDate;
  });

  const pastBookings = sortedBookings.filter(booking => {
    const bookingDate = new Date(booking.date.year, booking.date.month - 1, booking.date.day);
    return bookingDate < currentDate;
  });

  const handleFeedback = (booking) => {
    setSelectedBooking(booking);
    setShowFeedbackOverlay(true);
  };

  const handleUploadHomework = (booking) => {
    setSelectedBooking(booking);
    setShowHomeworkOverlay(true);
  };

  return (
    <div className="w-full max-w-[90%] mx-auto">
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger 
            value="upcoming"
            className="data-[state=active]:bg-green-600 data-[state=active]:text-white"
          >
            {t('bookings.tabs.upcoming')} ({upcomingBookings.length})
          </TabsTrigger>
          <TabsTrigger 
            value="past"
            className="data-[state=active]:bg-green-600 data-[state=active]:text-white"
          >
            {t('bookings.tabs.past')} ({pastBookings.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming">
          <ScrollArea className="h-[70vh] pr-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingBookings.length > 0 ? (
                upcomingBookings.map((booking) => (
                  <BookingCard 
                    key={booking.id || `${booking.date.year}-${booking.date.month}-${booking.date.day}-${booking.startTime}`} 
                    booking={booking}
                    onFeedback={handleFeedback}
                    onUploadHomework={handleUploadHomework}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground col-span-full">
                  {t('bookings.noUpcoming')}
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="past">
          <ScrollArea className="h-[70vh] pr-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pastBookings.length > 0 ? (
                pastBookings.map((booking) => (
                  <BookingCard 
                    key={booking.id || `${booking.date.year}-${booking.date.month}-${booking.date.day}-${booking.startTime}`} 
                    booking={booking}
                    onFeedback={handleFeedback}
                    onUploadHomework={handleUploadHomework}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground col-span-full">
                  {t('bookings.noPast')}
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {showFeedbackOverlay && selectedBooking && (
        <FeedbackOverlay
          booking={selectedBooking}
          onClose={() => setShowFeedbackOverlay(false)}
          onFeedbackSubmitted={() => {
            setShowFeedbackOverlay(false);
            // Refresh bookings if needed
          }}
        />
      )}

      {showHomeworkOverlay && selectedBooking && (
        <HomeworkLinkOverlay
          booking={selectedBooking}
          onClose={() => setShowHomeworkOverlay(false)}
          onSuccess={() => {
            setShowHomeworkOverlay(false);
            // Refresh bookings if needed
          }}
        />
      )}
    </div>
  );
}

const BookingCard = ({ booking, onFeedback, onUploadHomework }) => {
  const { user, teacherList } = useUser();
  const { t } = useTranslation('common');
  const currentDate = new Date();
  
  const bookingDate = new Date(
    booking.date.year,
    booking.date.month - 1,
    booking.date.day
  );
  
  const isUpcoming = bookingDate >= currentDate;
  const formattedDate = bookingDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            {booking.bulkId && (
              <CardTitle className="text-lg font-semibold">
                {t('bookings.lessonCount.lesson')} {booking.lessonNumber} {t('bookings.lessonCount.of')} {booking.totalLessons}
              </CardTitle>
            )}
            <CardDescription>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="h-4 w-4" />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Clock className="h-4 w-4" />
                <span>{formatTime(booking.startTime)} - {formatTime(booking.endTime)}</span>
              </div>
            </CardDescription>
          </div>
          <Badge className="bg-green-600 hover:bg-green-700">
            {t(`bookings.status.${isUpcoming ? 'upcoming' : 'past'}`)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="text-sm text-muted-foreground">
              {user.type === "teacher" 
                ? t('bookings.student', { name: booking.studentName || booking.studentId })
                : t('bookings.teacher', { name: teacherList[booking.teacherId]?.nickname || booking.teacherId })}
            </span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {booking.link && (
              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                size="sm"
                onClick={() => {
                  window.open(booking.link);
                  console.log(booking);
                  console.log(booking.link);
                }}
              >
                {t('bookings.buttons.meet')}
              </Button>
            )}

            {user.type === "teacher" ? (
              <Button
                variant="outline"
                size="sm"
                className="border-green-600 text-green-600 hover:bg-green-50"
                onClick={() => onUploadHomework(booking)}
              >
                <FileText className="h-4 w-4 mr-2" />
                {t(booking.homeworkLink ? 'bookings.buttons.updateHomework' : 'bookings.buttons.uploadHomework')}
              </Button>
            ) : booking.homeworkLink && (
              <Button
                variant="outline"
                size="sm"
                className="border-green-600 text-green-600 hover:bg-green-50"
                onClick={() => window.open(booking.homeworkLink, "_blank")}
              >
                <FileText className="h-4 w-4 mr-2" />
                {t('bookings.buttons.viewHomework')}
              </Button>
            )}

            {!isUpcoming && user.type === "student" && (
              <Button
                variant="outline"
                size="sm"
                className="border-green-600 text-green-600 hover:bg-green-50"
                onClick={() => onFeedback(booking)}
              >
                {t(booking.feedback ? 'bookings.buttons.editFeedback' : 'bookings.buttons.addFeedback')}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
