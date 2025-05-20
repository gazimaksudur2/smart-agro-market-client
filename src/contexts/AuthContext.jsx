import { createContext, useContext, useState, useEffect } from "react";
import {
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	signOut,
	onAuthStateChanged,
	GoogleAuthProvider,
	FacebookAuthProvider,
	signInWithPopup,
	updateProfile,
} from "firebase/auth";
import { auth } from "../firebase/firebase.config";
import axios from "axios";
import toast from "react-hot-toast";
import { areCookiesEnabled } from "../utils/cookieUtils";
import authService from "../services/authService";

export const AuthContext = createContext();

export function useAuth() {
	return useContext(AuthContext);
}

export default function AuthProvider({ children }) {
	const [currentUser, setCurrentUser] = useState(null);
	const [userRole, setUserRole] = useState("consumer");
	const [loading, setLoading] = useState(true);
	const [accessToken, setAccessToken] = useState("");
	const [usingCookies, setUsingCookies] = useState(true);

	// Create API base URL
	const apiBaseUrl =
		import.meta.env.VITE_SERVER_API_URL || "http://localhost:5000";

	// Check if cookies are enabled
	useEffect(() => {
		const cookiesEnabled = areCookiesEnabled();
		setUsingCookies(cookiesEnabled);
		console.log("Cookies enabled:", cookiesEnabled);

		// If in production and cookies aren't working, show a warning
		if (!cookiesEnabled && process.env.NODE_ENV === "production") {
			toast.error("Please enable cookies for full functionality");
		}
	}, []);

	// Central token management
	const handleToken = async (token) => {
		if (!token) return;

		// Store token
		setAccessToken(token);
		authService.storeToken(token);
	};

	// Register with email and password
	const registerWithEmail = async (
		email,
		password,
		name,
		profileImage,
		address
	) => {
		try {
			const userCredential = await createUserWithEmailAndPassword(
				auth,
				email,
				password
			);
			const user = userCredential.user;

			// Use provided profile image or default
			const photoURL = profileImage || "https://i.ibb.co/MBtjqXQ/no-avatar.gif";

			// Update profile with name and photo
			await updateProfile(user, {
				displayName: name?.first_name + " " + name?.last_name,
				photoURL,
			});

			// Create user in the backend with address
			await createUserInDatabase(
				user,
				password,
				"email-pass",
				"consumer",
				address
			);

			// Get JWT token after registration
			const token = await authService.getToken(user);
			await handleToken(token);

			// Return user info
			return user;
		} catch (error) {
			toast.error(error.message);
			throw error;
		}
	};

	// Login with email and password
	const loginWithEmail = async (email, password) => {
		try {
			// First authenticate with Firebase
			const userCredential = await signInWithEmailAndPassword(
				auth,
				email,
				password
			);
			const user = userCredential.user;

			// Then get token from backend
			const token = await authService.getToken(user);
			await handleToken(token);

			return user;
		} catch (error) {
			await authService.clearToken();
			toast.error(error.message || "Login failed");
			throw error;
		}
	};

	// Login with Google
	const loginWithGoogle = async () => {
		try {
			const provider = new GoogleAuthProvider();
			const result = await signInWithPopup(auth, provider);
			const user = result.user;

			// Check if user exists in database
			const { data: userInDatabase } = await axios.get(
				`${apiBaseUrl}/users/verifyUser?email=${user?.email}`
			);

			// If user doesn't exist in the database, create a new user
			if (!userInDatabase?.success) {
				await createUserInDatabase(user, null, "google");
			}

			// Get JWT token
			const token = await authService.getToken(user);
			await handleToken(token);

			return user;
		} catch (error) {
			await authService.clearToken();
			throw error;
		}
	};

	// Login with Facebook
	const loginWithFacebook = async () => {
		try {
			const provider = new FacebookAuthProvider();
			const result = await signInWithPopup(auth, provider);
			const user = result.user;

			// Check if user exists in database
			const { data: userInDatabase } = await axios.get(
				`${apiBaseUrl}/users/verifyUser?email=${user?.email}`
			);

			// If user doesn't exist in the database, create a new user
			if (!userInDatabase?.success) {
				await createUserInDatabase(user, null, "facebook");
			}

			// Get JWT token
			const token = await authService.getToken(user);
			await handleToken(token);

			return user;
		} catch (error) {
			await authService.clearToken();
			throw error;
		}
	};

	// Logout
	const logout = async () => {
		try {
			await signOut(auth);

			// Clear auth data
			await authService.clearToken();
			setAccessToken("");

			toast.success("User logged out successfully");
		} catch (error) {
			toast.error(error.message);
			throw error;
		}
	};

	// Create a new user in the database
	const createUserInDatabase = async (
		user,
		password,
		provider,
		role = "consumer",
		address = null
	) => {
		try {
			const { data } = await axios.post(
				`${apiBaseUrl}/users/register`,
				{
					name: user.displayName,
					email: user.email,
					password,
					provider,
					role,
					phoneNumber: "",
					address: address,
					firebaseUID: user.uid,
					profilePicture:
						user.photoURL || "https://i.ibb.co/MBtjqXQ/no-avatar.gif",
				},
				{ withCredentials: true }
			);
			return data;
		} catch (error) {
			currentUser && logout();
			throw error;
		}
	};

	// Get user role from API
	const getUserRole = async (email) => {
		try {
			const { data } = await axios.get(`${apiBaseUrl}/users/${email}`, {
				withCredentials: true,
			});

			if (data.role) {
				setUserRole(data.role);
				return data.role;
			}
			return "consumer";
		} catch (error) {
			console.error("Error getting user role:", error);
			return "consumer";
		}
	};

	// Check if user is Admin
	const isAdmin = () => userRole === "admin";

	// Check if user is Agent
	const isAgent = () => userRole === "agent";

	// Check if user is Seller
	const isSeller = () => userRole === "seller";

	// Check if user is Consumer
	const isConsumer = () => userRole === "consumer";

	// Set up an observer for auth state changes
	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, async (user) => {
			if (user) {
				setCurrentUser(user);
				try {
					// Get token from backend
					const token = await authService.getToken(user);
					await handleToken(token);

					// Get user role
					await getUserRole(user.email);
				} catch (error) {
					console.error("Error during auth state change:", error);
				}
			} else {
				setCurrentUser(null);
				setUserRole("consumer");
				setAccessToken("");
			}
			setLoading(false);
		});

		return unsubscribe;
	}, []);

	// Context value
	const value = {
		currentUser,
		userRole,
		loading,
		accessToken,
		usingCookies,
		registerWithEmail,
		loginWithEmail,
		loginWithGoogle,
		loginWithFacebook,
		logout,
		isAdmin,
		isAgent,
		isSeller,
		isConsumer,
		getUserRole,
		setUserRole,
	};

	return (
		<AuthContext.Provider value={value}>
			{!loading && children}
		</AuthContext.Provider>
	);
}
