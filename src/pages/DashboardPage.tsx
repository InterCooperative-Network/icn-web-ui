import { Activity, Zap, Users, Briefcase } from 'lucide-react';

export function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Overview of your ICN federation and network activity
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="icn-card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Zap className="h-8 w-8 text-mana-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">
                  Available Mana
                </dt>
                <dd className="text-lg font-medium text-gray-900 dark:text-white">1,250</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="icn-card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Briefcase className="h-8 w-8 text-icn-primary" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">
                  Active Jobs
                </dt>
                <dd className="text-lg font-medium text-gray-900 dark:text-white">7</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="icn-card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">
                  Network Peers
                </dt>
                <dd className="text-lg font-medium text-gray-900 dark:text-white">42</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="icn-card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Activity className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">
                  Reputation Score
                </dt>
                <dd className="text-lg font-medium text-gray-900 dark:text-white">8.7</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="icn-card">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
            Recent Activity
          </h3>
          <div className="mt-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 rounded-full bg-green-400"></div>
                <span className="text-sm text-gray-900 dark:text-white">
                  Mesh job completed successfully
                </span>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">2 minutes ago</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 rounded-full bg-blue-400"></div>
                <span className="text-sm text-gray-900 dark:text-white">
                  New governance proposal submitted
                </span>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">1 hour ago</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 rounded-full bg-yellow-400"></div>
                <span className="text-sm text-gray-900 dark:text-white">
                  Mana regeneration completed
                </span>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">3 hours ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
