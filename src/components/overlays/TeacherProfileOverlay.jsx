import { useState } from 'react';
import { useUser } from '../providers/UserContext';
import ErrorMessage from '../common/ErrorMessage';

export default function TeacherProfileOverlay({ setShowOverlay }) {
    const { user, updatePrice, updateNickname, updateDescription } = useUser();
    const [nickname, setNickname] = useState(user.nickname);
    const [description, setDescription] = useState(user.description);
    const [pricing, setPricing] = useState(user.pricing);
    const [error, setError] = useState('');

    const handleCancel = () => {
        setShowOverlay(false);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            await Promise.all([
                updateNickname(nickname),
                updateDescription(description),
                updatePrice(pricing)
            ]);
            
            setShowOverlay(false);
        } catch (error) {
            setError(`Failed to update profile: ${error.message}`);
        }
    };

    return (
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity">
        <div className="fixed inset-0 z-10 overflow-y-auto">
          {error && <ErrorMessage message={error} />}
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold leading-6 text-gray-900">
                  Edit Profile
                </h3>

                <div>
                  <label className="form-label">
                    Nickname
                  </label>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="form-label">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="form-label">
                    Pricing ($ per hour)
                  </label>
                  <input
                    type="number"
                    value={pricing}
                    onChange={(e) => setPricing(Number(e.target.value))}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                <button
                  type="button"
                  onClick={handleSave}
                  className="overlay-button-primary sm:col-start-2"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="overlay-button-secondary sm:col-start-1 sm:mt-0 mt-3"
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


