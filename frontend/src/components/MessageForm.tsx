import React, { useState } from 'react';
import axios from 'axios';

interface MessageFormProps {
  username: string;
}

const MessageForm: React.FC<MessageFormProps> = ({ username }) => {
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setError('');

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/message/${username}`, {
        text: message
      });
      setStatus('success');
      setMessage('');
    } catch (err: any) {
      setStatus('error');
      setError(err.response?.data?.error || 'Failed to send message');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Send Anonymous Message</h2>
      <p className="text-gray-600 mb-6">Your message will be sent to @{username}</p>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <textarea
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message here..."
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={status === 'sending'}
          className={`w-full py-2 px-4 rounded-lg text-white font-semibold ${
            status === 'sending' 
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {status === 'sending' ? 'Sending...' : 'Send Message'}
        </button>
      </form>

      {status === 'success' && (
        <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-lg">
          Message sent successfully!
        </div>
      )}

      {status === 'error' && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
};

export default MessageForm; 