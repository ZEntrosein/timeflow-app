import React from 'react';
import { Attribute, AttributeValue } from '../../../../types';

interface RatingEditorProps {
  value: AttributeValue;
  onChange: (value: AttributeValue) => void;
  disabled?: boolean;
  placeholder?: string;
  attribute: Attribute;
  suggestions?: AttributeValue[];
  onFocus?: () => void;
  onBlur?: () => void;
}

export const RatingEditor: React.FC<RatingEditorProps> = (props) => {
  const maxRating = props.attribute.options?.maxRating || 5;
  const currentRating = typeof props.value === 'number' ? props.value : 0;

  const handleStarClick = (rating: number) => {
    props.onChange(rating);
  };

  return (
    <div className="flex items-center space-x-1">
      {Array.from({ length: maxRating }, (_, index) => {
        const starValue = index + 1;
        return (
          <button
            key={index}
            type="button"
            onClick={() => handleStarClick(starValue)}
            disabled={props.disabled}
            className={`text-2xl ${
              starValue <= currentRating ? 'text-yellow-400' : 'theme-text-tertiary'
            } hover:text-yellow-400 disabled:cursor-not-allowed`}
          >
            ★
          </button>
        );
      })}
      <span className="ml-2 text-sm theme-text-secondary">
        {currentRating}/{maxRating}
      </span>
    </div>
  );
}; 