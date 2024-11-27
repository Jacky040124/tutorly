"use client";
import { useState } from 'react';
import { useUser } from '@/components/providers/UserContext';
import { formatTime } from '@/lib/utils/timeUtils';

export default function BookingOverlay({ selectedSlot, teacherData, onConfirm, onClose }) {
    console.log("BookingOverlay received selectedSlot with link:", selectedSlot?.link);
    
    const { user, updateUserBalance } = useUser();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleConfirm = async () => {
        console.log("handleConfirm starting with selectedSlot link:", selectedSlot?.link);
        setIsSubmitting(true);
        try {
            const totalPrice = selectedSlot.isRepeating 
                ? teacherData.pricing * selectedSlot.totalClasses 
                : teacherData.pricing;

            if (user.balance < totalPrice) {
                throw new Error(`Insufficient balance. Required: $${totalPrice}`);
            }

            if (selectedSlot.isRepeating) {
                const bulkId = `bulk_${Date.now()}_${user.uid}`;
                const bulkBookings = Array.from({ length: selectedSlot.totalClasses }, (_, index) => ({
                    studentId: user.uid,
                    teacherId: teacherData.uid,
                    date: {
                        ...selectedSlot.date,
                        day: selectedSlot.date.day + (index * 7)
                    },
                    startTime: selectedSlot.startTime,
                    endTime: selectedSlot.startTime + 1,
                    status: "confirmed",
                    createdAt: new Date().toISOString(),
                    price: teacherData.pricing,
                    bulkId,
                    lessonNumber: index + 1,
                    totalLessons: selectedSlot.totalClasses,
                    link: selectedSlot.link || null
                }));

                await onConfirm(bulkBookings, teacherData.availability, user.balance, updateUserBalance);
            } else {
                const booking = {
                    studentId: user.uid,
                    teacherId: teacherData.uid,
                    date: selectedSlot.date,
                    startTime: selectedSlot.startTime,
                    endTime: selectedSlot.startTime + 1,
                    status: "confirmed",
                    createdAt: new Date().toISOString(),
                    price: teacherData.pricing,
                    link: selectedSlot.link || null
                };
                console.log("Created single booking with link:", booking.link);
                await onConfirm(booking, teacherData.availability, user.balance, updateUserBalance);
            }
            onClose();
        } catch (error) {
            console.error("Booking error:", error);
            alert(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity">
            <div className="fixed inset-0 z-10 overflow-y-auto">
                <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                    <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                        <div>
                            <h3 className="text-lg font-medium leading-6 text-gray-900">
                                Confirm Booking
                            </h3>
                            <div className="mt-2">
                                <p className="text-sm text-gray-500">
                                    Teacher: {teacherData.nickname}
                                </p>
                                <p className="text-sm text-gray-500">
                                    Date: {selectedSlot.date.day}/{selectedSlot.date.month}/{selectedSlot.date.year}
                                </p>
                                <p className="text-sm text-gray-500">
                                    Time: {formatTime(selectedSlot.startTime)} - {formatTime(selectedSlot.startTime + 1)}
                                </p>
                                <p className="text-sm font-bold text-gray-700 mt-2">
                                    Price per lesson: ${teacherData.pricing}
                                    {selectedSlot.isRepeating && (
                                        <>
                                            <br />
                                            <span className="text-blue-600">
                                                Total for {selectedSlot.totalClasses} lessons: ${teacherData.pricing * selectedSlot.totalClasses}
                                            </span>
                                        </>
                                    )}
                                </p>
                                
                                <div className="mt-4 p-3 bg-blue-50 rounded-md">
                                    <p className="text-sm text-blue-800">
                                        <span className="font-semibold">Payment Notice:</span> Online payment is currently under development. 
                                        Please e-transfer the lesson fee to your teacher at:
                                    </p>
                                    <p className="text-sm font-medium text-blue-900 mt-1">
                                        {teacherData.email}
                                    </p>
                                </div>
                                {selectedSlot.isRepeating && (
                                    <div className="bg-blue-50 p-3 rounded-md mb-4">
                                        <p className="text-sm text-blue-800">
                                            <span className="font-semibold">Bulk Booking:</span> 
                                            {selectedSlot.totalClasses} lessons
                                        </p>
                                        <p className="text-sm text-blue-800">
                                            Total Price: ${teacherData.pricing * selectedSlot.totalClasses}
                                        </p>
                                        <p className="text-xs text-blue-600 mt-1">
                                            Weekly lessons for {selectedSlot.totalClasses} weeks
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                            <button
                                type="button"
                                className="overlay-button-primary sm:col-start-2"
                                onClick={handleConfirm}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Confirming...' : 'Confirm Booking'}
                            </button>
                            <button
                                type="button"
                                className="overlay-button-secondary sm:col-start-1 sm:mt-0"
                                onClick={onClose}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 