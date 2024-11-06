"use client"
import React, { useState } from 'react'
import { useSignIn } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Eye, EyeOff, LoaderCircle } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

function Signinpage() {

  const {isLoaded, signIn, setActive} = useSignIn()
  const [password, setpassword] = useState<string>('')
  const [showpassword, setshowpassword] = useState<boolean>(false)
  const [error, seterror] = useState<string>('');
  const [identifier, setIdentifier] = useState<string>('');
  const [pendingverification, setpendingverification] = useState<boolean>(false);

  const router = useRouter();

  if(!isLoaded){
    return <div className='text-center'>Loading...</div>
  }

  async function submit(e:React.FormEvent){
    e.preventDefault();
    if(!isLoaded){
      return <div className="text-center">Loading...</div>
    }
    try {
      const result = await signIn.create({
        identifier,
        password
      })
      setpendingverification(true);
      if(signIn.status === 'needs_identifier'){
        seterror('User needs to verify email address and password');
        console.log('User needs to verify email address and password');
      }
      if(signIn.status !== 'complete'){
        console.log(JSON.stringify(result, null, 2));
      }
      if(signIn.status === 'complete'){
        await setActive({session : signIn.createdSessionId});
        console.log(signIn.userData);
        setpendingverification(false);
        router.push('/dashboard');
      }
    } catch (error : any) {
      console.log(JSON.stringify(error, null, 2));
      seterror(error.errors[0].message);
    }
  }
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Login for Toodoo
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!pendingverification ? (
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  id="email"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    type={showpassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setpassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setshowpassword(!showpassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                  >
                    {showpassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </button>
                </div>
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full">
                Login
              </Button>
            </form>
          ) : (
            <LoaderCircle className='animate-spin'/>
          )}
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              href="/sign-up"
              className="font-medium text-primary hover:underline"
            >
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

export default Signinpage
