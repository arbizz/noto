import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

function Navbar() {
  return (
    <nav className="flex justify-between items-center p-6">
      <Link href="/" className="flex items-center gap-4">
        <Image
          src="/placeholder.svg"
          alt="Noto logo"
          width={32}
          height={32} 
        />
        <span>
          <strong>
            Noto
          </strong>
        </span>
      </Link>
      <div>
        <Button asChild size="lg">
          <Link href="/login">Sign in</Link>
        </Button>
      </div>
    </nav>
  )
}

export { Navbar }