// src/components/dashboard/CustomerTable.tsx
'use client'

import { Customer } from '@prisma/client'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import Link from 'next/link'
import { Edit, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

type CustomerTableProps = {
  customers: Customer[]
}

export function CustomerTable({ customers }: CustomerTableProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const filteredCustomers = customers.filter((customer) =>
    `${customer.lastName}${customer.firstName}`.includes(searchTerm)
  )

  const handleDelete = async (customerId: string) => {
    if (!confirm('本当にこの顧客を削除しますか？この操作は取り消せません。')) {
      return
    }

    try {
      setDeletingId(customerId)
      const res = await fetch(`/api/customers/${customerId}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        throw new Error('削除に失敗しました')
      }

      router.refresh()
    } catch (error) {
      alert('顧客の削除に失敗しました')
      console.error('Delete error:', error)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div>
      {/* 検索フィールド */}
      <div className="p-4 border-b">
        <input
          type="text"
          placeholder="顧客名で検索..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-xs px-4 py-2 border rounded-md"
        />
      </div>

      {/* テーブル */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                名前
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                連絡先
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                登録日
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredCustomers.map((customer) => (
              <tr key={customer.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link
                    href={`/customers/${customer.id}`}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    {customer.lastName} {customer.firstName}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{customer.email}</div>
                  <div className="text-sm text-gray-500">{customer.phone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(new Date(customer.createdAt), 'yyyy/MM/dd', {
                    locale: ja,
                  })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <Link
                      href={`/customers/${customer.id}/edit`}
                      className="text-indigo-600 hover:text-indigo-900 disabled:opacity-50"
                    >
                      <Edit className="h-5 w-5" />
                    </Link>
                    <button
                      onClick={() => handleDelete(customer.id)}
                      disabled={deletingId === customer.id}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* データが空の場合のメッセージ */}
      {filteredCustomers.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          {searchTerm ? '検索結果が見つかりませんでした' : '顧客データがありません'}
        </div>
      )}
    </div>
  )
}