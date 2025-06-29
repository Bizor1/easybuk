'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/auth';

export default function RoleSwitcher() {
    const { user, switchRole, addRole } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [showAddRole, setShowAddRole] = useState(false);
    const [loading, setLoading] = useState(false);

    if (!user) return null;

    const handleRoleSwitch = async (role: UserRole) => {
        setLoading(true);
        await switchRole(role);
        setIsOpen(false);
        setLoading(false);
    };

    const handleAddRole = async (role: UserRole) => {
        setLoading(true);
        const result = await addRole(role);
        if (result.success) {
            setShowAddRole(false);
            // Automatically switch to the new role
            await switchRole(role);
        }
        setIsOpen(false);
        setLoading(false);
    };

    const availableRoles = user.roles;
    const missingRoles = (['CLIENT', 'PROVIDER'] as UserRole[]).filter(
        role => !availableRoles.includes(role)
    );

    const getRoleDisplay = (role: UserRole) => {
        switch (role) {
            case 'CLIENT':
                return { name: 'Client', icon: '👤', description: 'Hire professionals' };
            case 'PROVIDER':
                return { name: 'Provider', icon: '🔧', description: 'Offer services' };
            case 'ADMIN':
                return { name: 'Admin', icon: '⚙️', description: 'Platform management' };
            default:
                return { name: role, icon: '❓', description: '' };
        }
    };

    const currentRoleDisplay = getRoleDisplay(user.activeRole);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
                disabled={loading}
            >
                <span className="text-lg">{currentRoleDisplay.icon}</span>
                <div className="text-left">
                    <div className="text-sm font-medium text-gray-900">{currentRoleDisplay.name}</div>
                    <div className="text-xs text-gray-500">{currentRoleDisplay.description}</div>
                </div>
                <svg
                    className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-3 border-b border-gray-100">
                        <h3 className="text-sm font-medium text-gray-900">Switch Role</h3>
                        <p className="text-xs text-gray-500">Choose how you want to use EasyBuk</p>
                    </div>

                    {/* Available Roles */}
                    <div className="py-2">
                        {availableRoles.map((role) => {
                            const roleDisplay = getRoleDisplay(role);
                            const isActive = user.activeRole === role;

                            return (
                                <button
                                    key={role}
                                    onClick={() => handleRoleSwitch(role)}
                                    disabled={isActive || loading}
                                    className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${isActive ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                                        }`}
                                >
                                    <span className="text-lg">{roleDisplay.icon}</span>
                                    <div className="flex-1">
                                        <div className="text-sm font-medium text-gray-900 flex items-center">
                                            {roleDisplay.name}
                                            {isActive && (
                                                <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                                    Active
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-xs text-gray-500">{roleDisplay.description}</div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Add Role Options */}
                    {missingRoles.length > 0 && (
                        <>
                            <div className="border-t border-gray-100 pt-2">
                                <div className="px-4 py-2">
                                    <h4 className="text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Add New Role
                                    </h4>
                                </div>
                                {missingRoles.map((role) => {
                                    const roleDisplay = getRoleDisplay(role);

                                    return (
                                        <button
                                            key={role}
                                            onClick={() => handleAddRole(role)}
                                            disabled={loading}
                                            className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                                        >
                                            <span className="text-lg">{roleDisplay.icon}</span>
                                            <div className="flex-1">
                                                <div className="text-sm font-medium text-gray-900 flex items-center">
                                                    {roleDisplay.name}
                                                    <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                                                        + Add
                                                    </span>
                                                </div>
                                                <div className="text-xs text-gray-500">{roleDisplay.description}</div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </>
                    )}

                    {/* Profile Management */}
                    <div className="border-t border-gray-100 p-2">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded transition-colors"
                        >
                            Manage Profiles →
                        </button>
                    </div>
                </div>
            )}

            {/* Click outside to close */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
} 