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

	// Create API base URL
	const apiBaseUrl =
		import.meta.env.VITE_SERVER_API_URL || "http://localhost:5000";

	// Check if cookies are enabled and warm up auth state from stored JWT on hard reload
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
		if (!cookiesEnabled && import.meta.env.VITE_PROD == "production") {
			toast.error("Please enable cookies for full functionality");
		}
	}, []);

	// On first mount, if we have a valid JWT but Firebase hasn't restored yet,
	// attempt to hydrate DB user so role-restricted routes don't kick us out on reload
	useEffect(() => {
		const bootstrapFromToken = async () => {
			try {
				const token = authService.getCurrentToken();
				if (token && authService.isTokenValid(token)) {
					// Hydrate DB user from backend
					const role = await getDBUser(null);
					if (role) setCurrentRole(role);
				}
			} catch (e) {
				// ignore
			}
		};
		bootstrapFromToken();
	}, []);

	// Get user role from API
	const getDBUser = async (email) => {
		try {
			const { data } = await axios.get(`${apiBaseUrl}/api/auth/me`, {
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
		address,
		fullAddress
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
				address,
				fullAddress
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

			// Then get token from backend (basic-auth: /auth/login)
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

	// Login with Google (OAuth exchange)
	const loginWithGoogle = async () => {
		try {
			const provider = new GoogleAuthProvider();
			const result = await signInWithPopup(auth, provider);
			const user = result.user;

			// Attempt to extract provider access token
			const googleCredential = GoogleAuthProvider.credentialFromResult(result);
			const oauthToken = googleCredential?.accessToken || null;

			// Exchange OAuth token with backend
			const { data } = await axios.post(
				`${apiBaseUrl}/api/auth/oauth/google`,
				{
					oauthToken,
					email: user?.email,
					name: user?.displayName,
				},
				{ withCredentials: true }
			);

			if (data?.token) {
				await handleToken(data.token);
				setCurrentRole(data?.user?.role || null);
				setCurrentUser({ FirebaseUser: user, DBUser: data?.user || null });
			} else {
				// Fallback: set Firebase user and fetch DB profile
				setCurrentUser({ FirebaseUser: user, DBUser: null });
				await getDBUser(user?.email);
			}

			return user;
		} catch (error) {
			await authService.clearToken();
			throw error;
		}
	};

	// Login with Facebook (OAuth exchange)
	const loginWithFacebook = async () => {
		try {
			const provider = new FacebookAuthProvider();
			const result = await signInWithPopup(auth, provider);
			const user = result.user;

			// Attempt to extract provider access token
			const fbCredential = FacebookAuthProvider.credentialFromResult(result);
			const oauthToken = fbCredential?.accessToken || null;

			// Exchange OAuth token with backend
			const { data } = await axios.post(
				`${apiBaseUrl}/api/auth/oauth/facebook`,
				{
					oauthToken,
					email: user?.email,
					name: user?.displayName,
				},
				{ withCredentials: true }
			);

			if (data?.token) {
				await handleToken(data.token);
				setCurrentRole(data?.user?.role || null);
				setCurrentUser({ FirebaseUser: user, DBUser: data?.user || null });
			} else {
				// Fallback: set Firebase user and fetch DB profile
				setCurrentUser({ FirebaseUser: user, DBUser: null });
				await getDBUser(user?.email);
			}

			return user;
		} catch (error) {
			await authService.clearToken();
			throw error;
		}
	};

	// Logout
	const logout = async () => {
		try {
			// Clear local JWT and axios header first to immediately deauth client-side
			await authService.clearToken();
			setAccessToken("");
			setCurrentRole(null);
			setCurrentUser(null);

			// Best-effort Firebase sign-out (don't block on failures)
			try {
				await signOut(auth);
			} catch (_) {}

			toast.success("User logged out successfully");
		} catch (error) {
			// Ensure local state is cleared even if server call fails
			setAccessToken("");
			setCurrentRole(null);
			setCurrentUser(null);
			throw error;
		}
	};

	// Create a new user in the database
	const createUserInDatabase = async (
		user,
		password,
		provider,
		role = "consumer",
		address = null,
		fullAddress = null
	) => {
		try {
			const { data } = await axios.post(
				`${apiBaseUrl}/api/auth/register`,
				{
					name: user.displayName,
					email: user.email,
					password,
					provider,
					role,
					phoneNumber: "",
					address: address,
					fullAddress: fullAddress,
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
		// Consider user authenticated if we have a valid JWT (server session) even
		// before Firebase observer repopulates on hard reload
		return authService.hasValidToken();
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
				`${apiBaseUrl}/api/users/updatePassword/${user.email}`,
				{ currentPassword, newPassword },
				{ withCredentials: true }
			);

			toast.success("Password updated successfully");
			return true;
		} catch (error) {
			console.error("Error changing password:", error);

			toast.error(
				error?.code
					? `${error.code}: ${error.message}`
					: "Failed to update password"
			);
			throw error;
		}
	};

	// Update user profile
	const updateUserProfile = async (displayName = null, photoURL = null) => {
		try {
			// Get the current user from Firebase Auth directly to ensure fresh state
			const currentFirebaseUser = auth.currentUser;
			if (!currentFirebaseUser || !currentFirebaseUser.email) {
				throw new Error("User not authenticated or session expired");
			}

			// Check if we have valid current user state
			const user = currentUser?.FirebaseUser;
			if (!user || user.uid !== currentFirebaseUser.uid) {
				throw new Error("User state is not synchronized");
			}

			// Only update if there are actual changes
			const currentDisplayName = currentFirebaseUser.displayName;
			const currentPhotoURL = currentFirebaseUser.photoURL;

			const newDisplayName = displayName || currentDisplayName;
			const newPhotoURL = photoURL || currentPhotoURL;

			// Check if there are any changes to avoid unnecessary Firebase calls
			if (
				newDisplayName === currentDisplayName &&
				newPhotoURL === currentPhotoURL
			) {
				console.log("No changes detected, skipping Firebase update");
				return true;
			}

			await updateProfile(currentFirebaseUser, {
				displayName: newDisplayName,
				photoURL: newPhotoURL,
			});

			// Wait a moment for Firebase to process the update
			await new Promise((resolve) => setTimeout(resolve, 100));

			// Update current user state with the fresh data
			setCurrentUser((prevUser) => ({
				...prevUser,
				FirebaseUser: {
					...prevUser.FirebaseUser,
					photoURL: newPhotoURL,
					displayName: newDisplayName,
				},
			}));

			// Refresh database user data
			await getDBUser(currentFirebaseUser.email);

			return true;
		} catch (error) {
			console.error("Error updating profile:", error);

			// Handle specific Firebase errors
			if (error.code === "auth/user-token-expired") {
				toast.error("Session expired. Please log in again.");
				await logout();
			} else if (error.message?.includes("getIdToken")) {
				toast.error("Session error. Please try again or log in again.");
			} else {
				toast.error(error.message || "Failed to update profile");
			}

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
