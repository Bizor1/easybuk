'use client'

import React, { useState } from 'react';

export default function AdminSupportPage() {
    return (
        <div className="space-y-6">
            <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <h1 className="text-2xl font-bold text-gray-900">Support Center</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Manage support tickets and user communications
                    </p>
                </div>
            </div>

            <div className="bg-white shadow rounded-lg">
                <div className="p-12 text-center">
                    <div className="text-8xl mb-6">🚧</div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        Support Center Coming Soon
                    </h2>
                    <p className="text-lg text-gray-600">
                        We&apos;re building a comprehensive support management system.
                    </p>
                </div>
            </div>
        </div>
    );
} 