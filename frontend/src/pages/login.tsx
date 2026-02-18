import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { useNavigate } from 'react-router'
import { jwtDecode } from "jwt-decode"
import { Tabs, TabsList } from '@/components/ui/tabs'
import { TabsContent, TabsTrigger } from '@radix-ui/react-tabs'

function AuthHandler() {

  return (
    <div className='w-full flex justify-center h-[99vh] items-center'>
      <Tabs defaultValue='login' className='w-[400px]'>
        <TabsList className='grid w-full grid-cols-2 mb-2'>
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="register">Register</TabsTrigger>
        </TabsList>
        <TabsContent className='w-full' value='login'><LoginPanel /></TabsContent>
        <TabsContent value='register'><RegisterPanel /></TabsContent>
      </Tabs>
    </div>
  )
}

function RegisterPanel() {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleLogin = async () => {
    if (email.match(/(\w+)@(\w+)\.(\w{2,3})/)) {
      await fetch("/api/register", {
        method: 'POST',
        body: JSON.stringify({ email, password, username })
      })
    } else {
      setError("wrong email format")
    }
  }

  return (
    <Card className='w-[400px]' >
      <CardHeader>
        <div>Make a new account</div>
      </CardHeader>
      <CardContent className='h-60'>
        <div className="grid w-full max-w-sm items-center gap-1.5 pb-2">
          <Label htmlFor="username">Username</Label>
          <Input type="text" id="username" placeholder="Username" value={username} onChange={(event) => setUsername(event.target.value)} />
        </div>
        <div className="grid w-full max-w-sm items-center gap-1.5 pb-2">
          <Label htmlFor="email">Email</Label>
          <Input type="email" id="email" placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} />
        </div>
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="password">Password</Label>
          <Input type="password" id="password" placeholder="Password" value={password} onChange={(event) => setPassword(event.target.value)} />
          {error !== "" ? (<div>{error}</div>) : null}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleLogin}>Register</Button>
      </CardFooter>
    </Card>
  )
}
function LoginPanel() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleLogin = async () => {
    if (email.match(/(\w+)@(\w+)\.(\w{2,3})/)) {
      const res = await fetch("/api/login", {
        method: 'POST',
        body: JSON.stringify({ email, password })
      })
      if (res.status == 200) {
        const token = (await res.text())
        const decoded = jwtDecode(token)
        console.log(decoded)
        sessionStorage.setItem("token", token);
        sessionStorage.setItem("decoded", JSON.stringify(decoded));

        navigate("dashboard")
      } else {
        console.error("scandal")
      }
    } else {
      setError("wrong email format")
    }
  }

  return (
    <Card className='w-[400px]'>
      <CardHeader>
        <div>Login Now</div>
      </CardHeader>
      <CardContent className='h-60'>
        <div className="grid w-full max-w-sm items-center gap-1.5 pb-2">
          <Label htmlFor="email">Email</Label>
          <Input type="email" id="email" placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} />
        </div>
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="password">Password</Label>
          <Input type="password" id="password" placeholder="Password" value={password} onChange={(event) => setPassword(event.target.value)} />
          {error !== "" ? (<div>{error}</div>) : null}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleLogin}>Login</Button>
      </CardFooter>
    </Card>
  )
}

export default AuthHandler 
