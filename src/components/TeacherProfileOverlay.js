import { useState } from 'react';
import { useUser } from './UserContext';

export default function TeacherProfileOverlay({ setShowOverlay }) {
    const { user, updatePrice, updateNickname, updateDescription } = useUser();
    const [nickname, setNickname] = useState(user.nickname);
    const [description, setDescription] = useState(user.description);
    const [pricing, setPricing] = useState(user.pricing);

    const handleCancel = () => {
        setShowOverlay(false);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            // Update each field separately
            await Promise.all([
                updateNickname(nickname),
                updateDescription(description),
                updatePrice(pricing)
            ]);
            
            console.log("Profile updated successfully");
            setShowOverlay(false);
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Failed to update profile. Please try again.");
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity">
            <div className="fixed inset-0 z-10 overflow-y-auto">
                <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                    <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold leading-6 text-gray-900">
                                Edit Profile
                            </h3>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Nickname
                                </label>
                                <input
                                    type="text"
                                    value={nickname}
                                    onChange={(e) => setNickname(e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Description
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={4}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Pricing ($ per hour)
                                </label>
                                <input
                                    type="number"
                                    value={pricing}
                                    onChange={(e) => setPricing(Number(e.target.value))}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none"
                                />
                            </div>
                        </div>

                        <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                            <button
                                type="button"
                                onClick={handleSave}
                                className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 sm:col-start-2"
                            >
                                Save
                            </button>
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
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


