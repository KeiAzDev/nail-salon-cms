// src/components/dashboard/Header.tsx
'use client'

import { Menu, ChevronDown } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { useState } from 'react'

type HeaderProps = {
  user: {
    name?: string | null
    email?: string | null
  }
}

export default function Header({ user }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="bg-white shadow">
      <div className="flex justify-between items-center py-4 px-6">
        {/* モバイルメニューボタン */}
        <button className="md:hidden p-2" onClick={() => {}}>
          <Menu className="h-6 w-6" />
        </button>

        {/* 右側のユーザーメニュー */}
        <div className="ml-auto relative">
          <button
            className="flex items-center space-x-2"
            onClick={() => setIsOpen(!isOpen)}
          >
            <span className="text-gray-700">{user.name || user.email}</span>
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </button>

          {/* ドロップダウンメニュー */}
          {isOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5">
              <button
                onClick={() => signOut()}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                ログアウト
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}