import { NextRequest, NextResponse } from "next/server";
import { auth } from '@clerk/nextjs/server'
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
    const {userId} : { userId : string | null | undefined} = await auth();

    if(!userId) {
        return NextResponse.json({success : false, message: 'Unauthorized'}, { status : 200})
    }

    //capture payment details 

    try {
        const user = await prisma.user.findUnique({
            where : { id : userId },
        });
        if(!user){
            return NextResponse.json({success : false, message: 'User not found'}, { status : 200})
        }

        const subscriptionends = new Date();
        subscriptionends.setMonth(subscriptionends.getMonth() + 1);

        const updateduser = await prisma.user.update({
            where : { id : userId },
            data : {
                issubscribed : true, 
                subscriptionends },
        });

        return NextResponse.json({success : true, message: 'Subscription updated successfully', subscriptionends}, { status : 200})
    } catch (error) {
        console.error("Error updating subscription", error);
        return NextResponse.json({success : false, message: 'Failed to update subscription'}, { status : 500})
    }

}

export async function GET(req : NextRequest){
    const {userId} : { userId : string | null | undefined} = await auth();

    if(!userId) {
        return NextResponse.json({success : false, message: 'Unauthorized'}, { status : 200})
    }

    try {
        const user = await prisma.user.findUnique({
            where : { id : userId },
            select : { issubscribed : true, subscriptionends : true },
        });
        if(!user){
            return NextResponse.json({success : false, message: 'User not found'}, { status : 200 })
        }

        const now = new Date(Date.now());
        if(user.subscriptionends && user.subscriptionends < now) {
            const updateduser = await prisma.user.update({
            where : { id : userId },
            data : {
                issubscribed : false, 
                subscriptionends : null},
            });
            return NextResponse.json({success : true, message: 'Subscription updated successfully', issubscribed : false, subscriptionends : updateduser.subscriptionends}, { status : 200})
        }

        return NextResponse.json({success : true, message: 'User is already subscribed', issubscribed : user.issubscribed, subscriptionends : user.subscriptionends}, { status : 200})
        
    } catch (error) {
        console.error("Error updating subscription", error);
        return NextResponse.json({success : false, message: 'Failed to update subscription'}, { status : 500})
    }

}

