export const validatePassword = (password: string): { isValid: boolean; error?: string } => {
    if (!password || password.length < 8) {
        return { 
            isValid: false, 
            error: "Password must be at least 8 characters long." 
        };
    }
    return { isValid: true };
};