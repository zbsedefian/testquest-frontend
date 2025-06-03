import { useAuth } from "../auth-context";

export default function Profile() {
  const { user } = useAuth();

  if (!user) {
    return (
      <p className="text-center mt-10 text-red-600">
        You must be logged in to view this page.
      </p>
    );
  }

  return (
    <div className="min-h-screen min-v-screen px-4 py-6">
      <div className="max-w-xl mx-auto mt-10 bg-white p-6 shadow-md rounded-lg">
        <h2 className="text-2xl font-semibold mb-4 text-blue-600">
          My Profile
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Username
            </label>
            <p className="mt-1 text-gray-800">{user.username}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">
              Role
            </label>
            <span className="mt-1 inline-block px-2 py-1 rounded bg-blue-100 text-blue-800 text-sm font-medium">
              {user.role}
            </span>
          </div>

          {/* Optional section for future features */}
          {/* <div>
          <button className="mt-4 bg-gray-200 hover:bg-gray-300 text-sm px-4 py-2 rounded">
            Change Password
          </button>
        </div> */}
        </div>
      </div>
    </div>
  );
}
