interface LoginPayload {
    username: string;
    password: string;
}

interface RegisterPayload extends LoginPayload {
    email: string;
}
