import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';
import {
    TrendingUp,
    Lock,
    Clock,
    ArrowRight,
    CheckCircle,
} from 'lucide-react';

const Home = () => {
    const navigate = useNavigate();
    const { isAuthenticated, isAdmin } = useAuth();

    useEffect(() => {
        if (isAuthenticated) {
            navigate(isAdmin ? '/admin/dashboard' : '/user/dashboard');
        }
    }, [isAuthenticated, isAdmin, navigate]);

    return (
        <div className="min-h-screen bg-white">
            {/* Navbar */}
            <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center gap-2">
                            <div className="bg-accent-600 p-2 rounded-lg">
                                <TrendingUp className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-xl font-bold text-gray-900">
                                Funds Manager
                            </span>
                        </div>
                        <button
                            onClick={() => navigate('/login')}
                            className="text-gray-600 hover:text-accent-600 font-medium px-4 py-2 transition-colors"
                        >
                            Login
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section className="relative overflow-hidden bg-gradient-to-b from-accent-50 to-white pt-16 pb-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center max-w-3xl mx-auto">
                        <div className="inline-flex items-center gap-2 bg-accent-100 text-accent-700 px-4 py-1.5 rounded-full text-sm font-medium mb-8">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-500" />
                            </span>
                            Guaranteed 4% Monthly Returns
                        </div>

                        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 tracking-tight mb-6">
                            Grow Your Wealth with{' '}
                            <span className="text-accent-600">Confidence</span>
                        </h1>

                        <p className="text-xl text-gray-600 mb-10">
                            Secure personal funds management designed for growth. Track your
                            deposits, watch interest accrue daily, and withdraw with ease.
                        </p>

                        <button
                            onClick={() => navigate('/login')}
                            className="btn-primary text-lg px-8 py-4 flex items-center justify-center gap-2 shadow-lg shadow-accent-500/20 hover:shadow-accent-500/30 transform hover:-translate-y-0.5 transition-all"
                        >
                            Start Growing Today
                            <ArrowRight className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Abstract background shapes */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-0 opacity-40 pointer-events-none">
                    <div className="absolute -top-24 -left-24 w-96 h-96 bg-accent-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
                    <div className="absolute top-0 -right-4 w-96 h-96 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
                    <div className="absolute -bottom-8 left-20 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
                </div>
            </section>

            {/* Features */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Why Choose Funds Manager?
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            A secure, transparent platform that maximizes your savings with
                            consistent returns.
                        </p>
                    </div>

                    <div className="grid grid-cols-3 gap-8">
                        {/* Feature 1 – Interest */}
                        <div className="card hover:shadow-xl transition-shadow border border-gray-100 group">
                            <div className="bg-accent-50 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:bg-accent-600 transition-colors">
                                <TrendingUp className="h-7 w-7 text-accent-600 group-hover:text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">
                                High Interest Rate
                            </h3>
                            <p className="text-gray-600">
                                Earn a competitive{' '}
                                <span className="font-semibold text-accent-600">
                                    4% monthly interest
                                </span>{' '}
                                on your principal. Watch your wealth compound.
                            </p>
                        </div>

                        {/* Feature 2 – Security */}
                        <div className="card hover:shadow-xl transition-shadow border border-gray-100 group">
                            <div className="bg-accent-50 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:bg-accent-600 transition-colors">
                                <Lock className="h-7 w-7 text-accent-600 group-hover:text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">
                                Secure & Private
                            </h3>
                            <p className="text-gray-600">
                                Industry‑leading encryption protects your data and funds.
                            </p>
                        </div>

                        {/* Feature 3 – Flexibility */}
                        <div className="card hover:shadow-xl transition-shadow border border-gray-100 group">
                            <div className="bg-accent-50 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:bg-accent-600 transition-colors">
                                <Clock className="h-7 w-7 text-accent-600 group-hover:text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">
                                Flexible Maturity
                            </h3>
                            <p className="text-gray-600">
                                Funds lock for 90 days; after that you can withdraw interest
                                only or the full amount.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            How It Works
                        </h2>
                        <p className="text-lg text-gray-600">
                            Simple steps to start your journey
                        </p>
                    </div>

                    <div className="grid grid-cols-3 gap-8 relative">
                        {/* Connecting line for desktop */}
                        <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -z-0 transform -translate-y-1/2" />

                        {/* Step 1 */}
                        <div className="relative z-10 bg-gray-50 p-4 text-center">
                            <div className="w-16 h-16 bg-white border-4 border-accent-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm text-xl font-bold text-accent-600">
                                1
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">
                                Create Account
                            </h3>
                            <p className="text-gray-600">
                                Sign up and verify your identity to get started.
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div className="relative z-10 bg-gray-50 p-4 text-center">
                            <div className="w-16 h-16 bg-white border-4 border-accent-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm text-xl font-bold text-accent-600">
                                2
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">
                                Make a Deposit
                            </h3>
                            <p className="text-gray-600">
                                Submit your deposit proof and wait for admin approval.
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div className="relative z-10 bg-gray-50 p-4 text-center">
                            <div className="w-16 h-16 bg-white border-4 border-accent-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm text-xl font-bold text-accent-600">
                                3
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">
                                Watch it Grow
                            </h3>
                            <p className="text-gray-600">
                                Track your 4% monthly interest and withdraw after 90 days.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-100 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="bg-accent-600 p-1.5 rounded-lg">
                            <TrendingUp className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-lg font-bold text-gray-900">
                            Funds Manager
                        </span>
                    </div>
                    <p className="text-gray-500 text-sm">
                        © {new Date().getFullYear()} Funds Manager. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default Home;