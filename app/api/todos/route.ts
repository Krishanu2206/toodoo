import { NextRequest, NextResponse } from "next/server";
import { auth } from '@clerk/nextjs/server'
import prisma from "@/lib/prisma";

const ITEMS_PER_PAGE = 10;

export async function GET(req: NextRequest) {
    const {userId} : { userId : string | null | undefined} = await auth();

    if(!userId) {
        return NextResponse.json({success : false, message: 'Unauthorized'}, { status : 200})
    }

    const {searchParams} = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const search = searchParams.get('search');

    try {
        const todos = await prisma.todo.findMany({
            where : {
                userId : userId,
                title : {
                    contains : search? search : '',
                    mode : 'insensitive'
                }
            },
            orderBy : {createdAt : "desc" },
            take : ITEMS_PER_PAGE,
            skip : (page - 1) * ITEMS_PER_PAGE
        });

        const totalitems = await prisma.todo.count({
            where : {
                user : {
                    id : userId,
                },
                title : {
                    contains : search? search : '',
                    mode : 'insensitive'
                }
            }
        })

        const totalpages = Math.ceil(totalitems / ITEMS_PER_PAGE);

        return NextResponse.json({success : true, message : "All todos fetched successfully", todos, totalpages, totalitems, currentpage : page}, {status : 200});

    } catch (error) {
        console.log("Failed to fetch todos", error);
        return NextResponse.json({success : false, message : "Failed to fetch todos", error}, {status : 500});
    }
}

export async function POST(req: NextRequest) {
    try {
        const {userId} : { userId : string | null | undefined} = await auth();

        if(!userId) {
            return NextResponse.json({success : false, message: 'Unauthorized'}, { status : 200})
        }

        const user = await prisma.user.findUnique({
            where : {
                id : userId,
            },
            include : { todos : true },
        })

        console.log(user);

        if(!user) {
            return NextResponse.json({success : false, message: 'User not found'}, { status : 200})
        }
        if(!user.issubscribed && user.todos.length>3) {
            return NextResponse.json({success : false, message: 'You have reached your limit of 3 todos. Please subscribe to access more.'}, { status : 200})
        }

        const {title} = await req.json();
        const createdtodo = await prisma.todo.create({
            data : {
                title,
                user : {
                    connect : {
                        id : userId,
                    },
                },
            },
        })
        return NextResponse.json({success : true, message : "Todo created successfully", todo : createdtodo}, {status : 201});
    } catch (error) {
        console.log("Failed to create todos", error);
        return NextResponse.json({success : false, message : "Failed to create todos", error}, {status : 500})
    }
    
}