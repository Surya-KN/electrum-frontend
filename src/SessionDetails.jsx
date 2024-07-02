import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const AdminSessionDashboard = () => {
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { sessionName } = useParams();

  useEffect(() => {
    fetch(`http://localhost:8000/sessiondetails/${sessionName}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setSessionData(data);
        setLoading(false);
      })
      .catch(error => {
        setError('Failed to fetch session data');
        setLoading(false);
      });
  }, [sessionName]);

  if (loading) return <div className="text-center mt-8">Loading...</div>;
  if (error) return <div className="text-center mt-8 text-red-500">{error}</div>;
  if (!sessionData) return <div className="text-center mt-8">No data available</div>;

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'bg-green-500';
      case 'closed':
        return 'bg-red-500';
      case 'upcoming':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const courseData = sessionData.Courses.map(course => ({
    name: course.name,
    seats: course.seats,
    seatsFilled: course.seats_filled || 0
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{sessionData.name} Dashboard</h1>
      
      {/* Session Overview */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Session Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-gray-600">Type</p>
            <p className="font-semibold">{sessionData.session_type}</p>
          </div>
          <div>
            <p className="text-gray-600">Status</p>
            <span className={`inline-block px-2 py-1 rounded-full text-white text-sm ${getStatusColor(sessionData.status)}`}>
              {sessionData.status}
            </span>
          </div>
          <div>
            <p className="text-gray-600">Total Students</p>
            <p className="font-semibold">{sessionData.total_students}</p>
          </div>
          <div>
            <p className="text-gray-600">Applied Students</p>
            <p className="font-semibold">{sessionData.applied_students}</p>
          </div>
        </div>
      </div>

      {/* Student Application Progress */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Student Application Progress</h2>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={[
                { name: 'Applied', value: sessionData.applied_students },
                { name: 'Remaining', value: sessionData.total_students - sessionData.applied_students }
              ]}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
            >
              {
                [0, 1].map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)
              }
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Course Seats Overview */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Course Seats Overview</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={courseData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="seats" fill="#8884d8" name="Total Seats" />
            <Bar dataKey="seatsFilled" fill="#82ca9d" name="Seats Filled" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Course List */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Courses</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left">Name</th>
                <th className="py-3 px-6 text-left">Code</th>
                <th className="py-3 px-6 text-center">Seats</th>
                <th className="py-3 px-6 text-center">Seats Filled</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm font-light">
              {sessionData.Courses.map(course => (
                <tr key={course.ID} className="border-b border-gray-200 hover:bg-gray-100">
                  <td className="py-3 px-6 text-left whitespace-nowrap">{course.name}</td>
                  <td className="py-3 px-6 text-left">{course.code}</td>
                  <td className="py-3 px-6 text-center">{course.seats}</td>
                  <td className="py-3 px-6 text-center">{course.seats_filled || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminSessionDashboard;