interface LoginPayload {
    username: string;
    password: string;
}

interface RegisterPayload extends LoginPayload {
    email: string;
}

interface OAuthPayload {
    code: string;
    redirectUrl: string;
}
