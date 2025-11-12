import { apiBase } from "@/lib/api/client";
import { GenericResponse } from "../generic-response";
import { RegisterPayload, RegisterResponse } from "./register-api";

async function register(input: RegisterPayload, token: string): Promise<GenericResponse<RegisterResponse>> {
    const response = await fetch(`${apiBase()}/register?token=${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
    });
    return response.json();
}

export const registerApi = {
    register,
}