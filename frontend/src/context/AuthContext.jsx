import { createContext, useContext, useState, useEffect } from "react";
import { authApi, userApi } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // On mount, check for existing token and fetch profile
    useEffect(() => {
        const token = localStorage.getItem("access_token");
        if (token) {
            userApi
                .getProfile()
                .then(setUser)
                .catch(() => {
                    localStorage.removeItem("access_token");
                    localStorage.removeItem("refresh_token");
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (email, password) => {
        const tokens = await authApi.login(email, password);
        localStorage.setItem("access_token", tokens.access_token);
        localStorage.setItem("refresh_token", tokens.refresh_token);
        const profile = await userApi.getProfile();
        setUser(profile);
        return profile;
    };

    const adminLogin = async (email, password) => {
        const tokens = await authApi.adminLogin(email, password);
        localStorage.setItem("access_token", tokens.access_token);
        localStorage.setItem("refresh_token", tokens.refresh_token);
        const profile = await userApi.getProfile();
        setUser(profile);
        return profile;
    };

    const register = async (data) => {
        await authApi.register(data);
        // Do not automatically log in the user after registration
    };

    const logout = async () => {
        const refreshToken = localStorage.getItem("refresh_token");
        if (refreshToken) {
            try {
                await authApi.logout(refreshToken);
            } catch (err) {
                console.error("Backend logout failed:", err);
            }
        }
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        setUser(null);
    };

    const isAdmin = user?.role === "admin" || user?.role === "staff" || user?.role === "super_admin";

    return (
        <AuthContext.Provider
            value={{
                user,
                setUser,
                loading,
                isAuthenticated: !!user,
                isAdmin,
                login,
                adminLogin,
                register,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
