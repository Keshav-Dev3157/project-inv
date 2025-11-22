import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../services/api';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('requests');
    const [users, setUsers] = useState([]);
    const [deposits, setDeposits] = useState([]);
    const [pendingDeposits, setPendingDeposits] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Create user form
    const [newUser, setNewUser] = useState({
        username: '',
        email: '',
        password: '',
        role: 'user'
    });

    const { logout, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (activeTab === 'users') {
            fetchUsers();
        } else if (activeTab === 'requests') {
            fetchPendingDeposits();
        }
    }, [activeTab]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await adminAPI.getUsers();
            setUsers(response.data);
        } catch (err) {
            setError('Failed to fetch users');
        }
        setLoading(false);
    };

    const fetchPendingDeposits = async () => {
        setLoading(true);
        try {
            const response = await adminAPI.getPendingDeposits();
            setPendingDeposits(response.data);
        } catch (err) {
            setError('Failed to fetch pending deposits');
        }
        setLoading(false);
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            await adminAPI.createUser(newUser);
            setSuccess('User created successfully!');
            setNewUser({ username: '', email: '', password: '', role: 'user' });
            fetchUsers();
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to create user');
        }
        setLoading(false);
    };

    const handleApproveDeposit = async (depositId) => {
        setError('');
        setSuccess('');
        try {
            await adminAPI.approveDeposit(depositId);
            setSuccess('Deposit approved successfully!');
            fetchPendingDeposits();
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to approve deposit');
        }
    };

    const handleRejectDeposit = async (depositId) => {
        setError('');
        setSuccess('');
        try {
            await adminAPI.rejectDeposit(depositId);
            setSuccess('Deposit rejected successfully!');
            fetchPendingDeposits();
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to reject deposit');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div>
                            <h1 className="text-2xl font-bold text-primary-900">Admin Dashboard</h1>
                            <p className="text-sm text-gray-600">Welcome, {user?.username}</p>
                        </div>
                        <button onClick={handleLogout} className="btn-secondary">
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Alerts */}
                {error && (
                    <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                        {success}
                    </div>
                )}

                {/* Tabs */}
                <div className="mb-6 border-b border-gray-200">
                    <nav className="flex space-x-8">
                        <button
                            onClick={() => setActiveTab('requests')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'requests'
                                    ? 'border-primary-500 text-primary-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Deposit Requests
                        </button>
                        <button
                            onClick={() => setActiveTab('create')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'create'
                                    ? 'border-primary-500 text-primary-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Create User
                        </button>
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'users'
                                    ? 'border-primary-500 text-primary-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            View Users
                        </button>
                    </nav>
                </div>

                {/* Tab Content */}
                {activeTab === 'requests' && (
                    <div className="card">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Pending Deposit Requests</h2>
                        {loading ? (
                            <p className="text-gray-600">Loading...</p>
                        ) : pendingDeposits.length === 0 ? (
                            <p className="text-gray-600">No pending deposit requests</p>
                        ) : (
                            <div className="space-y-4">
                                {pendingDeposits.map((deposit) => (
                                    <div key={deposit.id} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-600">User ID: {deposit.user_id}</p>
                                                <p className="text-2xl font-bold text-primary-900 mt-1">
                                                    ${deposit.amount.toFixed(2)}
                                                </p>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    Submitted: {new Date(deposit.submitted_at).toLocaleDateString()}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    Proof: <a href={deposit.proof_url} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">View Document</a>
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleApproveDeposit(deposit.id)}
                                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleRejectDeposit(deposit.id)}
                                                    className="btn-danger"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'create' && (
                    <div className="card max-w-2xl">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New User</h2>
                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Username
                                </label>
                                <input
                                    type="text"
                                    value={newUser.username}
                                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                                    className="input-field"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={newUser.email}
                                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                    className="input-field"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    value={newUser.password}
                                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                    className="input-field"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Role
                                </label>
                                <select
                                    value={newUser.role}
                                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                    className="input-field"
                                >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary w-full disabled:opacity-50"
                            >
                                {loading ? 'Creating...' : 'Create User'}
                            </button>
                        </form>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="card">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">All Users</h2>
                        {loading ? (
                            <p className="text-gray-600">Loading...</p>
                        ) : users.length === 0 ? (
                            <p className="text-gray-600">No users found</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Username
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Email
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Role
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Created At
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {users.map((user) => (
                                            <tr key={user.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {user.username}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {user.email}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                                                        }`}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {new Date(user.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                        }`}>
                                                        {user.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
