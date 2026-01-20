import React from 'react';
import Link from 'next/link';

interface CreatorCardProps {
  id: number;
  name: string;
  channelName: string;
  profileImage?: string;
  bio?: string;
  subscriberCount?: number;
  accentColor?: string;
}

export const CreatorCard: React.FC<CreatorCardProps> = ({
  id,
  name,
  channelName,
  profileImage,
  bio,
  subscriberCount,
  accentColor = '#FF0000',
}) => {
  return (
    <Link href={`/creator/${id}`}>
      <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden cursor-pointer active:scale-95">
        {/* Cover */}
        <div
          className="h-32 w-full"
          style={{
            background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}dd 100%)`,
          }}
        />

        {/* Profile Section */}
        <div className="px-4 pb-4 -mt-8 relative">
          {profileImage && (
            <img
              src={profileImage}
              alt={name}
              className="w-16 h-16 rounded-full border-4 border-white shadow-md"
            />
          )}

          <h3 className="text-lg font-bold text-gray-900 mt-3">{name}</h3>
          <p className="text-sm text-gray-600">{channelName}</p>

          {subscriberCount && (
            <p className="text-xs text-gray-500 mt-1">{subscriberCount.toLocaleString()} subscribers</p>
          )}

          {bio && <p className="text-sm text-gray-700 mt-2 line-clamp-2">{bio}</p>}
        </div>
      </div>
    </Link>
  );
};
