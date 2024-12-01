import { NextResponse } from "next/server"
import { ZoomService } from "@/services/zoom.service"

export async function GET(request) {
    try {
        // fetch url
        const { searchParams } = new URL(request.url);
        const meetingId = searchParams.get('meetingId');

        // EH
        if(!meetingId) {
            return NextResponse.json({ error: 'Meeting ID is required' }, { status: 400 });
        }

        // fetch acess token
        const access_token = await ZoomService.getAccessToken();


        // fetch artifacts (standard for OAuth 2.0 APIs)
        const artifactsResponse = await fetch(
            `https://api.zoom.us/v2/meetings/${meetingId}/recordings`,
            {headers: {'Authorization': `Bearer ${access_token}`, 'Content-Type': 'application/json'}}
        )

        // EH
        if (!artifactsResponse.ok) {
            throw new Error('Failed to fetch meeting artifacts');
        }

        // Return Statement
        const artifacts = await artifactsResponse.json();
        return NextResponse.json(artifacts);
    } catch (error) {
        // Error Handling
        console.error("Zoom API error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}