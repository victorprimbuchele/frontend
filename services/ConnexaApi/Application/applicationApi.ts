import { apiBase } from "@/lib/api/client";
import { ApplicationResponse, CreateApplicationInput } from "./application-api";
import { GenericResponse } from "../generic-response";

async function createApplication(input: CreateApplicationInput): Promise<GenericResponse<ApplicationResponse>> {
    const response = await fetch(`${apiBase()}/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
    });
    return response.json();
}

export const applicationApi = {
    createApplication,
}