import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

interface UserProfileProps {
  username: string;
}

interface UserData {
  username: string;
  createdAt: string;
  messageCount: number;
  lastMessageAt: string | null;
  settings: {
    allowMessages: boolean;
    messageLimit: number;
  };
  statistics: {
    total: number;
    delivered: number;
    failed: number;
  };
}

const UserProfile: React.FC<UserProfileProps> = ({ username }) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUserData = useCallback(async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/user/${username}`);
      setUserData(response.data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch user data');
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  if (loading) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  if (!userData) {
    return null;
  }

  const userLink = `${window.location.origin}/${username}`;

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">@{userData.username}</h2>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">Messages Received</p>
            <p className="text-2xl font-bold">{userData.messageCount}</p>
          </div>
          <div>
            <p className="text-gray-600">Last Message</p>
            <p className="text-lg">
              {userData.lastMessageAt 
                ? new Date(userData.lastMessageAt).toLocaleDateString()
                : 'Never'}
            </p>
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="font-semibold mb-2">Message Statistics</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-gray-600">Total</p>
              <p className="text-lg font-bold">{userData.statistics.total}</p>
            </div>
            <div>
              <p className="text-gray-600">Delivered</p>
              <p className="text-lg font-bold text-green-600">{userData.statistics.delivered}</p>
            </div>
            <div>
              <p className="text-gray-600">Failed</p>
              <p className="text-lg font-bold text-red-600">{userData.statistics.failed}</p>
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="font-semibold mb-2">Settings</h3>
          <div className="space-y-2">
            <p>
              <span className="text-gray-600">Accepting Messages:</span>{' '}
              <span className={userData.settings.allowMessages ? 'text-green-600' : 'text-red-600'}>
                {userData.settings.allowMessages ? 'Yes' : 'No'}
              </span>
            </p>
            <p>
              <span className="text-gray-600">Message Limit:</span>{' '}
              {userData.settings.messageLimit} characters
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center">
        <Link
          to="/"
          className="text-blue-500 hover:underline"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default UserProfile; 
