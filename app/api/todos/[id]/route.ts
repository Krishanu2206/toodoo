import { NextRequest, NextResponse } from "next/server";
import { auth } from '@clerk/nextjs/server'
import prisma from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 200 });
  }

  try {
    const { completed } = await req.json();
    const todoId = params.id;

    const todo = await prisma.todo.findUnique({
      where: { id: todoId },
    });

    if (!todo) {
      return NextResponse.json({ error: "Todo not found" }, { status: 200 });
    }

    if (todo.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 200 });
    }

    const updatedTodo = await prisma.todo.update({
      where: { id: todoId },
      data: { isCompleted : completed },
    });

    return NextResponse.json(updatedTodo);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req : NextRequest, {params} : {params : {id : string}}) {
    try {
        const {userId} : { userId : string | null | undefined} = await auth();

        if(!userId) {
            return NextResponse.json({success : false, message: 'Unauthorized'}, { status : 200})
        }

        const todoid = params.id;
        const todo = await prisma.todo.findUnique({
            where : {id : todoid},
            include : {user : true}
        });
        if(!todo){
            return NextResponse.json({success : false, message: 'Todo not found'}, { status : 200})
        }

        if(todo.userId!== userId){
            return NextResponse.json({success : false, message: 'Unauthorized'}, { status : 200})
        }
        await prisma.todo.delete({
            where : {id : todoid}
        })
        await prisma.user.update({
            where : {id : userId},
            data : {
                todos : {
                    delete : [{id : todoid}]
                }
            }
        })
        return NextResponse.json({success : true, message: 'Todo deleted successfully'}, { status : 200})

    } catch (error) {
        console.log("Failed to create todos", error);
        return NextResponse.json({success : false, message : "Failed to delete todos", error}, {status : 500}) 
    }
}