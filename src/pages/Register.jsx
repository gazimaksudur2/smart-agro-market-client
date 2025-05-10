import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FaGoogle, FaFacebook } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const [loading, setLoading] = useState(false);
  const { registerWithEmail, loginWithGoogle, loginWithFacebook } = useAuth();
  const [selectedRole, setSelectedRole] = useState('consumer');
  
  const navigate = useNavigate();
  const password = watch('password');

  // Handle registration with email/password
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await registerWithEmail(data.email, data.password, data.name);
      toast.success('Registration successful! Please complete your profile.');
      navigate('/dashboard/profile', { state: { newUser: true, role: selectedRole } });
    } catch (error) {
      toast.error(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Google login/registration
  const handleGoogleRegister = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      toast.success('Registration successful! Please complete your profile.');
      navigate('/dashboard/profile', { state: { newUser: true, role: selectedRole } });
    } catch (error) {
      toast.error(error.message || 'Google registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Facebook login/registration
  const handleFacebookRegister = async () => {
    setLoading(true);
    try {
      await loginWithFacebook();
      toast.success('Registration successful! Please complete your profile.');
      navigate('/dashboard/profile', { state: { newUser: true, role: selectedRole } });
    } catch (error) {
      toast.error(error.message || 'Facebook registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Link to="/" className="flex items-center">
            <span className="text-3xl font-display font-bold text-primary-600">SmartAgro</span>
            <span className="ml-1 text-3xl font-display font-bold text-gray-700">Connect</span>
          </Link>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
            sign in to your existing account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Registration form */}
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Name field */}
            <div>
              <label htmlFor="name" className="form-label">
                Full Name
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  className="form-input"
                  {...register('name', { 
                    required: 'Name is required',
                    minLength: {
                      value: 2,
                      message: 'Name must be at least 2 characters'
                    }
                  })}
                />
                {errors.name && <p className="form-error">{errors.name.message}</p>}
              </div>
            </div>

            {/* Email field */}
            <div>
              <label htmlFor="email" className="form-label">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className="form-input"
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                />
                {errors.email && <p className="form-error">{errors.email.message}</p>}
              </div>
            </div>

            {/* Password field */}
            <div>
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  className="form-input"
                  {...register('password', { 
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    }
                  })}
                />
                {errors.password && <p className="form-error">{errors.password.message}</p>}
              </div>
            </div>

            {/* Confirm Password field */}
            <div>
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  type="password"
                  className="form-input"
                  {...register('confirmPassword', { 
                    required: 'Please confirm your password',
                    validate: value => value === password || 'Passwords do not match'
                  })}
                />
                {errors.confirmPassword && <p className="form-error">{errors.confirmPassword.message}</p>}
              </div>
            </div>

            {/* User role selection */}
            <div>
              <label className="form-label">I am a</label>
              <div className="mt-2 grid grid-cols-3 gap-3">
                <div 
                  className={`border rounded-md p-3 flex flex-col items-center cursor-pointer 
                    ${selectedRole === 'consumer' ? 'border-primary-500 bg-primary-50' : 'border-gray-300'}`}
                  onClick={() => setSelectedRole('consumer')}
                >
                  <span className="text-sm font-medium text-gray-900">Buyer</span>
                  <span className="text-xs text-gray-500">Looking to purchase</span>
                </div>
                <div 
                  className={`border rounded-md p-3 flex flex-col items-center cursor-pointer 
                    ${selectedRole === 'seller' ? 'border-primary-500 bg-primary-50' : 'border-gray-300'}`}
                  onClick={() => setSelectedRole('seller')}
                >
                  <span className="text-sm font-medium text-gray-900">Seller</span>
                  <span className="text-xs text-gray-500">Looking to sell</span>
                </div>
                <div 
                  className={`border rounded-md p-3 flex flex-col items-center cursor-pointer 
                    ${selectedRole === 'agent' ? 'border-primary-500 bg-primary-50' : 'border-gray-300'}`}
                  onClick={() => setSelectedRole('agent')}
                >
                  <span className="text-sm font-medium text-gray-900">Agent</span>
                  <span className="text-xs text-gray-500">Local representative</span>
                </div>
              </div>
            </div>

            {/* Agreement checkbox */}
            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                {...register('terms', { 
                  required: 'You must agree to the terms and conditions'
                })}
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                I agree to the{' '}
                <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
                  terms and conditions
                </a>
              </label>
            </div>
            {errors.terms && <p className="form-error">{errors.terms.message}</p>}

            {/* Submit button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full btn btn-primary py-2 px-4 flex justify-center"
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : 'Create Account'}
              </button>
            </div>
          </form>

          {/* Social registration divider */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or register with</span>
              </div>
            </div>

            {/* Social registration buttons */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                onClick={handleGoogleRegister}
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <FaGoogle className="h-5 w-5 text-red-600" />
                <span className="ml-2">Google</span>
              </button>
              <button
                onClick={handleFacebookRegister}
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <FaFacebook className="h-5 w-5 text-blue-600" />
                <span className="ml-2">Facebook</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 