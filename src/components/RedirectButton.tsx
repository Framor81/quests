'use client'

import { useRouter } from 'next/navigation'

interface RedirectButtonProps {
  label: string
  route: string
  bgColor?: string
  hoverColor?: string
}

const RedirectButton: React.FC<RedirectButtonProps> = ({
  label,
  route,
  bgColor = 'bg-blue-600',
  hoverColor = 'hover:bg-blue-700',
}) => {
  const router = useRouter()

  return (
    <button
      onClick={() => router.push(route)}
      className={`mt-4 rounded-lg px-6 py-3 text-lg font-semibold text-white transition-colors duration-200 ${bgColor} ${hoverColor}`}
    >
      {label}
    </button>
  )
}

export default RedirectButton
