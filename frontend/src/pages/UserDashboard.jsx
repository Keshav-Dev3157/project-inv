import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api';

const UserDashboard = () => {
    const [currentDeposit, setCurrentDeposit] = useState(null);
    const [balance, setBalance] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Deposit form
    const [depositForm, setDepositForm] = useState({
        amount: '',
        proof_url: ''
    });

    const { logout, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchCurrentDeposit();
        fetchBalance();
        fetchTransactions();
    }, []);

    const fetchCurrentDeposit = async () => {
        try {
            const response = await userAPI.getCurrentDeposit();
            setCurrentDeposit(response.data);
        } catch (err) {
            console.error('Failed to fetch current deposit:', err);
        }
    };

    const fetchBalance = async () => {
        try {
            const response = await userAPI.getBalance();
            setBalance(response.data);
        } catch (err) {
            console.error('Failed to fetch balance:', err);
        }
    };

    const fetchTransactions = async () => {
        try {
            const response = await userAPI.getTransactions();
            setTransactions(response.data);
        } catch (err) {
            console.error('Failed to fetch transactions:', err);
        }
    };

    const handleSubmitDeposit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            await userAPI.submitDeposit({
                amount: parseFloat(depositForm.amount),
                proof_url: depositForm.proof_url
            });
            setSuccess('Deposit request submitted successfully! Waiting for admin approval.');
            setDepositForm({ amount: '', proof_url: '' });
            fetchCurrentDeposit();
            fetchBalance();
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to submit deposit');
        }
        setLoading(false);
    };

    const handleWithdraw = async (withdrawType) => {
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const response = await userAPI.withdraw(withdrawType);
            setSuccess(response.data.message + ` - Amount: $${response.data.amount.toFixed(2)}`);
            fetchCurrentDeposit();
            fetchBalance();
            fetchTransactions();
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to process withdrawal');
        }
        setLoading(false);
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
                            <h1 className="text-2xl font-bold text-primary-900">My Dashboard</h1>
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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Balance Card */}
                    <div className="card">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Balance</h2>
                        {balance ? (
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Principal:</span>
                                    <span className="text-lg font-semibold text-gray-900">
                                        ${balance.principal.toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Accrued Interest:</span>
                                    <span className="text-lg font-semibold text-green-600">
                                        +${balance.accrued_interest.toFixed(2)}
                                    </span>
                                </div>
                                <div className="border-t border-gray-200 pt-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-900 font-semibold">Total Balance:</span>
                                        <span className="text-2xl font-bold text-primary-900">
                                            ${balance.total_balance.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-600">No active deposit</p>
                        )}
                    </div>

                    {/* Current Deposit Status */}
                    {currentDeposit && (
                        <div className="card">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Deposit Status</h2>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Status:</span>
                                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${currentDeposit.status === 'approved' ? 'bg-green-100 text-green-800' :
                                            currentDeposit.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                        }`}>
                                        {currentDeposit.status.toUpperCase()}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Amount:</span>
                                    <span className="text-lg font-semibold text-gray-900">
                                        ${currentDeposit.amount.toFixed(2)}
                                    </span>
                                </div>
                                {currentDeposit.status === 'approved' && (
                                    <>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Maturity Date:</span>
                                            <span className="text-sm text-gray-900">
                                                {new Date(currentDeposit.maturity_date).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Days Remaining:</span>
                                            <span className="text-sm font-semibold text-primary-900">
                                                {currentDeposit.days_remaining} days
                                            </span>
                                        </div>
                                        {currentDeposit.is_mature && (
                                            <div className="mt-4 space-y-2">
                                                <p className="text-sm text-green-600 font-semibold">
                                                    ✓ Your deposit has matured! You can now withdraw.
                                                </p>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleWithdraw('interest')}
                                                        disabled={loading}
                                                        className="btn-primary flex-1 disabled:opacity-50"
                                                    >
                                                        Withdraw Interest
                                                    </button>
                                                    <button
                                                        onClick={() => handleWithdraw('full')}
                                                        disabled={loading}
                                                        className="bg-primary-700 hover:bg-primary-800 text-white font-semibold py-2 px-4 rounded-lg flex-1 disabled:opacity-50"
                                                    >
                                                        Withdraw All
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                        {!currentDeposit.is_mature && (
                                            <div className="mt-4">
                                                <button
                                                    disabled
                                                    className="btn-secondary w-full opacity-50 cursor-not-allowed"
                                                >
                                                    Withdraw (Available in {currentDeposit.days_remaining} days)
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Submit Deposit Form */}
                    {!currentDeposit && (
                        <div className="card lg:col-span-2">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Submit New Deposit</h2>
                            <form onSubmit={handleSubmitDeposit} className="space-y-4 max-w-2xl">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Deposit Amount
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        value={depositForm.amount}
                                        onChange={(e) => setDepositForm({ ...depositForm, amount: e.target.value })}
                                        className="input-field"
                                        placeholder="Enter amount"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Proof Document URL
                                    </label>
                                    <input
                                        type="text"
                                        value={depositForm.proof_url}
                                        onChange={(e) => setDepositForm({ ...depositForm, proof_url: e.target.value })}
                                        className="input-field"
                                        placeholder="Enter proof document URL or path"
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Provide a URL or path to your deposit proof document
                                    </p>
                                </div>

                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <h3 className="font-semibold text-blue-900 mb-2">Deposit Terms:</h3>
                                    <ul className="text-sm text-blue-800 space-y-1">
                                        <li>• 4% monthly interest (simple interest)</li>
                                        <li>• 90-day lock period</li>
                                        <li>• Only one deposit allowed at a time</li>
                                        <li>• Admin approval required</li>
                                    </ul>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn-primary w-full disabled:opacity-50"
                                >
                                    {loading ? 'Submitting...' : 'Submit Deposit Request'}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Transaction History */}
                    <div className="card lg:col-span-2">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Transaction History</h2>
                        {transactions.length === 0 ? (
                            <p className="text-gray-600">No transactions yet</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Date
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Type
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Description
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Amount
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {transactions.map((txn) => (
                                            <tr key={txn.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {new Date(txn.timestamp).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${txn.type === 'deposit' ? 'bg-green-100 text-green-800' :
                                                            txn.type === 'withdrawal' ? 'bg-red-100 text-red-800' :
                                                                'bg-blue-100 text-blue-800'
                                                        }`}>
                                                        {txn.type}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {txn.description}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                                                    <span className={txn.type === 'withdrawal' ? 'text-red-600' : 'text-green-600'}>
                                                        {txn.type === 'withdrawal' ? '-' : '+'}${txn.amount.toFixed(2)}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
