export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Face Recognition App
        </h1>
        <p className="text-gray-600 mb-8">
          Successfully deployed on Netlify! 🎉
        </p>
        <div className="space-x-4">
          <a 
            href="/signin" 
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Sign In
          </a>
          <a 
            href="/devices" 
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            View Devices
          </a>
        </div>
      </div>
    </div>
  );
}
