import { NotificationBell } from "@/components/shared/NotificationBell";

export default function DashboardPage() {
  return (
    <>
      <h1>Dashboard</h1>
      <div className="absolute top-4 right-4">
        <NotificationBell />
      </div>
    </>
  )
}