import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import CreateSessionForm from './CreateSession';
// import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom';
import {  Route, Routes } from "react-router-dom";


const EnrollmentPeriodCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [enrollingCourse, setEnrollingCourse] = useState(null);
  const [sessionName, setSessionName] = useState('');
  const [userId, setUserId] = useState('');
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (sessionName && userId) {
      setIsFormSubmitted(true);
      fetchCourses();
    } else {
      toast.error('Please enter both session name and user ID');
    }
  };

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/session/${sessionName}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setCourses(data.courses.map(course => ({
        ...course,
        availableSeats: course.Seats
      })));
      setLoading(false);
    } catch (error) {
      setError('Failed to fetch courses');
      setLoading(false);
      toast.error('Failed to load courses. Please try again later.');
    }
  };

  useEffect(() => {
    if (isFormSubmitted && courses.length > 0) {
      const ws = new WebSocket(`ws://localhost:8000/ws/session/${sessionName}`);

      ws.onopen = () => {
        console.log('WebSocket Connected');
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setCourses(prevCourses => prevCourses.map(course => ({
          ...course,
          availableSeats: parseInt(data[course.Code] || course.availableSeats)
        })));
      };

      ws.onclose = () => {
        console.log('WebSocket Disconnected');
      };

      return () => {
        ws.close();
      };
    }
  }, [isFormSubmitted, courses.length, sessionName]);

  const handleEnroll = async (courseCode) => {
    setEnrollingCourse(courseCode);
    try {
      const response = await fetch(`http://localhost:8000/session/${sessionName}/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: userId,
          course: courseCode
        }),
      });

      if (!response.ok) {
        throw new Error('Enrollment failed');
      }

      toast.success(`Successfully enrolled in course ${courseCode}`);
    } catch (error) {
      toast.error(`Failed to enroll in course ${courseCode}: ${error.message}`);
    } finally {
      setEnrollingCourse(null);
    }
  };

  if (!isFormSubmitted) {
    return (
      <div className="container mx-auto p-4 bg-gray-100">
        <h1 className="text-3xl font-bold mb-6 text-center text-indigo-800">Course Enrollment</h1>
        <form onSubmit={handleFormSubmit} className="max-w-md mx-auto">
          <div className="mb-4">
            <label htmlFor="sessionName" className="block text-gray-700 text-sm font-bold mb-2">
              Session Name:
            </label>
            <input
              type="text"
              id="sessionName"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="userId" className="block text-gray-700 text-sm font-bold mb-2">
              User ID:
            </label>
            <input
              type="text"
              id="userId"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Load Courses
          </button>
        </form>
      </div>
    );
  }

  if (loading) return <div className="text-center mt-8">Loading...</div>;
  if (error) return <div className="text-center mt-8 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-4 bg-gray-100">
      <Toaster position="top-right" />
      <h1 className="text-3xl font-bold mb-6 text-center text-indigo-800">Course Enrollment</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div key={course.Id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-indigo-100">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-2 text-indigo-700">{course.Name}</h2>
              <p className="text-gray-600 mb-1">Course Code: {course.Code}</p>
              <p className="text-gray-600 mb-4">Department: {course.Department}</p>
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">Available Seats:</span>
                  <span className="text-sm font-medium text-indigo-600">
                    {course.availableSeats} / {course.Seats}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500 ease-in-out" 
                    style={{ width: `${(course.availableSeats / course.Seats) * 100}%` }}
                  ></div>
                </div>
              </div>
              <button 
                className="w-full bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed"
                onClick={() => handleEnroll(course.Code)}
                disabled={enrollingCourse === course.Code || course.availableSeats === 0}
              >
                {enrollingCourse === course.Code ? 'Enrolling...' : course.availableSeats === 0 ? 'Full' : 'Enroll'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// export default EnrollmentPeriodCourses;

export function App() {
  return (
    <Routes>
    {/* <Route path="/" element={<Layout />}> */}
      {/* <Route index element={<Navigate to="/projects" replace />} /> */}
      <Route index element={<Home/>} />
      <Route path="/enroll" element={<EnrollmentPeriodCourses />} />
      <Route path="/create" element={<CreateSessionForm />} />
      {/* <Route path="/login" element={<Loginform />} /> */}

  </Routes>
  );
}
export default EnrollmentPeriodCourses;