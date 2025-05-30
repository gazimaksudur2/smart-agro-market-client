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
	updatePassword,
	reauthenticateWithCredential,
	EmailAuthProvider,
} from "firebase/auth";
import { auth } from "../firebase/firebase.config";
import axios from "axios";
import toast from "react-hot-toast";
import { areCookiesEnabled } from "../utils/cookieUtils";
import authService from "../services/authService";
import cartService from "../services/cartService";

export const AuthContext = createContext();

export function useAuth() {
	return useContext(AuthContext);
}

export default function AuthProvider({ children }) {
	const [currentUser, setCurrentUser] = useState(null);
	const [currentRole, setCurrentRole] = useState(null);
	const [loading, setLoading] = useState(true);
	const [accessToken, setAccessToken] = useState("");
	const [usingCookies, setUsingCookies] = useState(true);
	console.log(currentUser);

	// Create API base URL
	const apiBaseUrl =
		import.meta.env.VITE_SERVER_API_URL || "http://localhost:5000";

	// Check if cookies are enabled
	useEffect(() => {
		const cookiesEnabled = areCookiesEnabled();
		setUsingCookies(cookiesEnabled);
		console.log("Cookies enabled:", cookiesEnabled);

		// Initialize token from localStorage if available
		const tokenInitialized = authService.initializeToken();

		// If token was initialized, get user info from token
		if (tokenInitialized) {
			const userInfo = authService.getCurrentUserInfo();
			if (userInfo) {
				setCurrentRole(userInfo.role);
				console.log("Initialized role from existing token:", userInfo.role);
			}
		}

		// If in production and cookies aren't working, show a warning
		if (!cookiesEnabled && process.env.NODE_ENV === "production") {
			toast.error("Please enable cookies for full functionality");
		}
	}, []);

	// Get user role from API
	const getDBUser = async (email) => {
		try {
			const { data } = await axios.get(`${apiBaseUrl}/users/${email}`, {
				withCredentials: true,
			});

			if (data.success) {
				setCurrentUser((prevUser) => ({
					...prevUser,
					DBUser: data.user,
				}));
				return data.user.role;
			}
			return null; // Don't assign default role
		} catch (error) {
			console.error("Error getting user role:", error);
			return null; // Don't assign default role
		}
	};

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
			const { token, user: userFromToken } = await authService.getToken(
				user,
				password
			);
			await handleToken(token);
			setCurrentRole(userFromToken.role);

			// Set current user immediately with Firebase user
			setCurrentUser({ FirebaseUser: user, DBUser: null });

			// Then get DB user info
			await getDBUser(user.email);

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

			// Set current user immediately with Firebase user
			setCurrentUser({ FirebaseUser: user, DBUser: null });

			// Check if user exists in database
			const { data: userInDatabase } = await axios.get(
				`${apiBaseUrl}/users/verifyUser?email=${user?.email}`
			);

			// If user doesn't exist in the database, create a new user
			if (!userInDatabase?.success) {
				await createUserInDatabase(user, null, "google");
			} else {
				// If user exists, get their DB info
				await getDBUser(user.email);
			}

			// Get JWT token (will use existing valid token if available)
			const { token, user: userFromToken } = await authService.getToken(user);
			await handleToken(token);
			setCurrentRole(userFromToken.role);

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

			// Set current user immediately with Firebase user
			setCurrentUser({ FirebaseUser: user, DBUser: null });

			// Check if user exists in database
			const { data: userInDatabase } = await axios.get(
				`${apiBaseUrl}/users/verifyUser?email=${user?.email}`
			);

			// If user doesn't exist in the database, create a new user
			if (!userInDatabase?.success) {
				await createUserInDatabase(user, null, "facebook");
			} else {
				// If user exists, get their DB info
				await getDBUser(user.email);
			}

			// Get JWT token (will use existing valid token if available)
			const { token, user: userFromToken } = await authService.getToken(user);
			await handleToken(token);
			setCurrentRole(userFromToken.role);

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
			setCurrentRole(null);

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
			setCurrentRole(role);
			setCurrentUser((prevUser) => ({
				...prevUser,
				DBUser: data?.success ? data.user : null,
			}));
			return data;
		} catch (error) {
			currentUser && logout();
			throw error;
		}
	};

	// Check if user is Admin
	const isAdmin = () => currentRole === "admin";

	// Check if user is Agent
	const isAgent = () => currentRole === "agent";

	// Check if user is Seller
	const isSeller = () => currentRole === "seller";

	// Check if user is Consumer
	const isConsumer = () => currentRole === "consumer";

	// Check if user is authenticated with valid token
	const isAuthenticated = () => {
		return currentUser?.FirebaseUser && authService.hasValidToken();
	};

	// Change password
	const changePassword = async (currentPassword, newPassword) => {
		try {
			const user = currentUser?.FirebaseUser;
			if (!user || !user.email) {
				throw new Error("User not authenticated");
			}

			// Re-authenticate user with current password
			const credential = EmailAuthProvider.credential(
				user.email,
				currentPassword
			);
			await reauthenticateWithCredential(user, credential);

			// Update password in Firebase
			await updatePassword(user, newPassword);

			// Update password in database
			await axios.patch(
				`${apiBaseUrl}/users/${user.email}/password`,
				{ newPassword },
				{ withCredentials: true }
			);

			toast.success("Password updated successfully");
			return true;
		} catch (error) {
			console.error("Error changing password:", error);

			// Handle specific error messages
			if (error.code === "auth/wrong-password") {
				toast.error("Current password is incorrect");
			} else if (error.code === "auth/weak-password") {
				toast.error(
					"New password is too weak. Please choose a stronger password."
				);
			} else if (error.code === "auth/requires-recent-login") {
				toast.error(
					"Please log out and log in again before changing your password"
				);
			} else {
				toast.error(error.message || "Failed to update password");
			}
			throw error;
		}
	};

	// Update user profile
	const updateUserProfile = async (displayName = null, photoURL = null) => {
		try {
			const user = currentUser?.FirebaseUser;
			if (!user || !user.email) {
				throw new Error("User not authenticated");
			}

			// Update Firebase profile
			await updateProfile(user, {
				displayName: displayName || user.displayName,
				photoURL: photoURL || user.photoURL,
			});

			// Update current user state
			setCurrentUser((prevUser) => ({
				...prevUser,
				FirebaseUser: {
					...prevUser.FirebaseUser,
					photoURL: photoURL || user.photoURL,
					displayName: displayName || user.displayName,
				},
			}));

			// Refresh database user data
			await getDBUser(user.email);

			return true;
		} catch (error) {
			console.error("Error updating profile picture:", error);
			toast.error("Failed to update profile picture");
			throw error;
		}
	};

	// Set up an observer for auth state changes
	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, async (user) => {
			if (user) {
				// Set current user immediately with Firebase user
				setCurrentUser({ FirebaseUser: user, DBUser: null });

				try {
					// Check if we already have a valid token before making API call
					let token = authService.getCurrentToken();
					if (!token || !authService.isTokenValid(token)) {
						console.log("Getting new token for user:", user.email);
						const { token: tokenValue, user: userFromToken } =
							await authService.getToken(user);
						await handleToken(tokenValue);
						setCurrentRole(userFromToken.role);
					} else {
						console.log("Using existing valid token for user:", user.email);
						setAccessToken(token);

						// Get user info from existing token using centralized function
						const userInfo = authService.getCurrentUserInfo();
						if (userInfo) {
							setCurrentRole(userInfo.role);
							console.log("Set role from existing token:", userInfo.role);
						} else {
							// If we can't decode, fetch new token
							const { token: tokenValue, user: userFromToken } =
								await authService.getToken(user);
							await handleToken(tokenValue);
							setCurrentRole(userFromToken.role);
						}
					}

					// Get DB user info and wait for it
					const role = await getDBUser(user.email);
					if (role) setCurrentRole(role);

					// Merge cart from localStorage to database when user logs in
					try {
						await cartService.mergeAndTransferCart(user.email);
					} catch (error) {
						console.error("Error merging cart on login:", error);
					}
				} catch (error) {
					console.error("Error during auth state change:", error);
				}
			} else {
				setCurrentUser(null);
				setAccessToken("");
				setCurrentRole(null);
			}
			setLoading(false);
		});

		return unsubscribe;
	}, []);

	// Context value
	const value = {
		currentUser,
		loading,
		accessToken,
		usingCookies,
		currentRole,
		setCurrentRole,
		registerWithEmail,
		loginWithEmail,
		loginWithGoogle,
		loginWithFacebook,
		logout,
		changePassword,
		updateUserProfile,
		isAdmin,
		isAgent,
		isSeller,
		isConsumer,
		isAuthenticated,
		getDBUser,
	};

	return (
		<AuthContext.Provider value={value}>
			{!loading && children}
		</AuthContext.Provider>
	);
}
