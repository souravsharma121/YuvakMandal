import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, MapPin, Clock, AlertCircle } from 'lucide-react';
import { useEvent } from '../../context/EventContext';
import { useContribution } from '../../context/ContributionContext';

const EventCalendar = ({ compact = false }) => {
  const { events } = useEvent();
  const { contributions } = useContribution();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const months = ['January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December'];

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getEventsForDate = (day) => {
    if (!events) return [];
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getDate() === day &&
             eventDate.getMonth() === currentDate.getMonth() &&
             eventDate.getFullYear() === currentDate.getFullYear();
    });
  };

  const getContributionStatusForDate = (day) => {
    if (!contributions) return null;
    const monthName = months[currentDate.getMonth()];
    const year = currentDate.getFullYear();

    const monthContributions = contributions.filter(c =>
      c.month === monthName && c.year === year
    );

    if (monthContributions.length > 0) {
      // Check if any contribution on this date
      const dayContribs = monthContributions.filter(c => {
        const contribDate = new Date(c.paymentDate);
        return contribDate.getDate() === day;
      });
      if (dayContribs.length > 0) {
        const status = dayContribs[0].status;
        return status === 'Approved' ? 'approved' : status === 'Pending' ? 'pending' : 'rejected';
      }
    }
    return null;
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    setSelectedDate(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    setSelectedDate(null);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date().getDate());
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="aspect-square"></div>);
    }

    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayEvents = getEventsForDate(day);
      const contribStatus = getContributionStatusForDate(day);
      const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
      const isSelected = selectedDate === day;

      days.push(
        <div
          key={day}
          onClick={() => setSelectedDate(day)}
          className={`aspect-square p-2 rounded-lg cursor-pointer transition-all ${
            isToday ? 'bg-blue-100 border-2 border-blue-500 font-bold' : 'bg-gray-50 hover:bg-gray-100'
          } ${isSelected ? 'ring-2 ring-indigo-500' : ''} border`}
        >
          <div className="text-sm font-semibold text-gray-800">{day}</div>
          
          {/* Contribution Status Indicator */}
          {contribStatus && (
            <div className={`mt-1 h-1.5 rounded-full ${
              contribStatus === 'approved' ? 'bg-green-500' :
              contribStatus === 'pending' ? 'bg-yellow-500' :
              'bg-red-500'
            }`}></div>
          )}

          {/* Event Indicator */}
          {dayEvents.length > 0 && (
            <div className="mt-1 flex gap-0.5">
              {dayEvents.slice(0, 2).map((event, idx) => (
                <div
                  key={idx}
                  className="w-1.5 h-1.5 rounded-full bg-indigo-500"
                  title={event.title}
                ></div>
              ))}
              {dayEvents.length > 2 && <span className="text-xs text-indigo-600">+{dayEvents.length - 2}</span>}
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  return (
    <div className={`bg-white rounded-lg shadow ${!compact ? 'p-6' : 'p-4'}`}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-800">{months[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={previousMonth}
              className="p-1 hover:bg-gray-100 rounded-lg transition"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={goToToday}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              Today
            </button>
            <button
              onClick={nextMonth}
              className="p-1 hover:bg-gray-100 rounded-lg transition"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Approved</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span>Pending</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>Rejected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
            <span>Events</span>
          </div>
        </div>

        {/* Day names */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {renderCalendar()}
        </div>

        {/* Selected Date Details */}
        {selectedDate && (
          <div className="border-t pt-4 space-y-3">
            <h3 className="font-semibold text-lg">
              {months[currentDate.getMonth()]} {selectedDate}, {currentDate.getFullYear()}
            </h3>

            {/* Events */}
            {selectedDateEvents.length > 0 ? (
              <div className="space-y-2">
                {selectedDateEvents.map((event, idx) => (
                  <div key={idx} className="bg-indigo-50 border-l-4 border-indigo-500 p-3 rounded">
                    <h4 className="font-semibold text-indigo-900">{event.title}</h4>
                    <div className="text-sm text-indigo-700 space-y-1 mt-2">
                      {event.time && (
                        <div className="flex items-center gap-2">
                          <Clock size={14} />
                          <span>{event.time}</span>
                        </div>
                      )}
                      {event.location && (
                        <div className="flex items-center gap-2">
                          <MapPin size={14} />
                          <span>{event.location}</span>
                        </div>
                      )}
                      {event.description && (
                        <p className="text-xs mt-2">{event.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                <AlertCircle className="w-6 h-6 mx-auto mb-2 opacity-50" />
                <p>No events scheduled for this date</p>
              </div>
            )}

            {/* Contributions */}
            {getContributionStatusForDate(selectedDate) && (
              <div className={`p-3 rounded ${
                getContributionStatusForDate(selectedDate) === 'approved' ? 'bg-green-50 border-l-4 border-green-500' :
                getContributionStatusForDate(selectedDate) === 'pending' ? 'bg-yellow-50 border-l-4 border-yellow-500' :
                'bg-red-50 border-l-4 border-red-500'
              }`}>
                <p className="font-semibold text-sm">Contribution Status: <span className="capitalize">
                  {getContributionStatusForDate(selectedDate)}
                </span></p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventCalendar;
