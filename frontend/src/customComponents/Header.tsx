import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router"

function Header() {
  const navigator = useNavigate()
  return (
    <div className="h-15 p-2 border-2 rounded-md m-2 flex justify-between items-center">
      <div className="text-xl h-full text-center">NutriTrack</div>
      <div className="flex gap-2">
        <Button onClick={() => navigator("/dashboard")}>Dashboard</Button>
        <Button onClick={() => navigator("/domains")}>Domains</Button>
        <Button onClick={() => navigator("/")}>LogOut</Button>
      </div>
    </div>
  )
}

export default Header
