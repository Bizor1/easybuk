'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface CalendarEvent {
    id: string;
    title: string;
    client: string;
    time: string;
    duration: number; // in minutes
    type: 'booking' | 'blocked' | 'break';
    status: 'confirmed' | 'pending' | 'completed';
    amount?: number;
}

interface DayData {
    date: number;
    isCurrentMonth: boolean;
    isToday: boolean;
    events: CalendarEvent[];
}

export default function CalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [viewType, setViewType] = useState<'month' | 'week' | 'day'>('month');
    const [events, setEvents] = useState<{ [key: string]: CalendarEvent[] }>({});
    const [loading, setLoading] = useState(true);
    const [showAddEventModal, setShowAddEventModal] = useState(false);
    const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);

    // Fetch calendar events
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                setLoading(true);
                const year = currentDate.getFullYear();
                const month = currentDate.getMonth() + 1;

                console.log(`Fetching events for ${year}-${month}`);
                const response = await fetch(`/api/provider/calendar/events?year=${year}&month=${month}`, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include'
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log('Calendar data received:', data);
                    setEvents(data.events || {});
                } else {
                    const errorData = await response.json();
                    console.error('Error response:', errorData);
                    setEvents({});
                }
            } catch (error) {
                console.error('Error fetching calendar events:', error);
                setEvents({});
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, [currentDate]);

    const generateCalendarDays = (): DayData[] => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const today = new Date();

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        const days: DayData[] = [];
        const current = new Date(startDate);

        for (let i = 0; i < 42; i++) {
            const dateKey = current.toISOString().split('T')[0];
            days.push({
                date: current.getDate(),
                isCurrentMonth: current.getMonth() === month,
                isToday: current.toDateString() === today.toDateString(),
                events: events[dateKey] || []
            });
            current.setDate(current.getDate() + 1);
        }

        return days;
    };

    const getEventTypeConfig = (type: CalendarEvent['type']) => {
        const configs = {
            booking: {
                gradient: 'from-blue-500 to-cyan-500',
                bgGradient: 'from-blue-100/80 to-cyan-100/80 dark:from-blue-900/30 dark:to-cyan-900/30',
                textColor: 'text-blue-700 dark:text-blue-300',
                emoji: '📅'
            },
            blocked: {
                gradient: 'from-red-500 to-red-600',
                bgGradient: 'from-red-100/80 to-red-200/80 dark:from-red-900/30 dark:to-red-800/30',
                textColor: 'text-red-700 dark:text-red-300',
                emoji: '🚫'
            },
            break: {
                gradient: 'from-gray-500 to-gray-600',
                bgGradient: 'from-gray-100/80 to-gray-200/80 dark:from-gray-700/50 dark:to-gray-600/50',
                textColor: 'text-gray-700 dark:text-gray-300',
                emoji: '☕'
            }
        };
        return configs[type];
    };

    const formatTime = (time: string) => {
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
    };

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const calendarDays = generateCalendarDays();

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 dark:from-slate-900 dark:via-gray-900 dark:to-slate-800 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">Loading calendar...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 dark:from-slate-900 dark:via-gray-900 dark:to-slate-800 relative overflow-hidden">
            {/* Floating Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-orange-400/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-orange-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-4xl font-bold mb-2">
                                <span className="text-gray-900 dark:text-white">Calendar</span>
                                <span className="block text-gradient-mixed animate-gradient-x">Schedule 📅</span>
                            </h1>
                            <p className="text-lg text-gray-600 dark:text-gray-400">
                                Manage your availability and appointments
                            </p>
                        </div>
                        <div className="mt-4 md:mt-0 flex items-center space-x-3">
                            <button
                                onClick={() => setShowAddEventModal(true)}
                                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg text-sm"
                            >
                                + Add Event
                            </button>
                            <Link href="/provider/profile?tab=availability">
                                <button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg text-sm">
                                    Set Availability
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Calendar Controls */}
                <div className="relative group mb-8">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl opacity-20 group-hover:opacity-30 blur transition-opacity"></div>
                    <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            {/* Month Navigation */}
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                                    className="p-2 bg-gradient-to-r from-gray-100/80 to-gray-200/80 dark:from-gray-700/50 dark:to-gray-600/50 rounded-lg hover:from-blue-100/80 hover:to-purple-100/80 transition-all transform hover:scale-110"
                                >
                                    <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                                </h2>
                                <button
                                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                                    className="p-2 bg-gradient-to-r from-gray-100/80 to-gray-200/80 dark:from-gray-700/50 dark:to-gray-600/50 rounded-lg hover:from-blue-100/80 hover:to-purple-100/80 transition-all transform hover:scale-110"
                                >
                                    <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>

                            {/* View Type Toggle */}
                            <div className="flex bg-gradient-to-r from-gray-100/80 to-gray-200/80 dark:from-gray-700/50 dark:to-gray-600/50 rounded-lg p-1">
                                {(['month', 'week', 'day'] as const).map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => setViewType(type)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 ${viewType === type
                                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                                            : 'text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-600/50'
                                            }`}
                                    >
                                        {type.charAt(0).toUpperCase() + type.slice(1)}
                                    </button>
                                ))}
                            </div>

                            {/* Today Button */}
                            <button
                                onClick={() => setCurrentDate(new Date())}
                                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
                            >
                                Today
                            </button>
                        </div>
                    </div>
                </div>

                {/* Calendar Grid */}
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl opacity-20 group-hover:opacity-30 blur transition-opacity"></div>
                    <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-6">
                        {/* Day Headers */}
                        <div className="grid grid-cols-7 gap-2 mb-4">
                            {dayNames.map((day) => (
                                <div key={day} className="text-center py-3 text-sm font-semibold text-gray-600 dark:text-gray-400">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Calendar Days */}
                        <div className="grid grid-cols-7 gap-2">
                            {calendarDays.map((day, index) => (
                                <div
                                    key={index}
                                    className={`min-h-24 p-2 rounded-lg border transition-all duration-300 cursor-pointer animate-fadeInUp ${day.isCurrentMonth
                                        ? day.isToday
                                            ? 'bg-gradient-to-br from-blue-100/80 to-purple-100/80 dark:from-blue-900/30 dark:to-purple-900/30 border-blue-300 dark:border-blue-600 shadow-lg'
                                            : 'bg-gradient-to-br from-gray-50/80 to-gray-100/80 dark:from-gray-700/30 dark:to-gray-600/30 border-gray-200/50 dark:border-gray-600/50 hover:from-blue-50/80 hover:to-purple-50/80 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 hover:border-blue-200 dark:hover:border-blue-700'
                                        : 'bg-gray-50/30 dark:bg-gray-800/30 border-gray-100/50 dark:border-gray-700/50 text-gray-400'
                                        } transform hover:scale-105`}
                                    style={{ animationDelay: `${index * 20}ms` }}
                                    onClick={() => setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day.date))}
                                >
                                    <div className={`text-sm font-medium mb-1 ${day.isToday
                                        ? 'text-blue-700 dark:text-blue-300'
                                        : day.isCurrentMonth
                                            ? 'text-gray-900 dark:text-white'
                                            : 'text-gray-400'
                                        }`}>
                                        {day.date}
                                    </div>

                                    {/* Events */}
                                    <div className="space-y-1">
                                        {day.events.length > 0 ? (
                                            <>
                                                {day.events.slice(0, 2).map((event) => {
                                                    const config = getEventTypeConfig(event.type);
                                                    return (
                                                        <div
                                                            key={event.id}
                                                            className={`text-xs p-1 rounded bg-gradient-to-r ${config.bgGradient} ${config.textColor} truncate transition-all hover:scale-110 transform`}
                                                            title={`${event.title} - ${formatTime(event.time)}`}
                                                        >
                                                            <div className="flex items-center space-x-1">
                                                                <span>{config.emoji}</span>
                                                                <span className="truncate">{event.title}</span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                                {day.events.length > 2 && (
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                                                        +{day.events.length - 2} more
                                                    </div>
                                                )}
                                            </>
                                        ) : day.isCurrentMonth && (
                                            <div className="text-xs text-gray-400 dark:text-gray-600 text-center py-1">
                                                {day.isToday ? 'Free today' : 'Available'}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Empty State */}
                        {Object.keys(events).length === 0 && (
                            <div className="text-center py-8 mt-8 border-t border-gray-200/50 dark:border-gray-700/50">
                                <div className="text-4xl mb-2">📅</div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Events Scheduled</h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-4">
                                    Create your services and start receiving bookings to see your schedule
                                </p>
                                <Link
                                    href="/provider/services"
                                    className="inline-flex items-center bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
                                >
                                    Create Your Services
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Legend */}
                <div className="mt-8 relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl opacity-20 group-hover:opacity-30 blur transition-opacity"></div>
                    <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-6">
                        <h3 className="text-lg font-semibold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
                            Event Types 🎯
                        </h3>
                        <div className="flex flex-wrap gap-4">
                            {[
                                { type: 'booking' as const, label: 'Bookings' },
                                { type: 'blocked' as const, label: 'Blocked Time' },
                                { type: 'break' as const, label: 'Breaks' }
                            ].map(({ type, label }) => {
                                const config = getEventTypeConfig(type);
                                return (
                                    <div key={type} className="flex items-center space-x-2">
                                        <div className={`w-4 h-4 rounded bg-gradient-to-r ${config.gradient} animate-pulse`}></div>
                                        <span className="text-sm text-gray-700 dark:text-gray-300">{config.emoji} {label}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Event Modal */}
            {showAddEventModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add Calendar Event</h3>
                            <button
                                onClick={() => setShowAddEventModal(false)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Event Type</label>
                                <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                                    <option value="blocked">Block Time</option>
                                    <option value="break">Add Break</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                                <input
                                    type="date"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Time</label>
                                    <input
                                        type="time"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Time</label>
                                    <input
                                        type="time"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reason</label>
                                <input
                                    type="text"
                                    placeholder="e.g., Personal appointment, Lunch break"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 mt-6">
                            <button
                                onClick={() => setShowAddEventModal(false)}
                                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    // TODO: Implement add event functionality
                                    setShowAddEventModal(false);
                                }}
                                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
                            >
                                Add Event
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                .text-gradient-mixed {
                    background: linear-gradient(135deg, #3B82F6, #8B5CF6, #F59E0B);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    animation: gradient-x 3s ease infinite;
                    background-size: 200% 200%;
                }
                
                @keyframes gradient-x {
                    0%, 100% { background-position: left center; }
                    50% { background-position: right center; }
                }
            `}</style>
        </div>
    );
} 