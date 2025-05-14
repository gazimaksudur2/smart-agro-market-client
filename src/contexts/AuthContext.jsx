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

export const AuthContext = createContext();

export function useAuth() {
	return useContext(AuthContext);
}

export default function AuthProvider({ children }) {
	const [currentUser, setCurrentUser] = useState(null);
	const [userRole, setUserRole] = useState("consumer");
	const [loading, setLoading] = useState(true);
	const [accessToken, setAccessToken] = useState("");

	// Create API base URL
	const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

	// Register with email and password
	const registerWithEmail = async (email, password, name) => {
		try {
			const userCredential = await createUserWithEmailAndPassword(
				auth,
				email,
				password
			);
			const user = userCredential.user;

			// Update profile with name
			await updateProfile(user, { displayName: name });

			// Create user in the backend
			await createUserInDatabase(user, "consumer");

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
			const userCredential = await signInWithEmailAndPassword(
				auth,
				email,
				password
			);
			return userCredential.user;
		} catch (error) {
			toast.error(error.message);
			throw error;
		}
	};

	// Login with Google
	const loginWithGoogle = async () => {
		try {
			const provider = new GoogleAuthProvider();
			const result = await signInWithPopup(auth, provider);
			const user = result.user;

			// Check if user exists in database, if not create a new user
			await createUserInDatabase(user, "consumer");

			return user;
		} catch (error) {
			toast.error(error.message);
			throw error;
		}
	};

	// Login with Facebook
	const loginWithFacebook = async () => {
		try {
			const provider = new FacebookAuthProvider();
			const result = await signInWithPopup(auth, provider);
			const user = result.user;

			// Check if user exists in database, if not create a new user
			await createUserInDatabase(user, "consumer");

			return user;
		} catch (error) {
			toast.error(error.message);
			throw error;
		}
	};

	// Logout
	const logout = async () => {
		try {
			await signOut(auth);
			setAccessToken("");
			localStorage.removeItem("access_token");
		} catch (error) {
			toast.error(error.message);
			throw error;
		}
	};

	// Create a new user in the database
	const createUserInDatabase = async (user, role) => {
		try {
			const { data } = await axios.post(`${apiBaseUrl}/users`, {
				name: user.displayName,
				email: user.email,
				role: role,
				firebaseUID: user.uid,
				profilePicture:
					user.photoURL || "https://i.ibb.co/MBtjqXQ/no-avatar.gif",
			});
			return data;
		} catch (error) {
			console.error("Error creating user in database:", error);
			throw error;
		}
	};

	// Get JWT token from API
	const getJWTToken = async (user) => {
		try {
			const { data } = await axios.post(`${apiBaseUrl}/jwt`, {
				email: user.email,
				uid: user.uid,
			});

			const token = data.token;
			setAccessToken(token);
			localStorage.setItem("access_token", token);
			return token;
		} catch (error) {
			console.error("Error getting JWT token:", error);
			throw error;
		}
	};

	// Get user role from API
	const getUserRole = async (email) => {
		try {
			const token = localStorage.getItem("access_token");
			const { data } = await axios.get(`${apiBaseUrl}/users/${email}`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
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
				await getJWTToken(user);
				await getUserRole(user.email);
			} else {
				setCurrentUser(null);
				setUserRole("consumer");
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
