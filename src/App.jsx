import React, { useState, useRef } from 'react';

// Returns an object containing the current month and year
const getCurrentMonth = () => {
  const now = new Date();
  return { month: now.getMonth(), year: now.getFullYear() };
};

// Returns the number of days in a given month/year
const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();

// Checks if the provided day is today
const isToday = (year, month, day) => {
  const now = new Date();
  return now.getFullYear() === year && now.getMonth() === month && now.getDate() === day;
};

// Returns a random color from a predefined list
const getRandomColor = () => {
  const colors = ['#FF5733', '#33FF57', '#3357FF', '#FF33A8', '#FFC133'];
  return colors[Math.floor(Math.random() * colors.length)];
};

function App() {
  // Initialize with the current month and year
  const initialDate = getCurrentMonth();
  const daysCount = getDaysInMonth(initialDate.year, initialDate.month);

  // Define five default resources
  const defaultResources = ['Resource A', 'Resource B', 'Resource C', 'Resource D', 'Resource E', 'Resource F', 'Resource G', 'Resource H',
    'Resource I', 'Resource J', 'Resource K', 'Resource L', 'Resource M', 'Resource N', 'Resource O'];

  // Get current system date details for reordering days (if today is in the current month)
  const systemDate = new Date();
  const currentSystemYear = systemDate.getFullYear();
  const currentSystemMonth = systemDate.getMonth();
  const todayDate = systemDate.getDate();

  // Generate 5 random events per resource for the current month only.
  // Each event has startTime and endTime (one-hour duration).
  const defaultEvents = defaultResources.flatMap((res, resIndex) => {
    const eventsForResource = [];
    for (let i = 0; i < 5; i++) {
      const day = Math.floor(Math.random() * daysCount) + 1;
      const hour = Math.floor(Math.random() * 8) + 9; // Random hour between 9 and 16
      const startTime = `${hour.toString().padStart(2, '0')}:00`;
      const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
      eventsForResource.push({
        id: Date.now() + resIndex * 100 + i,
        resource: res,
        startDay: day,
        endDay: day,
        color: getRandomColor(),
        startTime,
        endTime,
        month: initialDate.month, // Store event's month
        year: initialDate.year,   // Store event's year
      });
    }
    return eventsForResource;
  });

  // State hooks
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [resources] = useState(defaultResources);
  const [events, setEvents] = useState(defaultEvents);
  const [draggedEvent, setDraggedEvent] = useState(null);
  const containerRef = useRef(null);

  // Create an array of day numbers for the current month
  const daysInMonth = getDaysInMonth(currentDate.year, currentDate.month);
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Reorder days so that if the current month is displayed, today's date comes first
  let orderedDaysArray = daysArray;
  if (currentDate.year === currentSystemYear && currentDate.month === currentSystemMonth) {
    const index = daysArray.indexOf(todayDate);
    if (index !== -1) {
      orderedDaysArray = [...daysArray.slice(index), ...daysArray.slice(0, index)];
    }
  }

  // Get month name for header display
  const monthName = new Date(currentDate.year, currentDate.month).toLocaleString('default', { month: 'long' });

  // Add a new event with the current time as startTime and one hour later as endTime
  const addEvent = (resource, day) => {
    const now = new Date();
    const startTime = now.getHours().toString().padStart(2, '0') + ':' +
      now.getMinutes().toString().padStart(2, '0');
    const endDate = new Date(now.getTime() + 60 * 60 * 1000);
    const endTime = endDate.getHours().toString().padStart(2, '0') + ':' +
      endDate.getMinutes().toString().padStart(2, '0');
    const newEvent = {
      id: Date.now(),
      resource,
      startDay: day,
      endDay: day,
      color: getRandomColor(),
      startTime,
      endTime,
      month: currentDate.month,
      year: currentDate.year,
    };
    setEvents([...events, newEvent]);
  };

  // Delete an event after confirmation
  const deleteEvent = (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      setEvents(events.filter(ev => ev.id !== id));
    }
  };

  // Drag event handler: store the dragged event in state
  const handleDragStart = (evObj) => setDraggedEvent(evObj);

  // Drop handler: update the event's resource and day on drop
  const handleDrop = (resource, day, e) => {
    e.preventDefault();
    if (draggedEvent) {
      setEvents(events.map(ev =>
        ev.id === draggedEvent.id ? { ...ev, resource, startDay: day, endDay: day } : ev
      ));
      setDraggedEvent(null);
    }
  };

  // Prevent default behavior to allow drop
  const handleDragOver = (e) => e.preventDefault();

  // Change month (next/prev)
  const handleMonthChange = (direction) => {
    setCurrentDate(prev => {
      let newMonth = prev.month + direction;
      let newYear = prev.year;
      if (newMonth < 0) { newMonth = 11; newYear--; }
      else if (newMonth > 11) { newMonth = 0; newYear++; }
      return { month: newMonth, year: newYear };
    });
  };

  // Go back to today's month/year
  const goToToday = () => setCurrentDate(getCurrentMonth());

  return (
    <div className="min-h-screen p-4 bg-gray-100">
      {/* Header with month navigation */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-2xl font-bold">{monthName} {currentDate.year}</div>
        <div className="flex items-center space-x-4">
          <button onClick={() => handleMonthChange(-1)} className="text-2xl text-blue-500">&larr;</button>
          <button onClick={goToToday} className="px-4 py-2 bg-blue-500 text-white rounded">Today</button>
          <button onClick={() => handleMonthChange(1)} className="text-2xl text-blue-500">&rarr;</button>
        </div>
      </div>

      {/* Calendar Table */}
      <div ref={containerRef} className="overflow-auto border border-gray-300 h-[80vh] w-full">
        <table className="w-full table-fixed border-collapse">
          <thead>
            <tr>
              {/* Sticky resource header */}
              <th className="p-2 border border-gray-300 bg-gray-200 w-28 h-28 sticky left-0 z-10">Resources</th>
              {orderedDaysArray.map(day => {
                const dateObj = new Date(currentDate.year, currentDate.month, day);
                const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                return (
                  <th key={day} className={`p-2 border border-gray-300 text-center w-28 h-28 ${isToday(currentDate.year, currentDate.month, day) ? 'bg-yellow-200' : ''}`}>
                    <div>{day}</div>
                    <div className="text-sm text-gray-600">{dayName}</div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {resources.map((resource, rIndex) => (
              <tr key={rIndex}>
                {/* Resource name cell */}
                <td className="p-2 border border-gray-300 bg-gray-100 font-bold w-28 h-28 sticky left-0 z-10">{resource}</td>
                {orderedDaysArray.map(day => {
                  // Only render events belonging to the current month/year
                  const eventHere = events.find(ev =>
                    ev.resource === resource &&
                    ev.startDay === day &&
                    ev.month === currentDate.month &&
                    ev.year === currentDate.year
                  );
                  return eventHere ? (
                    <td
                      key={day}
                      className="p-1 border border-gray-300 w-28 h-28 relative"
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(resource, day, e)}
                    >
                      <div
                        draggable
                        onDragStart={() => handleDragStart(eventHere)}
                        onClick={() => deleteEvent(eventHere.id)}
                        className="text-xs p-1 rounded cursor-pointer select-none"
                        style={{ backgroundColor: eventHere.color }}
                      >
                        <div>Event</div>
                        <div className="text-[10px]">
                          {eventHere.startTime} - {eventHere.endTime}
                        </div>
                      </div>
                    </td>
                  ) : (
                    <td
                      key={day}
                      className="p-1 border border-gray-300 w-28 h-28 relative"
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(resource, day, e)}
                    >
                      <button
                        onClick={(e) => { e.stopPropagation(); addEvent(resource, day); }}
                        className="absolute bottom-1 right-1 bg-green-500 text-white text-xs p-1 rounded"
                      >
                        +
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
