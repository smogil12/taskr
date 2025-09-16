"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { useAuth } from "@/components/providers/auth-provider";

const secondaryNavigation = [
  { name: 'Account', href: '#', current: true },
  { name: 'Notifications', href: '#', current: false },
  { name: 'Integrations', href: '#', current: false },
]

function SettingsPageContent() {
  const { user } = useAuth();
  return (
    <div>
      <main>
        <h1 className="sr-only">Account Settings</h1>

        <header className="border-b border-gray-200 dark:border-white/5">
          {/* Secondary navigation */}
          <nav className="flex overflow-x-auto py-4">
            <ul
              role="list"
              className="flex min-w-full flex-none gap-x-6 px-4 text-sm/6 font-semibold text-gray-500 sm:px-6 lg:px-8 dark:text-gray-400"
            >
              {secondaryNavigation.map((item) => (
                <li key={item.name}>
                  <a href={item.href} className={item.current ? 'text-indigo-600 dark:text-indigo-400' : ''}>
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </header>

        {/* Settings forms */}
        <div className="divide-y divide-gray-200 dark:divide-white/10">
          <div className="grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-8">
            <div>
              <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">Personal Information</h2>
              <p className="mt-1 text-sm/6 text-gray-500 dark:text-gray-400">
                Use a permanent address where you can receive mail.
              </p>
            </div>

            <form className="md:col-span-2">
              <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:max-w-xl sm:grid-cols-6">
                <div className="col-span-full flex items-center gap-x-8">
                  <div
                    className="size-24 flex-none rounded-lg bg-indigo-600 flex items-center justify-center text-white text-2xl font-semibold outline -outline-offset-1 outline-black/5 dark:outline-white/10"
                  >
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <button
                      type="button"
                      className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs inset-ring-1 inset-ring-gray-300 hover:bg-gray-100 dark:bg-white/10 dark:text-white dark:shadow-none dark:inset-ring-white/5 dark:hover:bg-white/20"
                    >
                      Change avatar
                    </button>
                    <p className="mt-2 text-xs/5 text-gray-500 dark:text-gray-400">JPG, GIF or PNG. 1MB max.</p>
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="first-name" className="block text-sm/6 font-medium text-gray-900 dark:text-white">
                    First name
                  </label>
                  <div className="mt-2">
                    <input
                      id="first-name"
                      name="first-name"
                      type="text"
                      autoComplete="given-name"
                      defaultValue={user?.name?.split(' ')[0] || ''}
                      className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="last-name" className="block text-sm/6 font-medium text-gray-900 dark:text-white">
                    Last name
                  </label>
                  <div className="mt-2">
                    <input
                      id="last-name"
                      name="last-name"
                      type="text"
                      autoComplete="family-name"
                      defaultValue={user?.name?.split(' ').slice(1).join(' ') || ''}
                      className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
                    />
                  </div>
                </div>

                <div className="col-span-full">
                  <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900 dark:text-white">
                    Email address
                  </label>
                  <div className="mt-2">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      defaultValue={user?.email || ''}
                      className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 flex">
                <button
                  type="submit"
                  className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:shadow-none dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <MainLayout>
      <SettingsPageContent />
    </MainLayout>
  );
}
