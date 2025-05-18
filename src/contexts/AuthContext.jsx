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
import {
	getCookie,
	setCookie,
	removeCookie,
	areCookiesEnabled,
} from "../utils/cookieUtils";

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
			try {
				const response = await axios.post(`${apiBaseUrl}/users/login`, {
					email: email,
					password: password,
				});

				// If server response includes a token but cookies aren't working, store it manually
				if (response.data.token && !usingCookies) {
					setAccessToken(response.data.token);
					localStorage.setItem("jwt_token", response.data.token);
				}
			} catch (error) {
				console.log(error);
				throw error?.response?.data || error;
			}

			const userCredential = await signInWithEmailAndPassword(
				auth,
				email,
				password
			);
			return userCredential.user;
		} catch (error) {
			clearCookies();
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
				await createUserInDatabase(user, null);
			}

			// After successful login, get JWT token
			await getJWTToken(user);

			return user;
		} catch (error) {
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
				await createUserInDatabase(user, null);
			}

			// After successful login, get JWT token
			await getJWTToken(user);

			return user;
		} catch (error) {
			throw error;
		}
	};

	// Logout
	const logout = async () => {
		try {
			await signOut(auth);

			// Clear both cookie and local storage
			clearCookies();
			localStorage.removeItem("jwt_token");
			setAccessToken("");

			toast.success("User logged out successfully");
		} catch (error) {
			toast.error(error.message);
			throw error;
		}
	};

	// clear cookies
	const clearCookies = async () => {
		try {
			await axios.post(`${apiBaseUrl}/jwt/clear`);
			// Also manually remove the cookie just in case
			removeCookie("jwt");
			setAccessToken("");
		} catch (error) {
			console.error("Error clearing cookies:", error);
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
			currentUser && logout();
			throw error;
		}
	};

	// Get JWT token from API
	const getJWTToken = async (user, role) => {
		try {
			// Try to get token from the server
			const response = await axios.post(`${apiBaseUrl}/jwt/token`, {
				uid: user.uid,
				email: user.email,
				role,
			});

			// If server response includes a token but cookies aren't working, store it manually
			if (response.data.token && !usingCookies) {
				setAccessToken(response.data.token);
				localStorage.setItem("jwt_token", response.data.token);
			}

			return true;
		} catch (error) {
			console.error("Error getting JWT token:", error);
			throw error;
		}
	};

	// Add token to requests if cookies aren't working
	useEffect(() => {
		// If cookies aren't working and we have a token, add it to all requests
		if (!usingCookies && (accessToken || localStorage.getItem("jwt_token"))) {
			const token = accessToken || localStorage.getItem("jwt_token");
			axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
		} else if (!usingCookies) {
			// No token available, clear authorization header
			delete axios.defaults.headers.common["Authorization"];
		}
	}, [usingCookies, accessToken]);

	// Get user role from API
	const getUserRole = async (email) => {
		try {
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
