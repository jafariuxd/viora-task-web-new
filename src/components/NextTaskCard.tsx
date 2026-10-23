import React from 'react';
import { type Task, TaskStatus } from '../types';
import { TaskCard } from './TaskCard';

interface NextTaskCardProps {
  task: Task;
  onCardClick?: () => void;
  onStatusSelect?: (newStatus: TaskStatus) => void;
}

/**
 * Matches NextTaskCard in jafariuxd/viora-task HomeScreen.kt:
 * In the mobile app, NextTaskCard is styled directly as the primary prominent white task card
 * in the vertical feed without extra outer banners.
 */
export const NextTaskCard: React.FC<NextTaskCardProps> = ({
  task,
  onCardClick,
  onStatusSelect,
}) => {
  return (
    <div className="w-full font-['SF_Pro_Display',-apple-system,sans-serif]">
      <TaskCard
        task={task}
        onCardClick={onCardClick}
        onStatusSelect={onStatusSelect}
      />
    </div>
  );
};
