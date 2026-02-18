import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Toaster } from "@/components/ui/toaster"
import Header from "@/customComponents/Header"
import { useToast } from "@/hooks/use-toast"
import { useEffect, useState } from "react"


function Domains() {
  const [kcal, setKcal] = useState(0)
  const [carb, setCarb] = useState(0)
  const [prot, setProt] = useState(0)
  const [sugar, setSugar] = useState(0)
  const [lipid, setLipid] = useState(0)
  const { toast } = useToast()

  useEffect(() => {
    const decoded = JSON.parse(sessionStorage.getItem("decoded") ?? '')

    fetch(`/api/userFood/Domains/${decoded.id}`)
      .then((res) => res.json())
      .then((domains) => {
        setKcal(domains.kcal)
        setCarb(domains.carb)
        setProt(domains.prot)
        setSugar(domains.sugar)
        setLipid(domains.lipid)
      })
  }, []
  )

  const SaveData = () => {
    const payload = {
      kcal,
      carb,
      prot,
      sugar,
      lipid
    }
    const decoded = JSON.parse(sessionStorage.getItem("decoded") ?? '')
    fetch(`/api/userFood/Domains/${decoded.id}`, {
      method: "POST",
      body: JSON.stringify(payload)
    })
    toast({
      title: "Saved",
      description: "Your preferances have been save successfuly"
    })
  }

  return (
    <div>
      <Header />
      <div className="w-full flex justify-center">
        <Card className="m-2 w-96">
          <CardHeader>
            Set Your Targets
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="dom_kcal">Kilocalories</Label>
              <Input type="number" id="dom_kcal" value={kcal} onChange={(event) => setKcal(Number(event.target.value))} />
            </div>
            <div>
              <Label htmlFor="dom_carb">Carbohidrates</Label>
              <Input type="number" id="dom_carb" value={carb} onChange={(event) => setCarb(Number(event.target.value))} />
            </div>
            <div>
              <Label htmlFor="dom_prot">Proteins</Label>
              <Input type="number" id="dom_prot" value={prot} onChange={(event) => setProt(Number(event.target.value))} />
            </div>
            <div>
              <Label htmlFor="dom_sugar">Sugar</Label>
              <Input type="number" id="dom_sugar" value={sugar} onChange={(event) => setSugar(Number(event.target.value))} />
            </div>
            <div>
              <Label htmlFor="dom_lipid">Lipids</Label>
              <Input type="number" id="dom_lipid" value={lipid} onChange={(event) => setLipid(Number(event.target.value))} />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={SaveData}>Save</Button>
          </CardFooter>
        </Card>

      </div>

      <Toaster />
    </div>
  )
}

export default Domains
