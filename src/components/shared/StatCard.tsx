import { Card, CardContent, CardHeader } from "@/components/ui/card"
import Link from "next/link"

type StatCardVariant = "default" | "success" | "warning" | "danger"

const variantBgColors: Record<StatCardVariant, string> = {
  default: "bg-primary/10",
  success: "bg-green-500/10",
  warning: "bg-yellow-500/10",
  danger: "bg-red-500/10",
}

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: number
  loading: boolean
  variant?: StatCardVariant
  href?: string
}

export function StatCard({
  icon,
  label,
  value,
  loading,
  variant = "default",
  href,
}: StatCardProps) {
  const content = (
    <Card className={href ? "hover:shadow-md transition-shadow cursor-pointer" : ""}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className={`p-2 ${variantBgColors[variant]} rounded-lg`}>
            {icon}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {loading ? "..." : value}
        </div>
        <p className="text-xs text-muted-foreground mt-1">{label}</p>
      </CardContent>
    </Card>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }

  return content
}