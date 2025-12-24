import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

function Navbar() {
  return (
    <nav>
      <Link href="/">
        <Image
          src="/placeholder.svg"
          alt="Noto logo"
          width={32}
          height={32} 
        />
        <span>Noto</span>
      </Link>
      <div>
        <Button asChild>
          <Link href="/signin">Sign in</Link>
        </Button>
      </div>
    </nav>
  )
}

export { Navbar }