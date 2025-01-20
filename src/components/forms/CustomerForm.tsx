// src/components/forms/CustomerForm.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Customer } from '@prisma/client'

type CustomerFormProps = {
  customer?: Partial<Customer>
  isEditing?: boolean
}

export function CustomerForm({ customer, isEditing = false }: CustomerFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const data = {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      dateOfBirth: formData.get('dateOfBirth'),
      notes: formData.get('notes'),
      healthInfo: formData.get('healthInfo'),
    }

    try {
      const url = isEditing 
        ? `/api/customers/${customer?.id}`
        : '/api/customers'
      
      const res = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || '顧客情報の保存に失敗しました')
      }

      router.push('/customers')
      router.refresh()
    } catch (error) {
      setError(error instanceof Error ? error.message : '予期せぬエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-md">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 姓 */}
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
            姓 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="lastName"
            id="lastName"
            required
            defaultValue={customer?.lastName}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-800"
          />
        </div>

        {/* 名 */}
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
            名 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="firstName"
            id="firstName"
            required
            defaultValue={customer?.firstName}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-800"
          />
        </div>

        {/* メールアドレス */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            メールアドレス <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            id="email"
            required
            defaultValue={customer?.email}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-800"
          />
        </div>

        {/* 電話番号 */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            電話番号 <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            name="phone"
            id="phone"
            required
            defaultValue={customer?.phone}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-800"
          />
        </div>

        {/* 生年月日 */}
        <div>
          <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
            生年月日
          </label>
          <input
            type="date"
            name="dateOfBirth"
            id="dateOfBirth"
            defaultValue={customer?.dateOfBirth?.toString().split('T')[0]}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-800"
          />
        </div>
      </div>

      {/* 健康情報 */}
      <div>
        <label htmlFor="healthInfo" className="block text-sm font-medium text-gray-700">
          健康情報（アレルギー等）
        </label>
        <textarea
          name="healthInfo"
          id="healthInfo"
          rows={3}
          defaultValue={customer?.healthInfo as string}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-800"
        />
      </div>

      {/* メモ */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
          メモ
        </label>
        <textarea
          name="notes"
          id="notes"
          rows={3}
          defaultValue={customer?.notes || ''}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-800"
        />
      </div>

      {/* 送信ボタン */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? '保存中...' : '保存する'}
        </button>
      </div>
    </form>
  )
}