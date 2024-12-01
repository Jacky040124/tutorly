export default function ArtifactModal({ artifacts, onClose }) {
  if (!artifacts?.recording_files?.length) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4">
          <h2 className="text-xl font-semibold mb-4">No Recordings Available</h2>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Meeting Recordings</h2>
        <div className="space-y-4">
          {artifacts.recording_files.map((recording, index) => (
            <div key={index} className="border p-4 rounded-lg">
              <p className="font-medium">Type: {recording.recording_type}</p>
              <p>Duration: {Math.round(recording.duration / 60)} minutes</p>
              <div className="mt-2">
                <a
                  href={recording.download_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800"
                >
                  Download Recording
                </a>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Close
        </button>
      </div>
    </div>
  );
} 