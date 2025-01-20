// src/app/(dashboard)/dashboard/page.tsx
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ダッシュボード | Nail Salon CMS',
  description: 'Nail Salon CMS dashboard',
}

export default async function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-gray-900">ダッシュボード</h1>
      
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* 顧客数 */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {/* <Users className="h-6 w-6 text-gray-400" /> */}
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    総顧客数
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">0</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* 本日の予約数 */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {/* <Calendar className="h-6 w-6 text-gray-400" /> */}
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    本日の予約数
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">0</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}