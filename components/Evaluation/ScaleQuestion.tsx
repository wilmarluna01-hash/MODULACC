import React from 'react';

interface ScaleQuestionProps {
  id: string;
  question: string;
  audioQuestion: string;
  value: string;
  onChange: (value: string) => void;
  feedback: string;
}

export const ScaleQuestion: React.FC<ScaleQuestionProps> = ({ id, question, audioQuestion, value, onChange, feedback }) => {
  const options = ['Poco', 'Algo', 'Mucho'];

  return (
    <fieldset className="space-y-3 p-4 border rounded-lg">
      <legend className="text-lg font-semibold text-gray-800">{question}</legend>
      <div className="flex gap-4" role="radiogroup" aria-label={audioQuestion}>
        {options.map((option) => (
          <label key={option} className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name={id}
              value={option}
              checked={value === option}
              onChange={(e) => onChange(e.target.value)}
              className="w-5 h-5"
              aria-label={`${question} - ${option}`}
              role="radio"
            />
            {option}
          </label>
        ))}
      </div>
      {value && <p className="text-sm text-primary font-medium mt-2" aria-live="polite">{feedback}</p>}
    </fieldset>
  );
};
