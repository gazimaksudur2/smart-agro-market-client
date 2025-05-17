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
	const apiBaseUrl =
		import.meta.env.VITE_SERVER_API_URL || "http://localhost:5000";

	// Configure axios to include credentials in requests - removed as it's set globally in axiosConfig.js

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
			await createUserInDatabase(user, password, "consumer", address);

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
			await createUserInDatabase(user, null, "consumer");

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
			await createUserInDatabase(user, null, "consumer");

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
			// No need to manually remove local storage token as we're using cookies
			// Backend will handle clearing the cookie on logout
			await axios.post(`${apiBaseUrl}/jwt/clear`);
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
		role = "consumer",
		address = null
	) => {
		try {
			const { data } = await axios.post(`${apiBaseUrl}/users/register`, {
				name: user.displayName,
				email: user.email,
				password,
				role,
				phoneNumber: "",
				address: address || "",
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
	const getJWTToken = async (user, role) => {
		try {
			// The token will now be set as a cookie by the server
			await axios.post(`${apiBaseUrl}/jwt/token`, {
				uid: user.uid,
				email: user.email,
				role,
			});
			// No need to store in local storage as it's now in cookies
			// The cookie will be automatically sent with subsequent requests
			return true;
		} catch (error) {
			console.error("Error getting JWT token:", error);
			throw error;
		}
	};

	// Get user role from API
	const getUserRole = async (email) => {
		try {
			// No need to manually add Authorization header as cookies are sent automatically
			const { data } = await axios.get(`${apiBaseUrl}/users/${email}`);

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
