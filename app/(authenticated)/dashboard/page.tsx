"use client"
import React, { useCallback, useEffect, useState } from 'react'
import { useUser } from "@clerk/nextjs";
import { AlertTriangle, Loader } from 'lucide-react';
import { Todo } from '@prisma/client';
import { useDebounceValue } from 'usehooks-ts'
import { useToast } from '@/hooks/use-toast';
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
import { Eye, EyeOff } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

function Dashboard() {

  const {isSignedIn, user, isLoaded} = useUser();
  const [todos, settodos] = useState<Todo[]>([]);
  const [searchterm, setsearchterm] = useState('');
  const [loading, setloading] = useState(false);
  const [totalpages, settotalpages] = useState(0);
  const [currentpage, setcurrentpage] = useState(1);
  const [totalitems, settotalitems] = useState(0);
  const [issubscribed, setissubscribed] = useState(false);
  const [debouncesearchterm] = useDebounceValue(searchterm, 300);
  const { toast } = useToast()

  if(!isLoaded){
    return <Loader className='animate-spin'>Loading...</Loader>
  }

  const fetchtodos = useCallback(async(page : number)=>{
    try {
        setloading(true);
        const response = await fetch(`/api/todos?page=${page}&search=${debouncesearchterm}`, {
            method: 'GET',
        })
        if(!response.ok){
            toast({
                title: 'Error',
                description: 'Failed to fetch todos',
                variant: 'destructive',
            })
        }
        const data = await response.json();
        if(data.success === true){
            toast({
                title: 'Success',
                description: data.message,
                variant:'default',
            })
            settodos(data.todos);
            settotalpages(data.totalpages);
            setcurrentpage(data.currentpage);
            settotalitems(data.totalitems);
            setloading(false);
        }else{
            toast({
                title: 'Error',
                description: data.message,
                variant: 'destructive',
            })
            setloading(false);
        }
    } catch (error:any) {
        setloading(false);
        console.log(error.message);
        toast({
            title: 'Error',
            description: 'Failed to fetch todos',
            variant: 'destructive',
        })
    }
  }, [debouncesearchterm]) 

  const fetchsubscriptionstatus = async()=>{
    try {
        const response = await fetch('/api/subscription', {
            method : 'GET',
        });
        if(!response.ok){
            toast({
                title: 'Error',
                description: 'Failed to fetch subscription status',
                variant: 'destructive',
            })
        }
        const data = await response.json();
        setissubscribed(data.issubscribed);
    } catch (error : any) {
        console.log(error.message);
        toast({
            title: 'Error',
            description: 'Internal Server Error',
            variant: 'destructive',
        })
        }   
    }

    const handleaddtodo = async(title: string)=>{
        try {
            setloading(true);
            const response = await fetch('/api/todos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({title:title}),
            })
            if(!response.ok){
                toast({
                    title: 'Error',
                    description: 'Failed to add todo',
                    variant: 'destructive',
                })
            }
            const data = await response.json();
            if(data.success === true){
                toast({
                    title: 'Success',
                    description: data.message,
                    variant: 'default',
                })
                await fetchtodos(currentpage);
            }else{
                toast({
                    title: 'Error',
                    description: data.message,
                    variant: 'destructive',
                })
            setloading(false);
        }
        } catch (error :any) {
            setloading(false);
            console.log(error.message);
            toast({
                title: 'Error',
                description: 'Internal Server Error',
                variant: 'destructive',
            })  
        }
    }

    const handleupdatedtodo = async(id: string, completed : boolean)=>{
        try {
            setloading(true);
            const response = await fetch(`/api/todos/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({completed:completed}),
            })
            if(!response.ok){
                toast({
                    title: 'Error',
                    description: 'Failed to update todo',
                    variant: 'destructive',
                })
            }
            const data = await response.json();
            if(data.success === true){
                toast({
                    title: 'Success',
                    description: data.message,
                    variant: 'default',
                })
                await fetchtodos(currentpage);
            }else{
                toast({
                    title: 'Error',
                    description: data.message,
                    variant: 'destructive',
                })
            }
            setloading(false);
        } catch (error :any) {
            setloading(false);
            console.log(error.message);
            toast({
                title: 'Error',
                description: 'Internal Server Error',
                variant: 'destructive',
            })
        }
    }

    const handledeleteTodo = async(id: string)=>{
        try {
            setloading(true);
            const response = await fetch(`/api/todos/${id}`, {
                method: 'DELETE'
            });
            if(!response.ok){
                toast({
                    title: 'Error',
                    description: 'Failed to delete todo',
                    variant: 'destructive',
                })
            }
            const data = await response.json();
            if(data.success === true){
                toast({
                    title: 'Success',
                    description: data.message,
                    variant: 'default',
                })
                await fetchtodos(currentpage);
            }else{
                toast({
                    title: 'Error',
                    description: data.message,
                    variant: 'destructive',
                })
            }
            setloading(false);
        } catch (error : any) {
            setloading(false);
            console.log(error.message);
            toast({
                title: 'Error',
                description: 'Internal Server Error',
                variant: 'destructive',
            })
        }
    }

    useEffect(()=>{
        fetchtodos(1);
        fetchsubscriptionstatus()
    }, [])

  return (
    <div className="container mx-auto p-4 max-w-3xl mb-8">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Welcome, {user?.emailAddresses[0].emailAddress}!
      </h1>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Add New Todo</CardTitle>
        </CardHeader>
        <CardContent>
          <TodoForm onSubmit={(title) => handleaddtodo(title)} />
        </CardContent>
      </Card>
      {!issubscribed && todos.length >= 3 && (
        <Alert variant="destructive" className="mb-8">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You&apos;ve reached the maximum number of free todos.{" "}
            <Link href="/subscribe" className="font-medium underline">
              Subscribe now
            </Link>{" "}
            to add more.
          </AlertDescription>
        </Alert>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Your Todos</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            type="text"
            placeholder="Search todos..."
            value={searchterm}
            onChange={(e) => setsearchterm(e.target.value)}
            className="mb-4"
          />
          {loading ? (
            <p className="text-center text-muted-foreground">
              Loading your todos...
            </p>
          ) : todos.length === 0 ? (
            <p className="text-center text-muted-foreground">
              You don&apos;t have any todos yet. Add one above!
            </p>
          ) : (
            <>
              <ul className="space-y-4">
                {todos.map((todo: Todo) => (
                  <TodoItem
                    key={todo.id}
                    todo={todo}
                    onUpdate={handleupdatedtodo}
                    onDelete={handledeleteTodo}
                  />
                ))}
              </ul>
              <Pagination
                currentPage={currentpage}
                totalPages={totalpages}
                onPageChange={(page) => fetchtodos(page)}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default Dashboard;
