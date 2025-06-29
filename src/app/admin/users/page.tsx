'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    UserGroupIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    EllipsisVerticalIcon,
    UserIcon,
    ShieldCheckIcon,
    ShieldExclamationIcon,
    ExclamationTriangleIcon,
    TrashIcon,
    EyeIcon,
    PencilIcon,
    XCircleIcon,
    CheckCircleIcon,
    ClockIcon
} from '@heroicons/react/24/outline';
import Image from 'next/image';

interface User {
    id: string;
    name: string;
    email: string;
    image?: string;
    roles: string[];
    status: 'ACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION' | 'BANNED';
    joinDate: string;
    lastActive: string;
    totalBookings: number;
    totalSpent: number;
    totalEarnings: number;
    profileCompleted: boolean;
    emailVerified: boolean;
    phoneVerified: boolean;
}

interface UserFilters {
    role: string;
    status: string;
    verification: string;
    search: string;
}

export default function UserManagement() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [filters, setFilters] = useState<UserFilters>({
        role: 'all',
        status: 'all',
        verification: 'all',
        search: ''
    });

    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: '20',
                search: filters.search,
                role: filters.role,
                status: filters.status,
                verification: filters.verification
            });

            const response = await fetch(`/api/admin/users?${params}`);

            if (response.ok) {
                const data = await response.json();
                setUsers(data.users);
                setTotalPages(data.pagination.pages);
            } else {
                console.error('Failed to fetch users');
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    }, [filters, currentPage]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setOpenDropdown(null);
        if (openDropdown) {
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [openDropdown]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'text-green-800 bg-green-100';
            case 'SUSPENDED': return 'text-red-800 bg-red-100';
            case 'PENDING_VERIFICATION': return 'text-yellow-800 bg-yellow-100';
            case 'BANNED': return 'text-gray-800 bg-gray-100';
            default: return 'text-gray-800 bg-gray-100';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'ACTIVE': return <CheckCircleIcon className="h-4 w-4" />;
            case 'SUSPENDED': return <XCircleIcon className="h-4 w-4" />;
            case 'PENDING_VERIFICATION': return <ClockIcon className="h-4 w-4" />;
            case 'BANNED': return <ExclamationTriangleIcon className="h-4 w-4" />;
            default: return <ClockIcon className="h-4 w-4" />;
        }
    };

    const handleUserAction = async (userId: string, action: string) => {
        try {
            const response = await fetch('/api/admin/users', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userIds: [userId],
                    action,
                    reason: `Single user ${action} action`
                }),
            });

            if (response.ok) {
                await fetchUsers(); // Refresh the list
                alert(`User ${action}d successfully!`);
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.error}`);
            }
        } catch (error) {
            console.error('Error updating user:', error);
            alert('Error updating user status');
        }
    };

    const handleDeleteUser = (userId: string) => {
        alert('User deletion functionality will be implemented based on your data retention policies.');
    };

    const handleBulkAction = async (action: string) => {
        if (selectedUsers.length === 0) return;

        if (action === 'delete') {
            alert('Bulk user deletion functionality will be implemented based on your data retention policies.');
            return;
        }

        const reason = prompt(`Please provide a reason for ${action}ing ${selectedUsers.length} users:`);
        if (!reason) return;

        try {
            const response = await fetch('/api/admin/users', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userIds: selectedUsers,
                    action,
                    reason
                }),
            });

            if (response.ok) {
                await fetchUsers(); // Refresh the list
                setSelectedUsers([]);
                alert(`Successfully ${action}d ${selectedUsers.length} users!`);
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.error}`);
            }
        } catch (error) {
            console.error('Error updating users:', error);
            alert('Error updating user statuses');
        }
    };

    const handleGrantAdminRole = async (userEmail: string) => {
        const reason = prompt('Please provide a reason for granting admin access:');
        if (!reason) return;

        try {
            const response = await fetch('/api/admin/assign-admin-role', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userEmail, reason }),
            });

            const result = await response.json();

            if (result.success) {
                // Update local state
                setUsers(prev => prev.map(user =>
                    user.email === userEmail
                        ? { ...user, roles: [...user.roles, 'ADMIN'] }
                        : user
                ));
                alert(`✅ Admin role granted to ${userEmail}`);
            } else {
                alert(`❌ Error: ${result.error}`);
            }
        } catch (error) {
            console.error('Error granting admin role:', error);
            alert('❌ Failed to grant admin role');
        }
    };

    const handleRevokeAdminRole = async (userEmail: string) => {
        const reason = prompt('Please provide a reason for revoking admin access:');
        if (!reason) return;

        try {
            const response = await fetch('/api/admin/assign-admin-role', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userEmail, reason }),
            });

            const result = await response.json();

            if (result.success) {
                // Update local state
                setUsers(prev => prev.map(user =>
                    user.email === userEmail
                        ? { ...user, roles: user.roles.filter(role => role !== 'ADMIN') }
                        : user
                ));
                alert(`✅ Admin role revoked from ${userEmail}`);
            } else {
                alert(`❌ Error: ${result.error}`);
            }
        } catch (error) {
            console.error('Error revoking admin role:', error);
            alert('❌ Failed to revoke admin role');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="sm:flex sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                    <p className="mt-1 text-sm text-gray-600">
                        Manage all platform users - clients, providers, and administrators
                    </p>
                </div>
                <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                    <button className="inline-flex items-center justify-center rounded-md border border-transparent bg-orange-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 sm:w-auto">
                        Export Users
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <UserGroupIcon className="h-6 w-6 text-gray-400" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                                    <dd className="text-lg font-medium text-gray-900">{users.length}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <CheckCircleIcon className="h-6 w-6 text-green-400" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Active Users</dt>
                                    <dd className="text-lg font-medium text-gray-900">
                                        {users.filter(u => u.status === 'ACTIVE').length}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <ClockIcon className="h-6 w-6 text-yellow-400" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Pending</dt>
                                    <dd className="text-lg font-medium text-gray-900">
                                        {users.filter(u => u.status === 'PENDING_VERIFICATION').length}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <XCircleIcon className="h-6 w-6 text-red-400" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Suspended</dt>
                                    <dd className="text-lg font-medium text-gray-900">
                                        {users.filter(u => u.status === 'SUSPENDED').length}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <div className="sm:flex sm:items-center sm:justify-between">
                        <div className="sm:flex sm:space-x-4 sm:items-center">
                            {/* Search */}
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                                    value={filters.search}
                                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                />
                            </div>

                            {/* Filter Dropdowns */}
                            <div className="mt-3 sm:mt-0 sm:flex sm:space-x-2">
                                <select
                                    value={filters.role}
                                    onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
                                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm rounded-md"
                                >
                                    <option value="all">All Roles</option>
                                    <option value="client">Clients</option>
                                    <option value="provider">Providers</option>
                                    <option value="admin">Admins</option>
                                </select>

                                <select
                                    value={filters.status}
                                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm rounded-md"
                                >
                                    <option value="all">All Statuses</option>
                                    <option value="ACTIVE">Active</option>
                                    <option value="SUSPENDED">Suspended</option>
                                    <option value="PENDING_VERIFICATION">Pending</option>
                                    <option value="BANNED">Banned</option>
                                </select>

                                <select
                                    value={filters.verification}
                                    onChange={(e) => setFilters(prev => ({ ...prev, verification: e.target.value }))}
                                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm rounded-md"
                                >
                                    <option value="all">All Verification</option>
                                    <option value="verified">Verified</option>
                                    <option value="unverified">Unverified</option>
                                </select>
                            </div>
                        </div>

                        {/* Bulk Actions */}
                        {selectedUsers.length > 0 && (
                            <div className="mt-3 sm:mt-0 sm:flex sm:space-x-2">
                                <span className="text-sm text-gray-500 mr-2">
                                    {selectedUsers.length} selected
                                </span>
                                <button
                                    onClick={() => handleBulkAction('active')}
                                    className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200"
                                >
                                    Activate
                                </button>
                                <button
                                    onClick={() => handleBulkAction('suspended')}
                                    className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-yellow-700 bg-yellow-100 hover:bg-yellow-200"
                                >
                                    Suspend
                                </button>
                                <button
                                    onClick={() => handleBulkAction('delete')}
                                    className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200"
                                >
                                    Delete
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                        <p className="mt-2 text-gray-600">Loading users...</p>
                    </div>
                ) : users.length === 0 ? (
                    <div className="p-8 text-center">
                        <div className="text-gray-400 text-lg">👥</div>
                        <p className="mt-2 text-gray-600">No users found</p>
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-200">
                        {users.map((user) => (
                            <li key={user.id}>
                                <div className="px-4 py-4 flex items-center justify-between">
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                                            checked={selectedUsers.includes(user.id)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedUsers(prev => [...prev, user.id]);
                                                } else {
                                                    setSelectedUsers(prev => prev.filter(id => id !== user.id));
                                                }
                                            }}
                                        />
                                        <div className="ml-4 flex items-center">
                                            <Image
                                                src={user.image || '/default-avatar.svg'}
                                                alt={user.name}
                                                width={40}
                                                height={40}
                                                className="h-10 w-10 rounded-full"
                                            />
                                            <div className="ml-4">
                                                <div className="flex items-center">
                                                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                    <div className="ml-2 flex space-x-1">
                                                        {user.roles.map(role => (
                                                            <span
                                                                key={role}
                                                                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${role === 'CLIENT' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'
                                                                    }`}
                                                            >
                                                                {role.toLowerCase()}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="text-sm text-gray-500">{user.email}</div>
                                                <div className="flex items-center text-xs text-gray-400 space-x-4">
                                                    <span>Joined {user.joinDate}</span>
                                                    <span>Last active {user.lastActive}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-8">
                                        {/* User Stats */}
                                        <div className="hidden sm:flex sm:space-x-6 text-sm text-gray-500">
                                            <div className="text-center">
                                                <div className="font-medium text-gray-900">{user.totalBookings}</div>
                                                <div>Bookings</div>
                                            </div>
                                            {user.totalSpent > 0 && (
                                                <div className="text-center">
                                                    <div className="font-medium text-gray-900">${user.totalSpent}</div>
                                                    <div>Spent</div>
                                                </div>
                                            )}
                                            {user.totalEarnings > 0 && (
                                                <div className="text-center">
                                                    <div className="font-medium text-gray-900">${user.totalEarnings}</div>
                                                    <div>Earned</div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Status */}
                                        <div className="flex items-center">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                                                {getStatusIcon(user.status)}
                                                <span className="ml-1">{user.status.replace('_', ' ').toLowerCase()}</span>
                                            </span>
                                        </div>

                                        {/* Verification Badges */}
                                        <div className="flex space-x-1">
                                            {user.emailVerified && (
                                                <CheckCircleIcon className="h-4 w-4 text-green-500" title="Email verified" />
                                            )}
                                            {user.phoneVerified && (
                                                <ShieldCheckIcon className="h-4 w-4 text-blue-500" title="Phone verified" />
                                            )}
                                            {!user.profileCompleted && (
                                                <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" title="Profile incomplete" />
                                            )}
                                        </div>

                                        {/* Actions Menu */}
                                        <div className="relative">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setOpenDropdown(openDropdown === user.id ? null : user.id);
                                                }}
                                                className="flex items-center text-gray-400 hover:text-gray-600"
                                            >
                                                <EllipsisVerticalIcon className="h-5 w-5" />
                                            </button>
                                            {openDropdown === user.id && (
                                                <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
                                                    <button
                                                        onClick={() => {
                                                            alert(`View details for ${user.name}`);
                                                            setOpenDropdown(null);
                                                        }}
                                                        className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                    >
                                                        <EyeIcon className="mr-3 h-4 w-4" />
                                                        View Details
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            alert(`Edit ${user.name}`);
                                                            setOpenDropdown(null);
                                                        }}
                                                        className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                    >
                                                        <PencilIcon className="mr-3 h-4 w-4" />
                                                        Edit User
                                                    </button>
                                                    {user.roles.includes('ADMIN') ? (
                                                        <button
                                                            onClick={() => {
                                                                handleRevokeAdminRole(user.email);
                                                                setOpenDropdown(null);
                                                            }}
                                                            className="flex w-full items-center px-4 py-2 text-sm text-red-700 hover:bg-gray-100"
                                                        >
                                                            <ShieldExclamationIcon className="mr-3 h-4 w-4" />
                                                            Revoke Admin Access
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => {
                                                                handleGrantAdminRole(user.email);
                                                                setOpenDropdown(null);
                                                            }}
                                                            className="flex w-full items-center px-4 py-2 text-sm text-purple-700 hover:bg-gray-100"
                                                        >
                                                            <ShieldCheckIcon className="mr-3 h-4 w-4" />
                                                            Grant Admin Access
                                                        </button>
                                                    )}
                                                    {user.status === 'ACTIVE' ? (
                                                        <button
                                                            onClick={() => {
                                                                handleUserAction(user.id, 'suspended');
                                                                setOpenDropdown(null);
                                                            }}
                                                            className="flex w-full items-center px-4 py-2 text-sm text-yellow-700 hover:bg-gray-100"
                                                        >
                                                            <XCircleIcon className="mr-3 h-4 w-4" />
                                                            Suspend User
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => {
                                                                handleUserAction(user.id, 'active');
                                                                setOpenDropdown(null);
                                                            }}
                                                            className="flex w-full items-center px-4 py-2 text-sm text-green-700 hover:bg-gray-100"
                                                        >
                                                            <CheckCircleIcon className="mr-3 h-4 w-4" />
                                                            Activate User
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => {
                                                            handleDeleteUser(user.id);
                                                            setOpenDropdown(null);
                                                        }}
                                                        className="flex w-full items-center px-4 py-2 text-sm text-red-700 hover:bg-gray-100"
                                                    >
                                                        <TrashIcon className="mr-3 h-4 w-4" />
                                                        Delete User
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                    <div className="flex-1 flex justify-between sm:hidden">
                        <button
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Page <span className="font-medium">{currentPage}</span> of{' '}
                                <span className="font-medium">{totalPages}</span>
                            </p>
                        </div>
                        <div>
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                <button
                                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 