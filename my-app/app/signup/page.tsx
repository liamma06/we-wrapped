import Link from "next/link";

export default function signup() {
  return (
     <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-neutral-900 border border-neutral-800 rounded-xl shadow-md">
        <h2 className="text-2xl font-semibold text-white text-center">Sign Up</h2>
        <form className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm text-white mb-1">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              required
              className="w-full px-4 py-2 bg-neutral-800 text-white border border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="userid@uwo.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm text-white mb-1">Password</label>
            <input
              type="password"
              name="password"
              id="password"
              required
              className="w-full px-4 py-2 bg-neutral-800 text-white border border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm text-white mb-1">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              id="confirmPassword"
              required
              className="w-full px-4 py-2 bg-neutral-800 text-white border border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-white text-black py-2 rounded-md font-medium hover:bg-purple-600 hover:text-white transition duration-300"
          >
            Create Account
          </button>
        </form>
        <p className="text-sm text-center text-neutral-400">
          Already have an account?{" "}
          <button className="text-purple-400 hover:text-purple-300 underline"><Link href={'/login'}>Login</Link></button>
        </p>
      </div>
    </div>
  );
}