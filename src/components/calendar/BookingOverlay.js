"use client";
import { useState } from 'react';
import { useUser } from '@/components/providers/UserContext';
import { formatTime } from '@/lib/utils/timeUtils';

export default function BookingOverlay({ selectedSlot, teacherData, onConfirm, onClose }) {
    const { user } = useUser();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleConfirm = async () => {
        setIsSubmitting(true);
        try {
            const booking = {
                studentId: user.uid,
                teacherId: teacherData.uid,
                date: selectedSlot.date,
                startTime: selectedSlot.startTime,
                endTime: selectedSlot.startTime + 1,
                status: "confirmed",
                createdAt: new Date().toISOString(),
                price: teacherData.pricing
            };

            await onConfirm(booking, teacherData.availability, user.balance);
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
                                    Price: ${teacherData.pricing}
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
                            </div>
                        </div>
                        <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                            <button
                                type="button"
                                className="inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 sm:col-start-2"
                                onClick={handleConfirm}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Confirming...' : 'Confirm Booking'}
                            </button>
                            <button
                                type="button"
                                className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
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