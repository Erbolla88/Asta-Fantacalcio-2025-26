
import React from 'react';
import { PlayerRole } from '../../types';

interface RoleIconProps {
  role: PlayerRole;
  size?: 'sm' | 'md' | 'lg';
}

export const RoleIcon: React.FC<RoleIconProps> = ({ role, size = 'md' }) => {
  const roleStyles: Record<PlayerRole, string> = {
    P: 'bg-yellow-500 text-yellow-900',
    D: 'bg-blue-500 text-blue-900',
    C: 'bg-green-500 text-green-900',
    A: 'bg-red-500 text-red-900',
  };

  const sizeStyles = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
  };

  return (
    <div
      className={`flex items-center justify-center rounded-full font-bold ${roleStyles[role]} ${sizeStyles[size]}`}
    >
      {role}
    </div>
  );
};
